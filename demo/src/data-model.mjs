// Canonical entities for the NovaMak demo world. These are fixed (from the demo
// docs); bulk instances are generated deterministically in seed.mjs.

export const SEED = 20260726;

export const SITES = [
  { id: 'site-1', name: 'Plant 1 — İstanbul (Dudullu OSB)', type: 'plant', city: 'İstanbul', headcount: 900 },
  { id: 'site-2', name: 'Plant 2 — Gebze', type: 'plant', city: 'Kocaeli', headcount: 520 },
  { id: 'site-3', name: 'Plant 3 — Bursa', type: 'plant', city: 'Bursa', headcount: 330 },
  { id: 'site-wh', name: 'Central Warehouse — Gebze', type: 'warehouse', city: 'Kocaeli', headcount: 70 },
  { id: 'site-ank', name: 'Sales Office — Ankara', type: 'office', city: 'Ankara', headcount: 15 },
  { id: 'site-izm', name: 'Sales Office — İzmir', type: 'office', city: 'İzmir', headcount: 15 },
];

export const UNITS = [
  { id: 'bu-machinery', name: 'Machinery Systems' },
  { id: 'bu-components', name: 'Precision Components' },
  { id: 'bu-aftermarket', name: 'Aftermarket & Service' },
  { id: 'bu-engineering', name: 'Engineering & R&D' },
];

export const DEPARTMENTS = [
  { id: 'dep-exec', name_tr: 'Yönetim', name_en: 'Executive' },
  { id: 'dep-hr', name_tr: 'İnsan Kaynakları', name_en: 'HR' },
  { id: 'dep-fin', name_tr: 'Finans ve Muhasebe', name_en: 'Finance' },
  { id: 'dep-it', name_tr: 'Bilgi Teknolojileri', name_en: 'IT' },
  { id: 'dep-ops', name_tr: 'Operasyonlar', name_en: 'Operations' },
  { id: 'dep-mnt', name_tr: 'Bakım', name_en: 'Maintenance' },
  { id: 'dep-qua', name_tr: 'Kalite', name_en: 'Quality' },
  { id: 'dep-sales', name_tr: 'Satış', name_en: 'Sales' },
  { id: 'dep-mkt', name_tr: 'Pazarlama', name_en: 'Marketing' },
  { id: 'dep-proc', name_tr: 'Satın Alma', name_en: 'Procurement' },
  { id: 'dep-eng', name_tr: 'Mühendislik', name_en: 'Engineering' },
  { id: 'dep-prd', name_tr: 'Üretim', name_en: 'Production' },
  { id: 'dep-hse', name_tr: 'İSG ve Çevre', name_en: 'HSE' },
  { id: 'dep-sec', name_tr: 'Güvenlik', name_en: 'Security' },
  { id: 'dep-wh', name_tr: 'Depo ve Lojistik', name_en: 'Warehouse' },
  { id: 'dep-sup', name_tr: 'Müşteri Destek', name_en: 'Support' },
];

