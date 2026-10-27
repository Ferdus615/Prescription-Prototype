/* PharmaZ247 prescription module prototype - MOCK DATA ONLY (not clinically verified). */
window.DATA = {
  today: '2026-10-21',

  doctor: {
    name: 'Dr. Farhana Islam', nameBn: 'ডা. ফারহানা ইসলাম', chamberBn: 'শিফা চেম্বার, ধানমন্ডি',
    degrees: 'MBBS, FCPS (Medicine)',
    speciality: 'Internal Medicine',
    bmdc: 'A-12345',
    chamber: 'Shifa Chamber, PharmaZ247 Dhanmondi',
    chamberAddr: 'House 12, Road 5, Dhanmondi, Dhaka',
    phone: '01711-000111'
  },

  patients: {
    p1: { id: 'p1', name: 'Rahima Begum', age: '54 y', sex: 'Female', phone: '01712-***-678', relation: null, allergies: ['Penicillin'],
      vitals: { bp: '140/90', pulse: '78', temp: '98.4', weight: '68', height: '156', spo2: '97' }, returning: true,
      /* PHAR-1693 patient record + last visit by this doctor, used for pre-fill (allergies = the record list above) */
      chronic: ['HTN', 'Hypothyroidism'], last: { date: '2026-10-12', no: 'RX-A12345-0042', dh: ['Taking Camlodin 5 mg regularly', 'Seclo 20 mg 1+0+1'], ph: ['Appendectomy 2015'], fh: ['Father - DM, HTN'] } },
    p2: { id: 'p2', name: 'Sabbir Hossain', age: '29 y', sex: 'Male', phone: '01819-***-204', relation: null, allergies: [],
      vitals: { bp: '120/80', pulse: '88', temp: '101.2', weight: '72', height: '172', spo2: '98' }, returning: false, chronic: [], last: null },
    p3: { id: 'p3', name: 'Arian Uddin', age: '8 y', sex: 'Male', phone: '01915-***-310 (parent)', relation: 'Child of Karim Uddin', allergies: ['Egg'],
      vitals: { bp: '', pulse: '96', temp: '100.4', weight: '25', height: '125', spo2: '99' }, returning: false, chronic: [], last: null },
    p4: { id: 'p4', name: 'Nasrin Akter', age: '41 y', sex: 'Female', phone: '01611-***-552', relation: null, allergies: [],
      vitals: { bp: '130/85', pulse: '82', temp: '98.6', weight: '61', height: '158', spo2: '98' }, returning: false, chronic: [], last: null },
    p5: { id: 'p5', name: 'Mizanur Rahman', age: '63 y', sex: 'Male', phone: '01511-***-097', relation: null, allergies: ['Sulfa'],
      vitals: { bp: '150/95', pulse: '72', temp: '98.2', weight: '74', height: '165', spo2: '95' }, returning: false, chronic: ['HTN', 'DM'], last: null }
  },

  appointments: [
    { serial: 1, time: '09:00', patientId: 'p4', reason: 'Fever, body ache', status: 'Done' },
    { serial: 2, time: '09:20', patientId: 'p1', reason: 'Follow-up, cough and headache', status: 'Waiting', tag: 'Returning patient' },
    { serial: 3, time: '09:40', patientId: 'p2', reason: 'Fever 3 days', status: 'Waiting', tag: 'First visit' },
    { serial: 4, time: '10:00', patientId: 'p3', reason: 'Cold, runny nose', status: 'Waiting', tag: 'Family member' },
    { serial: 5, time: '10:20', patientId: 'p5', reason: 'BP check', status: 'Waiting' }
  ],

  /* Medicine catalogue. def = defaults used when added from search. */
  meds: [
    { id: 'napa500', brand: 'Napa', generic: 'Paracetamol', strength: '500 mg', form: 'Tablet', company: 'Beximco', def: { slots: ['1', '1', '1'], food: 'after', days: 5, unit: 'tab' } },
    { id: 'napaextra', brand: 'Napa Extra', generic: 'Paracetamol + Caffeine', strength: '500 mg + 65 mg', form: 'Tablet', company: 'Beximco', def: { slots: ['1', '1', '1'], food: 'after', days: 5, unit: 'tab' } },
    { id: 'napasyp', brand: 'Napa', generic: 'Paracetamol', strength: '120 mg/5 ml', form: 'Syrup', company: 'Beximco', maxMgKgDay: 75, def: { slots: ['1', '1', '1'], food: 'after', days: 3, unit: 'tsp' } },
    { id: 'ace500', brand: 'Ace', generic: 'Paracetamol', strength: '500 mg', form: 'Tablet', company: 'Square', def: { slots: ['1', '1', '1'], food: 'after', days: 5, unit: 'tab' } },
    { id: 'aceplus', brand: 'Ace Plus', generic: 'Paracetamol + Caffeine', strength: '500 mg + 65 mg', form: 'Tablet', company: 'Square', def: { slots: ['1', '1', '1'], food: 'after', days: 5, unit: 'tab' } },
    { id: 'seclo20', brand: 'Seclo', generic: 'Omeprazole', strength: '20 mg', form: 'Capsule', company: 'Square', def: { slots: ['1', '0', '1'], food: 'before', days: 14, unit: 'cap' } },
    { id: 'losectil20', brand: 'Losectil', generic: 'Omeprazole', strength: '20 mg', form: 'Capsule', company: 'Eskayef', def: { slots: ['1', '0', '1'], food: 'before', days: 14, unit: 'cap' } },
    { id: 'maxpro20', brand: 'Maxpro', generic: 'Esomeprazole', strength: '20 mg', form: 'Tablet', company: 'Renata', def: { slots: ['1', '0', '1'], food: 'before', days: 14, unit: 'tab' } },
    { id: 'camlodin5', brand: 'Camlodin', generic: 'Amlodipine', strength: '5 mg', form: 'Tablet', company: 'Square', def: { slots: ['0', '0', '1'], food: 'any', cont: true, unit: 'tab' } },
    { id: 'bizoran', brand: 'Bizoran', generic: 'Olmesartan + Amlodipine', strength: '20 mg + 5 mg', form: 'Tablet', company: 'Square', def: { slots: ['0', '0', '1'], food: 'any', cont: true, unit: 'tab' } },
    { id: 'tonact10', brand: 'Tonact', generic: 'Atorvastatin', strength: '10 mg', form: 'Tablet', company: 'Square', def: { slots: ['0', '0', '1'], food: 'after', cont: true, unit: 'tab' } },
    { id: 'fexo120', brand: 'Fexo', generic: 'Fexofenadine', strength: '120 mg', form: 'Tablet', company: 'Square', def: { slots: ['0', '0', '1'], food: 'any', days: 10, unit: 'tab' } },
    { id: 'monas10', brand: 'Monas', generic: 'Montelukast', strength: '10 mg', form: 'Tablet', company: 'Acme', def: { slots: ['0', '0', '1'], food: 'any', days: 14, unit: 'tab' } },
    { id: 'comet10', brand: 'Comet', generic: 'Cetirizine', strength: '10 mg', form: 'Tablet', company: 'Square', def: { slots: ['0', '0', '1'], food: 'any', days: 7, unit: 'tab' } },
    { id: 'azith500', brand: 'Azithrocin', generic: 'Azithromycin', strength: '500 mg', form: 'Tablet', company: 'Square', def: { slots: ['1', '0', '0'], food: 'before', days: 3, unit: 'tab' } },
    { id: 'cef200', brand: 'Cef-3', generic: 'Cefixime', strength: '200 mg', form: 'Capsule', company: 'Square', def: { slots: ['1', '0', '1'], food: 'after', days: 5, unit: 'cap' } },
    { id: 'motigut10', brand: 'Motigut', generic: 'Domperidone', strength: '10 mg', form: 'Tablet', company: 'Square', def: { slots: ['1', '1', '1'], food: 'before', days: 7, unit: 'tab' } },
    { id: 'orsaline', brand: 'Orsaline-N', generic: 'Oral Rehydration Salt', strength: '4.1 g', form: 'Sachet', company: 'Square', def: { mode: 'prn', prnMax: 6, food: 'any', days: 3, unit: 'sachet' } },
    { id: 'ventolin', brand: 'Ventolin', generic: 'Salbutamol', strength: '100 mcg/puff', form: 'Inhaler', company: 'GSK', def: { mode: 'prn', prnMax: 4, food: 'any', days: 14, unit: 'puff', route: 'Inhalation' } },
    { id: 'rivotril05', brand: 'Rivotril', generic: 'Clonazepam', strength: '0.5 mg', form: 'Tablet', company: 'Roche', def: { slots: ['0', '0', '1'], food: 'any', days: 14, unit: 'tab' } },
    { id: 'glucomin500', brand: 'Glucomin', generic: 'Metformin', strength: '500 mg', form: 'Tablet', company: 'Incepta', def: { slots: ['1', '0', '1'], food: 'after', cont: true, unit: 'tab' } },
    { id: 'calbod', brand: 'Calbo-D', generic: 'Calcium + Vitamin D3', strength: '500 mg + 200 IU', form: 'Tablet', company: 'Square', def: { slots: ['0', '1', '0'], food: 'after', days: 30, unit: 'tab' } },
    { id: 'bisoloc5', brand: 'Bisoloc', generic: 'Bisoprolol', strength: '5 mg', form: 'Tablet', company: 'Square', def: { slots: ['1', '0', '0'], food: 'any', cont: true, unit: 'tab' } },
    { id: 'cortan5', brand: 'Cortan', generic: 'Prednisolone', strength: '5 mg', form: 'Tablet', company: 'Popular', def: { slots: ['1', '0', '0'], food: 'after', days: 5, unit: 'tab' } },
    { id: 'insulin', brand: 'Humulin 30/70', generic: 'Insulin (Human mixed)', strength: '100 IU/ml', form: 'Injection', company: 'Lilly', def: { mode: 'interval', intervalH: 12, food: 'before', cont: true, unit: 'unit', route: 'SC' } },
    /* PHAR-1724: cls = drug class used for the allergy check (generic is checked too). */
    { id: 'amox500', brand: 'Moxacil', generic: 'Amoxicillin', strength: '500 mg', form: 'Capsule', company: 'Square', cls: 'Penicillin', def: { slots: ['1', '1', '1'], food: 'after', days: 5, unit: 'cap' } },
    { id: 'clav625', brand: 'Clavulin', generic: 'Amoxicillin + Clavulanic Acid', strength: '500 mg + 125 mg', form: 'Tablet', company: 'Square', cls: 'Penicillin', def: { slots: ['1', '0', '1'], food: 'after', days: 5, unit: 'tab' } },
    { id: 'cotrim', brand: 'Bactrim DS', generic: 'Sulfamethoxazole + Trimethoprim', strength: '800 mg + 160 mg', form: 'Tablet', company: 'Roche', cls: 'Sulfa', def: { slots: ['1', '0', '1'], food: 'after', days: 5, unit: 'tab' } },
    /* PHAR-1722: paediatric syrup with a per-kg ceiling (mg/kg/day) for the max-dose warning. */
    { id: 'amoxsyp', brand: 'Moxacil', generic: 'Amoxicillin', strength: '125 mg/5 ml', form: 'Syrup', company: 'Square', cls: 'Penicillin', maxMgKgDay: 90, def: { slots: ['1', '1', '1'], food: 'after', days: 5, unit: 'ml' } },
    /* PHAR-1717: IV fluid for the infusion fields. */
    { id: 'ns1000', brand: 'Normal Saline 0.9%', generic: 'Sodium Chloride', strength: '1000 ml', form: 'IV fluid', company: 'Beximco', def: { slots: ['1', '0', '0'], food: 'any', days: 1, unit: 'bag', route: 'IV' } },
    /* PHAR-1721: eye / ear / nose drops for the side field. */
    { id: 'moxieye', brand: 'Moxicol Eye Drops', generic: 'Moxifloxacin', strength: '0.5%', form: 'Eye drops', company: 'Square', def: { slots: ['1', '1', '1'], food: 'any', days: 7, unit: 'drop', route: 'Eye drop' } },
    { id: 'cipear', brand: 'Ciprocin Ear Drops', generic: 'Ciprofloxacin', strength: '0.3%', form: 'Ear drops', company: 'Square', def: { slots: ['1', '0', '1'], food: 'any', days: 5, unit: 'drop', route: 'Ear drop' } },
    { id: 'xylonasal', brand: 'Nasocon', generic: 'Xylometazoline', strength: '0.1%', form: 'Nasal drops', company: 'Acme', def: { slots: ['1', '0', '1'], food: 'any', days: 3, unit: 'drop', route: 'Nasal' } }
  ],

  /* Clinical note sections (prescription_design.md section 3). kind decides which editor renders. */
  sections: [
    { id: 'cc', title: 'Chief complaints', abbr: 'C/C', kind: 'chips' },
    { id: 'kco', title: 'Comorbidity', abbr: 'K/C/O', kind: 'chips' },
    { id: 'dh', title: 'Drug history and allergies', abbr: 'D/H', kind: 'chips' },
    { id: 'ph', title: 'Past history', abbr: 'P/H', kind: 'chips' },
    { id: 'fh', title: 'Family and personal history', abbr: 'F/H', kind: 'chips' },
    { id: 'oe', title: 'On examination', abbr: 'O/E', kind: 'chips' },
    { id: 'oi', title: 'On investigation (results)', abbr: 'O/I', kind: 'chips' },
    { id: 'tests', title: 'Advised tests', abbr: 'Inv', kind: 'tests' },
    { id: 'dx', title: 'Diagnosis', abbr: 'Dx', kind: 'dx' },
    { id: 'advice', title: 'Advice / পরামর্শ', abbr: 'Adv', kind: 'advice' },
    { id: 'fu', title: 'Follow-up', abbr: 'F/U', kind: 'followup' }
  ],

  /* The doctor's own previously used entries: n = times used, d = days since last use. */
  noteSuggest: {
    cc: [{ t: 'Fever - 3 days', n: 14, d: 2 }, { t: 'Cough - 5 days', n: 11, d: 3 }, { t: 'Headache - 2 days', n: 9, d: 1 }, { t: 'Body ache', n: 7, d: 6 }, { t: 'Loose motion - 1 day', n: 3, d: 40 }, { t: 'Burning sensation in epigastrium', n: 12, d: 9 }],
    kco: [{ t: 'HTN', n: 30, d: 1 }, { t: 'DM', n: 26, d: 2 }, { t: 'Bronchial asthma', n: 8, d: 12 }, { t: 'Hypothyroidism', n: 6, d: 20 }, { t: 'IHD', n: 5, d: 18 }],
    dh: [{ t: 'Taking Camlodin 5 mg regularly', n: 4, d: 8 }, { t: 'NSAID use for knee pain', n: 5, d: 15 }, { t: 'Allergy: Penicillin', n: 3, d: 10 }],
    ph: [{ t: 'Appendectomy 2015', n: 2, d: 90 }, { t: 'Typhoid 2022', n: 2, d: 120 }, { t: 'No significant past illness', n: 20, d: 1 }],
    fh: [{ t: 'Father - DM, HTN', n: 9, d: 4 }, { t: 'Mother - HTN', n: 7, d: 7 }, { t: 'Non-smoker', n: 18, d: 1 }, { t: 'Betel leaf chewing', n: 3, d: 25 }],
    oe: [{ t: 'Mild pallor', n: 8, d: 5 }, { t: 'No jaundice, no oedema', n: 22, d: 1 }, { t: 'Chest: clear, no added sounds', n: 19, d: 2 }, { t: 'CVS: S1 S2 normal, no murmur', n: 16, d: 2 }, { t: 'Throat: congested', n: 10, d: 3 }, { t: 'Abdomen: soft, mild epigastric tenderness', n: 6, d: 9 }],
    oi: [{ t: 'Hb 9.2 g/dL', n: 2, d: 30 }, { t: 'RBS 7.8 mmol/L', n: 12, d: 4 }, { t: 'USG: Fatty liver (grade I)', n: 4, d: 14 }],
    advice: [
      { t: 'প্রচুর পানি পান করবেন / Drink plenty of water', n: 40, d: 1 },
      { t: 'পর্যাপ্ত বিশ্রাম নিন / Take adequate rest', n: 33, d: 1 },
      { t: 'লবণ কম খাবেন / Reduce salt intake', n: 21, d: 3 },
      { t: 'জ্বর ৩ দিনের বেশি থাকলে যোগাযোগ করবেন / Contact if fever persists more than 3 days', n: 12, d: 2 }
    ],
    dx: [{ t: 'Viral fever', n: 18, d: 2 }, { t: 'Essential hypertension', n: 25, d: 1 }, { t: 'Gastritis', n: 14, d: 6 }, { t: 'Allergic rhinitis', n: 8, d: 10 }, { t: 'Type 2 diabetes mellitus', n: 20, d: 3 }]
  },
  commonPhrases: {
    cc: ['Fever', 'Cough', 'Sore throat', 'Chest pain', 'Breathlessness', 'Vomiting', 'Abdominal pain', 'Dizziness'],
    kco: ['CKD', 'COPD', 'Epilepsy', 'CLD', 'Stroke (old)'],
    dh: ['No known drug allergy', 'On aspirin', 'On anticoagulant'],
    ph: ['Hospital admission - none', 'Previous surgery - none'],
    fh: ['Smoker', 'Non-smoker', 'Sedentary lifestyle'],
    oe: ['Anaemia: none', 'Pulse regular', 'Lymph nodes: not palpable', 'CNS: no focal deficit'],
    oi: ['CBC: normal', 'ECG: normal sinus rhythm', 'CXR: normal'],
    advice: ['ধূমপান বর্জন করুন / Quit smoking', 'নিয়মিত হাঁটুন / Walk regularly', 'তেল-চর্বিযুক্ত খাবার কম খান / Avoid oily food'],
    dx: ['Acute tonsillitis', 'Urinary tract infection', 'Dyspepsia']
  },

  labTests: ['CBC', 'ESR', 'CRP', 'Blood sugar (Fasting)', 'Blood sugar (2h after breakfast)', 'HbA1c', 'S. Creatinine', 'Urine R/M/E', 'Lipid profile', 'SGPT (ALT)', 'TSH', 'ECG', 'Chest X-ray P/A view', 'USG of whole abdomen', 'Dengue NS1 antigen', 'Widal test', 'S. Electrolytes', 'Echocardiogram'],
  /* PHAR-1698 report entry: unit + reference range suggested when a test name is picked (mock, NOT clinically verified). */
  labRef: {
    'Hb': { unit: 'g/dL', ref: '12.0-15.5' }, 'HbA1c': { unit: '%', ref: '4.0-5.6' }, 'Blood sugar (Fasting)': { unit: 'mmol/L', ref: '3.9-5.6' },
    'Blood sugar (2h after breakfast)': { unit: 'mmol/L', ref: '4.0-7.8' }, 'S. Creatinine': { unit: 'mg/dL', ref: '0.6-1.2' }, 'TSH': { unit: 'mIU/L', ref: '0.4-4.0' },
    'SGPT (ALT)': { unit: 'U/L', ref: '7-56' }, 'CRP': { unit: 'mg/L', ref: '<5' }, 'ESR': { unit: 'mm/hr', ref: '0-20' },
    'Total cholesterol': { unit: 'mmol/L', ref: '<5.2' }, 'LDL-C': { unit: 'mmol/L', ref: '<3.4' }, 'HDL-C': { unit: 'mmol/L', ref: '>1.0' }, 'Triglyceride': { unit: 'mmol/L', ref: '<1.7' },
    'Lipid profile': { panel: ['Total cholesterol', 'LDL-C', 'HDL-C', 'Triglyceride'] }, 'CBC': { panel: ['Hb'] }
  },
  /* PHAR-1699 follow-up slot booking: times the chamber offers each open day (mock); taken ones are listed. Friday is closed. */
  fuSlots: { times: ['09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20'], taken: ['09:20', '10:00', '10:40'], closedDow: 5 },
  testTemplates: [
    { id: 'tt1', name: 'Diabetes panel', tests: ['Blood sugar (Fasting)', 'Blood sugar (2h after breakfast)', 'HbA1c', 'S. Creatinine', 'Urine R/M/E'] },
    { id: 'tt2', name: 'Fever work-up', tests: ['CBC', 'ESR', 'CRP', 'Urine R/M/E', 'Dengue NS1 antigen'] },
    { id: 'tt3', name: 'Cardiac screen', tests: ['ECG', 'Lipid profile', 'Echocardiogram'] }
  ],

  /* PHAR-1719 non-drug orders: types, the doctor's saved entries (mine) and common suggestions. PHAR-1720: specialities for referral. */
  orderTypes: [
    { id: 'diet', en: 'Diet', bn: 'খাদ্যাভ্যাস' }, { id: 'exercise', en: 'Exercise', bn: 'ব্যায়াম' }, { id: 'physio', en: 'Physiotherapy', bn: 'ফিজিওথেরাপি' },
    { id: 'procedure', en: 'Procedure', bn: 'প্রক্রিয়া' }, { id: 'dressing', en: 'Dressing', bn: 'ড্রেসিং' }, { id: 'neb', en: 'Nebulisation', bn: 'নেবুলাইজেশন' }, { id: 'other', en: 'Other', bn: 'অন্যান্য' }
  ],
  orderSuggest: {
    mine: [
      { type: 'diet', en: 'Low-salt diet', bn: 'কম লবণযুক্ত খাবার খাবেন', d: 'daily' },
      { type: 'exercise', en: 'Brisk walk 30 minutes', bn: 'প্রতিদিন ৩০ মিনিট দ্রুত হাঁটবেন', d: 'daily' },
      { type: 'dressing', en: 'Wound dressing', bn: 'ক্ষতস্থানে ড্রেসিং করাবেন', d: 'every 2 days' }
    ],
    common: [
      { type: 'diet', en: 'Diabetic diet - avoid sugar and sweets', bn: 'চিনি ও মিষ্টি জাতীয় খাবার এড়িয়ে চলবেন', d: '' },
      { type: 'diet', en: 'Soft, bland diet', bn: 'নরম ও কম মসলাযুক্ত খাবার খাবেন', d: '1 week' },
      { type: 'diet', en: 'Plenty of oral fluids', bn: 'প্রচুর তরল খাবার পান করবেন', d: '' },
      { type: 'exercise', en: 'Gentle stretching exercises', bn: 'হালকা স্ট্রেচিং ব্যায়াম করবেন', d: '10 min, twice daily' },
      { type: 'physio', en: 'Physiotherapy - lower back (TENS + exercises)', bn: 'কোমরের ফিজিওথেরাপি (TENS ও ব্যায়াম)', d: '3 sessions a week for 2 weeks' },
      { type: 'physio', en: 'Chest physiotherapy', bn: 'বুকের ফিজিওথেরাপি', d: 'twice daily' },
      { type: 'procedure', en: 'Incision and drainage of abscess', bn: 'ফোড়া কেটে পুঁজ বের করা', d: '' },
      { type: 'procedure', en: 'Suture removal', bn: 'সেলাই খোলা', d: 'after 7 days' },
      { type: 'dressing', en: 'Daily wound dressing with antiseptic', bn: 'প্রতিদিন অ্যান্টিসেপটিক দিয়ে ড্রেসিং', d: 'daily for 5 days' },
      { type: 'neb', en: 'Nebulisation with salbutamol', bn: 'স্যালবুটামল নেবুলাইজেশন', d: 'every 6 hours if breathless' },
      { type: 'other', en: 'Steam inhalation', bn: 'গরম ভাপ নেবেন', d: 'twice daily' }
    ]
  },
  specialities: ['Cardiology', 'Endocrinology', 'Gastroenterology', 'Neurology', 'Orthopaedics', 'Ophthalmology', 'ENT', 'Dermatology', 'Nephrology', 'Paediatrics', 'Psychiatry', 'General Surgery'],

  /* Speed layer: condition templates, saved combinations, single-medicine presets. */
  medTemplates: {
    condition: [
      { id: 'c1', name: 'Viral fever', dx: 'Viral fever', meds: [{ id: 'napa500' }, { id: 'orsaline' }, { id: 'comet10', days: 5 }], tests: ['CBC', 'ESR'], advice: ['a1', 'a2', 'a3'], orders: [{ type: 'diet', en: 'Soft, bland diet', bn: 'নরম ও কম মসলাযুক্ত খাবার খাবেন', d: '1 week' }, { type: 'diet', en: 'Plenty of oral fluids', bn: 'প্রচুর তরল খাবার পান করবেন', d: '' }], followN: 3, followUnit: 'days', followNote: 'With reports if fever persists' },
      { id: 'c2', name: 'Hypertension follow-up', dx: 'Essential hypertension', meds: [{ id: 'camlodin5' }, { id: 'tonact10' }], tests: ['S. Creatinine', 'Lipid profile'], advice: ['a4', 'a5'], orders: [{ type: 'diet', en: 'Low-salt diet', bn: 'কম লবণযুক্ত খাবার খাবেন', d: 'daily' }, { type: 'exercise', en: 'Brisk walk 30 minutes', bn: 'প্রতিদিন ৩০ মিনিট দ্রুত হাঁটবেন', d: 'daily' }], followN: 1, followUnit: 'months', followNote: 'Bring BP chart' },
      { id: 'c3', name: 'Gastritis', dx: 'Gastritis', meds: [{ id: 'seclo20' }, { id: 'motigut10' }], tests: [], advice: ['a2', 'a6'], followN: 2, followUnit: 'weeks', followNote: '' },
      /* Dosage steps (PHAR-1716): steps run in order; quantity = sum of steps. */
      { id: 'c4', name: 'Asthma flare (steroid taper)', dx: 'Bronchial asthma - acute exacerbation',
        meds: [{ id: 'cortan5', steps: [{ slots: ['1', '0', '0'], amount: '8', durVal: '5' }, { slots: ['1', '0', '0'], amount: '6', durVal: '5' }, { slots: ['1', '0', '0'], amount: '4', durVal: '5' }, { slots: ['1', '0', '0'], amount: '2', durVal: '5' }] },
          { id: 'ventolin' }, { id: 'monas10', days: 30 }],
        tests: ['CBC', 'Chest X-ray P/A view'], advice: ['a2'], followN: 2, followUnit: 'weeks', followNote: 'Earlier if breathing gets worse' }
    ],
    combos: [
      { id: 'k1', name: 'Gastritis pack (Seclo + Motigut)', meds: [{ id: 'seclo20' }, { id: 'motigut10' }] },
      { id: 'k2', name: 'Allergy pack (Fexo + Monas)', meds: [{ id: 'fexo120' }, { id: 'monas10' }] },
      { id: 'k3', name: 'Cough & cold pack', meds: [{ id: 'comet10', days: 5 }, { id: 'napa500', days: 3 }] }
    ],
    presets: [
      { id: 's1', name: 'Napa 500 - 1+1+1 after meal, 5 days', med: { id: 'napa500', mode: 'pattern', slots: ['1', '1', '1'], food: 'after', days: 5 } },
      { id: 's2', name: 'Seclo 20 - 1+0+1 before meal, 14 days', med: { id: 'seclo20', mode: 'pattern', slots: ['1', '0', '1'], food: 'before', days: 14 } },
      { id: 's3', name: 'Fexo 120 - 0+0+1, 10 days', med: { id: 'fexo120', mode: 'pattern', slots: ['0', '0', '1'], days: 10 } },
      { id: 's4', name: 'Orsaline-N - SOS after each loose stool', med: { id: 'orsaline', mode: 'prn', instr: 'প্রতিবার পাতলা পায়খানার পর / After each loose stool' } },
      { id: 's5', name: 'Cortan 5 - taper 8→6→4→2 tab after meal, 20 days', med: { id: 'cortan5', food: 'after',
        steps: [{ amount: '8', durVal: '5' }, { amount: '6', durVal: '5' }, { amount: '4', durVal: '5' }, { amount: '2', durVal: '5' }], instrs: ['হঠাৎ বন্ধ করবেন না / Do not stop suddenly'] } },
      /* PHAR-1717 infusion + sliding scale, PHAR-1721 SOS reason + side. x = extra line fields. */
      { id: 's6', name: 'Normal Saline 1000 ml - IV 20 drops/min over 8 h', med: { id: 'ns1000', route: 'IV', x: { infVol: '1000', infUnit: 'ml', rateValue: '20', rateUnit: 'drops/min', overHours: '8', qtyMan: '1' } } },
      { id: 's7', name: 'Humulin sliding scale - before meals by RBS', med: { id: 'insulin', mode: 'pattern', slots: ['1', '1', '1'], amount: '4', food: 'before', days: 7, cont: false, route: 'SC',
        x: { qtyMan: '300', cond: [{ c: 'RBS 8–10 mmol/L', d: '4 units' }, { c: 'RBS 11–14 mmol/L', d: '6 units' }, { c: 'RBS > 14 mmol/L', d: '8 units and call the doctor' }] } } },
      { id: 's8', name: 'Napa 500 - SOS if fever', med: { id: 'napa500', mode: 'prn', prnMax: 3, food: 'after', days: 3, x: { asNeededReason: 'জ্বর ১০০°F এর বেশি হলে' } } },
      { id: 's9', name: 'Moxicol Eye Drops - right eye 1+1+1', med: { id: 'moxieye', route: 'Eye drop', x: { side: 'RIGHT' } } }
    ]
  },

  /* PHAR-1694 library categories (assumed - check against ticket). */
  adviceCats: [['diet', 'Diet', 'খাদ্যাভ্যাস'], ['rest', 'Rest and lifestyle', 'বিশ্রাম ও জীবনযাপন'], ['warning', 'Warning signs', 'সতর্ক লক্ষণ'], ['medicine', 'Using medicines', 'ওষুধ সেবন'], ['other', 'Other', 'অন্যান্য']],
  adviceLibrary: [
    { id: 'a1', cat: 'diet', title: 'Drink water', bn: 'প্রচুর পানি পান করবেন', en: 'Drink plenty of water' },
    { id: 'a2', cat: 'rest', title: 'Rest', bn: 'পর্যাপ্ত বিশ্রাম নিন', en: 'Take adequate rest' },
    { id: 'a3', cat: 'warning', title: 'Fever warning signs', bn: 'জ্বর ৩ দিনের বেশি থাকলে বা শ্বাসকষ্ট হলে দ্রুত যোগাযোগ করবেন', en: 'Contact urgently if fever lasts over 3 days or breathing is difficult' },
    { id: 'a4', cat: 'diet', title: 'Low salt diet', bn: 'লবণ কম খাবেন', en: 'Reduce salt intake' },
    { id: 'a5', cat: 'rest', title: 'Walk daily', bn: 'প্রতিদিন ৩০ মিনিট হাঁটবেন', en: 'Walk 30 minutes daily' },
    { id: 'a6', cat: 'diet', title: 'Avoid spicy food', bn: 'ঝাল ও তেলযুক্ত খাবার এড়িয়ে চলবেন', en: 'Avoid spicy and oily food' },
    { id: 'a7', cat: 'diet', title: 'Diabetic diet', bn: 'চিনি ও মিষ্টি জাতীয় খাবার বর্জন করবেন', en: 'Avoid sugar and sweets' },
    { id: 'a8', cat: 'medicine', title: 'Finish antibiotic course', bn: 'অ্যান্টিবায়োটিকের কোর্স শেষ করবেন, মাঝপথে বন্ধ করবেন না', en: 'Finish the full antibiotic course' },
    { id: 'a9', cat: 'medicine', title: 'Take with water', bn: 'ওষুধ এক গ্লাস পানি দিয়ে খাবেন', en: 'Take medicines with a glass of water' }
  ],

  /* The doctor's saved instruction formats (suggested next time). */
  instrFormats: [
    'খাবারের ৩০ মিনিট আগে / 30 minutes before meal',
    'প্রচুর পানি সহ গিলবেন / Swallow with plenty of water',
    'ঘুমানোর আগে / At bedtime',
    'জ্বর থাকলে / If fever',
    'কোর্স শেষ করবেন / Complete the full course'
  ],

  /*
   Issued prescriptions per patient (all doctors). byMe=false entries are ANOTHER doctor's:
   the UI must never show their brand, doctor name or notes (D1) - brand is stored only to mimic a real record.
   days: null = continuous.
  */
  history: {
    p1: [
      { id: 'rx31', no: 'RX-A12345-0031', version: 1, date: '2026-09-14', byMe: true,
        lines: [{ medId: 'napa500', pattern: '1+1+1', days: 5, food: 'after' }, { medId: 'seclo20', pattern: '1+0+1', days: 14, food: 'before' }, { medId: 'camlodin5', pattern: '0+0+1', days: null, food: 'any' }],
        tests: ['CBC', 'S. Creatinine'], cc: ['Fever - 3 days', 'Burning sensation in epigastrium'], dx: [{ t: 'Gastritis', type: 'PROVISIONAL' }, { t: 'Essential hypertension', type: 'FINAL' }],
        advice: ['প্রচুর পানি পান করবেন / Drink plenty of water'], follow: 'After 14 days',
        /* PHAR-1720 admission advice (mock) */
        adm: { id: 'h-adm1', where: 'General ward', facility: 'Dhaka Medical College Hospital', why: 'Severe dehydration - needs IV fluids and monitoring', urgency: 'within24', when: '' } },
      { id: 'rx42', no: 'RX-A12345-0042', version: 2, date: '2026-10-12', byMe: true,
        lines: [{ medId: 'napa500', pattern: '1+0+1', days: 7, food: 'after' }, { medId: 'seclo20', pattern: '1+0+1', days: 30, food: 'before' }, { medId: 'camlodin5', pattern: '0+0+1', days: null, food: 'any' }],
        tests: ['Lipid profile', 'Blood sugar (Fasting)'], cc: ['Headache - 2 days', 'Body ache'], dx: [{ t: 'Gastritis', type: 'FINAL' }, { t: 'Essential hypertension', type: 'FINAL' }],
        advice: ['লবণ কম খাবেন / Reduce salt intake'], follow: 'After 30 days', bnd: true,
        /* PHAR-1700 snapshot of the notes as issued (patient sees the full submitted Rx, D6); PHAR-1698 results; PHAR-1699 follow-up */
        snap: { vitals: { bp: '140/90', pulse: '78', temp: '98.4', weight: '68', height: '156', spo2: '97' }, secs: [
          { abbr: 'C/C', title: 'Chief complaints', items: ['Headache - 2 days', 'Body ache'] }, { abbr: 'K/C/O', title: 'Comorbidity', items: ['HTN'] },
          { abbr: 'D/H', title: 'Drug history and allergies', items: ['Allergy: Penicillin', 'Taking Camlodin 5 mg regularly'] }, { abbr: 'P/H', title: 'Past history', items: ['Appendectomy 2015'] },
          { abbr: 'O/E', title: 'On examination', items: ['Mild pallor', 'No jaundice, no oedema'] }, { abbr: 'O/I', title: 'On investigation (results)', items: [] },
          { abbr: 'Exam / Inv', title: 'Tests advised', items: ['Lipid profile', 'Blood sugar (Fasting)'] }, { abbr: 'Dx', title: 'Diagnosis', items: ['Gastritis (Final)', 'Essential hypertension (Final)'] }],
          res: [{ id: 'h-res1', name: 'S. Creatinine', value: '0.9', unit: 'mg/dL', ref: '0.6-1.2', date: '2026-10-10', flag: '', link: 'RX-A12345-0031' }, { id: 'h-res2', name: 'Hb', value: '10.4', unit: 'g/dL', ref: '12.0-15.5', date: '2026-10-10', flag: '', link: 'RX-A12345-0031' }] },
        fuRec: { n: 30, unit: 'days', date: '2026-11-11', time: '10:20', note: 'With reports', rem: true, remDays: 1 },
        /* PHAR-1719 non-drug orders, PHAR-1720 referral + certificate (mock) */
        orders: [{ id: 'h-o1', type: 'diet', en: 'Low-salt diet', bn: 'কম লবণযুক্ত খাবার খাবেন', d: 'daily' }, { id: 'h-o2', type: 'exercise', en: 'Brisk walk 30 minutes', bn: 'প্রতিদিন ৩০ মিনিট দ্রুত হাঁটবেন', d: 'daily' }],
        refs: [{ id: 'h-r1', to: 'speciality', spec: 'Cardiology', name: '', reason: 'BP not controlled on two medicines', urgency: 'routine', notes: '' }],
        cert: { id: 'h-c1', ctype: 'rest', from: '2026-10-12', days: '2', purpose: '', remarks: '', dx: true, dxText: 'Gastritis; Essential hypertension' } },
      { id: 'rxB210', no: 'RX-B55102-0210', version: 1, date: '2026-10-18', byMe: false,
        lines: [{ medId: 'aceplus', pattern: '1+1+1', days: 5, food: 'after' }, { medId: 'fexo120', pattern: '0+0+1', days: 10, food: 'any' }],
        tests: [], cc: [], dx: [], advice: [], follow: '' }
    ],
    p3: [
      { id: 'rxB77', no: 'RX-C90017-0077', version: 1, date: '2026-10-17', byMe: false,
        lines: [{ medId: 'napasyp', pattern: '1+1+1', days: 3, food: 'after' }, { medId: 'cef200', pattern: '1+0+1', days: 5, food: 'after' }],
        tests: [], cc: [], dx: [], advice: [], follow: '' }
    ]
  },

  /* Verify page records. key = Rx number. */
  verifyDb: [
    { no: 'RX-A12345-0036', code: 'ZP4M-8XQD', status: 'VALID', issued: '3 Oct 2026', doctor: 'Dr. Farhana Islam', bmdc: 'A-12345', patient: 'M*** R*****', meds: ['Napa 500 mg - 1+1+1 - 5 days', 'Comet 10 mg - 0+0+1 - 7 days'] },
    { no: 'RX-A12345-0042', code: 'K7QF-3MZA', status: 'VALID', issued: '12 Oct 2026', doctor: 'Dr. Farhana Islam', bmdc: 'A-12345', patient: 'R**** B*****', newer: '21 Oct 2026', meds: ['Napa 500 mg - 1+0+1 - 7 days', 'Seclo 20 mg - 1+0+1 - 30 days', 'Camlodin 5 mg - 0+0+1 - continue'] },
    { no: 'RX-A12345-0029', code: 'H2D9-WLQ5', status: 'CHANGED', issued: '28 Sep 2026' }
  ]
}

