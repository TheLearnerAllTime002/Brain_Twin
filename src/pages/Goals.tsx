import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore, Priority, Category } from '../store/useStore';
import { Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

export function Goals() {
  const { goals, addGoal, deleteGoal, toggleGoal } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', priority: 'medium' as Priority, category: 'personal' as Category });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    addGoal(newGoal);
    setNewGoal({ title: '', priority: 'medium', category: 'personal' });
    setIsAdding(false);
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progress = goals.length === 0 ? 0 : Math.round((completedCount / goals.length) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">My Goals</h2>
          <p className="text-text-muted mt-2">Track and manage your daily objectives.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-surface p-6 rounded-2xl border border-border">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-medium">Daily Progress</h3>
            <p className="text-sm text-text-muted">{completedCount} of {goals.length} completed</p>
          </div>
          <span className="text-3xl font-display font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-3 bg-background rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Add Goal Form */}
      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAdd}
          className="bg-surface p-6 rounded-2xl border border-border space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Goal Title</label>
            <input 
              type="text" autoFocus
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g., Read 20 pages of Atomic Habits"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-muted mb-2">Priority</label>
              <select 
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as Priority })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-primary appearance-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-muted mb-2">Category</label>
              <select 
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as Category })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-primary appearance-none"
              >
                <option value="health">Health</option>
                <option value="study">Study</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-background rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Save Goal
            </button>
          </div>
        </motion.form>
      )}

      {/* Goal List */}
      <div className="space-y-3">
        {goals.map(goal => (
          <motion.div 
            key={goal.id}
            layout
            className={cn(
              "group flex items-center gap-4 p-4 rounded-xl border transition-all",
              goal.completed 
                ? "bg-background border-border opacity-60" 
                : "bg-surface border-border hover:border-[#D4AF3780]"
            )}
          >
            <button 
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                goal.completed ? "bg-primary text-background" : "border-2 border-text-muted hover:border-primary"
              )}
            >
              {goal.completed && <Check className="w-4 h-4" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium truncate transition-all", goal.completed && "line-through text-text-muted")}>
                {goal.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm",
                  goal.priority === 'high' ? "bg-[rgba(239,68,68,0.1)] text-danger" :
                  goal.priority === 'medium' ? "bg-[rgba(245,158,11,0.1)] text-warning" :
                  "bg-[rgba(34,197,94,0.1)] text-success"
                )}>
                  {goal.priority}
                </span>
                <span className="text-xs text-text-muted capitalize">{goal.category}</span>
              </div>
            </div>
            
            <button 
              onClick={() => deleteGoal(goal.id)}
              className="p-2 text-text-muted hover:text-danger hover:bg-[rgba(239,68,68,0.1)] rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
        {goals.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
            <p className="text-text-muted">No goals for today. Add one to get started!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