// 42 users (id, name, dept, tier, site). Tiers: T0..T4, plus admin/audit overlays.
export const EMPLOYEES = [
  ['emp-01', 'Elif Demir', 'dep-exec', 'T0', 'site-1', 'General Manager'],
  ['emp-02', 'Hakan Çelik', 'dep-ops', 'T1', 'site-1', 'Operations Director'],
  ['emp-03', 'Kerem Yılmaz', 'dep-prd', 'T2', 'site-1', 'Production Manager'],
  ['emp-04', 'Serkan Aydın', 'dep-prd', 'T3', 'site-1', 'Production Supervisor'],
  ['emp-05', 'Emre Koç', 'dep-prd', 'T3', 'site-2', 'Production Supervisor'],
  ['emp-06', 'Fatma Şen', 'dep-prd', 'T3', 'site-1', 'Production Planner'],
  ['emp-07', 'Ali Vural', 'dep-prd', 'T4', 'site-1', 'CNC Operator / Team Lead'],
  ['emp-08', 'Mustafa Doğan', 'dep-mnt', 'T2', 'site-1', 'Maintenance Manager'],
  ['emp-09', 'Mehmet Aslan', 'dep-mnt', 'T3', 'site-1', 'Maintenance Engineer'],
  ['emp-10', 'Okan Er', 'dep-mnt', 'T4', 'site-1', 'Maintenance Technician'],
  ['emp-11', 'Zeynep Şahin', 'dep-qua', 'T2', 'site-1', 'Quality Manager'],
  ['emp-12', 'Deniz Acar', 'dep-qua', 'T3', 'site-1', 'Quality Engineer'],
  ['emp-13', 'Gökhan Uz', 'dep-qua', 'T4', 'site-2', 'Quality Inspector'],
  ['emp-14', 'Barış Yıldız', 'dep-hse', 'T2', 'site-2', 'HSE Manager'],
  ['emp-15', 'Selin Ak', 'dep-hse', 'T3', 'site-2', 'HSE Officer'],
  ['emp-16', 'Ayşe Kaya', 'dep-hr', 'T1', 'site-1', 'HR Director'],
  ['emp-17', 'Nalan Er', 'dep-hr', 'T3', 'site-1', 'HR Specialist (Recruitment)'],
  ['emp-18', 'Tuğçe Al', 'dep-hr', 'T3', 'site-1', 'HR Specialist (Payroll)'],
  ['emp-19', 'Canan Arslan', 'dep-fin', 'T1', 'site-1', 'Finance Director'],
  ['emp-20', 'Ozan Kurt', 'dep-fin', 'T2', 'site-1', 'Accounting Manager'],
  ['emp-21', 'Derya Kılıç', 'dep-fin', 'T3', 'site-1', 'Accountant'],
  ['emp-22', 'Levent Bozkurt', 'dep-proc', 'T2', 'site-1', 'Procurement Manager'],
  ['emp-23', 'Pelin Ay', 'dep-proc', 'T3', 'site-1', 'Buyer'],
  ['emp-24', 'Burak Öztürk', 'dep-it', 'T2', 'site-1', 'IT Manager'],
  ['emp-25', 'Cem Yalın', 'dep-it', 'T3', 'site-1', 'System Administrator'],
  ['emp-26', 'Ece Nur', 'dep-it', 'T4', 'site-1', 'IT Support Specialist'],
  ['emp-27', 'Tarık Güneş', 'dep-sec', 'T2', 'site-1', 'Security Manager'],
  ['emp-28', 'Volkan Ateş', 'dep-sec', 'T4', 'site-2', 'Security Officer'],
  ['emp-29', 'Onur Kaplan', 'dep-eng', 'T1', 'site-1', 'Engineering Director'],
  ['emp-30', 'Sibel Demirtaş', 'dep-eng', 'T3', 'site-1', 'Design Engineer'],
  ['emp-31', 'Kaan Yücel', 'dep-eng', 'T3', 'site-3', 'R&D Engineer'],
  ['emp-32', 'Murat Şahin', 'dep-sales', 'T1', 'site-1', 'Commercial Director'],
  ['emp-33', 'İpek Kara', 'dep-sales', 'T2', 'site-1', 'Sales Manager'],
  ['emp-34', 'Berk Aydın', 'dep-sales', 'T3', 'site-ank', 'Sales Representative'],
  ['emp-35', 'Ceren Işık', 'dep-sales', 'T3', 'site-izm', 'Export Sales Specialist'],
  ['emp-36', 'Aslı Yıldırım', 'dep-mkt', 'T2', 'site-1', 'Marketing Manager'],
  ['emp-37', 'Efe Demir', 'dep-mkt', 'T3', 'site-1', 'Marketing Specialist'],
  ['emp-38', 'Gizem Ünal', 'dep-sup', 'T2', 'site-1', 'Support Manager'],
  ['emp-39', 'Hüseyin Bal', 'dep-sup', 'T3', 'site-1', 'Support Specialist'],
  ['emp-40', 'Serdar Kaya', 'dep-wh', 'T2', 'site-wh', 'Warehouse Manager'],
  ['emp-41', 'Melis Tan', 'dep-wh', 'T3', 'site-wh', 'Logistics Coordinator'],
  ['emp-42', 'Yusuf Er', 'dep-wh', 'T4', 'site-wh', 'Warehouse Operator / Team Lead'],
].map(([id, name, department_id, tier, site_id, title]) => ({
  id, name, title, department_id, site_id, permission_tier: tier,
  email: `${slug(name)}@novamak.com.tr`, active: true, locale: 'tr',
}));

function slug(name) {
  return name.toLowerCase()
    .replaceAll('ı', 'i').replaceAll('İ', 'i').replaceAll('ş', 's').replaceAll('ğ', 'g')
    .replaceAll('ç', 'c').replaceAll('ö', 'o').replaceAll('ü', 'u')
    .replace(/[^a-z ]/g, '').trim().replace(/ +/g, '.');
}

