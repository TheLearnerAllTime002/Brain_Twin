import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Trophy, Star, Lock, Sun, Target, CheckCircle, Moon, Flame, Wind } from 'lucide-react';
import { cn } from '../lib/utils';

const ICON_MAP: Record<string, any> = {
  Sun, Target, CheckCircle: CheckCircle, Moon, Flame, Wind
};

export function Rewards() {
  const { level, xp, badges } = useStore();
  
  const xpForNextLevel = level * 500;
  const currentLevelXp = xp - ((level - 1) * 500);
  const progress = Math.min(100, Math.round((currentLevelXp / 500) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-display font-bold">Rewards & Progress</h2>
        <p className="text-text-muted mt-2">Level up and unlock badges by staying consistent.</p>
      </div>

      {/* Level System */}
      <section className="bg-surface p-8 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(212,175,55,0.05)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full border-4 border-[rgba(212,175,55,0.2)] flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)` }} />
            <div className="text-center">
              <span className="block text-sm text-text-muted uppercase tracking-widest">Level</span>
              <span className="block text-4xl font-display font-bold text-primary">{level}</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">Current XP: <strong className="text-text-main">{xp}</strong></span>
              <span className="text-text-muted">Next Level: <strong className="text-text-main">{xpForNextLevel}</strong></span>
            </div>
            <div className="h-4 bg-background rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-text-muted mt-4">
              Earn XP by completing goals, maintaining focus, and ending your day with a high score.
            </p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> Badges
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map(badge => {
            const Icon = ICON_MAP[badge.icon] || Star;
            
            return (
              <div 
                key={badge.id}
                className={cn(
                  "p-6 rounded-2xl border transition-all relative overflow-hidden group",
                  badge.unlocked 
                    ? "bg-surface border-[rgba(212,175,55,0.3)] hover:border-[rgba(212,175,55,0.6)]" 
                    : "bg-background border-border opacity-60 grayscale"
                )}
              >
                {!badge.unlocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-4 h-4 text-text-muted" />
                  </div>
                )}
                
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  badge.unlocked ? "bg-[rgba(212,175,55,0.2)] text-primary" : "bg-surface-hover text-text-muted"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h4 className="font-medium mb-1">{badge.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed">{badge.description}</p>
                
                {badge.unlocked && badge.unlockedAt && (
                  <p className="text-[10px] text-[rgba(212,175,55,0.6)] mt-4 uppercase tracking-wider">
                    Unlocked {badge.unlockedAt}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
