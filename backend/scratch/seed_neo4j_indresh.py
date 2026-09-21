import os
import neo4j
from dotenv import load_dotenv

# Load backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

uri = os.getenv("NEO4J_URI", "neo4j+s://63ba98a5.databases.neo4j.io")
user = os.getenv("NEO4J_USERNAME", "63ba98a5")
pwd = os.getenv("NEO4J_PASSWORD", "_Nxv6nFNRYmYWwGBTNZa-iT5MvRfVLM4BK6pm6sytIA")

print(f"Connecting to Neo4j at {uri} with user {user}...")
driver = neo4j.GraphDatabase.driver(uri, auth=(user, pwd))

cypher_statements = [
    # 1. Clean previous records to prevent duplicates and maintain referential integrity
    """
    MATCH (n)
    WHERE (n:User AND n.id IN ['indresh', 'patient-123', 'indresh_suresh', 'fam_suresh_father', 'fam_sunita_mother', 'fam_priya_sister', 'fam_ramesh_uncle'])
       OR (n:FamilyGroup AND n.id IN ['fam_indresh_cohort', 'fam_indresh_1'])
       OR n:BiometricDevice OR n:BodyZone OR n:AIPrediction OR n:HealthInsight OR n:GovernmentScheme OR n:Appointment OR n:LabReport
    DETACH DELETE n
    """,

    # 2. Primary Patient Node (Indresh Suresh) & Alias (patient-123)
    """
    CREATE (indresh:User {
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
        created_at: datetime('2024-01-01T09:00:00Z'),
        updated_at: datetime()
    })
    CREATE (p123:User {
        id: 'patient-123',
        name: 'Indresh Suresh',
        age: 24,
        gender: 'Male',
        blood_group: 'B+',
        email: 'indresh@swasthya.ai',
        phone: '+91 9876543210',
        city: 'Mumbai',
        created_at: datetime('2024-01-01T09:00:00Z'),
        updated_at: datetime()
    })
    """,

    # 3. Family Health Tree Nodes
    """
    CREATE (father:User {
        id: 'fam_suresh_father',
        name: 'Suresh Kumar',
        age: 56,
        gender: 'Male',
        relation: 'Father',
        city: 'Mumbai',
        blood_group: 'B+'
    })
    CREATE (mother:User {
        id: 'fam_sunita_mother',
        name: 'Sunita Suresh',
        age: 52,
        gender: 'Female',
        relation: 'Mother',
        city: 'Mumbai',
        blood_group: 'O+'
    })
    CREATE (sister:User {
        id: 'fam_priya_sister',
        name: 'Priya Suresh',
        age: 21,
        gender: 'Female',
        relation: 'Sister',
        city: 'Mumbai',
        blood_group: 'B+'
    })
    CREATE (uncle:User {
        id: 'fam_ramesh_uncle',
        name: 'Ramesh Kumar',
        age: 59,
        gender: 'Male',
        relation: 'Paternal Uncle',
        city: 'Mumbai',
        blood_group: 'A+'
    })
    CREATE (famGroup:FamilyGroup {
        id: 'fam_indresh_cohort',
        name: 'Suresh Family Health Cohort',
        created_by: 'indresh',
        created_at: datetime()
    })
    """,

    # 4. Family Relationships & Biological Connections
    """
    MATCH (indresh:User {id: 'indresh'}), (father:User {id: 'fam_suresh_father'}), (mother:User {id: 'fam_sunita_mother'}), (sister:User {id: 'fam_priya_sister'}), (uncle:User {id: 'fam_ramesh_uncle'}), (famGroup:FamilyGroup {id: 'fam_indresh_cohort'})
    CREATE (famGroup)-[:CONTAINS {relation: 'Self', is_admin: true}]->(indresh)
    CREATE (famGroup)-[:CONTAINS {relation: 'Father'}]->(father)
    CREATE (famGroup)-[:CONTAINS {relation: 'Mother'}]->(mother)
    CREATE (famGroup)-[:CONTAINS {relation: 'Sister'}]->(sister)
    CREATE (famGroup)-[:CONTAINS {relation: 'Paternal Uncle'}]->(uncle)
    CREATE (indresh)-[:FAMILY_MEMBER {relation: 'Father', genetic_similarity_pct: 50}]->(father)
    CREATE (father)-[:FAMILY_MEMBER {relation: 'Son'}]->(indresh)
    CREATE (indresh)-[:FAMILY_MEMBER {relation: 'Mother', genetic_similarity_pct: 50}]->(mother)
    CREATE (mother)-[:FAMILY_MEMBER {relation: 'Son'}]->(indresh)
    CREATE (indresh)-[:FAMILY_MEMBER {relation: 'Sister', genetic_similarity_pct: 50}]->(sister)
    CREATE (sister)-[:FAMILY_MEMBER {relation: 'Brother'}]->(indresh)
    CREATE (father)-[:FAMILY_MEMBER {relation: 'Brother'}]->(uncle)
    """,

    # 5. Conditions & Clinical Diagnoses
    """
    MERGE (c_diabetes:Condition {name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', category: 'Endocrine', risk_tier: 'Moderate', organ_affected: 'Pancreas'})
    MERGE (c_htn:Condition {name: 'Primary Hypertension', icd10: 'I10', category: 'Cardiovascular', risk_tier: 'Mild', organ_affected: 'Cardiovascular System'})
    MERGE (c_vitd:Condition {name: 'Vitamin D Deficiency', icd10: 'E55.9', category: 'Nutritional', risk_tier: 'Mild', organ_affected: 'Skeletal / Musculoskeletal'})
    MERGE (c_migraine:Condition {name: 'Migraine / Tension Headache', icd10: 'G43.9', category: 'Neurological', risk_tier: 'Intermittent', organ_affected: 'Central Nervous System'})
    MERGE (c_dyslipidemia:Condition {name: 'Dyslipidemia / Borderline Lipids', icd10: 'E78.0', category: 'Metabolic', risk_tier: 'Monitoring', organ_affected: 'Vascular'})
    MERGE (c_spondylosis:Condition {name: 'Lumbar Strain / Postural Spondylosis', icd10: 'M47.8', category: 'Musculoskeletal', risk_tier: 'Mild', organ_affected: 'Spine'})

    MERGE (d_diabetes:Disease {name: 'Type 2 Diabetes', chronic: true})
    MERGE (d_htn:Disease {name: 'Hypertension', chronic: true})
    MERGE (d_migraine:Disease {name: 'Migraine', chronic: false})
    MERGE (d_cad:Disease {name: 'Coronary Artery Disease', chronic: true})
    MERGE (d_hypothyroid:Disease {name: 'Hypothyroidism', chronic: true})
    """
    ,
    # 6. Link Conditions to Indresh & Family Members (Genetics & Predisposition)
    """
    MATCH (indresh:User {id: 'indresh'}), (p123:User {id: 'patient-123'}), (father:User {id: 'fam_suresh_father'}), (mother:User {id: 'fam_sunita_mother'}), (sister:User {id: 'fam_priya_sister'}), (uncle:User {id: 'fam_ramesh_uncle'})
    MATCH (c_diabetes:Condition {name: 'Type 2 Diabetes Mellitus'}), (c_htn:Condition {name: 'Primary Hypertension'}), (c_vitd:Condition {name: 'Vitamin D Deficiency'}), (c_migraine:Condition {name: 'Migraine / Tension Headache'}), (c_dyslipidemia:Condition {name: 'Dyslipidemia / Borderline Lipids'}), (c_spondylosis:Condition {name: 'Lumbar Strain / Postural Spondylosis'})
    MATCH (d_diabetes:Disease {name: 'Type 2 Diabetes'}), (d_htn:Disease {name: 'Hypertension'}), (d_migraine:Disease {name: 'Migraine'}), (d_cad:Disease {name: 'Coronary Artery Disease'}), (d_hypothyroid:Disease {name: 'Hypothyroidism'})

    CREATE (indresh)-[:HAS_CONDITION {status: 'active', severity: 'moderate', diagnosed_date: '2023-04-15', stage: 'Early Stage / Controlled'}]->(c_diabetes)
    CREATE (indresh)-[:HAS_CONDITION {status: 'active', severity: 'mild', diagnosed_date: '2023-11-20', stage: 'Stage 1 Essential'}]->(c_htn)
    CREATE (indresh)-[:HAS_CONDITION {status: 'monitoring', severity: 'mild', diagnosed_date: '2024-01-10'}]->(c_vitd)
    CREATE (indresh)-[:HAS_CONDITION {status: 'intermittent', severity: 'moderate', diagnosed_date: '2024-02-12'}]->(c_migraine)
    CREATE (indresh)-[:HAS_CONDITION {status: 'monitoring', severity: 'mild', diagnosed_date: '2024-03-05'}]->(c_dyslipidemia)
    CREATE (indresh)-[:HAS_CONDITION {status: 'active', severity: 'mild', diagnosed_date: '2024-05-18'}]->(c_spondylosis)

    CREATE (indresh)-[:HAS_DISEASE {diagnosed_at: '2023-04-15'}]->(d_diabetes)
    CREATE (indresh)-[:HAS_DISEASE {diagnosed_at: '2023-11-20'}]->(d_htn)
    CREATE (indresh)-[:HAS_DISEASE {diagnosed_at: '2024-02-12'}]->(d_migraine)

    CREATE (p123)-[:HAS_CONDITION {status: 'active', severity: 'moderate', diagnosed_date: '2023-04-15'}]->(c_diabetes)
    CREATE (p123)-[:HAS_CONDITION {status: 'active', severity: 'mild', diagnosed_date: '2023-11-20'}]->(c_htn)

    // Hereditary overlap across Suresh Family
    CREATE (father)-[:HAS_CONDITION {status: 'active', severity: 'moderate', diagnosed_date: '2015-06-10'}]->(c_diabetes)
    CREATE (father)-[:HAS_CONDITION {status: 'active', severity: 'moderate', diagnosed_date: '2012-03-01'}]->(c_htn)
    CREATE (father)-[:HAS_DISEASE {diagnosed_at: '2015-06-10'}]->(d_diabetes)
    CREATE (father)-[:HAS_DISEASE {diagnosed_at: '2012-03-01'}]->(d_htn)

    CREATE (mother)-[:HAS_CONDITION {status: 'active', severity: 'mild', diagnosed_date: '2018-09-12'}]->(c_htn)
    CREATE (mother)-[:HAS_DISEASE {diagnosed_at: '2019-02-20'}]->(d_hypothyroid)

    CREATE (sister)-[:HAS_CONDITION {status: 'intermittent', severity: 'mild', diagnosed_date: '2024-04-11'}]->(c_migraine)
    CREATE (uncle)-[:HAS_DISEASE {diagnosed_at: '2017-08-14'}]->(d_cad)
    CREATE (uncle)-[:HAS_CONDITION {status: 'active', severity: 'high', diagnosed_date: '2017-08-14'}]->(c_htn)
    """,

    # 7. Symptoms & Anatomical Body Heatmap Zones
    """
    MERGE (zone_head:BodyZone {name: 'Cranial & Neurological Zone', organ: 'Brain & Cranial Nerves', body_region: 'Head', color_code: '#F59E0B'})
    MERGE (zone_chest:BodyZone {name: 'Cardiovascular Zone', organ: 'Heart & Blood Vessels', body_region: 'Chest', color_code: '#EF4444'})
    MERGE (zone_pancreas:BodyZone {name: 'Endocrine Zone', organ: 'Pancreas & Liver', body_region: 'Abdomen', color_code: '#8B5CF6'})
    MERGE (zone_spine:BodyZone {name: 'Lumbar Spine Zone', organ: 'Lumbar Vertebrae & Paraspinal Muscles', body_region: 'Lower Back', color_code: '#3B82F6'})
    MERGE (zone_eyes:BodyZone {name: 'Ophthalmic Visual Zone', organ: 'Eyes & Optic Nerve', body_region: 'Face', color_code: '#06B6D4'})
    MERGE (zone_gi:BodyZone {name: 'Gastrointestinal Zone', organ: 'Stomach & Esophagus', body_region: 'Upper Abdomen', color_code: '#10B981'})
    MERGE (zone_resp:BodyZone {name: 'Upper Respiratory Zone', organ: 'Nasal Cavity & Pharynx', body_region: 'Nose & Throat', color_code: '#EC4899'})

    MERGE (sym_fatigue:Symptom {name: 'Morning Fatigue', category: 'General / Constitutional', organ_system: 'Constitutional', severity_scale: '1-10'})
    MERGE (sym_dizzy:Symptom {name: 'Post-prandial Dizziness', category: 'Neurological / Metabolic', organ_system: 'Cardiovascular', severity_scale: '1-10'})
    MERGE (sym_headache:Symptom {name: 'Occipital Tension Headache', category: 'Neurological', organ_system: 'Central Nervous System', severity_scale: '1-10'})
    MERGE (sym_back:Symptom {name: 'Lower Back Stiffness', category: 'Musculoskeletal', organ_system: 'Spine', severity_scale: '1-10'})
    MERGE (sym_eyestrain:Symptom {name: 'Digital Eye Strain & Dry Eyes', category: 'Ophthalmic', organ_system: 'Visual', severity_scale: '1-10'})
    MERGE (sym_reflux:Symptom {name: 'Acid Reflux & Heartburn', category: 'Gastrointestinal', organ_system: 'Digestive', severity_scale: '1-10'})
    MERGE (sym_rhinitis:Symptom {name: 'Seasonal Sneezing & Nasal Congestion', category: 'Respiratory', organ_system: 'Upper Respiratory', severity_scale: '1-10'})
    MERGE (sym_sleep_awake:Symptom {name: 'Mid-night Awakenings', category: 'Sleep Pathology', organ_system: 'Circadian', severity_scale: '1-10'})
    """,

    # 8. Connect Symptoms to Indresh and Body Zones
    """
    MATCH (indresh:User {id: 'indresh'}), (sister:User {id: 'fam_priya_sister'}), (mother:User {id: 'fam_sunita_mother'})
    MATCH (zone_head:BodyZone {name: 'Cranial & Neurological Zone'}), (zone_chest:BodyZone {name: 'Cardiovascular Zone'}), (zone_pancreas:BodyZone {name: 'Endocrine Zone'}), (zone_spine:BodyZone {name: 'Lumbar Spine Zone'}), (zone_eyes:BodyZone {name: 'Ophthalmic Visual Zone'}), (zone_gi:BodyZone {name: 'Gastrointestinal Zone'}), (zone_resp:BodyZone {name: 'Upper Respiratory Zone'})
    MATCH (sym_fatigue:Symptom {name: 'Morning Fatigue'}), (sym_dizzy:Symptom {name: 'Post-prandial Dizziness'}), (sym_headache:Symptom {name: 'Occipital Tension Headache'}), (sym_back:Symptom {name: 'Lower Back Stiffness'}), (sym_eyestrain:Symptom {name: 'Digital Eye Strain & Dry Eyes'}), (sym_reflux:Symptom {name: 'Acid Reflux & Heartburn'}), (sym_rhinitis:Symptom {name: 'Seasonal Sneezing & Nasal Congestion'}), (sym_sleep_awake:Symptom {name: 'Mid-night Awakenings'})

    CREATE (indresh)-[:HAS_SYMPTOM {
        severity: 6,
        since: '2026-09-01',
        last_reported: '2026-09-20',
        status: 'active',
        duration: '2-3 weeks',
        frequency: 'Daily on waking',
        triggers: ['Late night screen time', 'Sleep deficit', 'High cognitive workload'],
        relieved_by: ['Hydration', '7 hours continuous sleep']
    }]->(sym_fatigue)

    CREATE (indresh)-[:HAS_SYMPTOM {
        severity: 5,
        since: '2026-09-10',
        last_reported: '2026-09-20',
        status: 'active',
        duration: '1 week',
        frequency: '30-45 mins post lunch',
        triggers: ['High glycemic meal', 'Skipping morning breakfast'],
        relieved_by: ['Metformin compliance', '10 min walk', 'Electrolyte water']
    }]->(sym_dizzy)

    CREATE (indresh)-[:HAS_SYMPTOM {
        severity: 7,
        since: '2026-09-15',
        last_reported: '2026-09-21',
        status: 'active',
        duration: '3 days',
        frequency: 'Afternoon / Evening',
        triggers: ['Sprint deadline stress', 'Caffeine withdrawal', 'Prolonged monitor exposure'],
        relieved_by: ['Paracetamol 650mg', 'Rest in dark room']
    }]->(sym_headache)

    CREATE (indresh)-[:HAS_SYMPTOM {
        severity: 4,
        since: '2026-08-15',
        last_reported: '2026-09-18',
        status: 'active',
        duration: '1 month',
        frequency: 'Late evening after 6+ hours desk work',
        triggers: ['Prolonged desk sitting', 'Slouched posture'],
        relieved_by: ['Lumbar stretching', 'Ergonomic lumbar support', 'Walking']
    }]->(sym_back)

    CREATE (indresh)-[:HAS_SYMPTOM {
        severity: 5,
        since: '2026-09-05',
        last_reported: '2026-09-19',
        status: 'active',
        duration: '2 weeks',
        triggers: ['9+ hours code review monitor exposure'],
        relieved_by: ['20-20-20 rule', 'Lubricating eye drops']
    }]->(sym_eyestrain)

    CREATE (indresh)-[:HAS_SYMPTOM {
        severity: 4,
        since: '2026-09-08',
        last_reported: '2026-09-19',
        status: 'active',
        duration: '10 days',
        triggers: ['Late night heavy dinner (10:30 PM)', 'Spicy street food'],
        relieved_by: ['Pantoprazole 40mg', 'Warm water']
    }]->(sym_reflux)

    CREATE (indresh)-[:HAS_SYMPTOM {
        severity: 5,
        since: '2026-09-14',
        last_reported: '2026-09-21',
        status: 'active',
        duration: '1 week',
        triggers: ['Dusty air / seasonal pollen change'],
        relieved_by: ['Steam inhalation', 'Montelukast-Levocetirizine']
    }]->(sym_rhinitis)

    CREATE (indresh)-[:HAS_SYMPTOM {
        severity: 6,
        since: '2026-09-02',
        last_reported: '2026-09-20',
        status: 'active',
        triggers: ['Late night blue light', 'Caffeine after 6 PM'],
        relieved_by: ['Magnesium supplement', 'Chamomile tea']
    }]->(sym_sleep_awake)

    // Zone correlations
    CREATE (sym_headache)-[:LOCATED_IN_ZONE]->(zone_head)
    CREATE (sym_eyestrain)-[:LOCATED_IN_ZONE]->(zone_eyes)
    CREATE (sym_dizzy)-[:LOCATED_IN_ZONE]->(zone_head)
    CREATE (sym_back)-[:LOCATED_IN_ZONE]->(zone_spine)
    CREATE (sym_reflux)-[:LOCATED_IN_ZONE]->(zone_gi)
    CREATE (sym_rhinitis)-[:LOCATED_IN_ZONE]->(zone_resp)

    // Household Contagion overlap (Sister & Mother symptoms)
    CREATE (sister)-[:HAS_SYMPTOM {severity: 6, since: '2026-09-16', last_reported: '2026-09-21', status: 'active'}]->(sym_headache)
    CREATE (sister)-[:HAS_SYMPTOM {severity: 6, since: '2026-09-14', last_reported: '2026-09-21', status: 'active'}]->(sym_rhinitis)
    CREATE (mother)-[:HAS_SYMPTOM {severity: 5, since: '2026-09-14', last_reported: '2026-09-20', status: 'active'}]->(sym_fatigue)
    """,

    # 9. Lifestyle Habits & Minute Behavioral Details
    """
    CREATE (f_desk:HealthFact {id: 'fact-desk-1', text: 'Works 9.5+ hours daily at software development desk with dual high-brightness monitors', category: 'routine', frequency: 'daily', impact_level: 'High', date: '2026-09-10'})
    CREATE (f_sleep:HealthFact {id: 'fact-sleep-2', text: 'Sleep duration oscillates between 5.5 to 6.5 hours on weekdays with delayed sleep latency of 38 minutes', category: 'sleep', frequency: 'daily', impact_level: 'High', date: '2026-09-12'})
    CREATE (f_diet_skip:HealthFact {id: 'fact-diet-3', text: 'Skips morning breakfast 3-4 days a week during sprint delivery and release cycles', category: 'diet', frequency: 'recurring', impact_level: 'High', date: '2026-09-14'})
    CREATE (f_caffeine:HealthFact {id: 'fact-caffeine-4', text: 'Consumes 3-4 cups of strong Indian milk tea and Americano espresso across the workday', category: 'diet', frequency: 'daily', impact_level: 'Moderate', date: '2026-09-15'})
    CREATE (f_walk:HealthFact {id: 'fact-walk-5', text: 'Maintains brisk evening walk for 30 minutes (3.2 km) 4-5 days a week', category: 'exercise', frequency: 'weekly', impact_level: 'Positive', date: '2026-09-18'})
    CREATE (f_stress:HealthFact {id: 'fact-stress-6', text: 'Reports elevated acute cognitive stress during weekly sprint deliverables and architecture milestones', category: 'stress', frequency: 'recurring', impact_level: 'High', date: '2026-09-19'})
    CREATE (f_hydration:HealthFact {id: 'fact-hydration-7', text: 'Daily water intake averages 1.8 liters, failing the recommended 3.0 liter metabolic hydration goal', category: 'diet', frequency: 'daily', impact_level: 'Moderate', date: '2026-09-19'})
    CREATE (f_late_dinner:HealthFact {id: 'fact-dinner-8', text: 'Consistently consumes late dinners between 10:15 PM and 10:45 PM prior to sleeping at 12:30 AM', category: 'diet', frequency: 'daily', impact_level: 'Moderate', date: '2026-09-19'})
    CREATE (f_posture:HealthFact {id: 'fact-posture-9', text: 'Continuous sitting periods exceeding 120 minutes without ergonomic stretch breaks', category: 'routine', frequency: 'daily', impact_level: 'High', date: '2026-09-18'})
    """,

    # 10. Link Lifestyle Facts to Indresh and Map as Symptom Triggers
    """
    MATCH (indresh:User {id: 'indresh'})
    MATCH (f_desk:HealthFact {id: 'fact-desk-1'}), (f_sleep:HealthFact {id: 'fact-sleep-2'}), (f_diet_skip:HealthFact {id: 'fact-diet-3'}), (f_caffeine:HealthFact {id: 'fact-caffeine-4'}), (f_walk:HealthFact {id: 'fact-walk-5'}), (f_stress:HealthFact {id: 'fact-stress-6'}), (f_hydration:HealthFact {id: 'fact-hydration-7'}), (f_late_dinner:HealthFact {id: 'fact-dinner-8'}), (f_posture:HealthFact {id: 'fact-posture-9'})
    MATCH (sym_fatigue:Symptom {name: 'Morning Fatigue'}), (sym_dizzy:Symptom {name: 'Post-prandial Dizziness'}), (sym_headache:Symptom {name: 'Occipital Tension Headache'}), (sym_back:Symptom {name: 'Lower Back Stiffness'}), (sym_eyestrain:Symptom {name: 'Digital Eye Strain & Dry Eyes'}), (sym_reflux:Symptom {name: 'Acid Reflux & Heartburn'}), (sym_sleep_awake:Symptom {name: 'Mid-night Awakenings'})

    CREATE (indresh)-[:HAS_FACT {date: '2026-09-10'}]->(f_desk)
    CREATE (indresh)-[:HAS_FACT {date: '2026-09-12'}]->(f_sleep)
    CREATE (indresh)-[:HAS_FACT {date: '2026-09-14'}]->(f_diet_skip)
    CREATE (indresh)-[:HAS_FACT {date: '2026-09-15'}]->(f_caffeine)
    CREATE (indresh)-[:HAS_FACT {date: '2026-09-18'}]->(f_walk)
    CREATE (indresh)-[:HAS_FACT {date: '2026-09-19'}]->(f_stress)
    CREATE (indresh)-[:HAS_FACT {date: '2026-09-19'}]->(f_hydration)
    CREATE (indresh)-[:HAS_FACT {date: '2026-09-19'}]->(f_late_dinner)
    CREATE (indresh)-[:HAS_FACT {date: '2026-09-18'}]->(f_posture)

    // Mechanistic Causality / Triggers
    CREATE (sym_headache)-[:TRIGGERED_BY {confidence: 0.92}]->(f_stress)
    CREATE (sym_headache)-[:TRIGGERED_BY {confidence: 0.88}]->(f_sleep)
    CREATE (sym_headache)-[:TRIGGERED_BY {confidence: 0.79}]->(f_caffeine)
    CREATE (sym_fatigue)-[:TRIGGERED_BY {confidence: 0.95}]->(f_sleep)
    CREATE (sym_fatigue)-[:TRIGGERED_BY {confidence: 0.75}]->(f_hydration)
    CREATE (sym_dizzy)-[:TRIGGERED_BY {confidence: 0.89}]->(f_diet_skip)
    CREATE (sym_back)-[:TRIGGERED_BY {confidence: 0.94}]->(f_posture)
    CREATE (sym_back)-[:TRIGGERED_BY {confidence: 0.85}]->(f_desk)
    CREATE (sym_eyestrain)-[:TRIGGERED_BY {confidence: 0.96}]->(f_desk)
    CREATE (sym_reflux)-[:TRIGGERED_BY {confidence: 0.91}]->(f_late_dinner)
    CREATE (sym_sleep_awake)-[:TRIGGERED_BY {confidence: 0.87}]->(f_caffeine)
    """,

    # 11. Smartwatch & Wearable Biometric Streams
    """
    CREATE (device_watch:BiometricDevice {
        device_id: 'SW-WATCH-IND-901',
        model: 'Apple Watch Series 9 / WearOS Unified',
        firmware: 'v10.4.1',
        last_sync: datetime(),
        sync_status: 'Active Real-time',
        battery_pct: 86
    })

    CREATE (vital_hr:VitalSign {
        type: 'Resting Heart Rate',
        value: 72.0,
        unit: 'bpm',
        min_recorded: 58.0,
        max_recorded: 124.0,
        status: 'Normal / Stress Spikes Detected',
        timestamp: datetime('2026-09-21T08:30:00Z'),
        date: '2026-09-21'
    })

    CREATE (vital_spo2:VitalSign {
        type: 'Blood Oxygen (SpO2)',
        value: 98.0,
        unit: '%',
        min_recorded: 95.0,
        status: 'Optimal (>95%)',
        timestamp: datetime('2026-09-21T08:30:00Z'),
        date: '2026-09-21'
    })

    CREATE (vital_bp:VitalSign {
        type: 'Blood Pressure',
        systolic: 128,
        diastolic: 84,
        unit: 'mmHg',
        status: 'Elevated Pre-hypertension (Well Controlled on Amlodipine)',
        timestamp: datetime('2026-09-20T21:00:00Z'),
        date: '2026-09-20'
    })

    CREATE (vital_fbs:VitalSign {
        type: 'Fasting Blood Glucose',
        value: 112.0,
        unit: 'mg/dL',
        target_range: '70-99 mg/dL',
        status: 'Mildly Elevated (Controlled on Metformin)',
        timestamp: datetime('2026-09-18T07:15:00Z'),
        date: '2026-09-18'
    })

    CREATE (vital_hba1c:VitalSign {
        type: 'HbA1c Glycated Hemoglobin',
        value: 6.4,
        unit: '%',
        target_range: '< 5.7% (Normal), < 7.0% (Diabetic Target)',
        status: 'Pre-diabetic / Well Maintained Glycemic Index',
        timestamp: datetime('2026-08-20T10:00:00Z'),
        date: '2026-08-20'
    })

    CREATE (vital_hrv:VitalSign {
        type: 'Heart Rate Variability (HRV)',
        value: 38.0,
        unit: 'ms',
        status: 'Sympathetic Dominance / Moderate Stress',
        timestamp: datetime('2026-09-21T06:30:00Z'),
        date: '2026-09-21'
    })

    CREATE (vital_sleep_score:VitalSign {
        type: 'Sleep Quality Index',
        score: 74,
        unit: '/100',
        total_sleep_hours: 6.2,
        deep_sleep_hours: 1.1,
        rem_sleep_hours: 1.4,
        light_sleep_hours: 3.7,
        status: 'Sub-optimal Deep Sleep Stage',
        timestamp: datetime('2026-09-21T06:30:00Z'),
        date: '2026-09-21'
    })

    CREATE (vital_steps:VitalSign {
        type: 'Daily Physical Activity',
        step_count: 6420,
        active_calories: 420,
        distance_km: 4.8,
        status: 'Moderate Activity',
        timestamp: datetime('2026-09-20T22:00:00Z'),
        date: '2026-09-20'
    })
    """,

    # 12. Connect Biometrics to Indresh and Wearable Device
    """
    MATCH (indresh:User {id: 'indresh'}), (device_watch:BiometricDevice {device_id: 'SW-WATCH-IND-901'})
    MATCH (vital_hr:VitalSign {type: 'Resting Heart Rate'}), (vital_spo2:VitalSign {type: 'Blood Oxygen (SpO2)'}), (vital_bp:VitalSign {type: 'Blood Pressure'}), (vital_fbs:VitalSign {type: 'Fasting Blood Glucose'}), (vital_hba1c:VitalSign {type: 'HbA1c Glycated Hemoglobin'}), (vital_hrv:VitalSign {type: 'Heart Rate Variability (HRV)'}), (vital_sleep_score:VitalSign {type: 'Sleep Quality Index'}), (vital_steps:VitalSign {type: 'Daily Physical Activity'})
    MATCH (zone_chest:BodyZone {name: 'Cardiovascular Zone'}), (zone_pancreas:BodyZone {name: 'Endocrine Zone'})

    CREATE (indresh)-[:PAIRED_DEVICE {paired_date: '2024-01-15'}]->(device_watch)
    CREATE (device_watch)-[:STREAMED_METRIC]->(vital_hr)
    CREATE (device_watch)-[:STREAMED_METRIC]->(vital_spo2)
    CREATE (device_watch)-[:STREAMED_METRIC]->(vital_hrv)
    CREATE (device_watch)-[:STREAMED_METRIC]->(vital_sleep_score)
    CREATE (device_watch)-[:STREAMED_METRIC]->(vital_steps)

    CREATE (indresh)-[:RECORDED_VITAL]->(vital_hr)
    CREATE (indresh)-[:RECORDED_VITAL]->(vital_spo2)
    CREATE (indresh)-[:RECORDED_VITAL]->(vital_bp)
    CREATE (indresh)-[:RECORDED_VITAL]->(vital_fbs)
    CREATE (indresh)-[:RECORDED_VITAL]->(vital_hba1c)
    CREATE (indresh)-[:RECORDED_VITAL]->(vital_hrv)
    CREATE (indresh)-[:RECORDED_VITAL]->(vital_sleep_score)
    CREATE (indresh)-[:RECORDED_VITAL]->(vital_steps)

    CREATE (vital_bp)-[:MONITORS_ORGAN]->(zone_chest)
    CREATE (vital_hr)-[:MONITORS_ORGAN]->(zone_chest)
    CREATE (vital_fbs)-[:MONITORS_ORGAN]->(zone_pancreas)
    CREATE (vital_hba1c)-[:MONITORS_ORGAN]->(zone_pancreas)
    """,

    # 13. Medications & Branded Prescriptions
    """
    MERGE (med_glycomet:Medication {name: 'Glycomet 500mg', generic_name: 'Metformin HCl 500mg', form: 'Tablet', dosage: '500mg', frequency: 'Twice daily after meals', category: 'Antidiabetic / Biguanide', rx_class: 'Prescription Only', side_effects: 'Mild GI upset, Dizziness if meal skipped'})
    MERGE (med_amlokind:Medication {name: 'Amlokind 5mg', generic_name: 'Amlodipine Besylate 5mg', form: 'Tablet', dosage: '5mg', frequency: 'Once daily at bedtime', category: 'Antihypertensive / CCB', rx_class: 'Prescription Only', side_effects: 'Peripheral edema, Flushing'})
    MERGE (med_calcirol:Medication {name: 'Calcirol 60k', generic_name: 'Cholecalciferol Vitamin D3', form: 'Sachet/Capsule', dosage: '60000 IU', frequency: 'Once weekly with warm milk', category: 'Supplement / Vitamin', rx_class: 'OTC / Prescription', side_effects: 'None detected'})
    MERGE (med_crocin:Medication {name: 'Crocin 650mg', generic_name: 'Paracetamol 650mg', form: 'Tablet', dosage: '650mg', frequency: 'SOS (As needed for acute headache)', category: 'Analgesic / Antipyretic', rx_class: 'OTC', side_effects: 'Hepatotoxicity if overused'})
    MERGE (med_pand:Medication {name: 'Pan-D', generic_name: 'Pantoprazole 40mg + Domperidone 30mg', form: 'Capsule', dosage: '40mg/30mg', frequency: 'Once daily before breakfast', category: 'Antacid / PPI', rx_class: 'Prescription Only', side_effects: 'Dry mouth, Headache'})
    MERGE (med_montair:Medication {name: 'Montair-LC', generic_name: 'Montelukast 10mg + Levocetirizine 5mg', form: 'Tablet', dosage: '10mg/5mg', frequency: 'Once daily at bedtime (SOS in seasonal allergy)', category: 'Antiallergic / Antihistamine', rx_class: 'Prescription Only', side_effects: 'Mild drowsiness'})
    """,

    # 14. Jan Aushadhi Bio-Equivalent Generics (PMBJP Government Scheme)
    """
    MERGE (ja_metformin:JanAushadhiMedicine {
        name: 'Jan Aushadhi Metformin 500mg',
        generic_name: 'Metformin HCl 500mg',
        brand_equivalent: 'Glycomet 500mg',
        brand_price: 52.00,
        jan_aushadhi_price: 9.20,
        savings_percentage: 82.3,
        pack_size: '10 tablets',
        who_gmp_certified: true,
        drug_code: 'PMBJP-TAB-0142'
    })

    MERGE (ja_amlodipine:JanAushadhiMedicine {
        name: 'Jan Aushadhi Amlodipine 5mg',
        generic_name: 'Amlodipine Besylate 5mg',
        brand_equivalent: 'Amlokind 5mg',
        brand_price: 48.00,
        jan_aushadhi_price: 5.50,
        savings_percentage: 88.5,
        pack_size: '10 tablets',
        who_gmp_certified: true,
        drug_code: 'PMBJP-TAB-0089'
    })

    MERGE (ja_vitd3:JanAushadhiMedicine {
        name: 'Jan Aushadhi Vitamin D3 60k',
        generic_name: 'Cholecalciferol 60,000 IU',
        brand_equivalent: 'Calcirol 60k',
        brand_price: 65.00,
        jan_aushadhi_price: 12.00,
        savings_percentage: 81.5,
        pack_size: '4 capsules',
        who_gmp_certified: true,
        drug_code: 'PMBJP-CAP-0321'
    })

    MERGE (ja_paracetamol:JanAushadhiMedicine {
        name: 'Jan Aushadhi Paracetamol 650mg',
        generic_name: 'Paracetamol 650mg',
        brand_equivalent: 'Crocin 650mg / Dolo 650',
        brand_price: 30.00,
        jan_aushadhi_price: 4.50,
        savings_percentage: 85.0,
        pack_size: '10 tablets',
        who_gmp_certified: true,
        drug_code: 'PMBJP-TAB-0012'
    })

    MERGE (ja_pantoprazole:JanAushadhiMedicine {
        name: 'Jan Aushadhi Pantoprazole 40mg',
        generic_name: 'Pantoprazole Sodium 40mg',
        brand_equivalent: 'Pan-D / Pantocid 40',
        brand_price: 95.00,
        jan_aushadhi_price: 14.00,
        savings_percentage: 85.2,
        pack_size: '10 tablets',
        who_gmp_certified: true,
        drug_code: 'PMBJP-TAB-0205'
    })

    MERGE (ja_montelukast:JanAushadhiMedicine {
        name: 'Jan Aushadhi Montelukast + Levocetirizine',
        generic_name: 'Montelukast 10mg + Levocetirizine 5mg',
        brand_equivalent: 'Montair-LC',
        brand_price: 145.00,
        jan_aushadhi_price: 18.50,
        savings_percentage: 87.2,
        pack_size: '10 tablets',
        who_gmp_certified: true,
        drug_code: 'PMBJP-TAB-0418'
    })
    """,

    # 15. Connect Medications, Conditions & Jan Aushadhi Equivalents
    """
    MATCH (indresh:User {id: 'indresh'}), (p123:User {id: 'patient-123'})
    MATCH (med_glycomet:Medication {name: 'Glycomet 500mg'}), (med_amlokind:Medication {name: 'Amlokind 5mg'}), (med_calcirol:Medication {name: 'Calcirol 60k'}), (med_crocin:Medication {name: 'Crocin 650mg'}), (med_pand:Medication {name: 'Pan-D'}), (med_montair:Medication {name: 'Montair-LC'})
    MATCH (ja_metformin:JanAushadhiMedicine {name: 'Jan Aushadhi Metformin 500mg'}), (ja_amlodipine:JanAushadhiMedicine {name: 'Jan Aushadhi Amlodipine 5mg'}), (ja_vitd3:JanAushadhiMedicine {name: 'Jan Aushadhi Vitamin D3 60k'}), (ja_paracetamol:JanAushadhiMedicine {name: 'Jan Aushadhi Paracetamol 650mg'}), (ja_pantoprazole:JanAushadhiMedicine {name: 'Jan Aushadhi Pantoprazole 40mg'}), (ja_montelukast:JanAushadhiMedicine {name: 'Jan Aushadhi Montelukast + Levocetirizine'})
    MATCH (c_diabetes:Condition {name: 'Type 2 Diabetes Mellitus'}), (c_htn:Condition {name: 'Primary Hypertension'}), (c_vitd:Condition {name: 'Vitamin D Deficiency'}), (c_migraine:Condition {name: 'Migraine / Tension Headache'})

    CREATE (indresh)-[:TAKES_MEDICATION {dosage: '500mg', frequency: 'Twice daily after meals', started_date: '2023-04-20', status: 'active', adherence_score: 94, timing: '08:00 AM, 08:30 PM'}]->(med_glycomet)
    CREATE (indresh)-[:TAKES_MEDICATION {dosage: '5mg', frequency: 'Once daily bedtime', started_date: '2023-11-25', status: 'active', adherence_score: 89, timing: '09:30 PM'}]->(med_amlokind)
    CREATE (indresh)-[:TAKES_MEDICATION {dosage: '60k IU', frequency: 'Weekly', started_date: '2024-01-15', status: 'active', adherence_score: 96, timing: 'Sunday 01:00 PM'}]->(med_calcirol)
    CREATE (indresh)-[:TAKES_MEDICATION {dosage: '650mg', frequency: 'SOS', started_date: '2024-02-14', status: 'as_needed', adherence_score: 100}]->(med_crocin)
    CREATE (indresh)-[:TAKES_MEDICATION {dosage: '40mg/30mg', frequency: 'Morning empty stomach (SOS)', started_date: '2024-04-10', status: 'as_needed'}]->(med_pand)
    CREATE (indresh)-[:TAKES_MEDICATION {dosage: '10mg/5mg', frequency: 'Bedtime (SOS)', started_date: '2024-09-14', status: 'as_needed'}]->(med_montair)

    CREATE (p123)-[:TAKES_MEDICATION {dosage: '500mg', frequency: 'Twice daily', started_date: '2023-04-20', status: 'active'}]->(med_glycomet)
    CREATE (p123)-[:TAKES_MEDICATION {dosage: '5mg', frequency: 'Once daily', started_date: '2023-11-25', status: 'active'}]->(med_amlokind)

    CREATE (med_glycomet)-[:TREATS]->(c_diabetes)
    CREATE (med_amlokind)-[:TREATS]->(c_htn)
    CREATE (med_calcirol)-[:TREATS]->(c_vitd)
    CREATE (med_crocin)-[:TREATS]->(c_migraine)

    CREATE (med_glycomet)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 82.3, monthly_saving_inr: 42.80}]->(ja_metformin)
    CREATE (med_amlokind)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 88.5, monthly_saving_inr: 42.50}]->(ja_amlodipine)
    CREATE (med_calcirol)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 81.5, monthly_saving_inr: 53.00}]->(ja_vitd3)
    CREATE (med_crocin)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 85.0, monthly_saving_inr: 25.50}]->(ja_paracetamol)
    CREATE (med_pand)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 85.2, monthly_saving_inr: 81.00}]->(ja_pantoprazole)
    CREATE (med_montair)-[:JAN_AUSHADHI_EQUIVALENT {savings_pct: 87.2, monthly_saving_inr: 126.50}]->(ja_montelukast)
    """,

    # 16. Jan Aushadhi Kendras (Verified Outlets) & Supply Connections
    """
    MERGE (kendra_dadar:JanAushadhiKendra {
        kendra_code: 'PMBJP-MH-0104',
        name: 'Jan Aushadhi Kendra Dadar (West)',
        area: 'Dadar (West)',
        address: 'Shop No. 4, Bethlehem Apartments, Dadar West, Mumbai 400028',
        phone: '022-24381020',
        latitude: 19.0178,
        longitude: 72.8478,
        distance_km: 1.2,
        open_hours: '08:00 AM - 10:00 PM',
        pharmacist_in_charge: 'S. K. Joshi (Reg No. 89124)'
    })

    MERGE (kendra_borivali:JanAushadhiKendra {
        kendra_code: 'PMBJP-MH-0042',
        name: 'Jan Aushadhi Kendra Borivali (West)',
        area: 'Borivali (West)',
        address: 'Shop No. 4, Bethlehem Apartments, S V Patel Road, Near Bhagwati Hospital, Borivali West, Mumbai 400092',
        phone: '022-28901234',
        latitude: 19.2299,
        longitude: 72.8480,
        distance_km: 2.4,
        open_hours: '08:30 AM - 09:30 PM',
        pharmacist_in_charge: 'V. Nair (Reg No. 76421)'
    })

    MERGE (kendra_andheri:JanAushadhiKendra {
        kendra_code: 'PMBJP-MH-0078',
        name: 'Jan Aushadhi Kendra Andheri (East)',
        area: 'Andheri (East)',
        address: 'Shop No. 11, Mubarak Manzil, Church Road, Marol, Andheri East, Mumbai 400059',
        phone: '022-28504321',
        latitude: 19.1155,
        longitude: 72.8687,
        distance_km: 3.1,
        open_hours: '09:00 AM - 10:00 PM',
        pharmacist_in_charge: 'M. Ansari (Reg No. 92100)'
    })

    MERGE (kendra_ghatkopar:JanAushadhiKendra {
        kendra_code: 'PMBJP-MH-0095',
        name: 'Jan Aushadhi Kendra Ghatkopar (West)',
        area: 'Ghatkopar (West)',
        address: 'Ghatkopar Seva Sangh, Near Chirag Nagar Police Station, LBS Marg, Mumbai 400086',
        phone: '022-25159082',
        latitude: 19.0886,
        longitude: 72.9082,
        distance_km: 4.5,
        open_hours: '08:30 AM - 09:00 PM'
    })

    MERGE (kendra_thane:JanAushadhiKendra {
        kendra_code: 'PMBJP-MH-0112',
        name: 'Jan Aushadhi Kendra Thane (West)',
        area: 'Thane (West)',
        address: 'Shop No. D/6, Siddhivinayak Co-op Society, Sawarkar Nagar, Thane West 400606',
        phone: '022-25801122',
        latitude: 19.2183,
        longitude: 72.9781,
        distance_km: 7.2,
        open_hours: '09:00 AM - 09:30 PM'
    })
    """,

    # 17. Stock Relations for Jan Aushadhi Medicines
    """
    MATCH (ja_metformin:JanAushadhiMedicine {name: 'Jan Aushadhi Metformin 500mg'}), (ja_amlodipine:JanAushadhiMedicine {name: 'Jan Aushadhi Amlodipine 5mg'}), (ja_vitd3:JanAushadhiMedicine {name: 'Jan Aushadhi Vitamin D3 60k'}), (ja_paracetamol:JanAushadhiMedicine {name: 'Jan Aushadhi Paracetamol 650mg'}), (ja_pantoprazole:JanAushadhiMedicine {name: 'Jan Aushadhi Pantoprazole 40mg'}), (ja_montelukast:JanAushadhiMedicine {name: 'Jan Aushadhi Montelukast + Levocetirizine'})
    MATCH (kendra_dadar:JanAushadhiKendra {kendra_code: 'PMBJP-MH-0104'}), (kendra_borivali:JanAushadhiKendra {kendra_code: 'PMBJP-MH-0042'}), (kendra_andheri:JanAushadhiKendra {kendra_code: 'PMBJP-MH-0078'}), (kendra_ghatkopar:JanAushadhiKendra {kendra_code: 'PMBJP-MH-0095'})

    CREATE (ja_metformin)-[:STOCKED_AT {in_stock: true, units_available: 450, batch: 'JA24-09'}]->(kendra_dadar)
    CREATE (ja_amlodipine)-[:STOCKED_AT {in_stock: true, units_available: 320, batch: 'JA24-08'}]->(kendra_dadar)
    CREATE (ja_vitd3)-[:STOCKED_AT {in_stock: true, units_available: 180, batch: 'JA24-07'}]->(kendra_dadar)
    CREATE (ja_paracetamol)-[:STOCKED_AT {in_stock: true, units_available: 600, batch: 'JA24-09'}]->(kendra_dadar)
    CREATE (ja_pantoprazole)-[:STOCKED_AT {in_stock: true, units_available: 240, batch: 'JA24-08'}]->(kendra_dadar)
    CREATE (ja_montelukast)-[:STOCKED_AT {in_stock: true, units_available: 150, batch: 'JA24-06'}]->(kendra_dadar)

    CREATE (ja_metformin)-[:STOCKED_AT {in_stock: true, units_available: 500}]->(kendra_borivali)
    CREATE (ja_amlodipine)-[:STOCKED_AT {in_stock: true, units_available: 400}]->(kendra_borivali)
    CREATE (ja_vitd3)-[:STOCKED_AT {in_stock: true, units_available: 200}]->(kendra_borivali)
    CREATE (ja_paracetamol)-[:STOCKED_AT {in_stock: true, units_available: 750}]->(kendra_borivali)

    CREATE (ja_metformin)-[:STOCKED_AT {in_stock: true, units_available: 350}]->(kendra_andheri)
    CREATE (ja_amlodipine)-[:STOCKED_AT {in_stock: true, units_available: 280}]->(kendra_andheri)
    CREATE (ja_pantoprazole)-[:STOCKED_AT {in_stock: true, units_available: 190}]->(kendra_andheri)

    CREATE (ja_paracetamol)-[:STOCKED_AT {in_stock: true, units_available: 420}]->(kendra_ghatkopar)
    """,

    # 18. Medical Doctors, Clinics & Care Team
    """
    MERGE (doc_mehta:Doctor {
        name: 'Dr. Rajesh Mehta, MD',
        specialty: 'Internal Medicine & Diabetology',
        hospital: 'Lilavati Hospital & Research Centre, Bandra West, Mumbai',
        registration_no: 'MCI-48291',
        experience_years: 18,
        rating: 4.9,
        consultation_fee: 1500,
        phone: '+91 22 2675 1000'
    })

    MERGE (doc_sharma:Doctor {
        name: 'Dr. Ananya Sharma, DM',
        specialty: 'Consultant Interventional Cardiologist',
        hospital: 'Apex Heart Care Dadar, Mumbai',
        registration_no: 'MMC-77123',
        experience_years: 14,
        rating: 4.85,
        consultation_fee: 1800,
        phone: '+91 22 2415 8899'
    })

    MERGE (doc_desai:Doctor {
        name: 'Dr. Vikram Desai, MD, DM',
        specialty: 'Senior Neurologist',
        hospital: 'Nanavati Super Speciality Hospital, Vile Parle, Mumbai',
        registration_no: 'MMC-65490',
        experience_years: 22,
        rating: 4.92,
        consultation_fee: 2000,
        phone: '+91 22 2618 2255'
    })

    MERGE (doc_iyer:Doctor {
        name: 'Dr. Shalini Iyer, MS (Ophth)',
        specialty: 'Consultant Ophthalmologist',
        hospital: 'ClearVision Eye Institute Dadar, Mumbai',
        registration_no: 'MMC-83112',
        experience_years: 11,
        rating: 4.8,
        consultation_fee: 1000,
        phone: '+91 22 2430 4455'
    })
    """,

    # 19. Consultations, Prescriptions & Appointments
    """
    MATCH (indresh:User {id: 'indresh'})
    MATCH (doc_mehta:Doctor {registration_no: 'MCI-48291'}), (doc_sharma:Doctor {registration_no: 'MMC-77123'}), (doc_desai:Doctor {registration_no: 'MMC-65490'}), (doc_iyer:Doctor {registration_no: 'MMC-83112'})
    MATCH (med_glycomet:Medication {name: 'Glycomet 500mg'}), (med_calcirol:Medication {name: 'Calcirol 60k'}), (med_amlokind:Medication {name: 'Amlokind 5mg'}), (med_crocin:Medication {name: 'Crocin 650mg'})

    CREATE (indresh)-[:CONSULTS_WITH {
        last_visit: '2026-08-25',
        next_followup: '2026-11-25',
        diagnosis_summary: 'Type 2 Diabetes Mellitus under stable pharmacological control with Metformin 500mg. Dietary discipline advised.',
        status: 'Ongoing Care'
    }]->(doc_mehta)

    CREATE (indresh)-[:CONSULTS_WITH {
        last_visit: '2026-05-10',
        next_followup: '2026-11-10',
        diagnosis_summary: 'Primary Essential Hypertension well maintained on Amlodipine 5mg. Sodium restriction advised.',
        status: 'Ongoing Care'
    }]->(doc_sharma)

    CREATE (indresh)-[:CONSULTS_WITH {
        last_visit: '2026-02-14',
        diagnosis_summary: 'Tension-type episodic headaches triggered by screen glare and fatigue. Advised ergonomic breaks and SOS analgesics.',
        status: 'Consulted'
    }]->(doc_desai)

    CREATE (doc_mehta)-[:PRESCRIBED {date: '2026-08-25', validity_months: 6}]->(med_glycomet)
    CREATE (doc_mehta)-[:PRESCRIBED {date: '2026-08-25', validity_months: 6}]->(med_calcirol)
    CREATE (doc_sharma)-[:PRESCRIBED {date: '2026-05-10', validity_months: 12}]->(med_amlokind)
    CREATE (doc_desai)-[:PRESCRIBED {date: '2026-02-14', validity_months: 12}]->(med_crocin)

    CREATE (appt_upcoming:Appointment {
        id: 'appt-2026-1125',
        doctor_name: 'Dr. Rajesh Mehta, MD',
        specialty: 'Internal Medicine & Diabetology',
        date: '2026-11-25',
        time: '10:30 AM',
        location: 'Lilavati Hospital & Research Centre, Room 304',
        status: 'Confirmed',
        mode: 'In-person Clinical Review'
    })
    CREATE (indresh)-[:HAS_APPOINTMENT]->(appt_upcoming)
    CREATE (appt_upcoming)-[:WITH_DOCTOR]->(doc_mehta)
    """,

    # 20. Lab Reports & Diagnostic Panels
    """
    CREATE (lab_cmp:LabReport {
        report_id: 'METRO-LAB-89421',
        title: 'Comprehensive Metabolic & Glycemic Profile',
        lab_name: 'Metropolis Healthcare Diagnostic Laboratory, Mumbai',
        test_date: '2026-08-20',
        verified_by: 'Dr. K. Merchant, MD (Pathology)',
        hba1c: '6.4%',
        fasting_glucose: '112 mg/dL',
        serum_creatinine: '0.92 mg/dL (Normal)',
        egfr: '>90 mL/min/1.73m² (Normal Kidney Function)',
        sgot_ast: '24 U/L (Normal Liver Function)',
        sgpt_alt: '28 U/L (Normal Liver Function)',
        status: 'Clinically Verified'
    })

    CREATE (lab_lipid:LabReport {
        report_id: 'METRO-LAB-89422',
        title: 'Complete Lipid Profile Panel',
        lab_name: 'Metropolis Healthcare Diagnostic Laboratory, Mumbai',
        test_date: '2026-08-20',
        total_cholesterol: '194 mg/dL (< 200 Desirable)',
        hdl_good: '46 mg/dL (> 40 Normal)',
        ldl_bad: '118 mg/dL (< 100 Optimal, Mild Elevation)',
        triglycerides: '150 mg/dL (< 150 Normal)',
        status: 'Clinically Verified'
    })

    CREATE (lab_vitd:LabReport {
        report_id: 'METRO-LAB-88104',
        title: 'Serum 25-OH Vitamin D3 Immunoassay',
        lab_name: 'Metropolis Healthcare Diagnostic Laboratory, Mumbai',
        test_date: '2026-08-10',
        vitamin_d3: '22.4 ng/mL (Reference: 30-100 ng/mL, Insufficiency Detected)',
        status: 'Clinically Verified'
    })
    """,

    # 21. Connect Lab Reports to Indresh and Conditions
    """
    MATCH (indresh:User {id: 'indresh'})
    MATCH (lab_cmp:LabReport {report_id: 'METRO-LAB-89421'}), (lab_lipid:LabReport {report_id: 'METRO-LAB-89422'}), (lab_vitd:LabReport {report_id: 'METRO-LAB-88104'})
    MATCH (c_diabetes:Condition {name: 'Type 2 Diabetes Mellitus'}), (c_dyslipidemia:Condition {name: 'Dyslipidemia / Borderline Lipids'}), (c_vitd:Condition {name: 'Vitamin D Deficiency'})

    CREATE (indresh)-[:HAS_LAB_REPORT]->(lab_cmp)
    CREATE (indresh)-[:HAS_LAB_REPORT]->(lab_lipid)
    CREATE (indresh)-[:HAS_LAB_REPORT]->(lab_vitd)

    CREATE (lab_cmp)-[:VALIDATES_CONDITION]->(c_diabetes)
    CREATE (lab_lipid)-[:VALIDATES_CONDITION]->(c_dyslipidemia)
    CREATE (lab_vitd)-[:VALIDATES_CONDITION]->(c_vitd)
    """,

    # 22. Drug Allergies & Safety Alerts
    """
    MERGE (allergy_penicillin:Allergy {
        name: 'Penicillin / Beta-lactam Antibiotics',
        allergen_type: 'Pharmacological Drug Allergen',
        category: 'Drug Allergy',
        reaction_manifestations: 'Severe Urticaria, Facial Angioedema, Bronchospasm (High Anaphylaxis Risk)'
    })

    MERGE (allergy_dust:Allergy {
        name: 'Dust Mites & Seasonal Aeroallergens',
        allergen_type: 'Environmental Aeroallergen',
        category: 'Inhalant Allergy',
        reaction_manifestations: 'Sneezing, Nasal Pruritus, Clear Rhinorrhea, Conjunctival Hyperemia'
    })
    """,

    # 23. Connect Allergies & Contraindications
    """
    MATCH (indresh:User {id: 'indresh'})
    MATCH (allergy_penicillin:Allergy {name: 'Penicillin / Beta-lactam Antibiotics'}), (allergy_dust:Allergy {name: 'Dust Mites & Seasonal Aeroallergens'})
    MATCH (sym_rhinitis:Symptom {name: 'Seasonal Sneezing & Nasal Congestion'})

    CREATE (indresh)-[:HAS_ALLERGY {severity: 'Severe - Critical Anaphylaxis Alert', diagnosed_date: '2019-06-12'}]->(allergy_penicillin)
    CREATE (indresh)-[:HAS_ALLERGY {severity: 'Mild to Moderate', diagnosed_date: '2021-03-05'}]->(allergy_dust)
    CREATE (allergy_dust)-[:MANIFESTS_AS]->(sym_rhinitis)
    """,

    # 24. Government Welfare Schemes & Eligibility
    """
    CREATE (scheme_pmjay:GovernmentScheme {
        scheme_id: 'SCHEME-PMJAY',
        name: 'Pradhan Mantri Jan Arogya Yojana (PM-JAY Ayushman Bharat)',
        coverage_amount_inr: 500000,
        coverage_description: '₹5,00,000 secondary and tertiary cashless hospitalization cover per eligible family per year',
        eligible_status: 'Eligible (Family Ayushman Card Generated)',
        nodal_agency: 'National Health Authority (NHA)'
    })

    CREATE (scheme_pmbjp:GovernmentScheme {
        scheme_id: 'SCHEME-PMBJP',
        name: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)',
        coverage_description: 'Access to 1,900+ WHO-GMP quality generic medicines at 50% to 90% discounted pricing across 10,000+ Kendras in India',
        eligible_status: 'Universal Universal Citizen Access',
        nodal_agency: 'Pharmaceuticals & Medical Devices Bureau of India (PMBI)'
    })

    CREATE (scheme_mjpjay:GovernmentScheme {
        scheme_id: 'SCHEME-MJPJAY',
        name: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY Maharashtra)',
        coverage_amount_inr: 500000,
        coverage_description: 'State cashless medical cover for recognized inpatient procedures and critical illnesses',
        eligible_status: 'State Resident Covered',
        nodal_agency: 'State Health Assurance Society, Maharashtra'
    })
    """,

    # 25. Connect Government Schemes to Indresh & Jan Aushadhi
    """
    MATCH (indresh:User {id: 'indresh'})
    MATCH (scheme_pmjay:GovernmentScheme {scheme_id: 'SCHEME-PMJAY'}), (scheme_pmbjp:GovernmentScheme {scheme_id: 'SCHEME-PMBJP'}), (scheme_mjpjay:GovernmentScheme {scheme_id: 'SCHEME-MJPJAY'})
    MATCH (kendra_dadar:JanAushadhiKendra {kendra_code: 'PMBJP-MH-0104'})

    CREATE (indresh)-[:ELIGIBLE_FOR {card_status: 'Active Verified'}]->(scheme_pmjay)
    CREATE (indresh)-[:ELIGIBLE_FOR {card_status: 'Universal Access'}]->(scheme_pmbjp)
    CREATE (indresh)-[:ELIGIBLE_FOR {card_status: 'Active Resident'}]->(scheme_mjpjay)

    CREATE (scheme_pmbjp)-[:OPERATES_KENDRA]->(kendra_dadar)
    """,

    # 26. AI Predictive Risk & Clinical Insights
    """
    CREATE (pred_7day:AIPrediction {
        model_version: 'Swasthya-Clinical-Risk-v2.4',
        prediction_horizon: '7 Days',
        trajectory_status: 'Stable / Controlled',
        risk_score_day3: 32,
        risk_score_day5: 45,
        risk_score_day7: 37,
        projected_fatigue_index: 'Low-to-Moderate (Correlated with weekend recovery)',
        actionable_recommendation: 'Maintain Metformin twice daily timing; establish regular 7-hour sleep window on Thursdays/Fridays to mitigate predicted Day 5 fatigue rebound.'
    })

    CREATE (insight_savings:HealthInsight {
        insight_type: 'Pharmacological Financial Optimization',
        monthly_mrp_cost_inr: 1840.00,
        monthly_jan_aushadhi_cost_inr: 210.00,
        net_monthly_savings_inr: 1630.00,
        net_annual_savings_inr: 19560.00,
        savings_percentage: 88.6,
        summary: 'Switching active prescribed brands (Glycomet, Amlokind, Calcirol, Pan-D) to bio-equivalent PMBJP generic formulations reduces out-of-pocket medical expenditure by ₹19,560 annually.'
    })

    CREATE (insight_genetic:HealthInsight {
        insight_type: 'Hereditary Risk Stratification',
        primary_lineage: 'Paternal (Father: Suresh Kumar - Diabetes & HTN)',
        polygenic_risk_score: 'Moderate-High Cardiometabolic Propensity',
        clinical_note: 'Multi-generational concordance of Type 2 Diabetes and Hypertension identified in Suresh Family Cohort. Early lifestyle intervention (walking habit + glucose monitoring) actively reduces 5-year complication probability by 74%.'
    })
    """,

    # 27. Connect AI Predictions & Insights to Indresh
    """
    MATCH (indresh:User {id: 'indresh'})
    MATCH (pred_7day:AIPrediction {model_version: 'Swasthya-Clinical-Risk-v2.4'}), (insight_savings:HealthInsight {insight_type: 'Pharmacological Financial Optimization'}), (insight_genetic:HealthInsight {insight_type: 'Hereditary Risk Stratification'})
    MATCH (c_diabetes:Condition {name: 'Type 2 Diabetes Mellitus'})

    CREATE (indresh)-[:HAS_AI_PREDICTION]->(pred_7day)
    CREATE (indresh)-[:HAS_HEALTH_INSIGHT]->(insight_savings)
    CREATE (indresh)-[:HAS_HEALTH_INSIGHT]->(insight_genetic)

    CREATE (pred_7day)-[:EVALUATES_CONDITION]->(c_diabetes)
    CREATE (insight_genetic)-[:CORRELATED_CONDITION]->(c_diabetes)
    """
]

