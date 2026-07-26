// Minimal, self-contained PDF writer — no external library, no network.
// Supports text (Helvetica/Helvetica-Bold, WinAnsi) and filled rectangles, which
// is enough for the ROI report (headline tiles, tables, a savings bar chart).
// Turkish glyphs outside WinAnsi (ğ ş ı İ) are transliterated for the PDF export;
// for pixel-perfect Turkish, use the in-app "Print report" (browser rendering).

const WINANSI_MAP = {
  'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I',
};

// Encode a JS string to WinAnsi (Latin-1) bytes, transliterating unsupported
// Turkish letters and escaping PDF string metacharacters.
function toWinAnsiBytes(str) {
  const out = [];
  for (const ch of String(str)) {
    let c = WINANSI_MAP[ch] ?? ch;
    const code = c.charCodeAt(0);
    if (c === '(' || c === ')' || c === '\\') out.push(0x5c, c.charCodeAt(0));
    else if (code <= 0xff) out.push(code);
    else out.push(0x3f); // '?' for anything else outside Latin-1
  }
  return out;
}

export class PDFDoc {
  constructor({ width = 595.28, height = 841.89 } = {}) {
    this.width = width;
    this.height = height;
    this.pages = [];
    this.newPage();
  }

  newPage() {
    this.current = [];
    this.pages.push(this.current);
    return this;
  }

  // y is measured from the top for author convenience; converted to PDF space.
  text(x, yTop, str, { size = 11, bold = false } = {}) {
    const y = this.height - yTop;
    const font = bold ? '/F2' : '/F1';
    const bytes = toWinAnsiBytes(str);
    this.current.push({ type: 'text', x, y, size, font, bytes });
    return this;
  }

  rect(x, yTop, w, h, { rgb = [0.2, 0.4, 0.9] } = {}) {
    const y = this.height - yTop - h;
    this.current.push({ type: 'rect', x, y, w, h, rgb });
    return this;
  }

  line(x1, y1Top, x2, y2Top, { rgb = [0.6, 0.6, 0.6], w = 1 } = {}) {
    this.current.push({
      type: 'line', x1, y1: this.height - y1Top, x2, y2: this.height - y2Top, rgb, w,
    });
    return this;
  }

  _streamBytes(ops) {
    const chunks = [];
    const push = (s) => { for (let i = 0; i < s.length; i++) chunks.push(s.charCodeAt(i) & 0xff); };
    for (const op of ops) {
      if (op.type === 'text') {
        push(`BT ${op.font} ${op.size} Tf 0 0 0 rg 1 0 0 1 ${op.x.toFixed(2)} ${op.y.toFixed(2)} Tm (`);
        for (const b of op.bytes) chunks.push(b);
        push(`) Tj ET\n`);
      } else if (op.type === 'rect') {
        push(`${op.rgb.map((n) => n.toFixed(3)).join(' ')} rg ${op.x.toFixed(2)} ${op.y.toFixed(2)} ${op.w.toFixed(2)} ${op.h.toFixed(2)} re f\n`);
      } else if (op.type === 'line') {
        push(`${op.rgb.map((n) => n.toFixed(3)).join(' ')} RG ${op.w} w ${op.x1.toFixed(2)} ${op.y1.toFixed(2)} m ${op.x2.toFixed(2)} ${op.y2.toFixed(2)} l S\n`);
      }
    }
    return chunks;
  }

  build() {
    const objects = []; // each: array of byte values
    const enc = (s) => { const a = []; for (let i = 0; i < s.length; i++) a.push(s.charCodeAt(i) & 0xff); return a; };

    const nPages = this.pages.length;
    // Object numbering: 1=Catalog, 2=Pages, 3=F1, 4=F2, then per page: content + page.
    const fontF1 = 3, fontF2 = 4;
    const pageObjNums = [];
    const contentObjNums = [];
    let next = 5;
    for (let p = 0; p < nPages; p++) { contentObjNums.push(next++); pageObjNums.push(next++); }

    objects[1] = enc(`<< /Type /Catalog /Pages 2 0 R >>`);
    objects[2] = enc(`<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${nPages} >>`);
    objects[fontF1] = enc(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
    objects[fontF2] = enc(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);

    for (let p = 0; p < nPages; p++) {
      const streamBytes = this._streamBytes(this.pages[p]);
      const header = enc(`<< /Length ${streamBytes.length} >>\nstream\n`);
      const footer = enc(`\nendstream`);
      objects[contentObjNums[p]] = header.concat(streamBytes, footer);
      objects[pageObjNums[p]] = enc(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width.toFixed(2)} ${this.height.toFixed(2)}] ` +
        `/Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R >> >> /Contents ${contentObjNums[p]} 0 R >>`,
      );
    }

    // Serialize with xref.
    let bytes = [];
    const push = (arr) => { bytes = bytes.concat(arr); };
    push(enc(`%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`));
    const offsets = [];
    const maxObj = next - 1;
    for (let n = 1; n <= maxObj; n++) {
      offsets[n] = bytes.length;
      push(enc(`${n} 0 obj\n`));
      push(objects[n]);
      push(enc(`\nendobj\n`));
    }
    const xrefStart = bytes.length;
    push(enc(`xref\n0 ${maxObj + 1}\n`));
    push(enc(`0000000000 65535 f \n`));
    for (let n = 1; n <= maxObj; n++) {
      push(enc(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`));
    }
    push(enc(`trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`));
    return Uint8Array.from(bytes);
  }
}

