export const medicines = [
  { id: '1', name: 'Metformin', dosage: '500mg', times: ['08:00', '20:00'], takenToday: [true, false], color: '#2563eb', condition: 'Pre-diabetes' },
  { id: '2', name: 'Amlodipine', dosage: '5mg', times: ['08:00'], takenToday: [true], color: '#10b981', condition: 'Hypertension' },
  { id: '3', name: 'Aspirin', dosage: '75mg', times: ['13:00'], takenToday: [true], color: '#f97316', condition: 'Cardiac prevention' },
  { id: '4', name: 'Atorvastatin', dosage: '10mg', times: ['21:00'], takenToday: [false], color: '#8b5cf6', condition: 'Cholesterol' },
]

export const conflictPairs: Record<string, { severity: 'caution'|'warning'|'danger', description: string }> = {
  'aspirin-ibuprofen': { severity: 'caution', description: 'Ibuprofen may reduce the antiplatelet effect of Aspirin, increasing cardiovascular risk. Avoid concurrent use if possible.' },
  'metformin-ibuprofen': { severity: 'warning', description: 'NSAIDs like Ibuprofen can impair renal function in diabetic patients on Metformin, increasing lactic acidosis risk.' },
  'amlodipine-grapefruit': { severity: 'caution', description: 'Grapefruit can increase Amlodipine plasma levels, intensifying side effects like dizziness and hypotension.' },
}
