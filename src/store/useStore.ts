import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { auth, db } from '../firebase';
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'health' | 'study' | 'work' | 'personal';

export interface Goal {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  subtasks?: { id: string; title: string; completed: boolean }[];
  createdAt?: any;
}

export interface DailyMetrics {
  screenTime: number; // 0-12
  sleep: number; // 0-12
  procrastination: number; // 0-10
  focus: number; // 0-10
  hadDistractions: boolean;
  notes: string;
  updatedAt?: any;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  score: number;
  metrics: DailyMetrics;
  goalsCompleted: number;
  totalGoals: number;
  createdAt?: any;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const getTodayKey = () => format(new Date(), 'yyyy-MM-dd');

const calculateScore = (goals: Goal[], metrics: DailyMetrics) => {
  const goalsCompleted = goals.filter(g => g.completed).length;

  let score = 0;
  score += goalsCompleted * 10;
  score += metrics.focus * 2;
  score -= metrics.procrastination * 2;

  if (metrics.screenTime > 4) {
    score -= (metrics.screenTime - 4) * 2;
  }

  if (metrics.sleep >= 7 && metrics.sleep <= 9) {
    score += 10;
  } else if (metrics.sleep < 5) {
    score -= 5;
  }

  return Math.max(0, Math.round(score));
};

interface BrainTwinState {
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  toggleSubtask: (goalId: string, subtaskId: string) => void;

  // Daily Metrics
  metrics: DailyMetrics;
  updateMetrics: (metrics: Partial<DailyMetrics>) => void;
  
  // Progress
  xp: number;
  level: number;
  streak: number;
  activeDate: string;
  addXp: (amount: number) => void;

  // History
  history: HistoryEntry[];
  endDay: () => Promise<void>;
  resetDay: () => void;

  // Rewards
  badges: Badge[];
  unlockBadge: (id: string) => void;
  
  // Computed
  getCurrentScore: () => number;
  hasCompletedToday: () => boolean;
  ensureCurrentDay: () => Promise<void>;
  
  // Auth
  clearStore: () => void;
}

const INITIAL_METRICS: DailyMetrics = {
  screenTime: 0,
  sleep: 0,
  procrastination: 0,
  focus: 0,
  hadDistractions: false,
  notes: '',
};

const createInitialMetrics = (): DailyMetrics => ({
  ...INITIAL_METRICS,
});

const MOCK_BADGES: Badge[] = [
  { id: 'b1', title: 'Early Bird', description: 'Log in before 7 AM', icon: 'Sun', unlocked: true, unlockedAt: '2026-04-01' },
  { id: 'b2', title: 'Focus Master', description: 'Achieve a focus score of 10', icon: 'Target', unlocked: false },
  { id: 'b3', title: 'Goal Crusher', description: 'Complete all daily goals', icon: 'CheckCircle', unlocked: true, unlockedAt: '2026-04-03' },
  { id: 'b4', title: 'Night Owl', description: 'Sleep less than 4 hours (Not recommended!)', icon: 'Moon', unlocked: false },
  { id: 'b5', title: 'Unstoppable', description: 'Reach a 7-day streak', icon: 'Flame', unlocked: false },
  { id: 'b6', title: 'Zen Mind', description: '0 distractions reported', icon: 'Wind', unlocked: false },
];

export const useStore = create<BrainTwinState>()(
  persist(
    (set, get) => ({
      goals: [],
      metrics: createInitialMetrics(),
      xp: 0,
      level: 1,
      streak: 0,
      activeDate: getTodayKey(),
      history: [],
      badges: MOCK_BADGES,

      clearStore: () => set({
        goals: [],
        metrics: createInitialMetrics(),
        xp: 0,
        level: 1,
        streak: 0,
        activeDate: getTodayKey(),
        history: [],
      }),

      addGoal: (goal) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newGoal = { ...goal, id, completed: false };
        set((state) => ({ goals: [...state.goals, newGoal] }));
        
        const user = auth.currentUser;
        if (user) {
          setDoc(doc(db, 'users', user.uid, 'goals', id), {
            title: newGoal.title,
            priority: newGoal.priority,
            category: newGoal.category ?? 'personal',
            completed: newGoal.completed,
            createdAt: serverTimestamp()
          });
        }
      },
      
      toggleGoal: (id) => {
        const state = get();
        const goal = state.goals.find(g => g.id === id);
        if (!goal) return;
        
        const newCompleted = !goal.completed;
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? { ...g, completed: newCompleted } : g)
        }));

