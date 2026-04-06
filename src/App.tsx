import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Today } from './pages/Today';
import { Goals } from './pages/Goals';
import { History } from './pages/History';
import { Rewards } from './pages/Rewards';
import { Insights } from './pages/Insights';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { FirebaseSync } from './components/FirebaseSync';
import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { Loader2 } from 'lucide-react';
const Teams = lazy(() => import('./pages/Teams').then((module) => ({ default: module.Teams })));
const TeamDashboard = lazy(() => import('./pages/TeamDashboard').then((module) => ({ default: module.TeamDashboard })));
import { useStore } from './store/useStore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchTeams = useStore((state) => state.fetchTeams);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTeams().catch(console.error);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchTeams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <FirebaseSync />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Today />} />
          <Route path="goals" element={<Goals />} />
          <Route path="history" element={<History />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="insights" element={<Insights />} />
          <Route path="profile" element={<Profile />} />
          <Route path="teams" element={
            <Suspense fallback={<Loader2 className="animate-spin mx-auto" />}>
              <Teams />
            </Suspense>
          } />
          <Route path="teams/:teamId" element={
            <Suspense fallback={<Loader2 className="animate-spin mx-auto" />}>
              <TeamDashboard />
            </Suspense>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
