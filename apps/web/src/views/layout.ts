import type { Session } from '../session.js';

/** HTML-escape untrusted values before interpolation. */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** Steps not yet built in Phase 1 render as disabled. */
  ready: boolean;
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '◫', ready: true },
  { href: '/clients', label: 'Clients', icon: '◑', ready: true },
  { href: '/brands', label: 'Brands', icon: '✦', ready: true },
  { href: '/products', label: 'Products', icon: '❑', ready: true },
  { href: '/missions', label: 'Missions', icon: '➤', ready: true },
  { href: '/brief', label: 'Marketing Brief', icon: '✎', ready: false },
  { href: '/creative', label: 'Creative Studio', icon: '❖', ready: false },
  { href: '/campaigns', label: 'Campaigns', icon: '◎', ready: false },
  { href: '/analytics', label: 'Analytics', icon: '▤', ready: false },
  { href: '/reports', label: 'Reports', icon: '❐', ready: false },
  { href: '/settings', label: 'Settings', icon: '⚙', ready: false },
];

const STYLES = `
:root{
  --bg:#0e1116;--panel:#161b22;--panel-2:#1c2230;--line:#2a3140;--text:#e6edf3;
  --muted:#8b98a9;--brand:#5b8cff;--brand-2:#7aa2ff;--ok:#3fb950;--warn:#d29922;--err:#f85149;
  --radius:12px;--shadow:0 1px 3px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.25);
}
*{box-sizing:border-box}
body{margin:0;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  background:var(--bg);color:var(--text)}
a{color:var(--brand-2);text-decoration:none}
.shell{display:grid;grid-template-columns:248px 1fr;min-height:100vh}
.side{background:var(--panel);border-right:1px solid var(--line);padding:20px 14px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;padding:6px 8px 18px}
.logo .mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--brand),#9d7bff);
  display:grid;place-items:center;color:#fff;font-size:14px}
.nav{display:flex;flex-direction:column;gap:2px;flex:1}
.nav a{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:9px;color:var(--muted);font-weight:500}
.nav a .ic{width:20px;text-align:center;opacity:.9}
.nav a:hover{background:var(--panel-2);color:var(--text)}
.nav a.active{background:var(--panel-2);color:var(--text);box-shadow:inset 2px 0 0 var(--brand)}
.nav a.soon{opacity:.4;cursor:not-allowed}
.nav a.soon .tag{margin-left:auto;font-size:10px;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:1px 5px}
.who{border-top:1px solid var(--line);margin-top:8px;padding-top:14px;font-size:13px;color:var(--muted)}
.who b{color:var(--text);display:block}
.who form{margin-top:8px}
.main{padding:34px 40px;max-width:980px}
.head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:24px;gap:16px}
.head h1{margin:0;font-size:26px;letter-spacing:-.01em}
.head p{margin:4px 0 0;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:18px 18px;box-shadow:var(--shadow)}
.stat .n{font-size:30px;font-weight:700}
.stat .l{color:var(--muted);font-size:13px;margin-top:2px}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:22px 24px;box-shadow:var(--shadow)}
.panel h2{margin:0 0 4px;font-size:18px}
.panel .sub{color:var(--muted);margin:0 0 18px;font-size:14px}
label{display:block;font-size:13px;color:var(--muted);margin:14px 0 6px;font-weight:600}
input,select,textarea{width:100%;background:var(--panel-2);border:1px solid var(--line);color:var(--text);
  border-radius:9px;padding:10px 12px;font:inherit;outline:none}
input:focus,select:focus,textarea:focus{border-color:var(--brand)}
.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.actions{margin-top:22px;display:flex;gap:10px;align-items:center}
.btn{background:var(--brand);color:#fff;border:none;border-radius:9px;padding:11px 18px;font:inherit;
  font-weight:600;cursor:pointer}
.btn:hover{background:var(--brand-2)}
.btn.ghost{background:transparent;border:1px solid var(--line);color:var(--text)}
.err{background:rgba(248,81,73,.12);border:1px solid rgba(248,81,73,.4);color:#ffb4ae;
  padding:11px 14px;border-radius:9px;margin-bottom:16px;font-size:14px}
.ok{background:rgba(63,185,80,.12);border:1px solid rgba(63,185,80,.4);color:#9be6a6;
  padding:11px 14px;border-radius:9px;margin-bottom:16px;font-size:14px}
.steps{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}
.step{font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:20px;padding:5px 12px}
.step.done{color:var(--ok);border-color:rgba(63,185,80,.5)}
.step.now{color:#fff;background:var(--brand);border-color:var(--brand)}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line)}
th{color:var(--muted);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.feed{list-style:none;margin:0;padding:0}
.feed li{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px}
.feed .ev{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--brand-2)}
.feed .t{color:var(--muted)}
.empty{color:var(--muted);padding:18px 0}
.badge{display:inline-block;font-size:12px;padding:2px 9px;border-radius:20px;border:1px solid var(--line);color:var(--muted)}
.badge.active{color:var(--ok);border-color:rgba(63,185,80,.5)}
.login-wrap{min-height:100vh;display:grid;place-items:center;padding:20px}
.login-card{width:100%;max-width:380px}
.login-brand{display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:22px;font-size:22px;font-weight:700}
`;

/** Full-page chrome with the left navigation. `active` is the current href. */
export function layout(opts: {
  title: string;
  active: string;
  session: Session;
  body: string;
}): string {
  const nav = NAV.map((item) => {
    const cls = [item.href === opts.active ? 'active' : '', item.ready ? '' : 'soon'].filter(Boolean).join(' ');
    const inner = `<span class="ic">${item.icon}</span>${esc(item.label)}${item.ready ? '' : '<span class="tag">soon</span>'}`;
    return item.ready
      ? `<a class="${cls}" href="${item.href}">${inner}</a>`
      : `<a class="${cls}" title="Coming in a later phase">${inner}</a>`;
  }).join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)} · AdOS</title><style>${STYLES}</style></head>
<body><div class="shell">
<aside class="side">
  <div class="logo"><span class="mark">▲</span> AdOS</div>
  <nav class="nav">${nav}</nav>
  <div class="who">
    <b>${esc(opts.session.actor)}</b>
    <span>Tenant: ${esc(opts.session.tenantId)}</span>
    <form method="post" action="/logout"><button class="btn ghost" style="width:100%;padding:7px">Sign out</button></form>
  </div>
</aside>
<main class="main">${opts.body}</main>
</div></body></html>`;
}

/** Bare page chrome (login) — no nav. */
export function bare(opts: { title: string; body: string }): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)} · AdOS</title><style>${STYLES}</style></head>
<body>${opts.body}</body></html>`;
}

/** The onboarding progress rail shared by the create screens. */
export function steps(current: 'workspace' | 'client' | 'brand' | 'product' | 'mission' | 'done'): string {
  const order: Array<{ key: string; label: string }> = [
    { key: 'workspace', label: '1 · Workspace' },
    { key: 'client', label: '2 · Client' },
    { key: 'brand', label: '3 · Brand' },
    { key: 'product', label: '4 · Product' },
    { key: 'mission', label: '5 · Mission' },
  ];
  const idx = order.findIndex((s) => s.key === current);
  const curIdx = current === 'done' ? order.length : idx;
  return `<div class="steps">${order
    .map((s, i) => {
      const cls = i < curIdx ? 'done' : i === curIdx ? 'now' : '';
      return `<span class="step ${cls}">${esc(s.label)}</span>`;
    })
    .join('')}</div>`;
}
