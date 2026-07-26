// Excel export via SpreadsheetML 2003 (.xls) — a plain XML format Excel opens
// natively. No library, no network, deterministic. We emit numbers as real
// Number cells so Excel can re-use them in formulas.

const xesc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function cell(value, type = 'String') {
  if (value == null || value === '') return '<Cell><Data ss:Type="String"></Data></Cell>';
  return `<Cell><Data ss:Type="${type}">${xesc(value)}</Data></Cell>`;
}

function row(cells) {
  return `<Row>${cells.join('')}</Row>`;
}

/**
 * Build a SpreadsheetML workbook string.
 * @param {object} report same shape used by the app: title, tiles, inputs,
 *   assumptions, breakdown (with raw numeric values), honestFrame.
 */
export function buildWorkbookXML(report) {
  const sheetRows = [];
  sheetRows.push(row([cell(report.title)]));
  sheetRows.push(row([cell(report.subtitle)]));
  sheetRows.push(row([cell('')]));

  sheetRows.push(row([cell(report.inputsHeading), cell('Value')]));
  for (const r of report.inputsRaw) {
    sheetRows.push(row([cell(r.label), cell(r.value, typeof r.value === 'number' ? 'Number' : 'String')]));
  }
  sheetRows.push(row([cell('')]));

  sheetRows.push(row([cell(report.assumptionsHeading), cell('Value')]));
  for (const r of report.assumptionsRaw) {
    sheetRows.push(row([cell(r.label), cell(r.value, 'Number')]));
  }
  sheetRows.push(row([cell('')]));

  sheetRows.push(row([cell(report.tilesHeading), cell('Value')]));
  for (const t of report.tilesRaw) {
    sheetRows.push(row([cell(t.label), cell(t.value, t.value == null ? 'String' : 'Number')]));
  }
  sheetRows.push(row([cell('')]));

  sheetRows.push(row([cell(report.breakdownHeading), cell('Amount'), cell('% of total')]));
  for (const b of report.breakdownRaw) {
    sheetRows.push(row([cell(b.label), cell(b.value, 'Number'), cell(b.pct, 'Number')]));
  }
  sheetRows.push(row([cell('')]));
  sheetRows.push(row([cell(report.honestFrame)]));

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="AdOS ROI">
  <Table>
   ${sheetRows.join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;
}
