import { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Check, AlertCircle, Clock, Moon, Brain, Target, Zap, Download, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export function Today() {
  const { goals, toggleGoal, metrics, updateMetrics, getCurrentScore, level, streak } = useStore();
  const score = getCurrentScore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadError('');

    try {
      // Wait for the download-only UI state to render before capture.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const element = document.getElementById('daily-report-card');
      if (!element) {
        throw new Error('Daily report card element not found.');
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#0B0B0F',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        logging: false,
        useCORS: true,
        onclone: (clonedDocument) => {
          const clonedCard = clonedDocument.getElementById('daily-report-card');
          if (clonedCard instanceof HTMLElement) {
            clonedCard.style.position = 'static';
            clonedCard.style.top = 'auto';
            clonedCard.style.transform = 'none';
            clonedCard.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.35)';
          }

          const style = clonedDocument.createElement('style');
          style.textContent = `
            *,
            *::before,
            *::after {
              animation: none !important;
              transition: none !important;
              caret-color: transparent !important;
            }
          `;
          clonedDocument.head.appendChild(style);
        }
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (!blob) {
        throw new Error('Unable to create PNG file.');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `brain-twin-report-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report", error);
      setDownloadError('Unable to generate the PNG report on this device right now.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:grid lg:grid-cols-3 gap-8"
    >
      {/* Left Column: Goals & Metrics */}
      <div className="order-2 lg:order-1 lg:col-span-2 space-y-8">
        
        {/* Goals Section */}
        <section className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold">Today's Goals</h3>
            <span className="text-sm text-text-muted">{goals.filter(g => g.completed).length}/{goals.length} Completed</span>
          </div>
          
          <div className="space-y-3">
            {goals.map(goal => (
              <div 
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                  goal.completed 
                    ? "bg-background border-border opacity-60" 
                    : "bg-surface-hover border-border hover:border-[#D4AF3780]"
                )}
              >
                <button className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                  goal.completed ? "bg-primary text-background" : "border-2 border-text-muted"
                )}>
                  {goal.completed && <Check className="w-4 h-4" />}
                </button>
                
                <div className="flex-1">
                  <p className={cn("font-medium transition-all", goal.completed && "line-through text-text-muted")}>
                    {goal.title}
                  </p>
                </div>
                
                <div className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider",
                  goal.priority === 'high' ? "bg-[rgba(239,68,68,0.1)] text-danger" :
                  goal.priority === 'medium' ? "bg-[rgba(245,158,11,0.1)] text-warning" :
                  "bg-[rgba(34,197,94,0.1)] text-success"
                )}>
                  {goal.priority}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Wellness Metrics */}
        <section className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-xl font-display font-bold mb-6">Wellness Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Screen Time */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Clock className="w-4 h-4" /> Screen Time
                </label>
                <span className="text-sm font-bold">{metrics.screenTime}h</span>
              </div>
              <input 
                type="range" min="0" max="12" step="0.5"
                value={metrics.screenTime}
                onChange={(e) => updateMetrics({ screenTime: parseFloat(e.target.value) })}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Sleep */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Moon className="w-4 h-4" /> Sleep
                </label>
                <span className="text-sm font-bold">{metrics.sleep}h</span>
              </div>
              <input 
                type="range" min="0" max="12" step="0.5"
                value={metrics.sleep}
                onChange={(e) => updateMetrics({ sleep: parseFloat(e.target.value) })}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Focus */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Target className="w-4 h-4" /> Focus Quality
                </label>
                <span className="text-sm font-bold">{metrics.focus}/10</span>
              </div>
              <input 
                type="range" min="0" max="10" step="1"
                value={metrics.focus}
                onChange={(e) => updateMetrics({ focus: parseInt(e.target.value) })}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Procrastination */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <AlertCircle className="w-4 h-4" /> Procrastination
                </label>
                <span className="text-sm font-bold">{metrics.procrastination}/10</span>
              </div>
              <input 
                type="range" min="0" max="10" step="1"
                value={metrics.procrastination}
                onChange={(e) => updateMetrics({ procrastination: parseInt(e.target.value) })}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            <span className="text-sm font-medium">Had major distractions today?</span>
            <button 
              onClick={() => updateMetrics({ hadDistractions: !metrics.hadDistractions })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative ml-[11px]",
                metrics.hadDistractions ? "bg-danger" : "bg-border"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                metrics.hadDistractions ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </section>
      </div>

      {/* Right Column: Live Score */}
      <div className="order-1 lg:order-2 space-y-8">
        <section 
          id="daily-report-card" 
          className={cn(
            "bg-surface rounded-2xl p-6 border border-border sticky top-28 transition-all duration-300",
            isDownloading ? "p-8 border-[#D4AF3733] shadow-2xl" : ""
          )}
        >
          {/* Branding Header (Visible only when downloading) */}
          {isDownloading && (
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[rgba(42,42,53,0.5)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[rgba(212,175,55,0.2)] flex items-center justify-center text-primary">
                  <Brain className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl text-text-main">Brain Twin</h2>
                  <p className="text-sm text-primary font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Daily Progress Report
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-text-main text-lg">{format(new Date(), 'MMM do, yyyy')}</p>
                <p className="text-sm text-text-muted">Level {level} • {streak} Day Streak</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> {isDownloading ? "Final Score" : "Live Score"}
            </h3>
            {!isDownloading && (
              <button 
                onClick={handleDownload}
                className="p-2 text-text-muted hover:text-primary hover:bg-[rgba(212,175,55,0.1)] rounded-lg transition-colors"
                title="Download Daily Report"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-background" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-primary" strokeWidth="8"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * Math.min(score, 100)) / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-display font-bold text-primary">{score}</span>
                <span className="text-sm text-text-muted mt-1">Points</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Goals Completed</span>
              <span className="text-success font-medium">+{goals.filter(g => g.completed).length * 10}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Focus Bonus</span>
              <span className="text-success font-medium">+{metrics.focus * 2}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Procrastination Penalty</span>
              <span className="text-danger font-medium">-{metrics.procrastination * 2}</span>
            </div>
            {metrics.screenTime > 4 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Screen Time Penalty</span>
                <span className="text-danger font-medium">-{(metrics.screenTime - 4) * 2}</span>
              </div>
            )}
            {(metrics.sleep >= 7 && metrics.sleep <= 9) && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Optimal Sleep</span>
                <span className="text-success font-medium">+10</span>
              </div>
            )}
            {metrics.sleep < 5 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Sleep Deprivation</span>
                <span className="text-danger font-medium">-5</span>
              </div>
            )}
          </div>

          {/* Mini Metrics Summary for Download */}
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
            <div className="bg-background rounded-xl p-3">
              <span className="text-xs text-text-muted block mb-1">Goals</span>
              <span className="font-bold text-lg">{goals.filter(g => g.completed).length}/{goals.length}</span>
            </div>
            <div className="bg-background rounded-xl p-3">
              <span className="text-xs text-text-muted block mb-1">Focus</span>
              <span className="font-bold text-lg">{metrics.focus}/10</span>
            </div>
            <div className="bg-background rounded-xl p-3">
              <span className="text-xs text-text-muted block mb-1">Sleep</span>
              <span className="font-bold text-lg">{metrics.sleep}h</span>
            </div>
            <div className="bg-background rounded-xl p-3">
              <span className="text-xs text-text-muted block mb-1">Screen Time</span>
              <span className="font-bold text-lg">{metrics.screenTime}h</span>
            </div>
          </div>

          {/* Footer Branding */}
          {isDownloading && (
            <div className="mt-8 pt-6 border-t border-[rgba(42,42,53,0.5)] text-center flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-text-muted justify-center">
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">Generated by Brain Twin AI</span>
              </div>
              <span className="text-xs text-[rgba(160,160,171,0.7)]">braintwin.app</span>
            </div>
          )}
        </section>
        {downloadError && (
          <p className="text-sm text-danger">{downloadError}</p>
        )}
      </div>
    </motion.div>
  );
}
