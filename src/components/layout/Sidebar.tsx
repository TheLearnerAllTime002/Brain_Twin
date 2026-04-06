import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, History, Trophy, Lightbulb, Users, LogOut, LogIn, Flame, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import { auth, signInWithGoogle, logOut } from '../../firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

const NAV_ITEMS = [
  { name: 'Today', path: '/', icon: LayoutDashboard },
  { name: 'My Goals', path: '/goals', icon: Target },
  { name: 'History', path: '/history', icon: History },
  { name: 'Rewards', path: '/rewards', icon: Trophy },
  { name: 'Insights', path: '/insights', icon: Lightbulb },
  { name: 'Teams', path: '/teams', icon: Users },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const streak = useStore((state) => state.streak);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login failed", error);
      setLoginError(error.message || 'Failed to sign in');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <aside className="w-64 h-screen bg-surface border-r border-border flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.2)] flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
          </div>
          Brain Twin
        </h1>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 -mr-2 text-text-muted hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-[rgba(212,175,55,0.1)] text-primary font-medium" 
                  : "text-text-muted hover:bg-surface-hover hover:text-text-main"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-text-muted group-hover:text-text-main")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-background rounded-xl p-4 mb-4 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-warning" />
            <span className="font-medium text-sm">Current Streak</span>
          </div>
          <span className="font-bold font-display text-lg">{streak}</span>
        </div>
        
        {user ? (
          <div className="space-y-4">
            <Link 
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-2 cursor-pointer hover:bg-surface-hover p-2 rounded-xl transition-colors"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.2)] flex items-center justify-center text-primary font-bold">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-text-muted truncate">View Profile</p>
              </div>
            </Link>
            <button 
              onClick={logOut}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-muted hover:bg-surface-hover hover:text-danger transition-colors group"
            >
              <LogOut className="w-5 h-5 group-hover:text-danger" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl bg-primary text-background font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              <span>{isLoggingIn ? 'Signing in...' : 'Sign In with Google'}</span>
            </button>
            {loginError && (
              <p className="text-xs text-danger text-center">{loginError}</p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