/* ===== WAVE 4 (PHAR-1701..1708) - speciality catalogue, practitioner types, block library, doctors, animals. MOCK, not clinically verified. ===== */
;(function () {
  var D = window.DATA

  /* PHAR-1702 practitioner types (design 4.3 / 4.4): defaults for the two prescribing switches + print layout. PHAR-1708: printTitle / rxLabel. */
  D.practTypes = {
    PHYSICIAN: { label: 'Physician', tab: 'Doctors', regLabel: 'BMDC Reg. No.', med: true, patient: 'human', printTitle: '', rxLabel: '' },
    DENTAL: { label: 'Dental surgeon', tab: 'Dentists', regLabel: 'BMDC Reg. No. (BDS)', med: true, patient: 'human', printTitle: 'Dental prescription / ডেন্টাল প্রেসক্রিপশন', rxLabel: '' },
    ALLIED_HEALTH: { label: 'Allied health', tab: 'Therapy & Nutrition', regLabel: 'Reg. No.', med: false, patient: 'human', printTitle: 'Treatment plan / চিকিৎসা পরিকল্পনা', rxLabel: 'Treatment plan / চিকিৎসা পরিকল্পনা' },
    TRADITIONAL: { label: 'Traditional practitioner', tab: 'Homeopathy / Unani / Ayurveda', regLabel: 'Reg. No.', med: false, patient: 'human', printTitle: 'Prescription / ব্যবস্থাপত্র', rxLabel: '' },
    VETERINARY: { label: 'Veterinary doctor', tab: 'Veterinary', regLabel: 'BVC Reg. No.', med: true, patient: 'animal', printTitle: 'Veterinary prescription / পশু চিকিৎসা ব্যবস্থাপত্র', rxLabel: '' }
  }
  D.regBodies = { BMDC: 'BMDC', BVC: 'BVC', HOMEOPATHY_BOARD: 'Homeopathy board', UNANI_AYURVEDIC_BOARD: 'Unani & Ayurvedic board', OTHER: 'Other', NONE: 'None' }
  /* PHAR-1708 per-speciality print title / right-column label for the non-physician templates (wording assumed - check against ticket). */
  D.specPrint = {
    PHYSIOTHERAPY: { title: 'Physiotherapy prescription / ফিজিওথেরাপি ব্যবস্থাপত্র', rx: 'Exercise & therapy plan / ব্যায়াম ও থেরাপি পরিকল্পনা' },
    NUTRITION_DIETETICS: { title: 'Diet & nutrition plan / খাদ্য ও পুষ্টি পরিকল্পনা', rx: 'Diet plan / খাদ্য তালিকা' },
    CLINICAL_PSYCHOLOGY: { title: 'Clinical psychology advice / ক্লিনিক্যাল সাইকোলজি পরামর্শ', rx: 'Therapy plan / থেরাপি পরিকল্পনা' },
    HOMEOPATHY: { title: 'Homeopathic prescription / হোমিওপ্যাথিক ব্যবস্থাপত্র', rx: 'Remedies / ঔষধ' },
    UNANI: { title: 'Unani prescription / ইউনানী ব্যবস্থাপত্র', rx: 'Medicines / ঔষধ' },
    AYURVEDA: { title: 'Ayurvedic prescription / আয়ুর্বেদিক ব্যবস্থাপত্র', rx: 'Medicines / ঔষধ' }
  }

  /* PHAR-1701 speciality catalogue (design 4.3): CODE|Name|type|default blocks. */
  var CAT = [
    ['Primary care', 'GENERAL_PRACTICE|General Practice / Family Medicine|P|preventive,immunisation', 'INTERNAL_MEDICINE|Internal Medicine|P|diabetes,cardiac,renal', 'PEDIATRICS|Pediatrics|P|growth,birthHistory,immunisation', 'GERIATRICS|Geriatrics|P|geriatric,diabetes,cardiac'],
    ['Medicine specialities', 'CARDIOLOGY|Cardiology|P|cardiac,diabetes', 'ENDOCRINOLOGY|Endocrinology|P|diabetes,thyroid', 'DIABETOLOGY|Diabetology|P|diabetes,thyroid,renal', 'GASTROENTEROLOGY|Gastroenterology|P|giLiver', 'HEPATOLOGY|Hepatology|P|giLiver', 'HEMATOLOGY|Hematology|P|haematology,oncology',
      'INFECTIOUS_DISEASE|Infectious Disease|P|infection,immunisation', 'NEPHROLOGY|Nephrology|P|renal,diabetes', 'MEDICAL_ONCOLOGY|Oncology (Medical)|P|oncology,pain', 'PULMONOLOGY|Pulmonology / Respirology|P|respiratory,sleep', 'RHEUMATOLOGY|Rheumatology|P|jointCount,msk', 'ALLERGY_IMMUNOLOGY|Allergy & Immunology|P|allergyTest,respiratory'],
    ['Surgical specialities', 'GENERAL_SURGERY|General Surgery|P|localExam,perioperative', 'ORTHOPEDIC_SURGERY|Orthopedic Surgery|P|msk,perioperative', 'NEUROSURGERY|Neurosurgery|P|neuro,perioperative', 'CARDIOTHORACIC_SURGERY|Cardiothoracic Surgery|P|cardiac,respiratory,perioperative', 'VASCULAR_SURGERY|Vascular Surgery|P|vascular,localExam,perioperative',
      'PLASTIC_SURGERY|Plastic, Reconstructive & Aesthetic Surgery|P|localExam,burn,perioperative', 'UROLOGY|Urology|P|urology,perioperative', 'ENT|Otolaryngology (ENT)|P|ent,perioperative', 'PEDIATRIC_SURGERY|Pediatric Surgery|P|growth,localExam,perioperative', 'COLORECTAL_SURGERY|Colon & Rectal Surgery (Proctology)|P|localExam,giLiver,perioperative'],
    ["Women's & reproductive health", 'OBSTETRICS_GYNECOLOGY|Obstetrics & Gynecology (OB-GYN)|P|obstetric,menstrual,gynaeExam', 'MATERNAL_FETAL_MEDICINE|Maternal-Fetal Medicine|P|obstetric,diabetes', 'REPRODUCTIVE_ENDOCRINOLOGY|Reproductive Endocrinology & Infertility|P|infertility,menstrual,gynaeExam', 'GYNECOLOGIC_ONCOLOGY|Gynecologic Oncology|P|oncology,menstrual,gynaeExam,perioperative'],
    ['Brain, nerves & mental health', 'NEUROLOGY|Neurology|P|neuro', 'PSYCHIATRY|Psychiatry|P|mse', 'CHILD_ADOLESCENT_PSYCHIATRY|Child & Adolescent Psychiatry|P|mse,growth', 'ADDICTION_MEDICINE|Addiction Psychiatry / Medicine|P|mse,substanceUse'],
    ['Eye, skin', 'DERMATOLOGY|Dermatology|P|skin,sti', 'OPHTHALMOLOGY|Ophthalmology|P|eye'],
    ['Emergency & anaesthesia', 'EMERGENCY_MEDICINE|Emergency Medicine|P|triage', 'CRITICAL_CARE|Critical Care Medicine|P|criticalCare', 'ANESTHESIOLOGY|Anesthesiology|P|preAnaesthetic,pain', 'TRAUMA_SURGERY|Trauma Surgery|P|triage,localExam,perioperative'],
    ['Diagnostics', 'DIAGNOSTIC_RADIOLOGY|Diagnostic Radiology|P|diagnosticReport', 'INTERVENTIONAL_RADIOLOGY|Interventional Radiology|P|diagnosticReport,perioperative', 'PATHOLOGY|Pathology|P|diagnosticReport', 'NUCLEAR_MEDICINE|Nuclear Medicine|P|diagnosticReport,thyroid'],
    ['Supportive & preventive', 'PHYSICAL_MEDICINE_REHAB|Physical Medicine & Rehabilitation|P|function,msk,pain', 'PAIN_MEDICINE|Pain Medicine|P|pain', 'OCCUPATIONAL_MEDICINE|Occupational & Environmental Medicine|P|occupational', 'PREVENTIVE_MEDICINE|Public Health & Preventive Medicine|P|preventive,immunisation',
      'MEDICAL_GENETICS|Medical Genetics|P|genetics', 'SPORTS_MEDICINE|Sports Medicine|P|msk,function', 'PALLIATIVE_CARE|Palliative & Hospice Care|P|palliative,pain'],
    ['Added physician specialities', 'NEONATOLOGY|Neonatology|P|neonatal,birthHistory,growth', 'PEDIATRIC_CARDIOLOGY|Pediatric Cardiology|P|growth,cardiac', 'PEDIATRIC_NEUROLOGY|Pediatric Neurology|P|growth,neuro', 'PEDIATRIC_NEPHROLOGY|Pediatric Nephrology|P|growth,renal',
      'PEDIATRIC_HEMATOLOGY_ONCOLOGY|Pediatric Hematology & Oncology|P|growth,haematology,oncology', 'PEDIATRIC_GASTROENTEROLOGY|Pediatric Gastroenterology|P|growth,giLiver', 'RADIATION_ONCOLOGY|Radiation Oncology (Radiotherapy)|P|oncology,pain', 'SURGICAL_ONCOLOGY|Surgical Oncology|P|oncology,localExam,perioperative',
      'HEPATOBILIARY_SURGERY|Hepatobiliary & Pancreatic Surgery|P|giLiver,perioperative', 'BREAST_SURGERY|Breast Surgery|P|localExam,oncology,perioperative', 'LAPAROSCOPIC_SURGERY|Laparoscopic Surgery|P|localExam,perioperative', 'SPINE_SURGERY|Spine Surgery|P|neuro,msk,perioperative', 'HAND_SURGERY|Hand Surgery|P|msk,perioperative',
      'TRANSPLANT_SURGERY|Transplant Surgery|P|renal,perioperative', 'ANDROLOGY|Andrology|P|andrology,urology', 'CLINICAL_NUTRITION|Clinical Nutrition|P|nutrition', 'SLEEP_MEDICINE|Sleep Medicine|P|sleep,respiratory', 'TRANSFUSION_MEDICINE|Transfusion Medicine|P|haematology,diagnosticReport', 'MICROBIOLOGY|Microbiology / Virology|P|infection,diagnosticReport', 'BIOCHEMISTRY|Biochemistry|P|diagnosticReport', 'OTHER|Other|P|'],
    ['Dental (BDS)', 'DENTISTRY|General Dental Practice|D|dental', 'ORAL_MAXILLOFACIAL_SURGERY|Oral & Maxillofacial Surgery|D|dental,localExam,perioperative', 'ORTHODONTICS|Orthodontics|D|dental', 'CONSERVATIVE_DENTISTRY_ENDODONTICS|Conservative Dentistry & Endodontics|D|dental', 'PROSTHODONTICS|Prosthodontics|D|dental', 'PERIODONTOLOGY|Periodontology|D|dental', 'PEDIATRIC_DENTISTRY|Pediatric Dentistry|D|dental,growth'],
    ['Non-physician practitioners', 'PHYSIOTHERAPY|Physiotherapy|A|msk,function,pain', 'NUTRITION_DIETETICS|Nutrition & Dietetics|A|nutrition', 'CLINICAL_PSYCHOLOGY|Clinical Psychology|A|mse', 'HOMEOPATHY|Homeopathy (DHMS / BHMS)|T|', 'UNANI|Unani Medicine (BUMS)|T|', 'AYURVEDA|Ayurvedic Medicine (BAMS)|T|'],
    ['Veterinary (BVC)', 'VETERINARY_GENERAL|General Veterinary Practice|V|animalPatient,vetExam,vetPreventive', 'VETERINARY_COMPANION_ANIMAL|Companion / Small Animal (dogs, cats, birds)|V|animalPatient,vetExam,vetPreventive', 'VETERINARY_LIVESTOCK|Large Animal / Livestock (cattle, buffalo, goats, sheep)|V|animalPatient,vetExam,vetPreventive,vetReproduction,foodSafety',
      'VETERINARY_POULTRY|Poultry|V|herd,vetExam,vetPreventive,foodSafety', 'VETERINARY_SURGERY|Veterinary Surgery|V|animalPatient,vetExam,localExam,perioperative']
  ]
  var TY = { P: 'PHYSICIAN', D: 'DENTAL', A: 'ALLIED_HEALTH', T: 'TRADITIONAL', V: 'VETERINARY' }
  D.specCat = []; D.specGroups = []
  CAT.forEach(function (g) {
    var codes = []
    g.slice(1).forEach(function (row) {
      var p = row.split('|')
      D.specCat.push({ code: p[0], name: p[1], type: TY[p[2]], group: g[0], blocks: p[3] ? p[3].split(',') : [] }); codes.push(p[0])
    })
    D.specGroups.push({ name: g[0], codes: codes })
  })

  /* PHAR-1703 speciality seed phrases (common C/C, O/E, Dx, advice per speciality). Merged into the "common" suggestions. */
  D.specSeed = {
    PEDIATRICS: { cc: ['Fever - 2 days', 'Cough and cold', 'Loose motion', 'Poor feeding', 'Vomiting'], oe: ['Active, alert', 'Throat congested', 'Chest clear', 'Hydration: normal'], dx: ['Acute URTI', 'Acute gastroenteritis'], advice: ['বুকের দুধ চালিয়ে যান / Continue breastfeeding'] },
    OBSTETRICS_GYNECOLOGY: { cc: ['Amenorrhoea', 'Lower abdominal pain', 'Excessive vaginal bleeding', 'Per vaginal discharge', 'Antenatal check-up'], oe: ['Pallor: mild', 'Pedal oedema: nil', 'P/A: uterus relaxed'], dx: ['Pregnancy - 2nd trimester', 'Dysfunctional uterine bleeding', 'PCOS'], advice: ['নিয়মিত আয়রন ও ফলিক অ্যাসিড খাবেন / Take iron and folic acid regularly'] },
    DENTISTRY: { cc: ['Toothache', 'Bleeding gums', 'Sensitivity to cold', 'Swelling of the face'], oe: ['Deep caries', 'Calculus present', 'Gingival inflammation'], dx: ['Dental caries', 'Pulpitis', 'Gingivitis'], advice: ['দিনে দুইবার ব্রাশ করুন / Brush twice daily', 'ওষুধ খাওয়ার পর কুলি করুন / Rinse after medicine'] },
    OPHTHALMOLOGY: { cc: ['Blurring of vision', 'Redness of eye', 'Itching of eyes', 'Watering'], oe: ['Anterior segment: normal'], dx: ['Refractive error', 'Allergic conjunctivitis', 'Cataract'], advice: ['চোখ ঘষবেন না / Do not rub the eyes'] },
    NEUROLOGY: { cc: ['Headache', 'Dizziness', 'Seizure', 'Numbness of limbs'], oe: ['GCS 15/15', 'Cranial nerves: normal'], dx: ['Migraine', 'Epilepsy'], advice: [] },
    PHYSIOTHERAPY: { cc: ['Low back pain', 'Neck pain', 'Knee pain', 'Shoulder stiffness'], oe: ['ROM restricted', 'Muscle spasm present'], dx: ['Mechanical low back pain', 'Knee osteoarthritis'], advice: ['নির্দেশিত ব্যায়াম নিয়মিত করবেন / Do the prescribed exercises regularly'] },
    HOMEOPATHY: { cc: ['Recurrent cold', 'Skin eruption', 'Indigestion'], oe: [], dx: ['Chronic rhinitis'], advice: [] },
    VETERINARY_LIVESTOCK: { cc: ['Reduced milk yield', 'Fever', 'Off feed', 'Lameness', 'Bloat'], oe: ['Mucous membranes: pink', 'Rumen motility reduced'], dx: ['Mastitis', 'Foot-and-mouth disease', 'Indigestion'], advice: ['পরিষ্কার পানি দিন / Provide clean drinking water'] }
  }

  /* PHAR-1704 / 1705 block library. DSL per field, separated by ";": "Label" (text) | "Label:n(unit)" number | ":d" date | ":s(a,b)" select | ":m(a,b)" multi |
     ":a" textarea | ":rl" right/left pair | ":v(weight)" linked to the header vital | ":x(fn)" derived (never typed) | ":tt" tooth chart | ":an" animal record | ":wd" withdrawal table. */
  D.blockTitles = { giLiver: 'GI / Liver', jointCount: 'Joint count / RA', preAnaesthetic: 'Pre-anaesthetic', msk: 'Musculoskeletal', mse: 'Mental state exam', sti: 'STI', ent: 'ENT', eye: 'Eye', birthHistory: 'Birth history', gynaeExam: 'Gynae exam', criticalCare: 'Critical care',
    diagnosticReport: 'Diagnostic report', localExam: 'Local exam', allergyTest: 'Allergy testing', substanceUse: 'Substance use', animalPatient: 'Animal patient', vetExam: 'Vet exam', vetPreventive: 'Vet preventive', vetReproduction: 'Vet reproduction',
    foodSafety: 'Food safety (withdrawal)', herd: 'Herd / flock', haematology: 'Haematology', immunisation: 'Immunisation (EPI)' }
  D.blockLib = [
    /* wave 1 (PHAR-1704) */
    { id: 'diabetes', w: 1, g: 'Medicine systems', f: 'Type:s(Type 1,Type 2,Gestational,Other);Duration:n(years);FBS:n(mmol/L);2h-ABF:n(mmol/L);RBS:n(mmol/L);HbA1c:n(%);Regimen (OAD / insulin type + units):t;Hypoglycaemia episodes:s(None,Occasional,Frequent);Foot exam:m(Monofilament normal,Pulses present,Ulcer,Deformity);Last retinal screen:d;Urine ACR:n(mg/g);Waist circumference:n(cm)' },
    { id: 'thyroid', w: 1, g: 'Medicine systems', f: 'TSH:n(mIU/L);FT4:n(pmol/L);FT3:n(pmol/L);Goitre grade:s(0,1,2,3);Eye signs:s(None,Present);RAI history:s(None,Given)' },
    { id: 'cardiac', w: 1, g: 'Medicine systems', f: 'Chest-pain character:s(None,Typical,Atypical,Non-cardiac);NYHA class:s(I,II,III,IV);BP right arm:t;BP left arm:t;JVP:t;Heart sounds / murmur:t;Peripheral pulses:t;ECG findings:t;Echo EF:n(%);Echo valves:t;Lipid profile:t;Troponin:t;Risk factors:m(HTN,DM,Smoking,Dyslipidaemia,Family history,Obesity);INR (if anticoagulated):n' },
    { id: 'renal', w: 1, g: 'Medicine systems', f: 'Urine output:t;Creatinine:n(mg/dL);eGFR + CKD stage (derived):x(egfr);Urine ACR / PCR:t;Na:n(mmol/L);K:n(mmol/L);Dialysis:s(None,Haemodialysis,Peritoneal);Dialysis frequency:t;Dialysis access:t;Dry weight:n(kg);Transplant status:s(None,Transplanted);Immunosuppressant levels:t' },
    { id: 'respiratory', w: 1, g: 'Medicine systems', f: 'mMRC dyspnoea grade:s(0,1,2,3,4);Cough / sputum:t;Haemoptysis:s(No,Yes);Smoking pack-years:n;PEFR:n(L/min);FEV1:n(L);FVC:n(L);FEV1 / FVC (derived):x(ratio);SpO2 at rest:n(%);SpO2 on exertion:n(%);Inhaler technique checked:s(Yes,No,N/A);Asthma control (ACT):n;TB history / DOTS category:t;Chest X-ray finding:t' },
    { id: 'giLiver', w: 1, g: 'Medicine systems', f: 'Appetite:s(Normal,Reduced,Increased);Bowel habit:t;GI bleeding:m(Haematemesis,Melaena,PR bleeding);Jaundice:s(No,Yes);Liver span:n(cm);Spleen:t;Ascites:s(No,Mild,Moderate,Tense);Bilirubin:n(mg/dL);ALT:n(U/L);ALP:n(U/L);Albumin:n(g/dL);INR:n;HBsAg / anti-HCV:t;Endoscopy / colonoscopy:t;Child-Pugh (derived):x(cp)' },
    { id: 'obstetric', w: 1, g: "Women's health and children", f: 'LMP:d;EDD (derived):x(edd);Gestational age (derived):x(ga);Gravida:n;Para:n;Abortion:n;Living:n;Previous LSCS count:n;ANC visit no.:n;Td doses:s(0,1,2);Fundal height:n(cm);FHR:n(bpm);Presentation:s(Cephalic,Breech,Transverse,Not assessed);Foetal movement:s(Present,Reduced,Absent);USG EFW:n(g);USG AFI:n(cm);USG placenta:t;USG Doppler:t;Risk flags:m(PIH,GDM,Previous PPH,Multiple pregnancy,Rh-negative)' },
    { id: 'menstrual', w: 1, g: "Women's health and children", f: 'Menarche age:n(years);Cycle length:n(days);Duration:n(days);Regularity:s(Regular,Irregular);Flow:s(Scanty,Normal,Heavy);Dysmenorrhoea:s(None,Mild,Moderate,Severe);IMB / PCB:s(None,IMB,PCB,Both);Menopause age:n(years);Contraception:t;Last VIA / Pap:d' },
    { id: 'gynaeExam', w: 1, g: "Women's health and children", f: 'Breast exam:t;P/A:t;P/S:t;P/V:t' },
    { id: 'growth', w: 1, g: "Women's health and children", f: 'Weight (from the header, drives mg/kg dosing):v(weight);Length / height:n(cm);Head circumference:n(cm);MUAC:n(cm);BMI (derived):x(bmi);WHO percentiles / z-scores (derived):x(who);Feeding:s(Exclusive breastfeeding,Complementary feeding,Family diet);Gross motor:s(Appropriate,Delayed);Fine motor:s(Appropriate,Delayed);Language:s(Appropriate,Delayed);Social:s(Appropriate,Delayed)' },
    { id: 'birthHistory', w: 1, g: "Women's health and children", f: 'Gestation at birth:n(weeks);Birth weight:n(kg);Mode of delivery:s(NVD,LSCS,Instrumental);NICU stay:s(No,Yes);Neonatal jaundice:s(No,Yes)' },
    { id: 'immunisation', w: 1, g: "Women's health and children", f: 'EPI checklist:m(BCG,Penta 1,Penta 2,Penta 3,PCV 1,PCV 2,PCV 3,OPV / IPV,MR 1,MR 2,TCV,HPV);Up to date:s(Yes,No,Unknown);Adult vaccines:m(Hep B,Influenza,COVID-19,Td)' },
    { id: 'dental', w: 1, g: 'Mind, skin, eye, ENT, dental', f: 'FDI tooth chart:tt;Periodontal BOP:s(None,Localised,Generalised);Pocket depth:t;Oral hygiene:s(Good,Fair,Poor);Occlusion / malocclusion class:s(Class I,Class II,Class III);Soft tissue:t;OPG / IOPA findings:t' },
    { id: 'eye', w: 1, g: 'Mind, skin, eye, ENT, dental', f: 'VA unaided:rl;VA with glasses:rl;VA pinhole:rl;Near vision:t;IOP:rl;Lids / adnexa:t;Conjunctiva:t;Cornea:t;Anterior chamber:t;Pupil:t;Lens:t;Fundus CDR:rl;Macula:t;Refraction (sph / cyl / axis / add):rl;PD:n(mm)' },
    { id: 'ent', w: 1, g: 'Mind, skin, eye, ENT, dental', f: 'Otoscopy:rl;Rinne / Weber:t;Hearing:t;Nose (septum, turbinates, discharge):t;Throat (tonsil grade):s(0,1,2,3,4);Neck nodes:t;Audiogram / tympanogram:t' },
    { id: 'skin', w: 1, g: 'Mind, skin, eye, ENT, dental', f: 'Primary lesion:s(Macule,Papule,Plaque,Vesicle,Pustule,Nodule,Wheal);Secondary changes:m(Scale,Crust,Excoriation,Lichenification,Scar);Site / distribution:t;Colour:t;Size:t;Number:t;Itch:s(None,Mild,Moderate,Severe);BSA:n(%);PASI / SCORAD:t;Hair / nail findings:t' },
    { id: 'mse', w: 1, g: 'Mind, skin, eye, ENT, dental', f: 'Appearance / behaviour:t;Speech:t;Mood:t;Affect:t;Thought form / content:t;Perception:t;Cognition:t;Insight:s(Good,Partial,Poor);Judgement:s(Intact,Impaired);Suicide risk:s(None,Low,Moderate,High);Self-harm risk:s(None,Low,Moderate,High);Risk to others:s(None,Low,Moderate,High);PHQ-9:n;GAD-7:n' },
    { id: 'msk', w: 1, g: 'Surgery and musculoskeletal', f: 'Site:t;Side:s(Right,Left,Both);Inspection:t;Tenderness:t;Swelling:t;ROM active (degrees):t;ROM passive (degrees):t;Power:s(0,1,2,3,4,5);Special tests:t;Neurovascular status:t;Deformity:t;Imaging findings:t;Cast / splint:s(None,Cast,Splint)' },
    { id: 'localExam', w: 1, g: 'Surgery and musculoskeletal', f: 'Site:t;Size:t;Shape:t;Surface:t;Margin:t;Consistency:t;Tenderness:s(No,Yes);Mobility:t;Overlying skin:t;Regional nodes:t;Hernia:t;Perianal / PR exam:t' },
    { id: 'perioperative', w: 1, g: 'Surgery and musculoskeletal', f: 'Procedure:t;Procedure date:d;Post-op day (derived):x(pod);ASA grade:s(I,II,III,IV,V);Wound status:s(Clean,Discharging,Infected,Dehisced);Drain:t;Stitch-removal date:d;Fitness for surgery:s(Fit,Unfit,Pending);Histopathology:t' },
    /* wave 2 (PHAR-1705, lighter) */
    { id: 'neuro', w: 2, g: 'Medicine systems', f: 'GCS:n;Higher function:t;Speech:t;Cranial nerves:t;Power (MRC 0-5):t;Tone:t;Reflexes:t;Plantar:s(Flexor,Extensor,Equivocal);Sensory:t;Cerebellar:t;Gait:t;Neck stiffness:s(No,Yes);Seizure type:t;Seizure frequency:t;Last seizure:d;Headache profile:t;NIHSS:n;Imaging finding:t' },
    { id: 'neonatal', w: 2, g: "Women's health and children", f: 'Day of life:n;Corrected gestational age:t;APGAR:t;Weight vs birth weight:n(%);Jaundice Kramer zone:s(1,2,3,4,5);TSB:n(mg/dL);Feeding:t;Cord:t;Temperature:n(F);Sepsis signs:m(Lethargy,Poor feeding,Fever,Hypothermia,Apnoea)' },
    { id: 'infertility', w: 2, g: "Women's health and children", f: 'Duration:n(years);Type:s(Primary,Secondary);Partner semen analysis:t;Ovulation tracking / follicle study:t;AMH:n(ng/mL);HSG:t;Previous IUI cycles:n;Previous IVF cycles:n' },
    { id: 'oncology', w: 2, g: 'Medicine systems', f: 'Primary site:t;Histology:t;Stage (TNM):t;Receptors / biomarkers:t;ECOG:s(0,1,2,3,4);Regimen:t;Cycle no.:n;Total cycles:n;BSA (derived):x(bsa);Radiotherapy dose (Gy):n;Fractions:n;Toxicity (CTCAE grade):s(0,1,2,3,4);Tumour markers:t' },
    { id: 'haematology', w: 2, g: 'Medicine systems', f: 'Hb:n(g/dL);WBC:n;Platelets:n;Peripheral film:t;Transfusion count:n;Last transfusion:d;Iron studies:t;Chelation:t;Bleeding history:t;Coagulation profile:t' },
    { id: 'jointCount', w: 2, g: 'Medicine systems', f: 'Tender joints (of 28):n;Swollen joints (of 28):n;Morning stiffness:n(minutes);ESR:n(mm/hr);CRP:n(mg/L);Patient global health (0-100):n;DAS28 (derived):x(das28);RF / anti-CCP / ANA:t;Extra-articular features:t' },
    { id: 'infection', w: 2, g: 'Medicine systems', f: 'Fever pattern:s(Continuous,Intermittent,Remittent,Relapsing);Max temperature:n(F);Days of fever:n;Exposure / travel / contact:t;Dengue / malaria / typhoid tests:t;Culture and sensitivity:t;Antimicrobials (drug + day no.):t;Isolation precaution:s(None,Contact,Droplet,Airborne);Notifiable disease:s(No,Yes - report)' },
    { id: 'allergyTest', w: 2, g: 'Medicine systems', f: 'Triggers:t;Reaction type and severity:t;Anaphylaxis history:s(No,Yes);Skin-prick / specific IgE:t;Adrenaline auto-injector carried:s(No,Yes)' },
    { id: 'urology', w: 2, g: 'Surgery and musculoskeletal', f: 'IPSS:n;Stream:t;Haematuria:s(No,Yes);Stone history:t;DRE (prostate size, consistency):t;PSA:n(ng/mL);Post-void residual:n(mL);USG KUB:t;Catheter status:t' },
    { id: 'andrology', w: 2, g: 'Surgery and musculoskeletal', f: 'IIEF-5:n;Semen analysis:t;Testosterone:n(ng/dL)' },
    { id: 'pain', w: 2, g: 'Surgery and musculoskeletal', f: 'Site:t;NRS (0-10):n;Character:t;Radiation:t;Aggravating / relieving factors:t;Duration:t;Interventions done:t;Opioid MME per day:n' },
    { id: 'function', w: 2, g: 'Surgery and musculoskeletal', f: 'Barthel index / ADL:n;Mobility aid:s(None,Stick,Walker,Wheelchair);Therapy goals:t;Therapy modality:t;Frequency:t;Sessions:n' },
    { id: 'vascular', w: 2, g: 'Surgery and musculoskeletal', f: 'Limb pulse grid:t;Ankle pressure:n(mmHg);Brachial pressure:n(mmHg);ABI (derived):x(abi);Ulcer / gangrene:t;Varicose veins (CEAP class):s(C0,C1,C2,C3,C4,C5,C6);Doppler findings:t' },
    { id: 'burn', w: 2, g: 'Surgery and musculoskeletal', f: 'Mechanism:t;TBSA:n(%);Depth:s(Superficial,Partial thickness,Full thickness);Site:t;Days since injury:n;Graft status:t' },
    { id: 'preAnaesthetic', w: 2, g: 'Surgery and musculoskeletal', f: 'Mallampati:s(I,II,III,IV);Mouth opening:t;Neck movement:t;NPO status:t;Previous anaesthesia and complications:t;Dentition:t;ASA grade:s(I,II,III,IV,V);Anaesthesia plan:t' },
    { id: 'substanceUse', w: 2, g: 'Mind, skin, eye, ENT, dental', f: 'Substances:t;Route:t;Quantity per day:t;Duration:t;Last use:d;Withdrawal score (CIWA-Ar / COWS):n;Previous detox:s(No,Yes);Readiness to change:s(Pre-contemplation,Contemplation,Preparation,Action)' },
    { id: 'sti', w: 2, g: 'Mind, skin, eye, ENT, dental', f: 'Discharge:t;Ulcer:t;Partner treatment:s(Not needed,Advised,Done);VDRL / TPHA:t;HIV result:t' },
    { id: 'sleep', w: 2, g: 'Medicine systems', f: 'Epworth score:n;STOP-BANG:n;AHI:n;CPAP use:s(No,Yes - regular,Yes - irregular)' },
    { id: 'geriatric', w: 2, g: 'Acute, supportive and diagnostic', f: 'ADL / IADL:t;Falls in last 12 months:n;Cognition (MMSE / AMT):n;Mood screen:t;Continence:t;Frailty scale:s(1,2,3,4,5,6,7,8,9);Polypharmacy (derived from the medicines):x(poly);Hearing / vision:t' },
    { id: 'palliative', w: 2, g: 'Acute, supportive and diagnostic', f: 'ESAS symptom scores:t;PPS / ECOG:t;Goals of care:t;Advance directive:s(No,Yes);Opioid MME per day:n;Caregiver:t' },
    /* wave 3 (PHAR-1705, lighter) */
    { id: 'triage', w: 3, g: 'Acute, supportive and diagnostic', f: 'Triage category:s(Red,Orange,Yellow,Green);Arrival time:t;Arrival mode:s(Walk-in,Ambulance,Referred);Airway:t;Breathing:t;Circulation:t;Disability / GCS:n;NEWS2:n;Interventions done:t;Disposition:s(Discharge,Admit,Refer,LAMA)' },
    { id: 'criticalCare', w: 3, g: 'Acute, supportive and diagnostic', f: 'Ventilation mode:t;FiO2:n(%);PEEP:n;Vasopressors:t;Sedation (RASS):n;Lines / drains:t;Fluid balance:t;ABG:t;SOFA:n' },
    { id: 'nutrition', w: 3, g: 'Acute, supportive and diagnostic', f: 'MUAC:n(cm);Waist:n(cm);Body fat:n(%);Diet recall:a;Calorie target:n(kcal);Protein target:n(g);Malnutrition screen (MUST):s(0 low,1 medium,2+ high);Diet plan:a' },
    { id: 'occupational', w: 3, g: 'Acute, supportive and diagnostic', f: 'Occupation:t;Exposures:t;PPE:t;Fitness for work:s(Fit,Unfit,Restricted);Restriction days:n' },
    { id: 'preventive', w: 3, g: 'Acute, supportive and diagnostic', f: 'Screening checklist:m(BP,Blood sugar,Lipids,VIA,Mammogram,PSA);CVD risk score:n(%);Lifestyle counselling:t;Vaccines due:t' },
    { id: 'genetics', w: 3, g: 'Acute, supportive and diagnostic', f: 'Pedigree (generations, affected):t;Consanguinity:s(No,Yes);Genetic test + result:t;Counselling done:s(No,Yes);Prenatal testing:t' },
    { id: 'diagnosticReport', w: 3, g: 'Acute, supportive and diagnostic', f: 'Referral reason:t;Referring doctor:t;Procedure / modality:t;Findings:a;Impression:a;Recommendation:a' },
    /* veterinary blocks (PHAR-1707, design 4.5) */
    { id: 'animalPatient', w: 1, g: 'Veterinary', f: 'Animal record (from the customer):an;Weight (from the header, required):v(weight);Body condition score (1-9):s(1,2,3,4,5,6,7,8,9);Neutered:s(No,Yes,Unknown);Purpose:s(Pet,Dairy,Meat,Draught,Breeding,Layer,Broiler)' },
    { id: 'herd', w: 1, g: 'Veterinary', f: 'Group / shed:t;Head count:n;Number affected:n;Number dead:n;Age (days / weeks):t;Housing:t;Feed:t;Water source:t;Dose route:s(Per head,In drinking water,In feed)' },
    { id: 'vetExam', w: 1, g: 'Veterinary', f: 'Species-normal range (mock):x(vnorm);Rumen motility (ruminants):t;Mucous membrane colour:s(Pink,Pale,Congested,Icteric,Cyanotic);CRT:n(sec);Dehydration:n(%);Lymph nodes:t;Coat / skin:t;System notes:a' },
    { id: 'vetPreventive', w: 1, g: 'Veterinary', f: 'Vaccines given:m(FMD,Anthrax,HS,BQ,LSD,PPR,Rabies,Newcastle,Gumboro,Marek);Last vaccination date:d;Next due:d;Deworming history:t;Ectoparasite treatment history:t' },
    { id: 'vetReproduction', w: 1, g: 'Veterinary', f: 'Heat / oestrus:t;AI / service date:d;Pregnancy diagnosis:s(Not done,Positive,Negative);Expected calving / kidding (derived):x(calving);Lactation no.:n;Milk yield:n(L/day)' },
    { id: 'foodSafety', w: 1, g: 'Veterinary', f: 'Withdrawal period per medicine:wd' }
  ]

  /* PHAR-1701 / 1702 doctors. login = can be chosen in Prototype controls; the rest only appear in the customer "Find a doctor" search.
     presOn = prescriptionEnabled, medOn = medicinePrescribingEnabled (design 4.4: defaults come from the practitioner type; only the platform admin changes them). */
  D.doctors = [
    { id: 'd1', login: true, name: 'Dr. Farhana Islam', nameBn: 'ডা. ফারহানা ইসলাম', chamberBn: 'শিফা চেম্বার, ধানমন্ডি', degrees: 'MBBS, FCPS (Medicine)', spec: 'INTERNAL_MEDICINE', sec: ['DIABETOLOGY'], regBody: 'BMDC', bmdc: 'A-12345', chamber: 'Shifa Chamber, PharmaZ247 Dhanmondi', chamberAddr: 'House 12, Road 5, Dhanmondi, Dhaka', phone: '01711-000111', presOn: true, medOn: true, oldSpec: 'Medicine & Diabetes', fee: 800 },
    { id: 'd2', login: true, name: 'Dr. Rezaul Karim', nameBn: 'ডা. রেজাউল করিম', chamberBn: 'শিশু স্বাস্থ্য চেম্বার, মিরপুর', degrees: 'MBBS, DCH, MD (Paediatrics)', spec: 'PEDIATRICS', sec: ['NEONATOLOGY'], regBody: 'BMDC', bmdc: 'A-20871', chamber: 'Shishu Care Chamber, Mirpur', chamberAddr: 'Plot 4, Section 10, Mirpur, Dhaka', phone: '01711-000222', presOn: true, medOn: true, oldSpec: 'Child Specialist', fee: 700 },
    { id: 'd3', login: true, name: 'Dr. Nusrat Jahan', nameBn: 'ডা. নুসরাত জাহান', chamberBn: 'জয় উইমেন কেয়ার, উত্তরা', degrees: 'MBBS, FCPS (Obs & Gynae)', spec: 'OBSTETRICS_GYNECOLOGY', sec: ['REPRODUCTIVE_ENDOCRINOLOGY'], regBody: 'BMDC', bmdc: 'A-31002', chamber: 'Joy Women Care, Uttara', chamberAddr: 'Sector 7, Uttara, Dhaka', phone: '01711-000333', presOn: true, medOn: true, oldSpec: 'Gynae & Obs + Infertility', fee: 900 },
    { id: 'd4', login: true, name: 'Dr. Tanvir Ahmed', nameBn: 'ডা. তানভীর আহমেদ', chamberBn: 'স্মাইল ডেন্টাল, গুলশান', degrees: 'BDS, MPH', spec: 'DENTISTRY', sec: ['CONSERVATIVE_DENTISTRY_ENDODONTICS'], regBody: 'BMDC', bmdc: 'D-5521', chamber: 'Smile Dental, Gulshan', chamberAddr: 'Gulshan Avenue, Dhaka', phone: '01711-000444', presOn: true, medOn: true, oldSpec: 'Dental', fee: 600 },
    { id: 'd5', login: true, name: 'Rafiq Hasan, PT', nameBn: 'রফিক হাসান, পিটি', chamberBn: 'রিস্টোর ফিজিও সেন্টার', degrees: 'BPT, MSc (Physiotherapy)', spec: 'PHYSIOTHERAPY', sec: [], regBody: 'OTHER', bmdc: 'PT-0872', chamber: 'Restore Physio Centre, Banani', chamberAddr: 'Road 11, Banani, Dhaka', phone: '01711-000555', presOn: true, medOn: false, oldSpec: '', fee: 500 },
    { id: 'd6', login: true, name: 'Dr. Mahbub Alam (DHMS)', nameBn: 'ডা. মাহবুব আলম (ডিএইচএমএস)', chamberBn: 'আরোগ্য হোমিও হল', degrees: 'DHMS', spec: 'HOMEOPATHY', sec: [], regBody: 'HOMEOPATHY_BOARD', bmdc: 'H-4410', chamber: 'Arogya Homeo Hall, Mohammadpur', chamberAddr: 'Tajmahal Road, Mohammadpur, Dhaka', phone: '01711-000666', presOn: true, medOn: false, oldSpec: 'Homeopath', fee: 400 },
    { id: 'd7', login: true, name: 'Dr. Shamim Reza (DVM)', nameBn: 'ডা. শামীম রেজা (ডিভিএম)', chamberBn: 'প্রাণী চিকিৎসা কেন্দ্র, সাভার', degrees: 'DVM, MS (Medicine)', spec: 'VETERINARY_LIVESTOCK', sec: ['VETERINARY_GENERAL'], regBody: 'BVC', bmdc: 'V-3307', chamber: 'Pran Veterinary Clinic, Savar', chamberAddr: 'Savar Bazar, Dhaka', phone: '01711-000777', presOn: true, medOn: true, oldSpec: 'Vet / DVM', fee: 500 },
    { id: 'd8', login: true, name: 'Dr. Sabina Yasmin', nameBn: 'ডা. সাবিনা ইয়াসমিন', chamberBn: 'দৃষ্টি আই কেয়ার, ধানমন্ডি', degrees: 'MBBS, DO, FCPS (Ophthalmology)', spec: 'OPHTHALMOLOGY', sec: [], regBody: 'BMDC', bmdc: 'A-40118', chamber: 'Drishti Eye Care, Dhanmondi', chamberAddr: 'Road 27, Dhanmondi, Dhaka', phone: '01711-000888', presOn: true, medOn: true, oldSpec: 'Eye', fee: 800 },
    { id: 'd9', login: true, name: 'Dr. Anwar Hossain', nameBn: 'ডা. আনোয়ার হোসেন', chamberBn: 'নিউরো কেয়ার, ফার্মগেট', degrees: 'MBBS, MD (Neurology)', spec: 'NEUROLOGY', sec: [], regBody: 'BMDC', bmdc: 'A-27730', chamber: 'Neuro Care, Farmgate', chamberAddr: 'Farmgate, Dhaka', phone: '01711-000999', presOn: true, medOn: true, oldSpec: 'Neuromedicine', fee: 1000 },
    /* search-only doctors (customer "Find a doctor", PHAR-1706) */
    { id: 's1', name: 'Dr. Imran Hossain', degrees: 'MBBS, MD (Cardiology)', spec: 'CARDIOLOGY', sec: ['INTERNAL_MEDICINE'], regBody: 'BMDC', bmdc: 'A-11902', chamber: 'Heart Care, Dhanmondi', presOn: true, medOn: true, fee: 1000 },
    { id: 's2', name: 'Dr. Lutfun Nahar', degrees: 'MBBS, DGO', spec: 'OBSTETRICS_GYNECOLOGY', sec: [], regBody: 'BMDC', bmdc: 'A-33310', chamber: 'Shifa Chamber, Dhanmondi', presOn: true, medOn: true, fee: 800 },
    { id: 's3', name: 'Dr. Kamal Uddin', degrees: 'BDS, MS (Orthodontics)', spec: 'ORTHODONTICS', sec: ['DENTISTRY'], regBody: 'BMDC', bmdc: 'D-6120', chamber: 'Smile Dental, Gulshan', presOn: true, medOn: true, fee: 700 },
    { id: 's4', name: 'Dr. Mitu Rani, BDS', degrees: 'BDS', spec: 'DENTISTRY', sec: [], regBody: 'BMDC', bmdc: 'D-7788', chamber: 'Dental Point, Mirpur', presOn: true, medOn: true, fee: 400 },
    { id: 's5', name: 'Nadia Sultana, PT', degrees: 'BPT, MPT (Neuro)', spec: 'PHYSIOTHERAPY', sec: [], regBody: 'OTHER', bmdc: 'PT-1120', chamber: 'Restore Physio Centre, Banani', presOn: true, medOn: false, fee: 500 },
    { id: 's6', name: 'Farzana Haque, Dietitian', degrees: 'BSc, MSc (Nutrition)', spec: 'NUTRITION_DIETETICS', sec: [], regBody: 'OTHER', bmdc: 'N-0310', chamber: 'Nutri Clinic, Uttara', presOn: true, medOn: false, fee: 600 },
    { id: 's7', name: 'Dr. Abul Kalam (BUMS)', degrees: 'BUMS', spec: 'UNANI', sec: [], regBody: 'UNANI_AYURVEDIC_BOARD', bmdc: 'U-2201', chamber: 'Hikmat Chikitsalay, Old Dhaka', presOn: true, medOn: true, fee: 300 },
    { id: 's8', name: 'Dr. Sumon Das (BAMS)', degrees: 'BAMS', spec: 'AYURVEDA', sec: [], regBody: 'UNANI_AYURVEDIC_BOARD', bmdc: 'AY-1180', chamber: 'Ayur Care, Tikatuli', presOn: true, medOn: true, fee: 300 },
    { id: 's9', name: 'Dr. Mahmuda Khatun (DVM)', degrees: 'DVM', spec: 'VETERINARY_COMPANION_ANIMAL', sec: [], regBody: 'BVC', bmdc: 'V-4012', chamber: 'Pet Care Clinic, Gulshan', presOn: true, medOn: true, fee: 600 },
    { id: 's10', name: 'Dr. Jahid Hasan (DVM)', degrees: 'DVM, MS', spec: 'VETERINARY_POULTRY', sec: [], regBody: 'BVC', bmdc: 'V-2955', chamber: 'Poultry Health Service, Gazipur', presOn: true, medOn: true, fee: 500 }
  ]
  D.doctor = D.doctors[0]

  /* PHAR-1707 animals under the customer (Rahima Begum = p1). Weight is NOT stored here (design 4.5): it is captured per prescription. */
  D.animals = [
    { id: 'an1', owner: 'p1', name: 'Lali', animalType: 'LIVESTOCK', species: 'COW', speciesOther: '', breed: 'Holstein-Friesian cross', sex: 'F', ageValue: 4, ageUnit: 'YEARS', ageOn: '2026-10-21', features: ['White patch on forehead', 'Ear tag 0417'] },
    { id: 'an2', owner: 'p1', name: 'Moti', animalType: 'PET', species: 'DOG', speciesOther: '', breed: 'Deshi', sex: 'M', ageValue: 18, ageUnit: 'MONTHS', ageOn: '2026-10-21', features: ['Brown coat', 'Black left ear'] }
  ]
  D.animalTypes = { PET: 'Pet', LIVESTOCK: 'Livestock', POULTRY: 'Poultry', BIRD: 'Bird', OTHER: 'Other' }
  D.species = { COW: 'Cow', BUFFALO: 'Buffalo', GOAT: 'Goat', SHEEP: 'Sheep', CHICKEN: 'Chicken', DUCK: 'Duck', PIGEON: 'Pigeon', DOG: 'Dog', CAT: 'Cat', OTHER: 'Other' }
  /* species-normal ranges for the vet exam hint (mock, NOT clinically verified): temp F, pulse /min, resp /min */
  D.vetNorm = { COW: ['100.4-102.8', '48-84', '10-30'], BUFFALO: ['99.5-102.0', '40-60', '10-30'], GOAT: ['101.5-103.5', '70-80', '12-20'], SHEEP: ['102.0-103.5', '70-80', '12-20'], DOG: ['101.0-102.5', '70-120', '10-30'], CAT: ['100.5-102.5', '140-220', '20-30'], CHICKEN: ['105-107', '250-300', '15-30'] }

  /* patients added for the other doctors + animal patients (v1/v2 mirror D.animals; owner = p1) */
  D.patients.p6 = { id: 'p6', name: 'Tahmina Akter', age: '29 y', sex: 'Female', phone: '01713-***-441', relation: null, allergies: [], vitals: { bp: '118/76', pulse: '84', temp: '98.6', weight: '64', height: '158', spo2: '98' }, returning: false, chronic: [], last: null }
  D.patients.p7 = { id: 'p7', name: 'Ayaan Rahman', age: '14 months', sex: 'Male', phone: '01914-***-120 (parent)', relation: 'Child of Sumaiya Rahman', allergies: [], vitals: { bp: '', pulse: '120', temp: '99.8', weight: '10', height: '76', spo2: '99' }, returning: false, chronic: [], last: null }
  D.patients.p8 = { id: 'p8', name: 'Rafiq Ahmed', age: '34 y', sex: 'Male', phone: '01816-***-775', relation: null, allergies: ['Penicillin'], vitals: { bp: '124/80', pulse: '76', temp: '98.4', weight: '70', height: '170', spo2: '98' }, returning: false, chronic: [], last: null }
  D.patients.v1 = { id: 'v1', animalId: 'an1', owner: 'p1', name: 'Lali', age: '4 y', sex: 'Female', phone: '', relation: null, allergies: [], vitals: { bp: '', pulse: '64', temp: '103.4', weight: '350', height: '', spo2: '', rr: '24' }, returning: false, chronic: [], last: null }
  D.patients.v2 = { id: 'v2', animalId: 'an2', owner: 'p1', name: 'Moti', age: '18 months', sex: 'Male', phone: '', relation: null, allergies: [], vitals: { bp: '', pulse: '98', temp: '101.8', weight: '14', height: '', spo2: '', rr: '24' }, returning: false, chronic: [], last: null }

  /* appointments for the other doctors (doc = doctor id; the original five belong to d1). Serials are unique across doctors. */
  D.appointments.forEach(function (a) { a.doc = 'd1' })
  ;[
    { serial: 11, doc: 'd2', time: '09:00', patientId: 'p3', reason: 'Fever and cough, weight check', status: 'Waiting', tag: 'Family member' },
    { serial: 12, doc: 'd2', time: '09:20', patientId: 'p7', reason: 'Vaccination review (14 months)', status: 'Waiting' },
    { serial: 21, doc: 'd3', time: '09:00', patientId: 'p6', reason: 'Antenatal check-up', status: 'Waiting', tag: 'Pregnant' },
    { serial: 22, doc: 'd3', time: '09:30', patientId: 'p4', reason: 'Irregular periods', status: 'Waiting' },
    { serial: 31, doc: 'd4', time: '10:00', patientId: 'p8', reason: 'Toothache, lower left', status: 'Waiting' },
    { serial: 32, doc: 'd4', time: '10:30', patientId: 'p2', reason: 'Scaling and polishing', status: 'Waiting' },
    { serial: 41, doc: 'd5', time: '11:00', patientId: 'p5', reason: 'Knee pain - physiotherapy', status: 'Waiting' },
    { serial: 42, doc: 'd5', time: '11:30', patientId: 'p2', reason: 'Low back pain', status: 'Waiting' },
    { serial: 51, doc: 'd6', time: '17:00', patientId: 'p1', reason: 'Recurrent cold', status: 'Waiting', tag: 'Returning patient' },
    { serial: 61, doc: 'd7', time: '10:00', patientId: 'v1', reason: 'Lali (cow) - fever, reduced milk', status: 'Waiting', tag: 'Animal patient' },
    { serial: 62, doc: 'd7', time: '10:30', patientId: 'v2', reason: 'Moti (dog) - skin rash', status: 'Waiting', tag: 'Animal patient' },
    { serial: 71, doc: 'd8', time: '09:00', patientId: 'p4', reason: 'Blurred vision', status: 'Waiting' },
    { serial: 81, doc: 'd9', time: '09:00', patientId: 'p5', reason: 'Recurrent headache', status: 'Waiting' }
  ].forEach(function (a) { D.appointments.push(a) })
  D.history.v1 = []; D.history.v2 = []
})()

