// Full Body ABCD programme — ported from V1
export const TEMPLATES = {
  1: [
    { label: 'Calves + Hamstrings', exercises: [
      { name: 'Seated Calf Raises',        muscle: 'Calves',     muscle2: '',          sets: 3, rf: 15, rc: 20 },
      { name: 'Romanian Deadlift',          muscle: 'Hamstrings', muscle2: 'Glutes',    sets: 3, rf: 8,  rc: 12 },
    ]},
    { label: 'Delts + Biceps', exercises: [
      { name: 'Face Pulls',                 muscle: 'Delts',      muscle2: 'Stability', sets: 3, rf: 12, rc: 20 },
      { name: 'Incline DB Curl',            muscle: 'Biceps',     muscle2: '',          sets: 3, rf: 10, rc: 15 },
    ]},
    { label: 'Chest + Back', exercises: [
      { name: 'Barbell Bench Press',        muscle: 'Chest',      muscle2: '',          sets: 3, rf: 8,  rc: 12 },
      { name: 'Chest Supported Row',        muscle: 'Back',       muscle2: '',          sets: 3, rf: 10, rc: 15 },
    ]},
    { label: 'Biceps + Forearms', exercises: [
      { name: 'Bayesian Cable Curl',        muscle: 'Biceps',     muscle2: '',          sets: 3, rf: 10, rc: 15 },
      { name: 'Towel Grip Farmer Carry',    muscle: 'Forearms',   muscle2: 'Grip',      sets: 3, rf: 10, rc: 15 },
    ]},
  ],
  2: [
    { label: 'Quads + Forearms', exercises: [
      { name: 'Squat',                      muscle: 'Quads',      muscle2: 'Glutes',    sets: 3, rf: 8,  rc: 12 },
      { name: 'Wrist Curl',                 muscle: 'Forearms',   muscle2: 'Grip',      sets: 3, rf: 12, rc: 20 },
    ]},
    { label: 'Delts + Chest', exercises: [
      { name: 'Reverse Pec Deck',           muscle: 'Delts',      muscle2: 'Stability', sets: 3, rf: 12, rc: 15 },
      { name: 'Pec Deck Fly',               muscle: 'Chest',      muscle2: '',          sets: 3, rf: 12, rc: 15 },
    ]},
    { label: 'Back + Chest', exercises: [
      { name: 'Chest Supported Row',        muscle: 'Back',       muscle2: '',          sets: 3, rf: 10, rc: 15 },
      { name: 'DB Bench Press',             muscle: 'Chest',      muscle2: '',          sets: 3, rf: 8,  rc: 12 },
    ]},
    { label: 'Biceps + Triceps', exercises: [
      { name: 'EZ Bar Curl',                muscle: 'Biceps',     muscle2: 'Forearms',  sets: 3, rf: 8,  rc: 12 },
      { name: 'Overhead Cable Triceps Ext', muscle: 'Triceps',    muscle2: '',          sets: 3, rf: 10, rc: 15 },
    ]},
  ],
  3: [
    { label: 'Calves + Hamstrings', exercises: [
      { name: 'Standing Calf Raises',       muscle: 'Calves',     muscle2: '',          sets: 3, rf: 15, rc: 25 },
      { name: 'Romanian Deadlift',          muscle: 'Hamstrings', muscle2: 'Glutes',    sets: 3, rf: 8,  rc: 12 },
    ]},
    { label: 'Delts + Biceps', exercises: [
      { name: 'Face Pulls',                 muscle: 'Delts',      muscle2: 'Stability', sets: 3, rf: 12, rc: 20 },
      { name: 'Incline DB Curl',            muscle: 'Biceps',     muscle2: '',          sets: 3, rf: 10, rc: 15 },
    ]},
    { label: 'Chest + Back', exercises: [
      { name: 'Barbell Bench Press',        muscle: 'Chest',      muscle2: '',          sets: 3, rf: 8,  rc: 12 },
      { name: 'Chest Supported Row',        muscle: 'Back',       muscle2: '',          sets: 3, rf: 10, rc: 15 },
    ]},
    { label: 'Biceps + Forearms', exercises: [
      { name: 'Hammer Curl',                muscle: 'Biceps',     muscle2: 'Forearms',  sets: 3, rf: 10, rc: 12 },
      { name: 'Plate Pinch Hold',           muscle: 'Forearms',   muscle2: 'Grip',      sets: 3, rf: 10, rc: 15 },
    ]},
  ],
  4: [
    { label: 'Quads + Forearms', exercises: [
      { name: 'Front Squat',                muscle: 'Quads',      muscle2: 'Glutes',    sets: 3, rf: 8,  rc: 12 },
      { name: 'Reverse Wrist Curl',         muscle: 'Forearms',   muscle2: 'Grip',      sets: 3, rf: 12, rc: 20 },
    ]},
    { label: 'Delts + Chest', exercises: [
      { name: 'Reverse Pec Deck',           muscle: 'Delts',      muscle2: 'Stability', sets: 3, rf: 12, rc: 15 },
      { name: 'Pec Deck Fly',               muscle: 'Chest',      muscle2: '',          sets: 3, rf: 12, rc: 15 },
    ]},
    { label: 'Chest + Back', exercises: [
      { name: 'DB Bench Press',             muscle: 'Chest',      muscle2: '',          sets: 3, rf: 8,  rc: 12 },
      { name: 'Lat Pulldown',               muscle: 'Back',       muscle2: '',          sets: 3, rf: 10, rc: 15 },
    ]},
    { label: 'Biceps + Triceps', exercises: [
      { name: 'EZ Bar Curl',                muscle: 'Biceps',     muscle2: 'Forearms',  sets: 3, rf: 8,  rc: 12 },
      { name: 'Overhead Cable Triceps Ext', muscle: 'Triceps',    muscle2: '',          sets: 3, rf: 10, rc: 15 },
    ]},
  ],
}

// Flatten all exercises for a given day in order
export function getExercises(gymDay) {
  return (TEMPLATES[gymDay] || []).flatMap(ss =>
    ss.exercises.map(ex => ({ ...ex, supersetLabel: ss.label }))
  )
}

// Derive gym day from existing sessions this week
export function deriveGymDay(sessions, date) {
  const weekStart = getMonday(date)
  const gymTypes  = ['Gym', 'BJJ + Gym', 'Resistance training', 'resistance', 'resistance+bjj']
  const count     = sessions.filter(s =>
    s.date >= weekStart && s.date < date && gymTypes.includes(s.dtype)
  ).length
  return (count % 4) + 1
}

function getMonday(dateStr) {
  const d   = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}
