// Bilingual UI strings — SPEC §9 glossary + CANON bilingual rule.
// Product terms stay English in both languages (AdOS, Company Brain, Digital
// Employees, Workflows & Approvals).

export const STR = {
  en: {
    app_title: 'AdOS ROI Calculator',
    app_subtitle: 'A planning model you control — not a guarantee.',
    lang_toggle: 'Türkçe',
    theme_toggle: 'Theme',
    section_inputs: 'Your organization',
    section_assumptions: 'Assumptions panel',
    section_results: 'Results',
    section_charts: 'Charts',
    reset: 'Reset to defaults',
    export_pdf: 'Export PDF',
    export_excel: 'Export Excel',
    print: 'Print report',

    // inputs (SPEC §1)
    employee_count: 'Employee count',
    avg_annual_salary: 'Average annual salary (fully loaded)',
    search_minutes_per_day: 'Knowledge search time (min/employee/day)',
    manual_process_count: 'Number of manual processes',
    avg_approval_delay_hours: 'Average approval delay (hours)',
    monthly_document_volume: 'Monthly document volume',
    meetings_per_week: 'Meetings per week per employee',
    annual_training_cost: 'Annual training cost',
    ai_adoption_rate: 'Expected AI adoption rate (%)',
    annual_investment: 'Annual AdOS investment (license + support)',
    currency: 'Currency',

    // assumptions (SPEC §2)
    WORKING_DAYS_PER_YEAR: 'Working days per year',
    WORKING_HOURS_PER_DAY: 'Working hours per day',
    WORKING_WEEKS_PER_YEAR: 'Working weeks per year',
    SEARCH_TIME_RECOVERABLE: 'Search time recovered by Company Brain',
    APPROVAL_DELAY_REDUCTION: 'Approval delay reduction',
    MANUAL_PROCESS_TIME_SAVED: 'Manual-process time saved by Digital Employees',
    HOURS_PER_MANUAL_PROCESS_PER_YEAR: 'Labor hours per manual process per year',
    MINUTES_PER_DOCUMENT: 'Human handling time per document (min)',
    DOCUMENT_TIME_SAVED: 'Document-handling time saved',
    MEETING_DURATION_HOURS: 'Average meeting duration (hours)',
    MEETING_TIME_SAVED: 'Meeting time saved',
    TRAINING_COST_REDUCTION: 'Training-cost reduction',
    EFFICIENCY_BASELINE_HOURS_PCT: 'Efficiency denominator basis',
    RAMP_MONTHS: 'Adoption ramp length (months)',

    // outputs (SPEC §4.4)
    annual_savings: 'Annual Savings',
    roi_percent: 'ROI %',
    payback_months: 'Payback Period',
    efficiency_gain: 'Efficiency Gain',
    time_savings: 'Time savings (hours/year)',
    net_benefit: 'Net annual benefit',
    savings_breakdown: 'Savings breakdown',
    cumulative: 'Cumulative savings vs investment (36 months)',
    payback_point: 'Payback',
    efficiency_gauge: 'Efficiency gain',
    tile_subtext: 'Based on your inputs and assumptions.',

    // breakdown sources (SPEC §4.1)
    company_brain_search: 'Company Brain – Search',
    digital_employees_process: 'Digital Employees – Processes',
    workflows_approvals: 'Workflows & Approvals',
    digital_employees_docs: 'Digital Employees – Documents',
    company_brain_meetings: 'Company Brain – Meetings',
    training: 'Training',

    honest_frame:
      'This is a planning model, not a guaranteed result. Every number below is ' +
      'calculated from the inputs and assumptions you can see and change. AdOS ' +
      'does not guarantee any specific financial outcome.',
    empty_state: 'Enter your numbers to model savings.',

    // validation (SPEC §5)
    err_required: 'This field is required.',
    err_number: 'Enter a valid number.',
    err_integer: 'Enter a whole number.',
    err_range: 'Value is out of the allowed range.',
    err_currency: 'Select a valid currency.',
    warn_search_high: 'Over 2h/day per person spent searching — confirm this figure.',
    warn_approval_high: 'Approval delay over 30 days — please confirm.',
    warn_efficiency_high:
      'This efficiency gain is unusually high; revisit your assumptions — the ' +
      'model is only as honest as its inputs.',
    warn_roi_undefined: 'Enter an annual investment to see ROI % and payback.',
    warn_roi_negative:
      'At these inputs the model does not pay back in year one; adjust adoption, ' +
      'scope, or timeframe.',
    warn_investment_high:
      'Investment is well above modeled first-year savings; check scope and assumptions.',
    currency_note:
      'Currency changes labels only; re-enter amounts in the chosen currency.',
    months_unit: 'months',
    no_payback_36: 'No payback within 36 months at current inputs.',
  },
  tr: {
    app_title: 'AdOS ROI Hesaplayıcı',
    app_subtitle: 'Kontrol sizde olan bir planlama modeli — garanti değil.',
    lang_toggle: 'English',
    theme_toggle: 'Tema',
    section_inputs: 'Kuruluşunuz',
    section_assumptions: 'Varsayımlar Paneli',
    section_results: 'Sonuçlar',
    section_charts: 'Grafikler',
    reset: 'Varsayılanlara sıfırla',
    export_pdf: 'PDF Dışa Aktar',
    export_excel: 'Excel Dışa Aktar',
    print: 'Raporu Yazdır',

    employee_count: 'Çalışan sayısı',
    avg_annual_salary: 'Ortalama yıllık maaş (tüm maliyetler dahil)',
    search_minutes_per_day: 'Bilgi arama süresi (dk/çalışan/gün)',
    manual_process_count: 'Manuel süreç sayısı',
    avg_approval_delay_hours: 'Ortalama onay gecikmesi (saat)',
    monthly_document_volume: 'Aylık doküman hacmi',
    meetings_per_week: 'Çalışan başına haftalık toplantı',
    annual_training_cost: 'Yıllık eğitim maliyeti',
    ai_adoption_rate: 'Beklenen AI benimseme oranı (%)',
    annual_investment: 'Yıllık AdOS yatırımı (lisans + destek)',
    currency: 'Para birimi',

    WORKING_DAYS_PER_YEAR: 'Yıllık çalışma günü',
    WORKING_HOURS_PER_DAY: 'Günlük çalışma saati',
    WORKING_WEEKS_PER_YEAR: 'Yıllık çalışma haftası',
    SEARCH_TIME_RECOVERABLE: 'Company Brain ile geri kazanılan arama süresi',
    APPROVAL_DELAY_REDUCTION: 'Onay gecikmesi azalması',
    MANUAL_PROCESS_TIME_SAVED: 'Digital Employees ile azalan manuel süreç süresi',
    HOURS_PER_MANUAL_PROCESS_PER_YEAR: 'Manuel süreç başına yıllık iş gücü saati',
    MINUTES_PER_DOCUMENT: 'Doküman başına insan işleme süresi (dk)',
    DOCUMENT_TIME_SAVED: 'Doküman işleme süresinden tasarruf',
    MEETING_DURATION_HOURS: 'Ortalama toplantı süresi (saat)',
    MEETING_TIME_SAVED: 'Toplantı süresinden tasarruf',
    TRAINING_COST_REDUCTION: 'Eğitim maliyeti azalması',
    EFFICIENCY_BASELINE_HOURS_PCT: 'Verimlilik payda temeli',
    RAMP_MONTHS: 'Benimseme rampası süresi (ay)',

    annual_savings: 'Yıllık Tasarruf',
    roi_percent: 'Yatırım Getirisi (%)',
    payback_months: 'Geri Ödeme Süresi',
    efficiency_gain: 'Verimlilik Artışı',
    time_savings: 'Zaman Tasarrufu (saat/yıl)',
    net_benefit: 'Net Yıllık Fayda',
    savings_breakdown: 'Tasarruf Dağılımı',
    cumulative: 'Kümülatif Tasarruf vs Yatırım (36 ay)',
    payback_point: 'Geri ödeme',
    efficiency_gauge: 'Verimlilik artışı',
    tile_subtext: 'Girdi ve varsayımlarınıza dayanır.',

    company_brain_search: 'Company Brain – Arama',
    digital_employees_process: 'Digital Employees – Süreçler',
    workflows_approvals: 'Workflows & Approvals',
    digital_employees_docs: 'Digital Employees – Dokümanlar',
    company_brain_meetings: 'Company Brain – Toplantılar',
    training: 'Eğitim',

    honest_frame:
      'Bu bir planlama modelidir, garanti edilen bir sonuç değildir. Aşağıdaki ' +
      'her değer, görebildiğiniz ve değiştirebildiğiniz girdi ve varsayımlardan ' +
      'hesaplanır. AdOS herhangi bir finansal sonucu garanti etmez.',
    empty_state: 'Tasarrufu modellemek için değerlerinizi girin.',

    err_required: 'Bu alan zorunludur.',
    err_number: 'Geçerli bir sayı girin.',
    err_integer: 'Tam sayı girin.',
    err_range: 'Değer izin verilen aralığın dışında.',
    err_currency: 'Geçerli bir para birimi seçin.',
    warn_search_high: 'Kişi başına günde 2 saatten fazla arama — bu değeri doğrulayın.',
    warn_approval_high: 'Onay gecikmesi 30 günü aşıyor — lütfen doğrulayın.',
    warn_efficiency_high:
      'Bu verimlilik artışı olağandışı derecede yüksek; varsayımlarınızı gözden ' +
      'geçirin — model yalnızca girdileri kadar dürüsttür.',
    warn_roi_undefined: 'ROI % ve geri ödeme için yıllık yatırım girin.',
    warn_roi_negative:
      'Bu girdilerle model ilk yılda kendini amorti etmiyor; benimseme, kapsam ' +
      'veya zaman aralığını ayarlayın.',
    warn_investment_high:
      'Yatırım, modellenen ilk yıl tasarrufunun oldukça üzerinde; kapsamı ve ' +
      'varsayımları kontrol edin.',
    currency_note:
      'Para birimi yalnızca etiketleri değiştirir; tutarları seçilen para ' +
      'biriminde yeniden girin.',
    months_unit: 'ay',
    no_payback_36: 'Mevcut girdilerle 36 ay içinde geri ödeme yok.',
  },
};

export const INPUT_ORDER = [
  'employee_count',
  'avg_annual_salary',
  'search_minutes_per_day',
  'manual_process_count',
  'avg_approval_delay_hours',
  'monthly_document_volume',
  'meetings_per_week',
  'annual_training_cost',
  'ai_adoption_rate',
  'annual_investment',
];

export const ASSUMPTION_ORDER = [
  'WORKING_DAYS_PER_YEAR',
  'WORKING_HOURS_PER_DAY',
  'WORKING_WEEKS_PER_YEAR',
  'SEARCH_TIME_RECOVERABLE',
  'APPROVAL_DELAY_REDUCTION',
  'MANUAL_PROCESS_TIME_SAVED',
  'HOURS_PER_MANUAL_PROCESS_PER_YEAR',
  'MINUTES_PER_DOCUMENT',
  'DOCUMENT_TIME_SAVED',
  'MEETING_DURATION_HOURS',
  'MEETING_TIME_SAVED',
  'TRAINING_COST_REDUCTION',
  'RAMP_MONTHS',
];

export const BREAKDOWN_ORDER = [
  'company_brain_search',
  'digital_employees_process',
  'workflows_approvals',
  'digital_employees_docs',
  'company_brain_meetings',
  'training',
];