/* ===== WAVE 5 (PHAR-1709..1714) - prescription access rules R1-R7. MOCK. ===== */
;(function () {
  var D = window.DATA

  /* PHAR-1713 pharmacy branches (the branch a staff user belongs to is chosen on the POS screen) */
  D.branches = [
    { id: 'b1', name: 'PharmaZ247 Pharmacy - Dhanmondi', addr: 'Road 5, Dhanmondi, Dhaka' },
    { id: 'b2', name: 'PharmaZ247 Pharmacy - Mirpur', addr: 'Section 10, Mirpur, Dhaka' },
    { id: 'b3', name: 'PharmaZ247 Pharmacy - Uttara', addr: 'Sector 7, Uttara, Dhaka' }
  ]

  /* PHAR-1710 a prescription issued today 09:10 by Dr. Farhana (serial #1, Nasrin Akter). The prototype clock starts at 21 Oct 2026 10:00,
     so with the default 24 h window it is "editable for 23h 10m". The older ones (12 Oct and before) are past the window. */
  D.history.p4 = [
    { id: 'rx50', no: 'RX-A12345-0050', version: 1, date: '2026-10-21', submittedAt: '2026-10-21T09:10', serial: 1, byMe: true, by: 'd1',
      lines: [{ medId: 'napa500', pattern: '1+1+1', days: 3, food: 'after' }, { medId: 'seclo20', pattern: '1+0+1', days: 7, food: 'before' }],
      tests: ['CBC'], cc: ['Fever - 2 days', 'Body ache'], dx: [{ t: 'Viral fever', type: 'PROVISIONAL' }],
      advice: ['প্রচুর পানি পান করবেন / Drink plenty of water'], follow: 'After 5 days' }
  ]
  D.verifyDb.push({ no: 'RX-A12345-0050', code: 'QW5T-9HNB', status: 'VALID', issued: '21 Oct 2026', doctor: 'Dr. Farhana Islam', bmdc: 'A-12345', patient: 'N**** A*****', meds: ['Napa 500 mg - 1+1+1 - 3 days', 'Seclo 20 mg - 1+0+1 - 7 days'] })

  /* PHAR-1711 / 1713 shares. kind: doctor (target = doctor id) | branch (target = branch id) | link (target = token).
     by: patient | doctor (doctor-to-branch routing, any time). active=false = revoked (access ended at once). Shares never expire on their own (decision C). */
  D.shares = [
    { id: 'sh1', rx: 'rxB210', kind: 'doctor', target: 'd6', by: 'patient', active: true, at: '2026-10-19T12:00' },
    { id: 'sh2', rx: 'rx42', kind: 'branch', target: 'b1', by: 'doctor', active: true, at: '2026-10-12T11:30' },
    { id: 'sh3', rx: 'rxB210', kind: 'branch', target: 'b2', by: 'patient', active: true, at: '2026-10-19T12:05' },
    { id: 'sh4', rx: 'rx42', kind: 'link', target: 'k9f3a2', by: 'patient', active: true, at: '2026-10-14T18:20' },
    { id: 'sh5', rx: 'rx31', kind: 'link', target: 'x7r0q1', by: 'patient', active: false, at: '2026-09-20T09:00', revokedAt: '2026-09-25T08:10' }
  ]
})()

