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
  addXp: (amount: number) => void;

  // History
  history: HistoryEntry[];
  endDay: () => void;
  resetDay: () => void;

  // Rewards
  badges: Badge[];
  unlockBadge: (id: string) => void;
  
  // Computed
  getCurrentScore: () => number;
  
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
      metrics: INITIAL_METRICS,
      xp: 0,
      level: 1,
      streak: 0,
      history: [],
      badges: MOCK_BADGES,

      clearStore: () => set({
        goals: [],
        metrics: INITIAL_METRICS,
        xp: 0,
        level: 1,
        streak: 0,
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
            category: newGoal.category,
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
        const goalsCompleted = goals.filter(g => g.completed).length;
        
        let score = 0;
        score += goalsCompleted * 10;
        score += metrics.focus * 2;
        score -= metrics.procrastination * 2;
        
        // Screen time penalty (penalty starts after 4 hours)
        if (metrics.screenTime > 4) {
          score -= (metrics.screenTime - 4) * 2;
        }
        
        // Sleep bonus (bonus for 7-9 hours)
        if (metrics.sleep >= 7 && metrics.sleep <= 9) {
          score += 10;
        } else if (metrics.sleep < 5) {
          score -= 5;
        }

        return Math.max(0, Math.round(score)); // Ensure score doesn't go below 0
      },

      endDay: () => {
        const state = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        const score = state.getCurrentScore();
        
        const existingEntryIndex = state.history.findIndex(h => h.date === today);
        const isUpdate = existingEntryIndex !== -1;

        const newEntry: HistoryEntry = {
          date: today,
          score,
          metrics: { ...state.metrics },
          goalsCompleted: state.goals.filter(g => g.completed).length,
          totalGoals: state.goals.length,
        };

        const newStreak = isUpdate ? state.streak : state.streak + 1;
        const newHistory = [...state.history];
        
        if (isUpdate) {
          newHistory[existingEntryIndex] = newEntry;
        } else {
          newHistory.push(newEntry);
        }

        set({
          history: newHistory,
          streak: newStreak,
          goals: state.goals.map(g => ({ ...g, completed: false })),
          metrics: INITIAL_METRICS,
        });

        // Only add XP if it's a new day, or calculate difference if updating (for simplicity, we'll just add if new)
        if (!isUpdate) {
          state.addXp(score * 5);
        }

        const user = auth.currentUser;
        if (user) {
          const batch = writeBatch(db);
          
          // Add/Update history entry
          batch.set(doc(db, 'users', user.uid, 'history', today), {
            ...newEntry,
            createdAt: serverTimestamp()
          });
          
          // Update streak if new
          if (!isUpdate) {
            batch.update(doc(db, 'users', user.uid), { streak: newStreak });
          }
          
          // Reset goals
          state.goals.forEach(g => {
            batch.update(doc(db, 'users', user.uid, 'goals', g.id), { completed: false });
          });
          
          // Reset metrics
          batch.set(doc(db, 'users', user.uid, 'metrics', 'today'), {
            ...INITIAL_METRICS,
            updatedAt: serverTimestamp()
          });
          
          batch.commit().catch(console.error);
        }
      },

      resetDay: () => {
        set((state) => ({
          goals: state.goals.map(g => ({ ...g, completed: false })),
          metrics: INITIAL_METRICS
        }));
        
        const user = auth.currentUser;
        if (user) {
          const batch = writeBatch(db);
          get().goals.forEach(g => {
            batch.update(doc(db, 'users', user.uid, 'goals', g.id), { completed: false });
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
