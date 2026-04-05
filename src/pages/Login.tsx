import { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, LogIn, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

export function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 bg-[rgba(212,175,55,0.2)] rounded-full flex items-center justify-center mb-6">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-text-main mb-2">Brain Twin</h1>
        <p className="text-text-muted mb-8">Your AI-powered productivity and wellness coach.</p>

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-primary text-background font-medium hover:bg-primary-hover transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
          <span className="text-lg">{isLoggingIn ? 'Signing in...' : 'Sign In with Google'}</span>
        </button>

        {error && (
          <p className="mt-4 text-sm text-danger">{error}</p>
        )}
      </motion.div>
    </div>
  );
}
