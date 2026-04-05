import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useStore } from '../store/useStore';

export function FirebaseSync() {
  const { 
    goals, metrics, xp, level, streak, history, 
    addGoal, toggleGoal, deleteGoal, updateMetrics, endDay, resetDay, clearStore
  } = useStore();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile
        const userRef = doc(db, 'users', user.uid);
        
        // We use onSnapshot to listen to changes
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            useStore.setState({
              xp: data.xp || 0,
              level: data.level || 1,
              streak: data.streak || 0,
            });
          } else {
            // Create initial profile
            setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              xp: 0,
              level: 1,
              streak: 0,
              createdAt: serverTimestamp()
            });
          }
        });

        // Sync Goals
        const goalsRef = collection(db, 'users', user.uid, 'goals');
        const unsubGoals = onSnapshot(goalsRef, (snapshot) => {
          const fetchedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          useStore.setState({ goals: fetchedGoals });
        });

        // Sync Metrics
        const metricsRef = doc(db, 'users', user.uid, 'metrics', 'today');
        const unsubMetrics = onSnapshot(metricsRef, (docSnap) => {
          if (docSnap.exists()) {
            useStore.setState({ metrics: docSnap.data() as any });
          } else {
            setDoc(metricsRef, {
              screenTime: 0,
              sleep: 0,
              procrastination: 0,
              focus: 0,
              hadDistractions: false,
              notes: '',
              updatedAt: serverTimestamp()
            });
          }
        });

        // Sync History
        const historyRef = collection(db, 'users', user.uid, 'history');
        const unsubHistory = onSnapshot(historyRef, (snapshot) => {
          const fetchedHistory = snapshot.docs.map(doc => doc.data() as any);
          useStore.setState({ history: fetchedHistory });
        });

        setIsInitialized(true);

        return () => {
          unsubProfile();
          unsubGoals();
          unsubMetrics();
          unsubHistory();
        };
      } else {
        clearStore();
        setIsInitialized(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
