import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { format, parseISO, subDays } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export function History() {
  const history = useStore(state => state.history);
  
  // Sort history descending
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Generate last 30 days for heatmap
  const today = new Date();
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(today, 29 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const entry = history.find(h => h.date === dateStr);
    return {
      date: dateStr,
      score: entry?.score || 0,
      hasEntry: !!entry
    };
  });

  const getScoreColor = (score: number) => {
    if (score === 0) return 'bg-surface-hover';
    if (score < 40) return 'bg-danger/40';
    if (score < 60) return 'bg-warning/40';
    if (score < 80) return 'bg-primary/60';
    return 'bg-primary';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-display font-bold">History</h2>
        <p className="text-text-muted mt-2">Review your past performance and consistency.</p>
      </div>

      {/* Heatmap */}
      <section className="bg-surface p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">30-Day Activity</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {last30Days.map((day, i) => (
            <div 
              key={day.date}
              title={`${day.date}: ${day.hasEntry ? day.score + ' pts' : 'No data'}`}
              className={cn(
                "w-8 h-8 rounded-md transition-colors cursor-help",
                getScoreColor(day.score)
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-text-muted justify-end">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-surface-hover" />
            <div className="w-3 h-3 rounded-sm bg-danger/40" />
            <div className="w-3 h-3 rounded-sm bg-warning/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </section>

      {/* Recent Scorecards */}
      <section>
        <h3 className="text-xl font-display font-bold mb-4">Recent Scorecards</h3>
        <div className="space-y-4">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
              <p className="text-text-muted">No history yet. Complete a day to see your scorecard!</p>
            </div>
          ) : (
            sortedHistory.map((entry, index) => {
              const prevEntry = sortedHistory[index + 1];
              const trend = prevEntry 
                ? entry.score > prevEntry.score ? 'up' : entry.score < prevEntry.score ? 'down' : 'flat'
                : 'flat';

              return (
                <div key={entry.date} className="bg-surface p-6 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-lg">{format(parseISO(entry.date), 'EEEE, MMM do, yyyy')}</h4>
                    <p className="text-sm text-text-muted mt-1">
                      {entry.goalsCompleted}/{entry.totalGoals} Goals • {entry.metrics.focus}/10 Focus • {entry.metrics.screenTime}h Screen Time
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-display font-bold text-primary">{entry.score}</span>
                      <span className="text-xs text-text-muted uppercase tracking-wider">Points</span>
                    </div>
                    
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      trend === 'up' ? "bg-success/10 text-success" :
                      trend === 'down' ? "bg-danger/10 text-danger" :
                      "bg-surface-hover text-text-muted"
                    )}>
                      {trend === 'up' && <TrendingUp className="w-5 h-5" />}
                      {trend === 'down' && <TrendingDown className="w-5 h-5" />}
                      {trend === 'flat' && <Minus className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </motion.div>
  );
}
