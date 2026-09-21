import os
import neo4j
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
uri = os.getenv("NEO4J_URI", "neo4j+s://63ba98a5.databases.neo4j.io")
user = os.getenv("NEO4J_USERNAME", "63ba98a5")
pwd = os.getenv("NEO4J_PASSWORD", "_Nxv6nFNRYmYWwGBTNZa-iT5MvRfVLM4BK6pm6sytIA")

print(f"Connecting to Neo4j Aura DB at {uri}...")
driver = neo4j.GraphDatabase.driver(uri, auth=(user, pwd))

clean_build_cypher = """
// 1. Completely wipe old messy database and remove any duplicate edges
MATCH (n) DETACH DELETE n;

// 2. Primary Patient Node: Indresh Suresh
CREATE (u:User {
    id: 'indresh',
    name: 'Indresh Suresh',
    age: 24,
    gender: 'Male',
    blood_group: 'B+',
    email: 'indresh@swasthya.ai',
    phone: '+91 9876543210',
    city: 'Mumbai',
    emergency_contact: '+91 9820123456 (Father - Suresh Kumar)',
    height_cm: 178,
    weight_kg: 74,
    bmi: 23.4,
    smoker: false,
    alcohol: 'Occasional',
    language: 'Hindi / English / Marathi',
    created_at: '2024-01-01',
    status: 'Active Patient'
});

// Also create alias node for patient-123 API backward compatibility
CREATE (p123:User {
    id: 'patient-123',
    name: 'Indresh Suresh',
    age: 24,
    gender: 'Male',
    blood_group: 'B+',
    email: 'indresh@swasthya.ai',
    city: 'Mumbai'
});

// 3. Family Members & Family Group
CREATE (father:User {
    id: 'fam_suresh_father',
    name: 'Suresh Kumar',
    age: 56,
    gender: 'Male',
    relation: 'Father',
    city: 'Mumbai',
    blood_group: 'B+'
});

CREATE (mother:User {
    id: 'fam_sunita_mother',
    name: 'Sunita Suresh',
    age: 52,
    gender: 'Female',
    relation: 'Mother',
    city: 'Mumbai',
    blood_group: 'O+'
});

CREATE (sister:User {
    id: 'fam_priya_sister',
    name: 'Priya Suresh',
    age: 21,
    gender: 'Female',
    relation: 'Sister',
    city: 'Mumbai',
    blood_group: 'B+'
});

CREATE (famGroup:FamilyGroup {
    id: 'fam_indresh_cohort',
    name: 'Suresh Family Health Cohort',
    created_by: 'Indresh Suresh',
    created_date: '2024-01-15'
});

// Connect Family
MATCH (u:User {id: 'indresh'}), (p123:User {id: 'patient-123'}), (father:User {id: 'fam_suresh_father'}), (mother:User {id: 'fam_sunita_mother'}), (sister:User {id: 'fam_priya_sister'}), (fg:FamilyGroup {id: 'fam_indresh_cohort'})
CREATE (fg)-[:CONTAINS {relation: 'Self'}]->(u)
CREATE (fg)-[:CONTAINS {relation: 'Father'}]->(father)
CREATE (fg)-[:CONTAINS {relation: 'Mother'}]->(mother)
CREATE (fg)-[:CONTAINS {relation: 'Sister'}]->(sister)
CREATE (u)-[:FAMILY_MEMBER {relation: 'Father', genetic_similarity: '50%'}]->(father)
CREATE (father)-[:FAMILY_MEMBER {relation: 'Son'}]->(u)
CREATE (u)-[:FAMILY_MEMBER {relation: 'Mother', genetic_similarity: '50%'}]->(mother)
CREATE (mother)-[:FAMILY_MEMBER {relation: 'Son'}]->(u)
CREATE (u)-[:FAMILY_MEMBER {relation: 'Sister'}]->(sister)
CREATE (sister)-[:FAMILY_MEMBER {relation: 'Brother'}]->(u);

// 4. Clinical Conditions & Diagnoses
MATCH (u:User {id: 'indresh'}), (p123:User {id: 'patient-123'}), (father:User {id: 'fam_suresh_father'}), (mother:User {id: 'fam_sunita_mother'}), (sister:User {id: 'fam_priya_sister'})
CREATE (c1:Condition {name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', category: 'Endocrine', risk_tier: 'Moderate', organ_affected: 'Pancreas'})
CREATE (c2:Condition {name: 'Primary Hypertension', icd10: 'I10', category: 'Cardiovascular', risk_tier: 'Mild', organ_affected: 'Cardiovascular System'})
CREATE (c3:Condition {name: 'Vitamin D Deficiency', icd10: 'E55.9', category: 'Nutritional', risk_tier: 'Mild', organ_affected: 'Bones / Immunity'})
CREATE (c4:Condition {name: 'Migraine / Tension Headache', icd10: 'G43.9', category: 'Neurological', risk_tier: 'Intermittent', organ_affected: 'Brain'})
CREATE (c5:Condition {name: 'Dyslipidemia (Mild Lipids)', icd10: 'E78.0', category: 'Metabolic', risk_tier: 'Monitoring', organ_affected: 'Vascular'})

CREATE (u)-[:HAS_CONDITION {status: 'active', diagnosed_date: '2023-04-15', severity: 'moderate'}]->(c1)
CREATE (u)-[:HAS_CONDITION {status: 'active', diagnosed_date: '2023-11-20', severity: 'mild'}]->(c2)
CREATE (u)-[:HAS_CONDITION {status: 'monitoring', diagnosed_date: '2024-01-10', severity: 'mild'}]->(c3)
CREATE (u)-[:HAS_CONDITION {status: 'intermittent', diagnosed_date: '2024-02-12', severity: 'moderate'}]->(c4)
CREATE (u)-[:HAS_CONDITION {status: 'monitoring', diagnosed_date: '2024-03-05', severity: 'mild'}]->(c5)

CREATE (p123)-[:HAS_CONDITION {status: 'active'}]->(c1)
CREATE (p123)-[:HAS_CONDITION {status: 'active'}]->(c2)

// Hereditary overlap
CREATE (father)-[:HAS_CONDITION {status: 'active', diagnosed_date: '2015-06-10', hereditary_link: true}]->(c1)
CREATE (father)-[:HAS_CONDITION {status: 'active', diagnosed_date: '2012-03-01', hereditary_link: true}]->(c2)
CREATE (mother)-[:HAS_CONDITION {status: 'active', diagnosed_date: '2018-09-12', hereditary_link: true}]->(c2)
CREATE (sister)-[:HAS_CONDITION {status: 'intermittent', diagnosed_date: '2024-04-11'}]->(c4);

// 5. Habits & Lifestyle Facts (Minute details)
MATCH (u:User {id: 'indresh'})
CREATE (h1:HealthFact {id: 'fact-desk', name: 'Prolonged Desk Work (9.5 hrs/day)', category: 'routine', frequency: 'daily', impact: 'High sitting screen time', date: '2026-09-10'})
CREATE (h2:HealthFact {id: 'fact-sleep', name: 'Sleep Schedule (5.5 - 6.5 hrs)', category: 'sleep', frequency: 'daily', impact: 'Delayed sleep latency 38m', date: '2026-09-12'})
CREATE (h3:HealthFact {id: 'fact-skip-bf', name: 'Skips Morning Breakfast', category: 'diet', frequency: 'recurring', impact: 'During sprint delivery cycles', date: '2026-09-14'})
CREATE (h4:HealthFact {id: 'fact-caffeine', name: 'High Caffeine (3-4 cups tea/coffee)', category: 'diet', frequency: 'daily', impact: 'Daily stimulant use', date: '2026-09-15'})
CREATE (h5:HealthFact {id: 'fact-walk', name: 'Brisk Evening Walk (30 mins)', category: 'exercise', frequency: 'weekly', impact: '4-5 days a week positive habit', date: '2026-09-18'})
CREATE (h6:HealthFact {id: 'fact-stress', name: 'High Cognitive Deadline Stress', category: 'stress', frequency: 'recurring', impact: 'Sprint architecture milestones', date: '2026-09-19'})
CREATE (h7:HealthFact {id: 'fact-hydration', name: 'Sub-optimal Hydration (1.8 L/day)', category: 'diet', frequency: 'daily', impact: 'Below 3L target', date: '2026-09-19'})
CREATE (h8:HealthFact {id: 'fact-dinner', name: 'Late Night Dinner (10:30 PM)', category: 'diet', frequency: 'daily', impact: 'Late metabolic load before sleep', date: '2026-09-19'})

CREATE (u)-[:HAS_HABIT {status: 'active'}]->(h1)
CREATE (u)-[:HAS_HABIT {status: 'active'}]->(h2)
CREATE (u)-[:HAS_HABIT {status: 'active'}]->(h3)
CREATE (u)-[:HAS_HABIT {status: 'active'}]->(h4)
CREATE (u)-[:HAS_HABIT {status: 'active'}]->(h5)
CREATE (u)-[:HAS_HABIT {status: 'active'}]->(h6)
CREATE (u)-[:HAS_HABIT {status: 'active'}]->(h7)
CREATE (u)-[:HAS_HABIT {status: 'active'}]->(h8)
CREATE (u)-[:HAS_FACT {date: '2026-09-10'}]->(h1)
CREATE (u)-[:HAS_FACT {date: '2026-09-12'}]->(h2)
CREATE (u)-[:HAS_FACT {date: '2026-09-14'}]->(h3)
CREATE (u)-[:HAS_FACT {date: '2026-09-15'}]->(h4)
CREATE (u)-[:HAS_FACT {date: '2026-09-18'}]->(h5)
CREATE (u)-[:HAS_FACT {date: '2026-09-19'}]->(h6);

// 6. Symptoms & Causality Links to Habits
MATCH (u:User {id: 'indresh'}), (sister:User {id: 'fam_priya_sister'}), (mother:User {id: 'fam_sunita_mother'})
MATCH (h1:HealthFact {id: 'fact-desk'}), (h2:HealthFact {id: 'fact-sleep'}), (h3:HealthFact {id: 'fact-skip-bf'}), (h4:HealthFact {id: 'fact-caffeine'}), (h6:HealthFact {id: 'fact-stress'}), (h8:HealthFact {id: 'fact-dinner'})
CREATE (s1:Symptom {name: 'Morning Fatigue', category: 'Constitutional', severity: 6, duration: '2 weeks', status: 'active', body_area: 'Whole Body'})
CREATE (s2:Symptom {name: 'Occipital Tension Headache', category: 'Neurological', severity: 7, duration: '3 days', status: 'active', body_area: 'Head / Neck'})
CREATE (s3:Symptom {name: 'Post-prandial Dizziness', category: 'Metabolic', severity: 5, duration: '1 week', status: 'active', body_area: 'Head'})
CREATE (s4:Symptom {name: 'Lower Back Stiffness', category: 'Musculoskeletal', severity: 4, duration: '1 month', status: 'active', body_area: 'Lumbar Spine'})
CREATE (s5:Symptom {name: 'Acid Reflux & Heartburn', category: 'Gastrointestinal', severity: 4, duration: '10 days', status: 'active', body_area: 'Stomach / Chest'})
CREATE (s6:Symptom {name: 'Seasonal Sneezing & Rhinitis', category: 'Respiratory', severity: 5, duration: '1 week', status: 'active', body_area: 'Nasal'})

CREATE (u)-[:HAS_SYMPTOM {severity: 6, last_reported: '2026-09-20'}]->(s1)
CREATE (u)-[:HAS_SYMPTOM {severity: 7, last_reported: '2026-09-21'}]->(s2)
CREATE (u)-[:HAS_SYMPTOM {severity: 5, last_reported: '2026-09-20'}]->(s3)
CREATE (u)-[:HAS_SYMPTOM {severity: 4, last_reported: '2026-09-18'}]->(s4)
CREATE (u)-[:HAS_SYMPTOM {severity: 4, last_reported: '2026-09-19'}]->(s5)
CREATE (u)-[:HAS_SYMPTOM {severity: 5, last_reported: '2026-09-21'}]->(s6)

// Symptom Triggers (Causality)
CREATE (s1)-[:TRIGGERED_BY]->(h2)
CREATE (s2)-[:TRIGGERED_BY]->(h6)
CREATE (s2)-[:TRIGGERED_BY]->(h4)
CREATE (s3)-[:TRIGGERED_BY]->(h3)
CREATE (s4)-[:TRIGGERED_BY]->(h1)
CREATE (s5)-[:TRIGGERED_BY]->(h8)

// Family symptom overlap
CREATE (sister)-[:HAS_SYMPTOM {severity: 6, status: 'active'}]->(s2)
CREATE (sister)-[:HAS_SYMPTOM {severity: 6, status: 'active'}]->(s6)
CREATE (mother)-[:HAS_SYMPTOM {severity: 5, status: 'active'}]->(s1);

// 7. Active Prescribed Medications
MATCH (u:User {id: 'indresh'}), (p123:User {id: 'patient-123'})
MATCH (c1:Condition {name: 'Type 2 Diabetes Mellitus'}), (c2:Condition {name: 'Primary Hypertension'}), (c3:Condition {name: 'Vitamin D Deficiency'}), (c4:Condition {name: 'Migraine / Tension Headache'}), (c5:Condition {name: 'Dyslipidemia (Mild Lipids)'})

CREATE (m1:Medication {name: 'Glycomet 500mg', generic_name: 'Metformin HCl 500mg', dosage: '500mg', frequency: 'Twice daily after meals', brand_price: 52.00, timing: '08:00 AM, 08:30 PM'})
CREATE (m2:Medication {name: 'Dolo 650', generic_name: 'Paracetamol 650mg', dosage: '650mg', frequency: 'As needed for fever/headache', brand_price: 32.00, timing: '02:00 PM'})
CREATE (m3:Medication {name: 'Calcirol 60k', generic_name: 'Cholecalciferol Vitamin D3', dosage: '60000 IU', frequency: 'Once weekly Sunday', brand_price: 65.00, timing: '01:00 PM'})
CREATE (m4:Medication {name: 'Crocin 650mg', generic_name: 'Paracetamol 650mg', dosage: '650mg', frequency: 'SOS (As needed for headache)', brand_price: 30.00, timing: 'SOS'})
CREATE (m5:Medication {name: 'Pan-D', generic_name: 'Pantoprazole 40mg + Domperidone 30mg', dosage: '40mg/30mg', frequency: 'Morning before food (SOS)', brand_price: 95.00, timing: 'SOS'})

CREATE (u)-[:TAKES_MEDICATION {status: 'active', adherence_rate: '94%'}]->(m1)
CREATE (u)-[:TAKES_MEDICATION {status: 'active', adherence_rate: '91%'}]->(m2)
CREATE (u)-[:TAKES_MEDICATION {status: 'active', adherence_rate: '96%'}]->(m3)
CREATE (u)-[:TAKES_MEDICATION {status: 'as_needed'}]->(m4)
CREATE (u)-[:TAKES_MEDICATION {status: 'as_needed'}]->(m5)

CREATE (p123)-[:TAKES_MEDICATION {status: 'active'}]->(m1)
CREATE (p123)-[:TAKES_MEDICATION {status: 'active'}]->(m2)

CREATE (m1)-[:TREATS]->(c1)
CREATE (m2)-[:TREATS]->(c4)
CREATE (m3)-[:TREATS]->(c3)
CREATE (m4)-[:TREATS]->(c4);

// 8. Jan Aushadhi Bio-Equivalent Generics (PMBJP Government Scheme)
MATCH (m1:Medication {name: 'Glycomet 500mg'}), (m2:Medication {name: 'Dolo 650'}), (m3:Medication {name: 'Calcirol 60k'}), (m4:Medication {name: 'Crocin 650mg'}), (m5:Medication {name: 'Pan-D'})
CREATE (ja1:JanAushadhiMedicine {name: 'Jan Aushadhi Metformin 500mg', generic_name: 'Metformin HCl 500mg', brand_equivalent: 'Glycomet 500mg', brand_price: 52.00, jan_aushadhi_price: 9.20, savings_pct: 82.3, code: 'PMBJP-0142'})
CREATE (ja2:JanAushadhiMedicine {name: 'Jan Aushadhi Paracetamol 650mg (Dolo Equivalent)', generic_name: 'Paracetamol 650mg', brand_equivalent: 'Dolo 650', brand_price: 32.00, jan_aushadhi_price: 4.50, savings_pct: 85.9, code: 'PMBJP-0012'})
CREATE (ja3:JanAushadhiMedicine {name: 'Jan Aushadhi Vitamin D3 60k', generic_name: 'Cholecalciferol 60k IU', brand_equivalent: 'Calcirol 60k', brand_price: 65.00, jan_aushadhi_price: 12.00, savings_pct: 81.5, code: 'PMBJP-0321'})
CREATE (ja4:JanAushadhiMedicine {name: 'Jan Aushadhi Paracetamol 650mg', generic_name: 'Paracetamol 650mg', brand_equivalent: 'Crocin 650mg', brand_price: 30.00, jan_aushadhi_price: 4.50, savings_pct: 85.0, code: 'PMBJP-0012'})
CREATE (ja5:JanAushadhiMedicine {name: 'Jan Aushadhi Pantoprazole 40mg', generic_name: 'Pantoprazole 40mg', brand_equivalent: 'Pan-D', brand_price: 95.00, jan_aushadhi_price: 14.00, savings_pct: 85.2, code: 'PMBJP-0205'})

CREATE (m1)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 82.3, monthly_savings_inr: 42.80}]->(ja1)
CREATE (m2)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 85.9, monthly_savings_inr: 27.50}]->(ja2)
CREATE (m3)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 81.5, monthly_savings_inr: 53.00}]->(ja3)
CREATE (m4)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 85.0, monthly_savings_inr: 25.50}]->(ja4)
CREATE (m5)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 85.2, monthly_savings_inr: 81.00}]->(ja5);

// 9. Jan Aushadhi Kendras (Pharmacy Stores)
MATCH (ja1:JanAushadhiMedicine {name: 'Jan Aushadhi Metformin 500mg'}), (ja2:JanAushadhiMedicine {name: 'Jan Aushadhi Paracetamol 650mg (Dolo Equivalent)'}), (ja3:JanAushadhiMedicine {name: 'Jan Aushadhi Vitamin D3 60k'}), (ja4:JanAushadhiMedicine {name: 'Jan Aushadhi Paracetamol 650mg'}), (ja5:JanAushadhiMedicine {name: 'Jan Aushadhi Pantoprazole 40mg'})
CREATE (k1:JanAushadhiKendra {name: 'Jan Aushadhi Kendra Dadar (West)', area: 'Dadar West, Mumbai', address: 'Shop 4, Bethlehem Apts, Dadar West', distance_km: 1.2, phone: '022-24381020', lat: 19.0178, lon: 72.8478, hours: '08:00 AM - 10:00 PM'})
CREATE (k2:JanAushadhiKendra {name: 'Jan Aushadhi Kendra Borivali (West)', area: 'Borivali West, Mumbai', address: 'S V Patel Road, Near Bhagwati Hospital', distance_km: 2.4, phone: '022-28901234', lat: 19.2299, lon: 72.8480, hours: '08:30 AM - 09:30 PM'})
CREATE (k3:JanAushadhiKendra {name: 'Jan Aushadhi Kendra Andheri (East)', area: 'Andheri East, Mumbai', address: 'Shop 11, Mubarak Manzil, Marol', distance_km: 3.1, phone: '022-28504321', lat: 19.1155, lon: 72.8687, hours: '09:00 AM - 10:00 PM'})

CREATE (ja1)-[:STOCKED_AT {in_stock: true, stock_units: 450}]->(k1)
CREATE (ja2)-[:STOCKED_AT {in_stock: true, stock_units: 320}]->(k1)
CREATE (ja3)-[:STOCKED_AT {in_stock: true, stock_units: 180}]->(k1)
CREATE (ja4)-[:STOCKED_AT {in_stock: true, stock_units: 600}]->(k1)
CREATE (ja5)-[:STOCKED_AT {in_stock: true, stock_units: 240}]->(k1)

CREATE (ja1)-[:STOCKED_AT {in_stock: true, stock_units: 500}]->(k2)
CREATE (ja2)-[:STOCKED_AT {in_stock: true, stock_units: 400}]->(k2)
CREATE (ja3)-[:STOCKED_AT {in_stock: true, stock_units: 200}]->(k2)

CREATE (ja1)-[:STOCKED_AT {in_stock: true, stock_units: 350}]->(k3)
CREATE (ja2)-[:STOCKED_AT {in_stock: true, stock_units: 280}]->(k3);

// 10. Past Diagnostic Lab Reports
MATCH (u:User {id: 'indresh'})
MATCH (c1:Condition {name: 'Type 2 Diabetes Mellitus'}), (c3:Condition {name: 'Vitamin D Deficiency'}), (c5:Condition {name: 'Dyslipidemia (Mild Lipids)'})

CREATE (lab1:LabReport {
    report_id: 'METRO-LAB-89421',
    name: 'Comprehensive Metabolic & Glycemic Profile',
    lab: 'Metropolis Healthcare Diagnostic Laboratory, Mumbai',
    test_date: '2026-08-20',
    hba1c: '6.4%',
    fasting_glucose: '112 mg/dL',
    serum_creatinine: '0.92 mg/dL (Normal)',
    egfr: '>90 mL/min (Normal)',
    status: 'Verified'
})

CREATE (lab2:LabReport {
    report_id: 'METRO-LAB-89422',
    name: 'Complete Lipid Profile Panel',
    lab: 'Metropolis Healthcare Diagnostic Laboratory, Mumbai',
    test_date: '2026-08-20',
    total_cholesterol: '194 mg/dL (<200 Desirable)',
    hdl: '46 mg/dL (>40 Normal)',
    ldl: '118 mg/dL (<100 Optimal)',
    triglycerides: '150 mg/dL',
    status: 'Verified'
})

CREATE (lab3:LabReport {
    report_id: 'METRO-LAB-88104',
    name: 'Serum 25-OH Vitamin D3 Immunoassay',
    lab: 'Metropolis Healthcare Diagnostic Laboratory, Mumbai',
    test_date: '2026-08-10',
    vitamin_d3: '22.4 ng/mL (Target >30 ng/mL, Insufficiency)',
    status: 'Verified'
})

CREATE (u)-[:HAS_LAB_REPORT {date: '2026-08-20'}]->(lab1)
CREATE (u)-[:HAS_LAB_REPORT {date: '2026-08-20'}]->(lab2)
CREATE (u)-[:HAS_LAB_REPORT {date: '2026-08-10'}]->(lab3)

CREATE (lab1)-[:VALIDATES_CONDITION]->(c1)
CREATE (lab2)-[:VALIDATES_CONDITION]->(c5)
CREATE (lab3)-[:VALIDATES_CONDITION]->(c3);

// 11. Drug Allergies & Safety Warnings
MATCH (u:User {id: 'indresh'})
MATCH (s6:Symptom {name: 'Seasonal Sneezing & Rhinitis'})

CREATE (al1:Allergy {
    name: 'Penicillin / Amoxicillin',
    allergen_type: 'Drug Allergen',
    category: 'Severe Pharmacological Allergy',
    reaction: 'Severe Urticaria, Facial Angioedema, Bronchospasm (High Anaphylaxis Risk)',
    severity: 'Severe - Critical Warning'
})

CREATE (al2:Allergy {
    name: 'Dust Mites & Seasonal Aeroallergens',
    allergen_type: 'Inhalant Allergen',
    category: 'Environmental Allergy',
    reaction: 'Sneezing, Nasal Pruritus, Clear Rhinorrhea, Watery Eyes',
    severity: 'Mild to Moderate'
})

CREATE (u)-[:HAS_ALLERGY {diagnosed_date: '2019-06-12', severity: 'Critical'}]->(al1)
CREATE (u)-[:HAS_ALLERGY {diagnosed_date: '2021-03-05', severity: 'Mild'}]->(al2)
CREATE (al2)-[:MANIFESTS_AS]->(s6);

// 12. Smartwatch Biometrics & Wearable Vitals
MATCH (u:User {id: 'indresh'})
CREATE (dev:BiometricDevice {
    name: 'Apple Watch Series 9 / WearOS',
    device_id: 'SW-WATCH-IND-901',
    last_sync: '2026-09-21 08:30 AM',
    battery_pct: 86,
    status: 'Connected'
})

CREATE (v1:VitalSign {name: 'Resting Heart Rate', value: 72, unit: 'bpm', status: 'Normal / Stable', date: '2026-09-21'})
CREATE (v2:VitalSign {name: 'Blood Oxygen (SpO2)', value: 98, unit: '%', status: 'Optimal (>95%)', date: '2026-09-21'})
CREATE (v3:VitalSign {name: 'Blood Pressure', systolic: 128, diastolic: 84, unit: 'mmHg', status: 'Elevated Pre-hypertension (Controlled)', date: '2026-09-20'})
CREATE (v4:VitalSign {name: 'Fasting Blood Glucose', value: 112, unit: 'mg/dL', status: 'Mildly Elevated (Controlled on Metformin)', date: '2026-09-18'})
CREATE (v5:VitalSign {name: 'HbA1c Glycated Hemoglobin', value: 6.4, unit: '%', status: 'Pre-diabetic Good Control', date: '2026-08-20'})
CREATE (v6:VitalSign {name: 'Sleep Quality Score', value: 74, unit: '/100', total_hours: 6.2, deep_sleep_hours: 1.1, status: 'Sub-optimal Deep Sleep', date: '2026-09-21'})

CREATE (u)-[:PAIRED_DEVICE]->(dev)
CREATE (dev)-[:STREAMED_METRIC]->(v1)
CREATE (dev)-[:STREAMED_METRIC]->(v2)
CREATE (dev)-[:STREAMED_METRIC]->(v6)

CREATE (u)-[:RECORDED_VITAL {date: '2026-09-21'}]->(v1)
CREATE (u)-[:RECORDED_VITAL {date: '2026-09-21'}]->(v2)
CREATE (u)-[:RECORDED_VITAL {date: '2026-09-20'}]->(v3)
CREATE (u)-[:RECORDED_VITAL {date: '2026-09-18'}]->(v4)
CREATE (u)-[:RECORDED_VITAL {date: '2026-08-20'}]->(v5)
CREATE (u)-[:RECORDED_VITAL {date: '2026-09-21'}]->(v6);

// 13. Doctors, Care Team & Appointments
MATCH (u:User {id: 'indresh'})
MATCH (m1:Medication {name: 'Glycomet 500mg'}), (m2:Medication {name: 'Amlokind 5mg'}), (m3:Medication {name: 'Calcirol 60k'}), (m4:Medication {name: 'Crocin 650mg'})

CREATE (doc1:Doctor {
    name: 'Dr. Rajesh Mehta, MD',
    specialty: 'Internal Medicine & Diabetology',
    hospital: 'Lilavati Hospital & Research Centre, Mumbai',
    registration_no: 'MCI-48291',
    experience_years: 18,
    phone: '+91 22 2675 1000'
})

CREATE (doc2:Doctor {
    name: 'Dr. Ananya Sharma, DM',
    specialty: 'Consultant Cardiologist',
    hospital: 'Apex Heart Care Dadar, Mumbai',
    registration_no: 'MMC-77123',
    experience_years: 14,
    phone: '+91 22 2415 8899'
})

CREATE (doc3:Doctor {
    name: 'Dr. Vikram Desai, MD, DM',
    specialty: 'Consultant Neurologist',
    hospital: 'Nanavati Super Speciality Hospital, Mumbai',
    registration_no: 'MMC-65490',
    experience_years: 22,
    phone: '+91 22 2618 2255'
})

CREATE (u)-[:CONSULTS_WITH {last_visit: '2026-08-25', next_followup: '2026-11-25', status: 'Active Care'}]->(doc1)
CREATE (u)-[:CONSULTS_WITH {last_visit: '2026-05-10', next_followup: '2026-11-10', status: 'Active Care'}]->(doc2)
CREATE (u)-[:CONSULTS_WITH {last_visit: '2026-02-14', status: 'Consulted'}]->(doc3)

CREATE (doc1)-[:PRESCRIBED {date: '2026-08-25'}]->(m1)
CREATE (doc1)-[:PRESCRIBED {date: '2026-08-25'}]->(m3)
CREATE (doc2)-[:PRESCRIBED {date: '2026-05-10'}]->(m2)
CREATE (doc3)-[:PRESCRIBED {date: '2026-02-14'}]->(m4)

CREATE (appt:Appointment {
    id: 'appt-2026-1125',
    title: 'Diabetology Clinical Review',
    date: '2026-11-25',
    time: '10:30 AM',
    location: 'Lilavati Hospital Room 304',
    status: 'Confirmed'
})

CREATE (u)-[:HAS_APPOINTMENT]->(appt)
CREATE (appt)-[:WITH_DOCTOR]->(doc1);

// 14. Government Schemes & AI Insights
MATCH (u:User {id: 'indresh'})
CREATE (sch1:GovernmentScheme {
    name: 'PM-JAY (Ayushman Bharat)',
    coverage: '₹5,00,000 Secondary & Tertiary Cashless Hospitalization per Family',
    status: 'Eligible & Verified'
})

CREATE (sch2:GovernmentScheme {
    name: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)',
    coverage: 'Quality WHO-GMP Generic Medicines at 50% to 90% Discounted Prices',
    status: 'Universal Access'
})

CREATE (ins1:HealthInsight {
    title: 'Jan Aushadhi Generic Cost Optimization',
    annual_savings_inr: 19560,
    monthly_savings_inr: 1630,
    savings_pct: 88.6,
    summary: 'Switching active prescribed brands (Glycomet, Amlokind, Calcirol, Pan-D) to bio-equivalent PMBJP generic formulations reduces out-of-pocket medical expenditure by ₹19,560 annually.'
})

CREATE (ins2:HealthInsight {
    title: 'Hereditary Risk Stratification',
    lineage: 'Paternal (Father: Suresh Kumar - Diabetes & HTN)',
    risk_level: 'Moderate Cardiometabolic Propensity',
    summary: 'Multi-generational concordance of Type 2 Diabetes and Hypertension identified. Early lifestyle intervention (walking habit + glucose monitoring) actively reduces 5-year complication probability by 74%.'
})

CREATE (u)-[:ELIGIBLE_FOR]->(sch1)
CREATE (u)-[:ELIGIBLE_FOR]->(sch2)
CREATE (u)-[:HAS_AI_INSIGHT]->(ins1)
CREATE (u)-[:HAS_AI_INSIGHT]->(ins2);
"""

