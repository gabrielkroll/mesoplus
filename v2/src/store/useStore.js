import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Reads from the same mp7 localStorage key as V1
// Safe to run alongside V1 — same data, no conflicts

const STORAGE_KEY = 'mp7'

// Custom storage adapter: V1 writes raw JSON, Zustand expects {state,version}
// This bridges the two formats transparently
const mp7Storage = {
  getItem: (name) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    const data = JSON.parse(str)
    // Return as StorageValue object (Zustand v5 expects objects, not strings)
    if (data.state) return { state: data.state, version: data.version ?? 0 }
    // V1 raw format — wrap it
    return { state: data, version: 0 }
  },
  setItem: (name, value) => {
    // Zustand v5 passes an object {state, version}; v4 passed a JSON string.
    // Handle both and write V1-compatible raw JSON so V1 can still read it.
    const state = typeof value === 'string' ? JSON.parse(value).state : value.state
    localStorage.setItem(name, JSON.stringify(state))
  },
  removeItem: (name) => localStorage.removeItem(name),
}

const useStore = create(
  persist(
    (set, get) => ({
      // ── Session data (mirrors V1 S object) ──────────────────────────────
      sessions: [],
      phases: [],
      phaseIdx: 0,
      mesoStart: '',
      setGoals: { 1: {}, 2: {}, 3: {}, 4: {} },
      globalSetGoal: 3,

      // ── Sync / integration (same keys as V1) ─────────────────────────────
      scriptUrl: '',   // Google Apps Script Web App URL
      sheetId:   '',   // Google Spreadsheet ID (from URL)
      sheetTab:  'Sessions',

      // ── UI state (not persisted) ─────────────────────────────────────────
      activeSheet: null,       // 'readiness' | 'rest' | 'resistance' | 'bjj' | 'resistance+bjj' | 'performance' | 'notes'
      activeTab: 'log',        // 'log' | 'stats' | 'analysis' | 'plan' | 'profile'
      selectedDate: null,

      // ── Actions ──────────────────────────────────────────────────────────
      openSheet: (sheet) => set({ activeSheet: sheet }),
      closeSheet: () => set({ activeSheet: null }),
      setTab: (tab) => set({ activeTab: tab }),
      setDate: (date) => set({ selectedDate: date }),

      addSession: (session) => set((state) => ({
        sessions: [
          ...state.sessions.filter(s => s.date !== session.date),
          session,
        ]
      })),

      removeSession: (date) => set((state) => ({
        sessions: state.sessions.filter(s => s.date !== date)
      })),

      // Remove training type from a session (keeps readiness, notes, etc.)
      removeTraining: (date) => set((state) => ({
        sessions: state.sessions.map(s => {
          if (s.date !== date) return s
          // eslint-disable-next-line no-unused-vars
          const { dtype, gymDay, supersets, completed,
                  bjjDuration, bjjGc, bjjGood, bjjNext, perf,
                  ...rest } = s
          return rest
        })
      })),

      updateSetGoal: (day, exName, val) => set((state) => {
        const dayGoals = { ...state.setGoals[day] }
        if (val <= 0) delete dayGoals[exName]
        else dayGoals[exName] = val
        return { setGoals: { ...state.setGoals, [day]: dayGoals } }
      }),

      setAllGoals: (val) => set(() => ({ globalSetGoal: Math.max(1, val) })),

      setMesoStart: (date) => set({ mesoStart: date }),

      setPhases: (phases) => set({ phases }),

      setPhaseIdx: (idx) => set({ phaseIdx: idx }),

      setScriptUrl: (url) => set({ scriptUrl: url }),

      setSheetId: (id) => set({ sheetId: id }),

      setSheetTab: (tab) => set({ sheetTab: tab }),
    }),
    {
      name: STORAGE_KEY,
      storage: mp7Storage,
      // Only persist data fields, not UI state
      partialize: (state) => ({
        sessions:      state.sessions,
        phases:        state.phases,
        phaseIdx:      state.phaseIdx,
        mesoStart:     state.mesoStart,
        setGoals:      state.setGoals,
        globalSetGoal: state.globalSetGoal,
        scriptUrl:     state.scriptUrl,
        sheetId:       state.sheetId,
        sheetTab:      state.sheetTab,
      }),
    }
  )
)

export default useStore
