// Helper to format date as "Mar 3"
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const today = new Date('2026-04-01');

export const vitals30Days = Array.from({length: 30}, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - (29 - i));
  
  const heartRate = 68 + Math.round(Math.sin(i * 0.4) * 6 + Math.random() * 8);
  const riskScore = 58 + Math.round(Math.sin(i * 0.3) * 10 + Math.random() * 6);
  
  // Add a spike at index 18 (Symptom spike)
  if (i === 18) {
    return {
      date: formatDate(d),
      heartRate: 96,
      spo2: 95,
      steps: 3100,
      sleep: 5.2,
      stress: 78,
      riskScore: 79,
      label: 'Symptom spike'
    };
  }

  return {
    date: formatDate(d),
    heartRate,
    spo2: 96 + Math.round(Math.random() * 3),
    steps: 4200 + Math.round(Math.random() * 4800),
    sleep: +(5.5 + Math.random() * 2.5).toFixed(1),
    stress: Math.round(30 + Math.random() * 40),
    riskScore,
  };
});
