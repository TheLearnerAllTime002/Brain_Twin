import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useStore } from '../store/useStore';

export function FirebaseSync() {
  const clearStore = useStore(state => state.clearStore);

  useEffect(() => {
    let cleanupFirestoreListeners: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      cleanupFirestoreListeners?.();
      cleanupFirestoreListeners = undefined;

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const metricsRef = doc(db, 'users', user.uid, 'metrics', 'today');

        try {
          const [userSnap, metricsSnap] = await Promise.all([
            getDoc(userRef),
            getDoc(metricsRef)
          ]);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email ?? '',
              xp: 0,
              level: 1,
              streak: 0,
              createdAt: serverTimestamp()
            });
          }

          if (!metricsSnap.exists()) {
            await setDoc(metricsRef, {
              screenTime: 0,
              sleep: 0,
              procrastination: 0,
              focus: 0,
              hadDistractions: false,
              notes: '',
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error('Error initializing Firestore user data', error);
        }

        const handleSnapshotError = (label: string) => (error: unknown) => {
          console.error(`Error syncing ${label}`, error);
        };

        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            useStore.setState({
              xp: data.xp || 0,
              level: data.level || 1,
              streak: data.streak || 0,
            });
          }
        }, handleSnapshotError('profile'));

        const goalsRef = collection(db, 'users', user.uid, 'goals');
        const unsubGoals = onSnapshot(goalsRef, (snapshot) => {
          const fetchedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          useStore.setState({ goals: fetchedGoals });
        }, handleSnapshotError('goals'));

        const unsubMetrics = onSnapshot(metricsRef, (docSnap) => {
          if (docSnap.exists()) {
            useStore.setState({ metrics: docSnap.data() as any });
          }
        }, handleSnapshotError('metrics'));

        const historyRef = collection(db, 'users', user.uid, 'history');
        const unsubHistory = onSnapshot(historyRef, (snapshot) => {
          const fetchedHistory = snapshot.docs.map(doc => doc.data() as any);
          useStore.setState({ history: fetchedHistory });
        }, handleSnapshotError('history'));

        cleanupFirestoreListeners = () => {
          unsubProfile();
          unsubGoals();
          unsubMetrics();
          unsubHistory();
        };
      } else {
        clearStore();
      }
    });

    return () => {
      cleanupFirestoreListeners?.();
      unsubscribe();
    };
  }, [clearStore]);

  return null;
}