// Approval limits (₺) by tier — from KB-POL-004.
export const APPROVAL_LIMITS = { T4: 0, T3: 5000, T2: 100000, T1: 500000, T0: Infinity };

// 12 AI agents.
export const AGENTS = [
  'Knowledge', 'HR', 'Legal', 'Finance', 'Operations', 'Quality',
  'Production', 'Maintenance', 'Document', 'Executive', 'Risk', 'Security',
].map((n) => ({ id: `agent-${n.toLowerCase()}`, name: `${n} Assistant` }));

// 25 workflow definitions (id, name, owner dept, sla days, assistant).
export const WORKFLOWS = [
  ['wf-01', 'Purchase Approval', 'dep-proc', 2, 'agent-finance'],
  ['wf-02', 'Vacation / Leave', 'dep-hr', 1, 'agent-hr'],
  ['wf-03', 'Expense', 'dep-fin', 5, 'agent-finance'],
  ['wf-04', 'Recruitment', 'dep-hr', 10, 'agent-hr'],
  ['wf-05', 'Asset Request', 'dep-wh', 3, 'agent-operations'],
  ['wf-06', 'Incident', 'dep-hse', 5, 'agent-risk'],
  ['wf-07', 'Maintenance', 'dep-mnt', 1, 'agent-maintenance'],
  ['wf-08', 'Corrective Action', 'dep-qua', 30, 'agent-quality'],
  ['wf-09', 'Customer Complaint', 'dep-sup', 5, 'agent-knowledge'],
  ['wf-10', 'Supplier Evaluation', 'dep-proc', 7, 'agent-knowledge'],
  ['wf-11', 'Risk Assessment', 'dep-hse', 14, 'agent-risk'],
  ['wf-12', 'Contract Approval', 'dep-fin', 5, 'agent-legal'],
  ['wf-13', 'Invoice', 'dep-fin', 3, 'agent-finance'],
  ['wf-14', 'Document Approval', 'dep-qua', 5, 'agent-document'],
  ['wf-15', 'Training', 'dep-hr', 7, 'agent-hr'],
  ['wf-16', 'IT Request', 'dep-it', 2, 'agent-knowledge'],
  ['wf-17', 'Password Reset', 'dep-it', 1, 'agent-knowledge'],
  ['wf-18', 'Access Request', 'dep-it', 2, 'agent-security'],
  ['wf-19', 'Visitor Management', 'dep-sec', 1, 'agent-security'],
  ['wf-20', 'CAPA', 'dep-qua', 30, 'agent-quality'],
  ['wf-21', 'Quality Inspection', 'dep-qua', 1, 'agent-quality'],
  ['wf-22', 'Production Change', 'dep-prd', 3, 'agent-production'],
  ['wf-23', 'Internal Audit', 'dep-qua', 30, 'agent-quality'],
  ['wf-24', 'Management Approval', 'dep-exec', 5, 'agent-executive'],
  ['wf-25', 'Emergency Process', 'dep-hse', 1, 'agent-risk'],
].map(([id, name, owner_dept_id, sla_days, assistant_id]) => ({ id, name, owner_dept_id, sla_days, assistant_id }));

// Document categories with counts (reconciles to ~120).
// count and default visibility per category; total sums to ~120.
export const DOC_CATEGORIES = [
  ['POL', 'Policies', 6, 'company', null],
  ['PRC', 'Procedures', 7, 'company', null],
  ['MAN', 'Manuals', 8, 'company', null],
  ['WI', 'Work instructions', 8, 'dep', 'dep-prd'],
  ['ORG', 'Organization', 4, 'company', null],
  ['FRM', 'Forms', 7, 'company', null],
  ['STD', 'Standards', 6, 'company', null],
  ['MTG', 'Meeting notes', 6, 'restricted', 'executives'],
  ['INC', 'Incident reports', 6, 'dep', 'dep-hse'],
  ['MNT', 'Maintenance', 8, 'dep', 'dep-mnt'],
  ['PUR', 'Purchasing', 6, 'dep', 'dep-proc'],
  ['HR', 'HR', 7, 'company', null],
  ['IT', 'IT', 6, 'dep', 'dep-it'],
  ['SEC', 'Security', 6, 'restricted', 'security'],
  ['QUA', 'Quality', 7, 'company', null],
  ['PRD', 'Production', 7, 'dep', 'dep-prd'],
  ['ENV', 'Environmental', 4, 'dep', 'dep-hse'],
  ['EMG', 'Emergency', 5, 'company', null],
];
