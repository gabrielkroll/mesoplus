import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Reads from the same mp7 localStorage key as V1
// Safe to run alongside V1 — same data, no conflicts

const STORAGE_KEY = 'mp7'

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

      updateSetGoal: (day, exName, val) => set((state) => {
        const dayGoals = { ...state.setGoals[day] }
        if (val <= 0) delete dayGoals[exName]
        else dayGoals[exName] = val
        return { setGoals: { ...state.setGoals, [day]: dayGoals } }
      }),

      setAllGoals: (val) => set((state) => {
        // Set in store — TEMPLATES imported in consuming component
        return { globalSetGoal: Math.max(1, val) }
      }),
    }),
    {
      name: STORAGE_KEY,
      // Only persist data fields, not UI state
      partialize: (state) => ({
        sessions: state.sessions,
        phases: state.phases,
        phaseIdx: state.phaseIdx,
        mesoStart: state.mesoStart,
        setGoals: state.setGoals,
        globalSetGoal: state.globalSetGoal,
      }),
    }
  )
)

export default useStore