/**
 * Build the ROI report PDF from the computed outputs. Returns a Uint8Array.
 * `report` = { title, subtitle, tiles:[{label,value}], inputs:[{label,value}],
 *   breakdown:[{label,value,pct}], assumptionsNote, honestFrame, currencySymbol }
 */
export function buildReportPDF(report) {
  const doc = new PDFDoc();
  const M = 48;
  let y = 56;
  doc.text(M, y, report.title, { size: 20, bold: true }); y += 22;
  doc.text(M, y, report.subtitle, { size: 11 }); y += 26;
  doc.line(M, y, doc.width - M, y, { rgb: [0.7, 0.7, 0.75], w: 1 }); y += 22;

  // Headline tiles (2x2)
  doc.text(M, y, report.tilesHeading, { size: 13, bold: true }); y += 18;
  const colW = (doc.width - 2 * M) / 2;
  report.tiles.forEach((t, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const tx = M + col * colW;
    const ty = y + row * 46;
    doc.text(tx, ty, t.label, { size: 10 });
    doc.text(tx, ty + 18, t.value, { size: 16, bold: true });
  });
  y += Math.ceil(report.tiles.length / 2) * 46 + 12;
  doc.line(M, y, doc.width - M, y, { rgb: [0.85, 0.85, 0.9], w: 0.5 }); y += 20;

  // Savings breakdown with mini bar chart
  doc.text(M, y, report.breakdownHeading, { size: 13, bold: true }); y += 18;
  const maxVal = Math.max(1, ...report.breakdown.map((b) => b.value));
  const barMaxW = 220;
  report.breakdown.forEach((b) => {
    doc.text(M, y + 10, b.label, { size: 10 });
    const bw = (b.value / maxVal) * barMaxW;
    doc.rect(M + 250, y, bw, 12, { rgb: [0.16, 0.45, 0.95] });
    doc.text(M + 250 + bw + 6, y + 10, `${b.valueStr} (${b.pctStr})`, { size: 9 });
    y += 20;
  });
  y += 8;
  doc.line(M, y, doc.width - M, y, { rgb: [0.85, 0.85, 0.9], w: 0.5 }); y += 20;

  // Inputs table
  doc.text(M, y, report.inputsHeading, { size: 13, bold: true }); y += 18;
  report.inputs.forEach((r) => {
    doc.text(M, y + 10, r.label, { size: 10 });
    doc.text(M + 320, y + 10, r.value, { size: 10, bold: true });
    y += 18;
    if (y > doc.height - 120) { doc.newPage(); y = 56; }
  });

  // Honest frame footer
  y = doc.height - 90;
  doc.line(M, y, doc.width - M, y, { rgb: [0.7, 0.7, 0.75], w: 0.5 }); y += 14;
  wrapText(doc, M, y, report.honestFrame, doc.width - 2 * M, 8.5);

  return doc.build();
}

function wrapText(doc, x, y, str, maxWidth, size) {
  const approxCharW = size * 0.5;
  const perLine = Math.max(10, Math.floor(maxWidth / approxCharW));
  const words = String(str).split(/\s+/);
  let line = '';
  let yy = y;
  for (const w of words) {
    if ((line + ' ' + w).trim().length > perLine) {
      doc.text(x, yy, line.trim(), { size });
      yy += size + 3;
      line = w;
    } else {
      line += ' ' + w;
    }
  }
  if (line.trim()) doc.text(x, yy, line.trim(), { size });
}