/* ===== USER GUIDE (in-app, "Guide" tab). Plain-language content for product owners, doctors and testers.
   Section = { id, title, lead, parts: [{ h, ol | ul | cheat }], tags (Jira), show: [{ k, label }] }.
   "show" keys map to the gShow table in app.js. Text is escaped when drawn; **bold** marks a button or tab name. ===== */
;(function () {
  var D = window.DATA
  function F(id, title, lead, steps, see, tags, show) {
    return { id: id, title: title, lead: lead, parts: [{ h: 'How to test', ol: steps }, { h: 'What you should see', ul: see }], tags: tags, show: show }
  }
  D.guide = [
    { id: 'start', title: 'Start here', tags: [], show: [{ k: 'start', label: 'Show me the controls panel' }],
      lead: 'This is a clickable design demo of the doctor prescription module. It has no server. All people, medicines and prescriptions are made up and are not clinically verified. Reload the page and everything resets.',
      parts: [
        { h: 'How to open it', ul: ['Double-click **index.html** in the prescription-module folder. Use a laptop-size window. A tablet works too.', 'All changes stay in memory. Reload the page, or press **Reset demo data**, to start again.', 'Bangla text uses your system font.', 'Buttons for things that are out of scope show a small message: "Prototype: not built".'] },
        { h: 'Prototype controls (dashed box, bottom-left)', ul: [
          'This box is not part of the product. It only helps you test. Click the minus to fold it. Click **Prototype controls** to open it again.',
          '**Logged-in doctor**: pick one of 9 doctors. Each has their own appointments, form template, print header and prescribing status.',
          '**Platform admin**: two switches for the current doctor, **Prescription enabled** and **Medicine prescribing enabled**. In the real product only the platform admin can change these.',
          '**Scenario (Dr. Farhana)**: **Returning patient**, **First visit**, **Family member**. Picking one opens that consultation. It only shows for Dr. Farhana.',
          '**Edit window** and clock: choose 24 h, 12 h, 1 h or 1 min. Then move the clock with **+1 h**, **+12 h**, **+1 day** or **Reset**. The prototype starts at 21 Oct 2026, 10:00.',
          '**Warning style**: A inline card, B side panel, C pop-up on add. You can switch at any time.',
          '**Reset demo data**: reloads the page.'] },
        { h: 'The main tabs (top bar)', ul: [
          '**Appointments**: today\'s list. **Open consultation** starts the prescription writer.',
          '**Consultation**: notes on the left, medicines on the right, **Save draft**, **Preview** and **Complete** at the bottom.',
          '**Patient Rx**: the prescriptions this doctor may see, with edit and send options.',
          '**My profile**: the doctor\'s speciality and prescribing status.',
          '**Verify (public)**: check a prescription by Rx number and check code. No login.',
          '**Patient view**: the customer portal (phone-size frame).',
          '**Pharmacy staff (POS)**: read-only lookup for pharmacy staff.',
          '**Guide**: this page.'] },
        { h: 'Keyboard shortcuts', ul: [
          'Press **/** on the Consultation screen to jump to the medicine search (when you are not typing in a field).',
          'In any suggestion list use the **Up** and **Down** arrows, then **Enter** to pick.',
          'Press **Enter** in the medicine search to add the highlighted medicine. The last row adds free text.',
          'Press **Esc** to close a pop-up or a suggestion list.',
          'Press **Tab** to move between fields.'] }
      ] },
    { id: 'tour', title: '5-minute guided tour', tags: ['PHAR-1615'], show: [{ k: 'tour', label: 'Start the tour (opens Rahima Begum)' }],
      lead: 'One path through the most important flow. It takes about five minutes. Press Show me to start at step 2.',
      parts: [
        { h: 'The path', ol: [
          'Open the Returning patient. On **Appointments**, click **Open consultation** on serial #2 Rahima Begum.',
          'Look at the patient strip: masked phone, allergy chip (Penicillin), vitals and BMI. The notes on the left are already filled in. Chips are tagged "record" or "last visit".',
          'Notes: click into **Chief complaints** and type a few letters. A list of suggestions opens. Your own entries come first. Press Down, then Enter, to insert a chip.',
          'Medicines: press **/**, type "napa", press Down and Enter. The medicine is added with its dose.',
          'Taper: click the **Cortan** chip in **Quick add**. One medicine appears with 4 numbered dose steps (8, 6, 4, 2 tablets, 5 days each). The quantity is 100 tablets.',
          'Warnings: click **Continue from this** in the banner. It copies medicines and advised tests only. Then click the **Fexo** chip. A warning card "Already on this medicine" names the other doctor\'s Fexofenadine. Click **Keep (acknowledge)**.',
          'Click **Preview** at the bottom. Read the A4 sheet. The taper prints as numbered steps in Bangla. Click **Back to editing**.',
          'Click **Complete**. Read the summary. Click **Confirm and issue**. You get a new Rx number, a QR and a check code.',
          'Click **Open in Verify page**. The number and code are filled in. Click **Verify**. You should see a valid result.',
          'Click the **Patient view** tab. Open the prescription you just issued. The patient sees the notes, medicines, advice and follow-up. **Download PDF** is simulated.'] },
        { h: 'What you should see', ul: ['Every step works without an error message.', 'The Rx number from step 8 appears in Verify and in Patient view.'] }
      ] },
    F('notes', 'Clinical notes',
      'The left side of the consultation holds the notes: complaints, history, examination, results, tests, diagnosis, advice and follow-up. Suggestions rank your own saved entries first, then common phrases. Known facts are pre-filled from the patient record.',
      ['Press Show me. Rahima Begum\'s consultation opens.',
       'Look at the bar above the notes. It counts the pre-filled chips. Click **Clear pre-filled**, then **Re-apply pre-fill**.',
       'Click into **Chief complaints** and type a few letters. Pick a suggestion with Up, Down and Enter, or click it.',
       'Save an entry to your list: click **Save to list** next to the field, or click the star on a chip. The star turns solid. Click it again to remove it.',
       'Click **Manage sections**. Hide, rename or reorder a section. Add your own section. For each section add, edit or delete your saved notes.',
       'Type "Chronic kidney disease" in **Comorbidity** and "Allergy: Sulfa" in **Drug history**. Both chips are tagged "+ record". Click **Complete** to see "Patient record: will add ...". Click **Back** to stay.',
       'In **On investigation (results)** click **Report results**. Pick **Blood sugar (Fasting)** and type 7.8. The flag shows High. Click **Lipid profile** to add four rows at once.',
       'In **Follow-up** choose **Weeks**, type 2, click **Book follow-up slot** and pick a time. Click **Preview SMS (Bangla)**.'],
      ['Chips tagged "record", "last visit" or "+ record".', 'Saved entries are suggested next time.', 'Results show H or L marks and a reference range.', 'The follow-up date is worked out for you. The booked slot and the Bangla reminder text show. Nothing is really sent.', 'Removing a chip never deletes it from the patient record.'],
      ['PHAR-1615', 'PHAR-1692', 'PHAR-1693', 'PHAR-1698', 'PHAR-1699', 'PHAR-1703'],
      [{ k: 'notes', label: 'Show me: Rahima\'s notes' }, { k: 'manage', label: 'Show me: Manage sections' }]),
    F('meds', 'Medicines & dosing',
      'The right side of the consultation holds the medicines. Each line has a dose pattern, food, route, duration, quantity and instructions. Special cases are covered too: tapering, infusions, SOS, eye drops, weight-based doses and allergy checks.',
      ['Press Show me, then **Cortan taper**. The First visit patient opens with Cortan 5 added.',
       'Look at the line. It has 4 numbered steps, each with its own dates. The quantity is 100 tablets.',
       'On the line set **Start** to "After N days" and type 5. Click **Preview**. The sheet says the course starts later.',
       'On a Napa line click **+ Add dose step**, then **Auto taper...**. Fill the start amount, the reduction, days per step and the last amount. Check the preview, then apply.',
       'Click the **Napa 500** chip whose hover text says "SOS if fever". A reason field appears. Click **Moxicol Eye Drops**. A Right / Left / Both side choice appears.',
       'Press Show me, then **Infusion + sliding scale**. Check the **Infusion** box. Add an empty sliding-scale row and click **Complete** to see the field errors.',
       'Press Show me, then **Weight dosing**. Arian is 25 kg. Napa syrup is added and **Dose by weight (mg/kg)** is ticked at 15. Change the weight in the vitals strip to 12, then clear it.',
       'In a medicine line type an instruction and press Enter. It becomes a chip. Click **Save typed text as my format** to keep it.',
       'Press Show me, then **Allergy warning**. Rahima has a Penicillin allergy. A red card shows on Moxacil and Clavulin. Click **Keep with override reason** and type a reason.'],
      ['A tapered medicine prints as one drug with numbered steps: "১) ... ৫ দিন, তারপর / ২) ...".', 'Removing steps down to one turns the line back into a normal dose.', 'The weight formula shows, for example, 12 kg x 15 mg/kg = 180 mg = 7.5 ml.', 'With no weight you get an error on the line and on the Weight field. Complete is blocked.', 'Allergy warnings never block Complete. The confirm screen counts the open ones.', 'Quantity for infusion and sliding-scale lines is typed by the doctor.'],
      ['PHAR-1716', 'PHAR-1717', 'PHAR-1721', 'PHAR-1722', 'PHAR-1724', 'PHAR-1615'],
      [{ k: 'taper', label: 'Show me: Cortan taper' }, { k: 'infusion', label: 'Show me: Infusion + sliding scale' }, { k: 'weight', label: 'Show me: Weight dosing' }, { k: 'allergy', label: 'Show me: Allergy warning' }]),
    F('speed', 'Speed tools (quick add, templates, instruction formats, advice library)',
      'These tools save typing. Quick add is one click per medicine. Templates fill a whole condition. Instruction formats and the advice library keep your usual wording.',
      ['Press Show me, then **Apply template**. The window has three tabs: **Condition templates**, **Saved combinations**, **Single-medicine presets**.',
       'Click **Apply** on **Viral fever**. Diagnosis, medicines, tests, advice and follow-up fill in. Then try **Asthma flare (steroid taper)**.',
       'On a medicine line click the star to add it to **Quick add**. Click the x on a chip to remove it.',
       'Press Show me, then **Manage quick add**. Reorder with the arrows, click **Edit** or **Delete**, or click **+ New**. The limit is 10 chips.',
       'Click **Save current as template** to keep the current medicines as a template.',
       'Press Show me, then **Advice library**. Pick a category. Tick items to attach them. Click **+ New advice item**, type English only and save. You see an error.',
       'Add the Bangla text and save again. Tick "Also add it to this prescription".'],
      ['Chips in Quick add keep the full dose, food, duration and instructions.', 'Bangla is required for advice. English is optional and prints under it.', 'Deleting a library item removes the line from this draft. Issued prescriptions keep their text.', 'Free-typed advice without Bangla blocks **Complete** with a field error.'],
      ['PHAR-1615', 'PHAR-1694', 'PHAR-1696', 'PHAR-1755'],
      [{ k: 'tpl', label: 'Show me: Apply template' }, { k: 'qa', label: 'Show me: Manage quick add' }, { k: 'lib', label: 'Show me: Advice library' }]),
    F('orders', 'Other orders & documents',
      'Not everything is a medicine. Other orders hold diet, exercise, physiotherapy, procedures, dressing and nebulisation. You can also add a referral, admission advice and a medical certificate. Each can be printed as its own document.',
      ['Press Show me. The **Hypertension follow-up** template is applied. It includes a low-salt diet and a brisk walk.',
       'Under the medicines find **Other orders**. Click **+ Add order**. Pick the **Physiotherapy** tab, then a saved or common entry.',
       'On an order card click **Save to my list**. It is suggested next time.',
       'Press Show me, then **Add referral, admission, certificate**. Click **Complete**. Field errors show because the cards are empty.',
       'Fill them in. Click **Preview**, then use **Preview / print** on each card.',
       'Open the **Patient view** tab. Open RX-A12345-0042 (referral, certificate) and RX-A12345-0031 (admission advice). Click **View / print**.'],
      ['Orders print in their own block, "অন্যান্য নির্দেশনা / Other orders". They are not dispensed and not warning-checked.', 'Each document opens as its own A4 page with the doctor header, QR and check code.', 'Referral, admission and certificate are not copied by **Continue from previous**.', 'The certificate on the prescription sheet is only a one-line note: "printed separately".'],
      ['PHAR-1719', 'PHAR-1720'],
      [{ k: 'orders', label: 'Show me: Orders template' }, { k: 'docs', label: 'Show me: Add referral, admission, certificate' }]),
    F('continue', 'Continue from previous & warnings',
      'For a returning patient you can start from your last prescription. The "Already on this medicine" check compares each medicine with the last two prescriptions of this patient, from any doctor. Warnings never block you.',
      ['Press Show me. Rahima\'s consultation opens and **Continue from this** is applied.',
       'Look for the chip "Continuing from RX-A12345-0042 (v2) - will be saved as v3". Only medicines and advised tests are copied. Click **Undo (remove copied items)** or **Start new** to try the other path.',
       'Click **View previous**. The drawer shows your prescriptions as a v1 to v2 chain with a read-only preview.',
       'Click the **Fexo** chip. A warning card shows the other doctor\'s Fexofenadine. The card shows generic, strength, frequency, duration, date and "by another doctor". Nothing more.',
       'Search for **Napa Extra** and add it. It is flagged against your v2 ("course ended on 18 Oct") and the other doctor\'s prescription.',
       'Click **Keep (acknowledge)**, **Edit dose** or **Remove** on a card.',
       'Click **+ Stop a medicine**. Pick Napa 500 and type a reason. Click **+ Continue previous medicines** and use **Continue** on Seclo.',
       'Change **Warning style** in Prototype controls to B and C. Add a medicine again.'],
      ['Continued medicines are tagged "continued". They are not warned against their own source.', 'The "Checked against: ..." bar shows what was compared. Free-text lines say "not checked".', 'A stop line prints "বন্ধ করুন / STOP" and is never dispensed.', 'In the Family scenario **+ Continue previous medicines** says the other doctor\'s prescription is not shared.'],
      ['PHAR-1754', 'PHAR-1689', 'PHAR-1690', 'PHAR-1718'],
      [{ k: 'continue', label: 'Show me: Continue + warning' }, { k: 'stop', label: 'Show me: Stop a medicine' }]),
    F('preview', 'Preview, print & complete',
      'Preview shows the printed A4 sheet. Complete issues the prescription and makes it final.',
      ['Press Show me. A medicine is added and the preview opens.',
       'Read the sheet: doctor header, patient line, notes on the left, Rx on the right in Bangla, advice, follow-up, signature, QR and check code.',
       'Click **English 123**, then **বাংলা ১২৩**. The directions and follow-up dates change digits. Click **Make this my default** to keep the choice.',
       'Tick **Also print long history (P/H, F/H)**. Those lines now appear on the sheet.',
       'Click **Back to editing**. Click **Save draft**.',
       'Press Show me, then **Complete summary**. Read the counts. Click **Back** or **Confirm and issue**.',
       'After issue, note the Rx number, version, QR and check code. Click **Open in Verify page**.'],
      ['The preview says the real QR and code are generated when you complete.', 'The summary shows the version chain and says "Previous prescriptions stay unchanged and valid".', 'Rx number and check code always use English digits.', '**Print** uses the browser print dialog.'],
      ['PHAR-1700', 'PHAR-1723', 'PHAR-1615'],
      [{ k: 'preview', label: 'Show me: Preview' }, { k: 'complete', label: 'Show me: Complete summary' }]),
    F('verify', 'Verify',
      'Anyone can check a printed prescription with the Rx number and the 8-character check code. This page is public and has no login. It is shown in a phone-size frame.',
      ['Press Show me. The **Verify (public)** tab opens with a valid Rx number and code. Click **Verify**.',
       'Click **Valid prescription**, **Not valid - not found**, **Not valid - changed** and **Old prescription (newer exists)**.',
       'Click **Scan QR**. It is simulated and verifies a sample.',
       'Issue a prescription (see the tour). Then click the button for the one just issued, or use **Open in Verify page**.'],
      ['Valid shows the doctor, date and medicines with a masked patient name.', 'The old prescription is still Valid, with an amber note: "A newer prescription for this patient exists".', 'Not found and Not valid - changed show a clear result.'],
      ['PHAR-1615', 'PHAR-1689'],
      [{ k: 'verify', label: 'Show me: Verify page' }, { k: 'verifyOld', label: 'Show me: Old prescription' }]),
    F('patient', 'Patient portal',
      'The customer portal for Rahima Begum, in a phone-size frame. It has five tabs: Prescriptions, Find a doctor, My animals, Appointments and SMS (simulated).',
      ['Press Show me, then **Prescriptions**. RX-A12345-0042 opens. You see the clinical notes, results table, medicines, advice and follow-up. Click **Download PDF** (simulated). Click **123** to flip the digits.',
       'Click **Share...**. Search a doctor (for example "Mahbub") and share, share with a pharmacy branch, or click **Create view-only link**. Click **Revoke** to end access at once.',
       'Click **Open as recipient**. This is the external link page. It is read-only and the name is masked. After you revoke the link it says "Link revoked".',
       'Press Show me, then **Find a doctor**. Try each practitioner-type chip. Pick a speciality, then switch the chip. A speciality of another type is cleared with a message.',
       'Pick a Veterinary doctor and click **Book**. Confirm without an animal to see the field error. Then pick Moti and confirm.',
       'Press Show me, then **My animals**. Add, edit or remove an animal. Each animal has its own prescription list.',
       'Press Show me, then **SMS link**. Click **Open link**. Log in with phone 01712345678 and OTP 123456.'],
      ['Drafts are never shown to the patient.', 'A shared prescription shows "shared with N". An edited one shows "updated ...".', 'Shares made by the doctor show "sent by your doctor" and have no patient Revoke.', 'Practitioner-type chips show counts. Veterinary, Therapy and Homeopathy appear only when picked.', 'A vet booking needs an animal. A human doctor offers no animal choice.', 'The SMS link asks for phone and OTP first. It never opens the prescription directly.'],
      ['PHAR-1711', 'PHAR-1714', 'PHAR-1706', 'PHAR-1707', 'PHAR-1700', 'PHAR-1723'],
      [{ k: 'patient', label: 'Show me: Prescriptions' }, { k: 'share', label: 'Show me: Share sheet' }, { k: 'find', label: 'Show me: Find a doctor' }, { k: 'animals', label: 'Show me: My animals' }, { k: 'sms', label: 'Show me: SMS link' }]),
    F('profile', 'Doctor profile & speciality',
      'Each doctor has a practitioner type and a primary speciality. These choose the form template, the speciality blocks in the notes and the print title. Some types cannot prescribe medicines. Veterinary doctors treat animals.',
      ['Press Show me. **My profile** opens for Dr. Farhana. Change the **primary speciality**. Tick a few **secondary specialities**. Specialities of another practitioner type are disabled.',
       'Press Show me, then **Speciality blocks**. In Renal type creatinine 1.4. eGFR and a CKD stage appear. In Diabetes type HbA1c 8.2. Click **Preview**.',
       'Click **+ Add block** and pick Obstetric. Type a date in LMP. The due date and gestational age appear. Use the **Form template** switcher to pick Cardiology.',
       'Press Show me, then **Physiotherapist**. The medicine search is disabled with an explanation. Add an order and click **Preview**. The right column is the plan.',
       'In Prototype controls tick **Medicine prescribing enabled**. The search returns. Untick **Prescription enabled** to see the "disabled" screen (403).',
       'Press Show me, then **Veterinarian (Lali)**. Lali (cow) opens. See the animal strip, no BP or BMI, and the **Food safety** block with withdrawal days.'],
      ['Print titles change by type: "Dental prescription", "Homeopathic prescription", "Veterinary prescription".', 'Derived values (eGFR, EDD, BSA and others) are mock formulas, not clinically verified.', 'The vet print says "For animal use only". The owner record is not pre-filled and is never written back.', 'The vet needs the animal weight. Without it **Complete** is blocked.'],
      ['PHAR-1701', 'PHAR-1702', 'PHAR-1703', 'PHAR-1704', 'PHAR-1705', 'PHAR-1707', 'PHAR-1708'],
      [{ k: 'profile', label: 'Show me: My profile' }, { k: 'blocks', label: 'Show me: Speciality blocks' }, { k: 'physio', label: 'Show me: Physiotherapist' }, { k: 'vet', label: 'Show me: Veterinarian (Lali)' }]),
    F('access', 'Access rules (Patient Rx tab, edit window, POS staff screen)',
      'Only the doctor who wrote a prescription may create or edit it. A doctor sees their own prescriptions and the ones the patient shared. Pharmacy staff only look up prescriptions shared with their branch.',
      ['Press Show me, then **Patient Rx**. Dr. Farhana, patient Nasrin Akter. The card says "Editable for 23h 10m".',
       'Press Show me, then **Edit window 1 h**. The window is 1 h and shows 10 minutes left. In Prototype controls click **+1 h**. Edit is now disabled, with the reason.',
       'Press Show me, then **Patient Rx**. Click **Edit** on Nasrin\'s prescription. Add a medicine and click **Save edit**. Then open **Verify (public)**: RX-A12345-0050 with the old code QW5T-9HNB says "Not valid - changed".',
       'Switch the doctor to **Homeopathy** and open Rahima. A prescription tagged "Shared by patient" shows, read-only. Switch to Gynaecology and open Nasrin. You see an empty state with no hint that others exist.',
       'As Dr. Farhana, on Rahima\'s card for RX-A12345-0031 click **Send to pharmacy branch** and pick Uttara.',
       'Press Show me, then **POS screen**. Branch Dhanmondi, RX-A12345-0042 is found. RX-A12345-0031 and an invented number give the same message.'],
      ['The edit window counts from submission, not from the first draft save.', 'An edit keeps the same Rx number and version. The check code changes. Old printed copies show "Not valid - changed".', 'After the window the way forward is **Continue from previous**.', 'The POS screen has no create or edit control, on purpose.', 'The one exception: "Already on this medicine" still reads the last two prescriptions of any doctor, with minimal fields.'],
      ['PHAR-1709', 'PHAR-1710', 'PHAR-1711', 'PHAR-1712', 'PHAR-1713', 'PHAR-1714'],
      [{ k: 'prx', label: 'Show me: Patient Rx' }, { k: 'win', label: 'Show me: Edit window 1 h' }, { k: 'pos', label: 'Show me: POS screen' }]),
    { id: 'simulated', title: 'What is simulated', tags: [], show: [{ k: 'sms', label: 'Show me: SMS link' }],
      lead: 'There is no server. These things look real but are only pretend.',
      parts: [{ h: 'Pretend features', ul: [
        '**SMS**: nothing is sent. Reminder SMS, issue SMS and the test send only show text or a message.',
        '**Login and OTP**: the OTP is always 123456. Demo phones: 01712345678 (Rahima, the owner) and 01819000204 (Sabbir, sees "not issued to this account").',
        '**PDF download**: **Download PDF** only shows a message.',
        '**QR scan**: **Scan QR** verifies a sample prescription.',
        '**QR code and check code**: the QR is a picture made from the number. The check code is made up on issue.',
        '**Platform admin switches**: in the real product only the platform admin changes them. Here they are two tick boxes.',
        '**Clock and edit window**: the prototype clock starts at 21 Oct 2026, 10:00. You move it by hand.',
        '**Medical values**: brands, strengths, formulas, ranges and species norms are examples. They are not clinically verified.'] }] },
    { id: 'cheat', title: 'Mock data cheat sheet', tags: [], show: [{ k: 'cheat', label: 'Show me: Appointments' }],
      lead: 'The people, doctors, prescriptions and places you can use while testing.',
      parts: [{ h: 'Scenarios (Dr. Farhana)', cheat: 'scenarios' }, { h: 'Patients', cheat: 'patients' }, { h: 'Doctors in the doctor switcher', cheat: 'doctors' },
        { h: 'Prescriptions for Verify', cheat: 'rx' }, { h: 'Pharmacy branches (POS)', cheat: 'branches' }, { h: 'Animals (owner Rahima Begum)', cheat: 'animals' },
        { h: 'Login for the SMS link', ul: ['Phone 01712345678 = Rahima Begum (owner). OTP 123456.', 'Phone 01819000204 = Sabbir Hossain (sees "not issued to this account"). OTP 123456.'] }] },
    { id: 'questions', title: 'Open questions for the team', tags: ['PHAR-1615'], show: [{ k: 'continue', label: 'Show me: warnings (question 1)' }],
      lead: 'These are the points we want your opinion on. Please write your answer next to each number, for example in a shared note or on the Jira ticket. If you have no view, write "no opinion".',
      parts: [{ h: 'Questions', ol: [
        'Warning style: inline card (A), side panel (B) or pop-up (C)? A keeps context but pushes lines down. B gives one summary but needs width. C is hardest to miss but interrupts typing. A mix is possible.',
        'Continue banner or auto-open drawer: the banner is quiet. Should **View previous** open by itself for returning patients?',
        'Section customisation: per doctor (hide and reorder, as built) or only a default per speciality template? Should hidden sections still print if filled?',
        'Allergy override (PHAR-1724): the ticket says issuing needs an override reason. Here warnings never block and open ones are only counted. Block or not?',
        'Pop-up on template or continue: style C pops up only for single adds and templates. For Continue it shows a badge and a message. Is that right?',
        'Continue from an older version (in the drawer): always saved as the latest version + 1?',
        'Check code: on the printed page only, or also in the patient SMS?',
        'Record write-back (PHAR-1693): built as automatic and add-only on issue (design D8). Do you want a per-item opt-out?',
        'Bangla mandatory (PHAR-1694): free-typed advice without Bangla blocks Complete. Should library items and free lines be allowed in Bangla only? Built: yes.',
        'Reminder SMS (PHAR-1699): who sends it, and can the patient opt out? Built as a per-prescription switch.',
        'Dentists (PHAR-1702): the request said dentists may be limited. Design D14 says no limit. Built as D14. Confirm.',
        'Homeopath, Unani, Ayurveda (D9): medicine prescribing is OFF by default, so the homeopath demo cannot prescribe until a platform admin turns it on. Is that intended?',
        'Ad-hoc blocks: kept for one prescription unless "Keep on my form". Should a template switch also reset hidden and renamed sections? Built: no.',
        'Registration body for physiotherapy, nutrition and psychology is "Other". Is there a council to name?',
        'Vet booking: must the animal exist before booking (built), or may it be added during booking?',
        'Poultry and herd patients: should My animals take a head count for a flock? The demo animals are single animals.',
        'Edit semantics (PHAR-1710): built as an in-place correction (same number and version, new check code, window does not restart). Or should an edit create a new version?',
        'What staff and link viewers see (PHAR-1711, PHAR-1713): built as medicines, advice and follow-up without clinical notes. The name is masked on the link and shown to staff. Show the full prescription instead?',
        'Doctor-routed branch shares: the patient cannot revoke them. Can the doctor withdraw one? Should the patient be able to revoke it too?',
        'Windows: if the edit window closes while the editor is open, Save edit is refused. Is a grace period wanted? Sharing with a doctor also gives that doctor Continue-from-previous on the shared prescription (read-only copy into a new prescription).'] }] }
  ]
})()
