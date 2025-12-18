import { useEffect } from 'react';
import { getDatabase, onValue, ref, update } from 'firebase/database';
import { getAuth, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { firebaseApp } from '../../firebase';
import { BarType, Instruction, SportType, DurationType } from '../../../types/workout';
import { Message } from '../../../types/ui';
import helpers from '../../helpers';
import Bugsnag from "@bugsnag/js";
import { sanitizeWorkoutData } from '../../../utils/sanitize';

interface FirebaseSyncProps {
  id: string;
  setAuthor: (author: string) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setBars: (bars: BarType[]) => void;
  setInstructions: (instructions: Instruction[]) => void;
  setTags: (tags: string[]) => void;
  setDurationType: (durationType: DurationType) => void;
  setSportType: (sportType: SportType) => void;
  setMessage: (message: Message) => void;
  setUser: (user: FirebaseUser | null) => void;
}

/**
 * Custom hook for Firebase synchronization
 */
export const useFirebaseSync = ({
  id,
  setAuthor,
  setName,
  setDescription,
  setBars,
  setInstructions,
  setTags,
  setDurationType,
  setSportType,
  setMessage,
  setUser,
}: FirebaseSyncProps) => {
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

  useEffect(() => {
    setMessage({ visible: true, class: 'loading', text: 'Loading..' });

    const starCountRef = ref(db, 'workouts/' + id);
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      if (snapshot.val()) {
        // Workout exists on server
        setAuthor(snapshot.val().author);
        setName(snapshot.val().name);
        setDescription(snapshot.val().description);
        setBars(snapshot.val().workout || []);
        setInstructions(snapshot.val().instructions || []);
        setTags(snapshot.val().tags || []);
        setDurationType(snapshot.val().durationType);
        setSportType(snapshot.val().sportType);

        localStorage.setItem('id', id);
      } else {
        // Workout doesn't exist on cloud
        if (id === localStorage.getItem('id')) {
          // User refreshed the page
        } else {
          // Treat this as new workout
          setBars([]);
          setInstructions([]);
          setName('');
          setDescription('');
          setAuthor('');
          setTags([]);
        }

        localStorage.setItem('id', id);
      }
      // Finished loading
      setMessage({ visible: false });
    });

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    window.history.replaceState('', '', `/editor/${id}`);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      if (typeof authUnsubscribe === 'function') {
        authUnsubscribe();
      }
    };
  }, [id, db, auth, setAuthor, setName, setDescription, setBars, setInstructions, setTags, setDurationType, setSportType, setMessage, setUser]);

  const saveWorkout = async (
    user: FirebaseUser | null,
    author: string,
    name: string,
    description: string,
    sportType: SportType,
    durationType: DurationType,
    tags: string[],
    bars: BarType[],
    instructions: Instruction[]
  ): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to save');
    }

    setMessage({ visible: true, class: 'loading', text: 'Saving..' });

    const item = {
      id: id,
      name: name,
      description: description,
      author: author,
      workout: bars,
      tags: tags,
      instructions: instructions,
      userId: user.uid,
      updatedAt: Date(),
      sportType: sportType,
      durationType: durationType,
    };

    const item2 = {
      name: name,
      description: description,
      updatedAt: Date(),
      sportType: sportType,
      durationType: durationType,
      workoutTime: helpers.formatDuration(
        helpers.getWorkoutLength(bars)
      ),
      workoutDistance: durationType === 'distance' ? helpers.getWorkoutDistance(bars) : 0,
    };

    const updates: any = {};
    updates[`users/${user.uid}/workouts/${id}`] = sanitizeWorkoutData(item2);
    updates[`workouts/${id}`] = sanitizeWorkoutData(item);

    try {
      await update(ref(db), updates);
      setMessage({
        visible: true,
        class: 'success',
        text: 'Workout saved!',
      });
    } catch (error) {
      console.error(error, updates);
      Bugsnag.notify(error as Error, (event) => {
        event.addMetadata('workout', updates);
      });
      setMessage({
        visible: true,
        class: 'error',
        text: 'Cannot save workout',
      });
    }
  };

  const deleteWorkout = async (user: FirebaseUser | null, onSuccess: () => void): Promise<void> => {
    if (!user) {
      return;
    }

    const updates: any = {};
    updates[`users/${user.uid}/workouts/${id}`] = null;
    updates[`workouts/${id}`] = null;

    try {
      await update(ref(db), updates);
      onSuccess();
    } catch (error) {
      console.error(error);
      Bugsnag.notify(error as Error);
      setMessage({
        visible: true,
        class: 'error',
        text: 'Cannot delete workout',
      });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error(error);
      Bugsnag.notify(error as Error);
    }
  };

  return {
    saveWorkout,
    deleteWorkout,
    logout,
  };
};
