export const checkinHistory = [
  {
    date: 'Apr 1, 2026', // today
    severity: 'watch' as const,
    questions: [
      { q: 'Good morning Arjun. Your resting heart rate was slightly elevated last night at 78 bpm. Any chest tightness or shortness of breath this morning?', a: null }, // today - unanswered
    ],
    summary: 'Pending today\'s check-in.',
  },
  {
    date: 'Mar 31, 2026',
    severity: 'flagged' as const,
    questions: [
      { q: 'The lower back pain you mentioned — has it radiated toward the abdomen or leg?', a: 'No it stays in the lower back, especially when I sit for long.' },
      { q: 'Have you taken your evening Metformin consistently this week?', a: 'Missed it twice this week.' },
      { q: 'Any swelling in the feet or ankles?', a: 'No swelling noticed.' },
    ],
    summary: 'Persistent lower back pain (3rd consecutive day). Metformin adherence gap noted.',
  },
  {
    date: 'Mar 30, 2026',
    severity: 'normal' as const,
    questions: [
      { q: 'How is your energy level today?', a: 'Feeling good, a bit tired from work.' },
    ],
    summary: 'Routine check-in, no issues reported.',
  },
  {
    date: 'Mar 29, 2026',
    severity: 'watch' as const,
    questions: [
      { q: 'Any dizziness after taking your medications?', a: 'Slight lightheadedness in the morning.' },
    ],
    summary: 'Mild dizziness reported, monitoring requested.',
  },
  {
    date: 'Mar 28, 2026',
    severity: 'flagged' as const,
    questions: [
      { q: 'You mentioned some chest tightness. Rate it 1-10.', a: 'About a 4, went away quickly.' },
    ],
    summary: 'Chest tightness episode reported (Mar 28). Baseline vitals remained stable.',
  },
  {
    date: 'Mar 27, 2026',
    severity: 'normal' as const,
    questions: [
      { q: 'Are you getting enough sleep?', a: 'Yes, about 7 hours.' },
    ],
    summary: 'Stable sleep and activity levels.',
  },
  {
    date: 'Mar 26, 2026',
    severity: 'normal' as const,
    questions: [
      { q: 'Have you been active today?', a: 'Walked 5km.' },
    ],
    summary: 'Good activity levels maintained.',
  },
]
