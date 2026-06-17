// app/constants/fakeData.ts
// All fake data - looks real, completely fake

export const FAKE_PATIENT = {
  id: 'fake-user-123',
  full_name: 'Indresh',
  age: 20,
  phone_number: '+91 98765 43210',
  gender: 'Male',
  location: 'Bangalore, India',
  risk_level: 'Moderate',
  weight: '72 kg',
  height: '5\'10"',
  blood_type: 'O+',
  allergies: 'Penicillin',
  blood_pressure: '120/80',
  heart_rate: '72 bpm',
  oxygen_level: '98%',
  chronic_conditions: ['Migraine', 'Anxiety'],
  vaccinations: ['COVID-19', 'Tetanus'],
  family_genetics: 'Father - Hypertension, Mother - Diabetes',
  surgeries: [],
};

export const FAKE_DAILY_SUMMARIES = [
  {
    id: '1',
    summary_date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    summary_text: 'Had a mild headache in the afternoon, relieved by rest. Overall good health status with normal vitals.',
    symptoms_reported: ['Mild Headache'],
    facts_mentioned: ['Slept 7 hours', 'Ate regularly', 'Moderate stress at work'],
    mood_indicator: 'Positive',
    data_importance_score: 6,
    important_data_found: true,
  },
  {
    id: '2',
    summary_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    summary_text: 'Experienced occasional dizziness in the morning. Stayed hydrated and activity levels normal throughout the day.',
    symptoms_reported: ['Mild Dizziness', 'Headache'],
    facts_mentioned: ['Woke up late', 'Skipped breakfast', 'Good hydration'],
    mood_indicator: 'Neutral',
    data_importance_score: 5,
    important_data_found: true,
  },
  {
    id: '3',
    summary_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    summary_text: 'No significant symptoms reported. Regular exercise and balanced nutrition maintained. Energy levels good.',
    symptoms_reported: [],
    facts_mentioned: ['30 min jog', 'Healthy diet', 'Good sleep'],
    mood_indicator: 'Positive',
    data_importance_score: 4,
    important_data_found: false,
  },
  {
    id: '4',
    summary_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    summary_text: 'Reported fatigue after late work hours. Improved with adequate rest and hydration. Vitals remain stable.',
    symptoms_reported: ['Fatigue'],
    facts_mentioned: ['Worked late', 'Poor sleep', 'High caffeine intake'],
    mood_indicator: 'Negative',
    data_importance_score: 5,
    important_data_found: true,
  },
  {
    id: '5',
    summary_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    summary_text: 'Anxiety levels elevated due to exam preparation. Managed through meditation and breathing exercises.',
    symptoms_reported: ['Anxiety', 'Tension'],
    facts_mentioned: ['Exam stress', 'Meditation daily', 'Irregular meals'],
    mood_indicator: 'Anxious',
    data_importance_score: 7,
    important_data_found: true,
  },
  {
    id: '6',
    summary_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    summary_text: 'Excellent health day. All vitals normal, mood positive, and no symptoms reported. Active lifestyle maintained.',
    symptoms_reported: [],
    facts_mentioned: ['Gym workout', 'Balanced meals', 'Social activities'],
    mood_indicator: 'Positive',
    data_importance_score: 3,
    important_data_found: false,
  },
];