        const user = auth.currentUser;
        if (user) {
          updateDoc(doc(db, 'users', user.uid, 'goals', id), {
            completed: newCompleted
          });
        }
      },
      
      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
        
        const user = auth.currentUser;
        if (user) {
          deleteDoc(doc(db, 'users', user.uid, 'goals', id));
        }
      },

      toggleSubtask: (goalId, subtaskId) => {
        // Subtasks are not in the Firebase schema, so we'll just update local state for now
        // If we wanted them in Firebase, we'd need to update the schema
        set((state) => ({
          goals: state.goals.map(g => {
            if (g.id === goalId && g.subtasks) {
              return {
                ...g,
                subtasks: g.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
              };
            }
            return g;
          })
        }));
      },

      updateMetrics: (newMetrics) => {
        set((state) => ({ metrics: { ...state.metrics, ...newMetrics } }));
        
        const user = auth.currentUser;
        if (user) {
          const updatedMetrics = { ...get().metrics };
          // Remove undefined values
          Object.keys(updatedMetrics).forEach(key => {
            if (updatedMetrics[key as keyof DailyMetrics] === undefined) {
              delete updatedMetrics[key as keyof DailyMetrics];
            }
          });
          
          setDoc(doc(db, 'users', user.uid, 'metrics', 'today'), {
            ...updatedMetrics,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      },

      addXp: (amount) => {
        set((state) => {
          const newXp = state.xp + amount;
          const newLevel = Math.floor(newXp / 500) + 1;
          
          const user = auth.currentUser;
          if (user) {
            updateDoc(doc(db, 'users', user.uid), {
              xp: newXp,
              level: newLevel
            });
          }
          
          return { xp: newXp, level: newLevel };
        });
      },

      getCurrentScore: () => {
        const { goals, metrics } = get();
        return calculateScore(goals, metrics);
      },

      hasCompletedToday: () => {
        const today = getTodayKey();
        return get().history.some(entry => entry.date === today);
      },

      ensureCurrentDay: async () => {
        const state = get();
        const today = getTodayKey();
        const activeDate = state.activeDate || today;

        if (activeDate === today) {
          return;
        }

        const alreadyArchived = state.history.some(entry => entry.date === activeDate);
        const goalsCompleted = state.goals.filter(g => g.completed).length;
        const score = calculateScore(state.goals, state.metrics);
        const archivedEntry: HistoryEntry = {
          date: activeDate,
          score,
          metrics: { ...state.metrics },
          goalsCompleted,
          totalGoals: state.goals.length,
        };

        set((currentState) => ({
          activeDate: today,
          history: alreadyArchived ? currentState.history : [...currentState.history, archivedEntry],
          streak: alreadyArchived ? currentState.streak : currentState.streak + 1,
          goals: [],
          metrics: createInitialMetrics(),
        }));

        if (!alreadyArchived) {
          get().addXp(score * 5);
        }

        const user = auth.currentUser;
        if (user) {
          const batch = writeBatch(db);

          if (!alreadyArchived) {
            batch.set(doc(db, 'users', user.uid, 'history', activeDate), {
              ...archivedEntry,
              createdAt: serverTimestamp()
            });
          }

          batch.set(doc(db, 'users', user.uid), {
            activeDate: today,
            ...(alreadyArchived ? {} : { streak: get().streak })
          }, { merge: true });

          state.goals.forEach(goal => {
            batch.delete(doc(db, 'users', user.uid, 'goals', goal.id));
          });

          batch.set(doc(db, 'users', user.uid, 'metrics', 'today'), {
            ...INITIAL_METRICS,
            updatedAt: serverTimestamp()
          }, { merge: true });

          await batch.commit();
        }
      },

      endDay: async () => {
        const state = get();
        const today = getTodayKey();
        
        if (state.hasCompletedToday()) {
          return;
        }

        const score = state.getCurrentScore();

        const newEntry: HistoryEntry = {
          date: today,
          score,
          metrics: { ...state.metrics },
          goalsCompleted: state.goals.filter(g => g.completed).length,
          totalGoals: state.goals.length,
        };

        const newStreak = state.streak + 1;
        const newHistory = [...state.history, newEntry];

        set({
          activeDate: today,
          history: newHistory,
          streak: newStreak,
          goals: [],
          metrics: createInitialMetrics(),
        });

        state.addXp(score * 5);

        const user = auth.currentUser;
        if (user) {
          const batch = writeBatch(db);
          
          // Add/Update history entry
          batch.set(doc(db, 'users', user.uid, 'history', today), {
            ...newEntry,
            createdAt: serverTimestamp()
          });
          
          batch.set(doc(db, 'users', user.uid), {
            streak: newStreak,
            activeDate: today,
          }, { merge: true });
          
          // Reset goals
          state.goals.forEach(g => {
            batch.delete(doc(db, 'users', user.uid, 'goals', g.id));
          });
          
          // Reset metrics
          batch.set(doc(db, 'users', user.uid, 'metrics', 'today'), {
            ...INITIAL_METRICS,
            updatedAt: serverTimestamp()
          });
          
          await batch.commit().catch(console.error);
        }
      },

      resetDay: () => {
        if (get().hasCompletedToday()) {
          return;
        }

        set((state) => ({
          goals: state.goals.map(g => ({ ...g, completed: false })),
          metrics: createInitialMetrics()
        }));
        
        const user = auth.currentUser;
        if (user) {
          const batch = writeBatch(db);
          get().goals.forEach(g => {
            batch.set(doc(db, 'users', user.uid, 'goals', g.id), { completed: false }, { merge: true });
          });
          batch.set(doc(db, 'users', user.uid, 'metrics', 'today'), {
            ...INITIAL_METRICS,
            updatedAt: serverTimestamp()
          });
          batch.commit().catch(console.error);
        }
      },

      unlockBadge: (id) => set((state) => ({
        badges: state.badges.map(b => b.id === id ? { ...b, unlocked: true, unlockedAt: format(new Date(), 'yyyy-MM-dd') } : b)
      })),
    }),
    {
      name: 'brain-twin-storage',
    }
  )
);
