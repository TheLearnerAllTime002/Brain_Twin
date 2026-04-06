import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore, Team } from '../store/useStore';
import { Users, Crown, ArrowLeft, Share2, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export function TeamDashboard() {
  const { teamId } = useParams<{ teamId: string }>();
  const { teams, fetchTeams, setCurrentTeam } = useStore();
  const team = teams.find(t => t.id === teamId) as Team | undefined;

  useEffect(() => {
    fetchTeams();
    if (team) setCurrentTeam(team.id);
  }, [teamId, fetchTeams, setCurrentTeam]);

  if (!team) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-center">
        <Users className="w-16 h-16 text-text-muted mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Team Not Found</h2>
        <p className="text-text-muted mb-8">This team doesn't exist or you don't have access.</p>
        <Link to="/teams" className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-xl font-medium hover:bg-primary-hover">
          <ArrowLeft className="w-4 h-4" />
          Back to Teams
        </Link>
      </motion.div>
    );
  }

  const code = team.code;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[rgba(212,175,55,0.2)] rounded-2xl flex items-center justify-center p-2">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">{team.name}</h1>
              <p className="text-text-muted">Team Code: <code className="font-mono bg-background px-2 py-1 rounded text-sm">{code}</code></p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-xl font-medium hover:bg-primary-hover">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members */}
        <section className="lg:col-span-2 bg-surface rounded-2xl p-8 border border-border">
          <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Members ({team.members.length})
          </h3>
          <div className="space-y-3">
            {team.members.map((memberId, index) => (
              <div key={memberId} className="flex items-center justify-between p-4 bg-background rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[rgba(212,175,55,0.2)] rounded-2xl flex items-center justify-center font-bold text-primary text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">Member {memberId.slice(-6)}</p>
                    <p className="text-text-muted text-sm">Streak: -- | Score: --</p>
                  </div>
                </div>
                {index === 0 && <Crown className="w-6 h-6 text-warning" />}
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="space-y-4">
          <div className="bg-surface p-6 rounded-2xl border border-border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-8 h-8 text-warning" />
              <span className="text-2xl font-display font-bold">Leaderboard</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Team Avg Score</span>
                <span>--</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Longest Streak</span>
                <span>--</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden mt-4">
                <div className="h-full bg-warning w-3/4 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border">
            <div className="text-center mb-6">
              <TrendingUp className="w-12 h-12 mx-auto text-primary mb-3" />
              <h4 className="font-display font-bold">Weekly Trends</h4>
            </div>
            <div className="h-32 bg-gradient-to-r from-primary/10 to-warning/10 rounded-xl flex items-center justify-center">
              <p className="text-text-muted text-sm">Coming soon...</p>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