export const FAKE_HEALTH_GRAPH_NODES = {
  nodes: [
    {
      id: 'user-main',
      label: 'Indresh (20)',
      type: 'user',
      color: '#FF6B6B',
    },
    // Symptoms
    {
      id: 'sym-headache',
      label: 'Headache (Severity: 6/10)',
      type: 'symptom',
      severity: 6,
      color: '#FF6B6B',
      since: '2024-06-10',
    },
    {
      id: 'sym-anxiety',
      label: 'Anxiety (Severity: 5/10)',
      type: 'symptom',
      severity: 5,
      color: '#FF6B6B',
      since: '2024-06-12',
    },
    {
      id: 'sym-fatigue',
      label: 'Fatigue (Severity: 4/10)',
      type: 'symptom',
      severity: 4,
      color: '#FF6B6B',
      since: '2024-06-14',
    },
    // Health Facts (Habits/Lifestyle)
    {
      id: 'fact-sleep',
      label: 'Irregular sleep pattern',
      type: 'fact',
      category: 'sleep',
      frequency: 'daily',
      color: '#4ECDC4',
    },
    {
      id: 'fact-stress',
      label: 'High stress from exams',
      type: 'fact',
      category: 'stress',
      frequency: 'recurring',
      color: '#FF6B6B',
    },
    {
      id: 'fact-exercise',
      label: 'Regular gym sessions',
      type: 'fact',
      category: 'exercise',
      frequency: 'daily',
      color: '#95E1D3',
    },
    {
      id: 'fact-diet',
      label: 'Sometimes skips meals',
      type: 'fact',
      category: 'diet',
      frequency: 'occasional',
      color: '#FFE66D',
    },
    // Diseases
    {
      id: 'dis-migraine',
      label: 'Migraine (Chronic)',
      type: 'disease',
      color: '#C7CEEA',
    },
  ],
  edges: [
    {
      source: 'user-main',
      target: 'sym-headache',
      label: 'HAS_SYMPTOM',
      type: 'symptom',
    },
    {
      source: 'user-main',
      target: 'sym-anxiety',
      label: 'HAS_SYMPTOM',
      type: 'symptom',
    },
    {
      source: 'user-main',
      target: 'sym-fatigue',
      label: 'HAS_SYMPTOM',
      type: 'symptom',
    },
    {
      source: 'user-main',
      target: 'fact-sleep',
      label: 'HAS_FACT',
      type: 'fact',
    },
    {
      source: 'user-main',
      target: 'fact-stress',
      label: 'HAS_FACT',
      type: 'fact',
    },
    {
      source: 'user-main',
      target: 'fact-exercise',
      label: 'HAS_FACT',
      type: 'fact',
    },
    {
      source: 'user-main',
      target: 'fact-diet',
      label: 'HAS_FACT',
      type: 'fact',
    },
    {
      source: 'user-main',
      target: 'dis-migraine',
      label: 'HAS_DISEASE',
      type: 'disease',
    },
    // Triggers
    {
      source: 'sym-headache',
      target: 'fact-stress',
      label: 'TRIGGERED_BY',
      type: 'trigger',
    },
    {
      source: 'sym-headache',
      target: 'fact-sleep',
      label: 'TRIGGERED_BY',
      type: 'trigger',
    },
    {
      source: 'sym-anxiety',
      target: 'fact-stress',
      label: 'TRIGGERED_BY',
      type: 'trigger',
    },
  ],
};

export const FAKE_AI_INSIGHTS = [
  {
    id: '1',
    title: 'Sleep Pattern Alert',
    insight: 'Your irregular sleep schedule correlates with 78% of your headache occurrences. Consistent sleep timing could reduce symptoms significantly.',
    severity: 'moderate',
    icon: '😴',
  },
  {
    id: '2',
    title: 'Stress Management',
    insight: 'Anxiety levels spike during exam periods. Incorporating 20-minute daily meditation has shown 45% improvement in similar cases.',
    severity: 'moderate',
    icon: '🧘',
  },
  {
    id: '3',
    title: 'Nutrition Impact',
    insight: 'You\'re skipping meals 3x/week, which triggers fatigue. Maintaining regular meal times could boost energy by 60%.',
    severity: 'low',
    icon: '🥗',
  },
  {
    id: '4',
    title: 'Exercise Consistency',
    insight: 'Your gym routine is excellent and correlates with positive mood days. Keep it up!',
    severity: 'positive',
    icon: '💪',
  },
];

export const FAKE_FAMILY_DATA = [
  {
    member_id: 'member-1',
    member_name: 'Indresh',
    relation: 'Self',
    active_symptoms: ['Headache', 'Anxiety'],
    risk_score: 58,
    risk_level: 'Moderate',
  },
  {
    member_id: 'member-2',
    member_name: 'Raj Kumar',
    relation: 'Father',
    active_symptoms: ['Hypertension', 'Fatigue'],
    risk_score: 72,
    risk_level: 'High',
  },
  {
    member_id: 'member-3',
    member_name: 'Priya',
    relation: 'Sister',
    active_symptoms: ['Headache', 'Anxiety'],
    risk_score: 55,
    risk_level: 'Moderate',
  },
];

