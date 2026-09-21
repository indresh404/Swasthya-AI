// src/data/fallbackMedicines.ts
import { Medicine } from '../types/medicine';

export const fallbackMedicines: Medicine[] = [
  {
    Id: 'med-1',
    product_name: 'Metformin 500mg Tablet',
    sub_category: 'Anti-Diabetic',
    salt_composition: 'Metformin Hydrochloride (500mg)',
    product_price: '₹32.50',
    product_manufactured: 'Sun Pharmaceutical Industries Ltd',
    medicine_desc: 'Metformin is a first-line medication for the treatment of type 2 diabetes, particularly in people who are overweight. It helps lower blood sugar levels by improving body sensitivity to insulin.',
    side_effects: 'Nausea, stomach upset, diarrhea, metallic taste, loss of appetite.',
    drug_interactions: { conflict_risk: 'Moderate with cimetidine and iodinated contrast agents.' }
  },
  {
    Id: 'med-2',
    product_name: 'Lisinopril 10mg Tablet',
    sub_category: 'Cardiovascular / ACE Inhibitor',
    salt_composition: 'Lisinopril (10mg)',
    product_price: '₹45.00',
    product_manufactured: 'Cipla Ltd',
    medicine_desc: 'Lisinopril is an ACE inhibitor used to treat high blood pressure (hypertension), heart failure, and after heart attacks to improve survival outcomes.',
    side_effects: 'Dry cough, dizziness, headache, excessive tiredness.',
    drug_interactions: { conflict_risk: 'High interaction risk with Potassium supplements and NSAIDs.' }
  },
  {
    Id: 'med-3',
    product_name: 'Dolo 650mg Tablet',
    sub_category: 'Analgesic & Antipyretic',
    salt_composition: 'Paracetamol / Acetaminophen (650mg)',
    product_price: '₹30.80',
    product_manufactured: 'Micro Labs Ltd',
    medicine_desc: 'Dolo 650 is a widely prescribed analgesic and antipyretic medication used to relieve fever and mild to moderate bodily pain, including headaches and muscle aches.',
    side_effects: 'Rare allergic skin rash; hepatotoxicity if taken in extreme overdose.',
    drug_interactions: { conflict_risk: 'Avoid concurrent high alcohol intake or chronic warfarin therapy.' }
  },
  {
    Id: 'med-4',
    product_name: 'Amoxicillin 500mg Capsule',
    sub_category: 'Antibiotic (Penicillin)',
    salt_composition: 'Amoxicillin Trihydrate (500mg)',
    product_price: '₹68.20',
    product_manufactured: 'GlaxoSmithKline Pharmaceuticals Ltd',
    medicine_desc: 'Amoxicillin is a broad-spectrum penicillin antibiotic used to treat bacterial infections of the middle ear, throat, respiratory tract, and urinary tract.',
    side_effects: 'Mild diarrhea, nausea, skin rash, mild stomach discomfort.',
    drug_interactions: { conflict_risk: 'May reduce efficacy of oral contraceptives; severe rash with Allopurinol.' }
  },
  {
    Id: 'med-5',
    product_name: 'Atorvastatin 20mg Tablet',
    sub_category: 'Lipid-Lowering / Statin',
    salt_composition: 'Atorvastatin Calcium (20mg)',
    product_price: '₹110.00',
    product_manufactured: 'Lupin Ltd',
    medicine_desc: 'Atorvastatin lowers "bad" cholesterol (LDL) and triglycerides in the blood while raising "good" cholesterol (HDL), significantly reducing stroke and heart attack risks.',
    side_effects: 'Joint pain, muscle ache, diarrhea, mild liver enzyme elevation.',
    drug_interactions: { conflict_risk: 'Avoid grapefruit juice and high-dose Gemfibrozil.' }
  },
  {
    Id: 'med-6',
    product_name: 'Omeprazole 20mg Capsule',
    sub_category: 'Gastroenterology / PPI',
    salt_composition: 'Omeprazole Magnesium (20mg)',
    product_price: '₹52.00',
    product_manufactured: 'Dr. Reddy’s Laboratories Ltd',
    medicine_desc: 'Omeprazole decreases the amount of acid produced in the stomach. It is used to treat gastroesophageal reflux disease (GERD), stomach ulcers, and acidity.',
    side_effects: 'Headache, stomach pain, gas, nausea, vitamin B12 deficiency on long-term use.',
    drug_interactions: { conflict_risk: 'Interferes with Clopidogrel and Digoxin absorption.' }
  },
  {
    Id: 'med-7',
    product_name: 'Amlodipine 5mg Tablet',
    sub_category: 'Cardiovascular / Calcium Blocker',
    salt_composition: 'Amlodipine Besylate (5mg)',
    product_price: '₹28.40',
    product_manufactured: 'Torrent Pharmaceuticals Ltd',
    medicine_desc: 'Amlodipine relaxes blood vessels so blood can flow more easily, effectively lowering elevated blood pressure and preventing angina chest pain episodes.',
    side_effects: 'Ankle swelling (edema), dizziness, flushing, palpitations.',
    drug_interactions: { conflict_risk: 'Increased hypotensive effect with Simvastatin and Diltiazem.' }
  },
  {
    Id: 'med-8',
    product_name: 'Azithromycin 500mg Tablet',
    sub_category: 'Antibiotic (Macrolide)',
    salt_composition: 'Azithromycin Dihydrate (500mg)',
    product_price: '₹118.50',
    product_manufactured: 'Zydus Cadila Ltd',
    medicine_desc: 'Azithromycin is a macrolide-type antibiotic used to treat various bacterial infections, including bronchitis, pneumonia, and infections of the skin, ear, and throat.',
    side_effects: 'Diarrhea, vomiting, abdominal pain, temporary alteration in taste.',
    drug_interactions: { conflict_risk: 'Avoid simultaneous administration with antacids containing aluminum or magnesium.' }
  },
  {
    Id: 'med-9',
    product_name: 'Pantoprazole 40mg Tablet',
    sub_category: 'Gastroenterology / PPI',
    salt_composition: 'Pantoprazole Sodium (40mg)',
    product_price: '₹75.00',
    product_manufactured: 'Alkem Laboratories Ltd',
    medicine_desc: 'Pantoprazole treats heartburn, acid reflux, and peptic ulcer disease by inhibiting hydrogen-potassium ATPase pumps in stomach parietal cells.',
    side_effects: 'Headache, flatulence, abdominal pain, dizziness.',
    drug_interactions: { conflict_risk: 'Decreases bioavailability of Ketoconazole and Iron supplements.' }
  },
  {
    Id: 'med-10',
    product_name: 'Ibuprofen 400mg Tablet',
    sub_category: 'NSAID / Pain Relief',
    salt_composition: 'Ibuprofen (400mg)',
    product_price: '₹22.00',
    product_manufactured: 'Abbott Healthcare Pvt Ltd',
    medicine_desc: 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used for reducing fever and treating pain or inflammation caused by conditions such as headaches, toothaches, or arthritis.',
    side_effects: 'Stomach irritation, heartburn, dizziness, risk of gastric ulcers.',
    drug_interactions: { conflict_risk: 'Avoid mixing with Aspirin, Warfarin, or antihypertensives.' }
  },
  {
    Id: 'med-11',
    product_name: 'Vitamin D3 60,000 IU Capsule',
    sub_category: 'Nutritional Supplement',
    salt_composition: 'Cholecalciferol (60,000 IU)',
    product_price: '₹140.00',
    product_manufactured: 'Sun Pharmaceutical Industries Ltd',
    medicine_desc: 'Cholecalciferol (Vitamin D3) is essential for calcium absorption in bones and supporting immune memory and muscle strength.',
    side_effects: 'Hypercalcemia if taken in extreme excessive doses over time.',
    drug_interactions: { conflict_risk: 'Thiazide diuretics may elevate serum calcium levels.' }
  },
  {
    Id: 'med-12',
    product_name: 'Cetirizine 10mg Tablet',
    sub_category: 'Antihistamine / Anti-Allergic',
    salt_composition: 'Cetirizine Hydrochloride (10mg)',
    product_price: '₹18.00',
    product_manufactured: 'Cipla Ltd',
    medicine_desc: 'Cetirizine provides fast relief from allergy symptoms such as sneezing, runny nose, watery eyes, and itching caused by allergic rhinitis or hives.',
    side_effects: 'Mild drowsiness, dry mouth, tiredness, headache.',
    drug_interactions: { conflict_risk: 'Increased sedation when combined with alcohol or CNS depressants.' }
  },
  {
    Id: 'med-13',
    product_name: 'Telmisartan 40mg Tablet',
    sub_category: 'Cardiovascular / ARB',
    salt_composition: 'Telmisartan (40mg)',
    product_price: '₹88.00',
    product_manufactured: 'Glenmark Pharmaceuticals Ltd',
    medicine_desc: 'Telmisartan is an Angiotensin II Receptor Blocker (ARB) that lowers elevated blood pressure and protects kidney function in diabetic patients.',
    side_effects: 'Dizziness, sinus congestion, back pain, mild diarrhea.',
    drug_interactions: { conflict_risk: 'Avoid lithium co-administration and potassium-sparing diuretics.' }
  },
  {
    Id: 'med-14',
    product_name: 'Rosuvastatin 10mg Tablet',
    sub_category: 'Lipid-Lowering / Statin',
    salt_composition: 'Rosuvastatin Calcium (10mg)',
    product_price: '₹135.00',
    product_manufactured: 'AstraZeneca Pharma India Ltd',
    medicine_desc: 'Rosuvastatin is a high-potency statin used alongside diet to reduce bad cholesterol levels and slow arterial plaque accumulation.',
    side_effects: 'Muscular tenderness, weakness, mild nausea, elevated blood sugar.',
    drug_interactions: { conflict_risk: 'Interaction risk with Cyclosporine and Warfarin.' }
  },
  {
    Id: 'med-15',
    product_name: 'Levothyroxine 50mcg Tablet',
    sub_category: 'Endocrinology / Thyroid Supplement',
    salt_composition: 'Thyroxine Sodium (50mcg)',
    product_price: '₹125.00',
    product_manufactured: 'Abbott Healthcare Pvt Ltd',
    medicine_desc: 'Levothyroxine is a synthetic thyroid hormone used to treat hypothyroidism (underactive thyroid gland) and maintain metabolic hormone balance.',
    side_effects: 'Palpitations, weight loss, tremor, heat intolerance if over-dosed.',
    drug_interactions: { conflict_risk: 'Take on empty stomach 4 hours apart from Calcium/Iron tablets.' }
  }
];
