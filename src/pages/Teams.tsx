import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Plus, Users, Search, Copy, Users2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

export function Teams() {
  const { fetchTeams, teams, createTeam } = useStore();
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    fetchTeams().catch(console.error);
  }, [fetchTeams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setIsCreating(true);
    try {
      await createTeam(newTeamName);
      setNewTeamName('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    try {
      setJoinError('');
      await useStore.getState().joinTeam(codeInput);
      setCodeInput('');
    } catch (error: any) {
      console.error(error);
      setJoinError(error?.message || 'Failed to join team');
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Failed to copy team code', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">Teams</h2>
          <p className="text-text-muted mt-2">Collaborate with friends on productivity challenges.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Team */}
        <motion.section 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-surface rounded-2xl p-8 border border-border"
        >
          <Users className="w-12 h-12 text-primary mx-auto mb-6 p-3 bg-[rgba(212,175,55,0.1)] rounded-2xl" />
          <h3 className="text-2xl font-display font-bold text-center mb-4">Create Team</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team Name (e.g., Code Crushers)"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:border-primary"
            />
            <button 
              type="submit" 
              disabled={isCreating || !newTeamName.trim()}
              className="w-full bg-primary text-background rounded-xl py-3 font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create & Join'}
            </button>
          </form>
        </motion.section>

        {/* Join Team */}
        <motion.section 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl p-8 border border-border"
        >
          <Users2 className="w-12 h-12 text-primary mx-auto mb-6 p-3 bg-[rgba(212,175,55,0.1)] rounded-2xl" />
          <h3 className="text-2xl font-display font-bold text-center mb-4">Join Team</h3>
          <p className="text-text-muted text-center mb-6 text-sm">Ask team owner for code</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter team code"
                className="w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-main focus:border-primary"
              />
            </div>
            <button 
              type="submit" 
              disabled={!codeInput.trim()}
              className="w-full bg-primary text-background rounded-xl py-3 font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              Join Team
            </button>
            {joinError && (
              <p className="text-sm text-danger text-center">{joinError}</p>
            )}
          </form>
        </motion.section>
      </div>

      {/* Teams List */}
      {teams.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-2xl font-display font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Your Teams ({teams.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <motion.div 
                key={team.id}
                className="bg-surface-hover p-6 rounded-2xl border border-border hover:border-primary group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-display font-bold text-xl truncate flex-1">{team.name}</h4>
                <button className="p-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-all" onClick={() => useStore.getState().leaveTeam(team.id)}>
                  <X className="w-4 h-4" />
                </button>
                </div>
                <p className="text-text-muted text-sm mb-4">{team.members.length} members</p>
                <div className="flex items-center gap-2 text-xs bg-background px-3 py-1 rounded-full">
                  Code: <span className="font-mono font-bold text-primary">{team.code}</span>
                  <button type="button" className="ml-1 p-1 hover:bg-primary text-primary-hover rounded-full" onClick={() => handleCopyCode(team.code)}>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