export const FAKE_SHARED_SYMPTOMS = [
  {
    symptom: 'Headache',
    members: ['Indresh', 'Priya'],
    count: 2,
    alert: '2 family members experiencing headaches - possible hereditary pattern',
  },
  {
    symptom: 'Anxiety',
    members: ['Indresh', 'Priya'],
    count: 2,
    alert: '2 family members with anxiety - consider family counseling',
  },
];

export const FAKE_RISK_SCORE_DATA = {
  current_score: 58,
  score_range: '55-62',
  confidence: 'Moderate',
  trend: 'stable',
  base_factors: [
    'Chronic headache history',
    'High stress levels',
    'Irregular sleep',
  ],
  improvement_tips: [
    'Maintain consistent sleep schedule',
    'Daily 20-min meditation',
    'Regular meals',
    'Reduce caffeine after 2 PM',
  ],
};

// Chat greeting message
export const FAKE_CHAT_GREETING = {
  id: 'greeting-1',
  text: `Hey Indresh 👋! I'm your health AI assistant. I've been analyzing your health patterns, and I noticed a few things:

1. **Sleep & Headaches**: Your irregular sleep schedule seems to trigger most of your headaches. Consistent bedtime could help!

2. **Stress Management**: During exam periods, your anxiety spikes. Daily meditation could be game-changing for you.

3. **Meal Timing**: You're skipping breakfast 3x/week, which causes afternoon fatigue. Regular meals = steady energy! 🥗

Feel free to ask me anything about your health patterns, symptoms, or how to improve your wellness. What would you like to know?`,
  isUser: false,
  timestamp: new Date(),
};

// Medicines/Prescriptions
export const FAKE_MEDICINES = [
  {
    id: 'med-1',
    name: 'Aspirin',
    dosage: '500mg',
    frequency: 'As needed',
    prescribedBy: 'Dr. Sharma',
    startDate: '2024-01-15',
    notes: 'For headache relief',
  },
  {
    id: 'med-2',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Patel',
    startDate: '2024-02-01',
    notes: 'Daily supplement',
  },
];

// Vitals History
export const FAKE_VITALS_HISTORY = [
  {
    date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 98.6,
    oxygenSaturation: 98,
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bloodPressure: '118/78',
    heartRate: 70,
    temperature: 98.5,
    oxygenSaturation: 98,
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bloodPressure: '122/82',
    heartRate: 75,
    temperature: 98.7,
    oxygenSaturation: 99,
  },
];

// Government Schemes
export const FAKE_GOVERNMENT_SCHEMES = [
  {
    id: 'scheme-1',
    name: 'Ayushman Bharat',
    description: 'National health protection scheme providing up to ₹5 lakhs health cover',
    eligibility: 'All Indian citizens',
    link: 'https://pmjay.gov.in',
    icon: '🏥',
  },
  {
    id: 'scheme-2',
    name: 'PMJAY - AB-PMJAY',
    description: 'Amended scheme covering more sections of society',
    eligibility: 'Check state criteria',
    link: 'https://pmjay.gov.in',
    icon: '📋',
  },
  {
    id: 'scheme-3',
    name: 'State Health Insurance',
    description: 'State-specific health insurance schemes',
    eligibility: 'Varies by state',
    link: '#',
    icon: '🛡️',
  },
];

// Alerts & Recommendations
export const FAKE_ALERTS = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'Sleep Pattern Alert',
    message: 'Your sleep has been irregular for 3 days. This may trigger headaches.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actionable: true,
  },
  {
    id: 'alert-2',
    type: 'info',
    title: 'Medication Reminder',
    message: 'Time to take your daily Vitamin D3 supplement',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    actionable: true,
  },
];

// Recommendations
export const FAKE_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    title: 'Establish Sleep Routine',
    description: 'Try sleeping and waking at consistent times',
    priority: 'high',
    impact: 'Could reduce headaches by 40%',
  },
  {
    id: 'rec-2',
    title: 'Daily Meditation',
    description: '20 minutes of guided meditation can help with anxiety',
    priority: 'high',
    impact: 'Reduce stress-induced symptoms',
  },
  {
    id: 'rec-3',
    title: 'Regular Meals',
    description: 'Don\'t skip breakfast - maintain steady energy',
    priority: 'medium',
    impact: 'Prevent afternoon fatigue',
  },
];
