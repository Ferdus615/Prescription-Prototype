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
