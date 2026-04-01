export const HEAT_POINTS_CONFIG = [
  { id: "head", position: [0, 1.25, 0.05], color: "#ff8800", intensity: 0.6, label: "Head" },
  { id: "heart", position: [-0.08, 0.55, -0.18], color: "#ff0000", intensity: 1.2, label: "Heart" },
  { id: "lungs", position: [0, 0.6, 0.1], color: "#10b981", intensity: 0.5, label: "Lungs" },
  { id: "abdomenUpper", position: [0, 0.35, 0.12], color: "#ffdd00", intensity: 0.4, label: "Upper Abdomen" },
  { id: "abdomenLower", position: [0, 0.15, 0.12], color: "#ffdd00", intensity: 0.4, label: "Lower Abdomen" },
  { id: "lowerBack", position: [0, 0.25, -0.15], color: "#f97316", intensity: 0.8, label: "Lower Back" },
  { id: "joints", position: [0.08, -0.50, 0.05], color: "#10b981", intensity: 0.4, label: "Joints" },
  { id: "limbs", position: [0.25, 0.1, 0.05], color: "#10b981", intensity: 0.3, label: "Limbs" },
  { id: "systemic", position: [0, 0, 0], color: "#ffdd00", intensity: 0.2, label: "Systemic" },
];

export const zoneRiskData: Record<string, { level: 'green'|'yellow'|'orange'|'red', symptoms: string[], lastLogged: string, aiRec: string }> = {
  head:     { level: 'yellow',  symptoms: ['Occasional headaches (2x this week)', 'Mild dizziness reported'], lastLogged: 'Mar 31', aiRec: 'Monitor. If dizziness persists > 3 days, visit GP.' },
  heart:    { level: 'orange',  symptoms: ['Elevated resting HR (78 bpm avg)', 'Mild chest tightness Mar 28'], lastLogged: 'Mar 28', aiRec: 'Cardiac monitoring recommended. Scheduled cardiology follow-up due.' },
  lungs:    { level: 'green',   symptoms: ['No respiratory symptoms reported'], lastLogged: 'Mar 20', aiRec: 'No action needed.' },
  abdomenUpper: { level: 'yellow', symptoms: ['Post-meal bloating (3 occurrences)'], lastLogged: 'Mar 30', aiRec: 'Dietary adjustment advised. Monitor for 1 week.' },
  abdomenLower: { level: 'yellow', symptoms: ['Occasional lower abdominal cramps'], lastLogged: 'Mar 29', aiRec: 'Log frequency. Consult if > 3 times in a week.' },
  lowerBack:{ level: 'orange',  symptoms: ['Persistent lower back pain (3 consecutive days)', 'Worse during prolonged sitting'], lastLogged: 'Apr 1', aiRec: 'Physical therapy or GP visit recommended if no improvement in 2 days.' },
  joints:   { level: 'green',   symptoms: ['No joint symptoms reported'], lastLogged: 'Mar 15', aiRec: 'No action needed.' },
  limbs:    { level: 'green',   symptoms: ['No limb symptoms'], lastLogged: 'Mar 10', aiRec: 'No action needed.' },
  systemic: { level: 'yellow',  symptoms: ['Fatigue reported (low energy 4/7 days this week)', 'Disrupted sleep pattern'], lastLogged: 'Mar 31', aiRec: 'Ensure 7+ hours sleep. Track caffeine and stress levels.' },
};