print(f"Executing {len(cypher_statements)} comprehensive graph ingestion statements...")

with driver.session() as session:
    for idx, stmt in enumerate(cypher_statements, 1):
        try:
            res = session.run(stmt)
            res.consume()
            print(f"[{idx}/{len(cypher_statements)}] Successfully applied graph layer.")
        except Exception as e:
            print(f"Error on statement {idx}: {e}\nQuery snippet: {stmt[:120]}...")

summary = driver.execute_query("MATCH (n) RETURN labels(n)[0] as label, count(n) as count ORDER BY count DESC")
print("\n" + "="*50)
print("     SWASTHYA AI CLINICAL KNOWLEDGE GRAPH (AURA DB)")
print("="*50)
total_nodes = 0
for record in summary.records:
    lbl = record["label"]
    cnt = record["count"]
    total_nodes += cnt
    print(f"• {lbl:<25}: {cnt:>3} nodes")
print(f"\nTOTAL NODES IN GRAPH: {total_nodes}")

relationships_summary = driver.execute_query("MATCH ()-[r]->() RETURN type(r) as rel_type, count(r) as count ORDER BY count DESC")
print("\n" + "="*50)
print("     SWASTHYA AI CLINICAL RELATIONSHIPS (AURA DB)")
print("="*50)
total_rels = 0
for record in relationships_summary.records:
    rt = record["rel_type"]
    cnt = record["count"]
    total_rels += cnt
    print(f"- {rt:<26}: {cnt:>3} edges")
print(f"\nTOTAL RELATIONSHIPS IN GRAPH: {total_rels}")

driver.close()
print("\n[Complete] High-density clinical health memory graph is fully synced in Neo4j Aura DB!")
