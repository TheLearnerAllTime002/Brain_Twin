import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Lightbulb, Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

export function Insights() {
  const { metrics, history, goals } = useStore();
  const score = useStore(state => state.getCurrentScore());

  // Mock Intelligence Logic
  const generateInsights = () => {
    const insights = [];
    
    // Today's Analysis
    if (metrics.focus > 7 && metrics.screenTime > 6) {
      insights.push({
        type: 'warning',
        title: 'High Focus, High Screen Time',
        message: 'Your focus is great today, but prolonged screen time might lead to burnout. Consider taking a 15-minute screen-free break.',
        icon: AlertTriangle
      });
    } else if (metrics.focus < 5 && metrics.hadDistractions) {
      insights.push({
        type: 'improvement',
        title: 'Distraction Impact',
        message: 'Distractions heavily impacted your focus today. Try using a website blocker or putting your phone in another room tomorrow.',
        icon: Brain
      });
    } else if (score > 80) {
      insights.push({
        type: 'success',
        title: 'Peak Performance',
        message: 'You are having an excellent day! Your balance of goal completion and wellness metrics is optimal.',
        icon: TrendingUp
      });
    }

    // Behavioral Patterns (based on mock history)
    const avgSleep = history.reduce((acc, h) => acc + h.metrics.sleep, 0) / (history.length || 1);
    const highScoringDays = history.filter(h => h.score > 70);
    const avgSleepOnHighDays = highScoringDays.reduce((acc, h) => acc + h.metrics.sleep, 0) / (highScoringDays.length || 1);

    if (avgSleepOnHighDays > avgSleep) {
      insights.push({
        type: 'pattern',
        title: 'Sleep Correlation',
        message: `Data shows you score significantly higher on days you get ~${Math.round(avgSleepOnHighDays)} hours of sleep. Prioritize rest tonight.`,
        icon: Lightbulb
      });
    }

    // Suggestions
    if (goals.filter(g => !g.completed).length > 2 && metrics.procrastination > 5) {
      insights.push({
        type: 'action',
        title: 'Action Required',
        message: 'Procrastination is blocking your goals. Try the "2-Minute Rule": if a goal takes less than 2 minutes to start, do it right now.',
        icon: Target
      });
    }

    return insights.length > 0 ? insights : [
      {
        type: 'neutral',
        title: 'Gathering Data',
        message: 'Complete more days to unlock personalized behavioral patterns and suggestions.',
        icon: Brain
      }
    ];
  };

  const insights = generateInsights();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-display font-bold">Brain Twin Insights</h2>
        <p className="text-text-muted mt-2">AI-driven analysis of your behavior and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-6 rounded-2xl border",
                insight.type === 'warning' ? "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)]" :
                insight.type === 'success' ? "bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.2)]" :
                insight.type === 'improvement' ? "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]" :
                "bg-surface border-border"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  insight.type === 'warning' ? "bg-[rgba(245,158,11,0.2)] text-warning" :
                  insight.type === 'success' ? "bg-[rgba(34,197,94,0.2)] text-success" :
                  insight.type === 'improvement' ? "bg-[rgba(239,68,68,0.2)] text-danger" :
                  "bg-[rgba(212,175,55,0.2)] text-primary"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-2">{insight.title}</h3>
                  <p className="text-text-muted leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Static Weekly Summary */}
      <section className="bg-surface p-8 rounded-2xl border border-border mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold">Weekly Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <span className="block text-sm text-text-muted mb-1">Avg Score</span>
            <span className="text-3xl font-display font-bold text-primary">
              {history.length ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length) : 0}
            </span>
          </div>
          <div>
            <span className="block text-sm text-text-muted mb-1">Goals Met</span>
            <span className="text-3xl font-display font-bold text-text-main">
              {history.reduce((acc, h) => acc + h.goalsCompleted, 0)}
            </span>
          </div>
          <div>
            <span className="block text-sm text-text-muted mb-1">Avg Focus</span>
            <span className="text-3xl font-display font-bold text-text-main">
              {history.length ? (history.reduce((acc, h) => acc + h.metrics.focus, 0) / history.length).toFixed(1) : 0}
            </span>
          </div>
          <div>
            <span className="block text-sm text-text-muted mb-1">Avg Sleep</span>
            <span className="text-3xl font-display font-bold text-text-main">
              {history.length ? (history.reduce((acc, h) => acc + h.metrics.sleep, 0) / history.length).toFixed(1) : 0}h
            </span>
          </div>
        </div>

        {/* Score Trend Chart */}
        {history.length > 0 && (
          <div className="h-64 mt-8">
            <h4 className="text-sm font-medium text-text-muted mb-4">Score Trend (Last 7 Days)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...history].reverse().slice(-7).map(h => ({ ...h, displayDate: format(parseISO(h.date), 'MMM dd') }))}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#A0A0AB" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A0A0AB" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A22', borderColor: '#2A2A35', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="score" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </motion.div>
  );
}
