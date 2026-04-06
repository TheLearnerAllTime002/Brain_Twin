import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, storage } from '../firebase';
import { updateProfile, onAuthStateChanged, User } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Camera, Save, Loader2, Mail, BadgeCheck, Users, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useStore();
  const currentTeam = store.currentTeam;
  const myTeams = store.myTeams;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || '');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    store.fetchTeams().catch(console.error);
  }, [store]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage('');

    try {
      await updateProfile(user, {
        displayName: displayName
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsSaving(true);
    setMessage('Uploading image...');

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `profile_pictures/${user.uid}/${Date.now()}-${sanitizedName}`);
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
      });
      const url = await getDownloadURL(uploadResult.ref);
      
      await updateProfile(user, {
        photoURL: url
      });
      
      setPhotoURL(url);
      setMessage('Profile picture updated!');
      e.target.value = '';
    } catch (error: any) {
      console.error("Error uploading image", error);
      const errorCode = error?.code ? ` (${error.code})` : '';
      setMessage(`Failed to upload image${errorCode}.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h2 className="text-3xl font-display font-bold">Profile</h2>
        <p className="text-text-muted mt-2">A compact snapshot of your Brain Twin identity.</p>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_28%)]" />
        <div className="relative grid gap-6 p-5 md:grid-cols-[auto_1fr] md:items-center md:p-6">
          <div className="flex justify-center md:justify-start">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[26px] border border-[rgba(212,175,55,0.28)] bg-[linear-gradient(145deg,rgba(212,175,55,0.18),rgba(255,255,255,0.03))] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.25)] bg-background text-primary shadow-lg transition-transform hover:scale-105"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.16)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Account Summary
                </div>
                <h3 className="mt-3 truncate text-2xl font-display font-bold text-text-main">
                  {displayName || user.displayName || 'Set your display name'}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-text-muted">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-[220px]">
                <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Status</p>
                  <p className="mt-2 text-sm font-semibold text-text-main">Synced</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Photo</p>
                  <p className="mt-2 text-sm font-semibold text-text-main">{photoURL ? 'Custom' : 'Initials'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-[0.18em] text-text-muted">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-text-main transition-colors focus:border-primary focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-medium text-background transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save
              </button>
            </form>

            {message && (
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm",
                message.includes('Failed') ? "bg-[rgba(239,68,68,0.1)] text-danger" : "bg-[rgba(34,197,94,0.1)] text-success"
              )}>
                {message}
              </div>
            )}

            <p className="text-xs leading-relaxed text-text-muted">
              Upload a square photo for the cleanest crop. Your image is stored inside your own Firebase Storage folder.
            </p>

            {/* Teams Section */}
            <section className="space-y-4 pt-8 border-t border-border">
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                Teams
              </h3>
              <div className="space-y-3">
                {myTeams.length === 0 ? (
                    <div className="text-center py-8 bg-background rounded-2xl border-2 border-dashed border-border">
                      <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <p className="text-text-muted mb-4">No teams yet</p>
                      <Link to="/teams" className="inline-flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-xl font-medium hover:bg-primary-hover">
                        Create or Join Team
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                ) : (
                  <div>
                    {currentTeam && (
                      <div className="bg-gradient-to-r from-primary/5 to-warning/5 p-6 rounded-2xl border border-primary/20 mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{currentTeam.name}</p>
                            <p className="text-sm text-text-muted">{currentTeam.members.length} members</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Link to={`/teams/${currentTeam.id}`} className="flex-1 bg-primary text-background py-2 px-4 rounded-lg text-center font-medium">
                            View Dashboard
                          </Link>
                          <button
                            type="button"
                            className="flex-1 border border-border py-2 px-4 rounded-lg hover:bg-surface text-text-muted"
                            onClick={() => store.leaveTeam(currentTeam.id)}
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    )}
                    <Link to="/teams" className="w-full block bg-background border border-border py-4 px-6 rounded-2xl text-center font-medium hover:border-primary transition-colors">
                      Manage Teams ({myTeams.length})
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
