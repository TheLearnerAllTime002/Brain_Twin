import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { RefreshCw, CheckCircle2, Menu } from 'lucide-react';

const QUOTES = [
  "Discipline equals freedom.",
  "Win the morning, win the day.",
  "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
  "Focus on the step in front of you, not the whole staircase.",
  "What gets measured gets managed.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "The secret of your future is hidden in your daily routine."
];

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { resetDay, endDay, hasCompletedToday } = useStore();
  const today = format(new Date(), 'EEEE, MMMM do');
  const dayOfYear = format(new Date(), 'DDD');
  const quote = QUOTES[parseInt(dayOfYear) % QUOTES.length];
  const completedToday = hasCompletedToday();

  return (
    <header className="h-20 border-b border-border bg-[rgba(11,11,15,0.8)] backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-main rounded-lg hover:bg-surface"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="min-w-0">
          <h2 className="text-lg md:text-xl lg:text-2xl font-display font-bold text-text-main truncate">{today}</h2>
          <p className="text-xs md:text-sm text-text-muted mt-1 hidden lg:block truncate">"{quote}"</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <button 
          onClick={resetDay}
          disabled={completedToday}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-muted disabled:hover:bg-transparent"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
        <button 
          onClick={endDay}
          disabled={completedToday}
          className="flex items-center gap-2 px-4 py-2 md:px-5 lg:px-6 md:py-2.5 rounded-lg text-sm font-medium bg-primary text-background hover:bg-primary-hover transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="hidden lg:inline">{completedToday ? 'Day Completed' : 'End Day & Score'}</span>
          <span className="lg:hidden">{completedToday ? 'Completed' : 'End Day'}</span>
        </button>
      </div>
    </header>
  );
}
