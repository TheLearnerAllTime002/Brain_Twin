import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, storage } from '../firebase';
import { updateProfile, onAuthStateChanged, User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Save, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await updateProfile(user, {
        photoURL: url
      });
      
      setPhotoURL(url);
      setMessage('Profile picture updated!');
    } catch (error) {
      console.error("Error uploading image", error);
      setMessage('Failed to upload image.');
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
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-3xl font-display font-bold">Profile Settings</h2>
        <p className="text-text-muted mt-2">Manage your account and personal details.</p>
      </div>

      <div className="bg-surface p-8 rounded-2xl border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-hover bg-[rgba(212,175,55,0.2)] flex items-center justify-center">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-4xl font-bold text-primary">{displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-3 bg-primary text-background rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <p className="text-sm text-text-muted mt-4">{user.email}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your name"
            />
          </div>

          {message && (
            <div className={cn(
              "p-4 rounded-xl text-sm",
              message.includes('Failed') ? "bg-[rgba(239,68,68,0.1)] text-danger" : "bg-[rgba(34,197,94,0.1)] text-success"
            )}>
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