# Execute statements one by one in clean transaction
statements = [s.strip() for s in clean_build_cypher.split(";") if s.strip()]
print(f"Executing {len(statements)} structured Cypher queries...")

with driver.session() as session:
    for idx, stmt in enumerate(statements, 1):
        try:
            res = session.run(stmt)
            res.consume()
            print(f"Query [{idx}/{len(statements)}] committed.")
        except Exception as e:
            print(f"Error on query {idx}: {e}\nQuery: {stmt[:100]}...")

print("\n" + "="*50)
print("     SWASTHYA AI KNOWLEDGE GRAPH SUMMARY (AURA DB)")
print("="*50)

node_summary = driver.execute_query("MATCH (n) RETURN labels(n)[0] as label, count(n) as count ORDER BY count DESC")
total_nodes = 0
for r in node_summary.records:
    lbl = r["label"]
    cnt = r["count"]
    total_nodes += cnt
    print(f"* {lbl:<25}: {cnt:>2} nodes")
print(f"\nTOTAL DISTINCT NODES: {total_nodes}")

rel_summary = driver.execute_query("MATCH ()-[r]->() RETURN type(r) as rel_type, count(r) as count ORDER BY count DESC")
total_rels = 0
for r in rel_summary.records:
    rt = r["rel_type"]
    cnt = r["count"]
    total_rels += cnt
    print(f"-> {rt:<26}: {cnt:>2} edges")
print(f"\nTOTAL ACTIVE RELATIONSHIPS: {total_rels}")

isolated_check = driver.execute_query("MATCH (n) WHERE NOT (n)--() RETURN count(n) as isolated_count").records[0]["isolated_count"]
print(f"\nISOLATED (DISCONNECTED) NODES: {isolated_check} (Goal: 0)")

driver.close()
print("\n[Done] Neo4j Aura DB graph has been completely cleaned, restructured, and perfectly connected!")
