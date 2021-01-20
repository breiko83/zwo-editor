import firebase from './firebase';

interface WorkoutMetadata {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  sportType: string;
  durationType: string;
  workoutTime: string;
  workoutDistance: string;
}

export async function remove(user: firebase.User, id: string): Promise<void> {
  return firebase.database().ref().update({
    [`users/${user.uid}/workouts/${id}`]: null
  });
}

export async function update(user: firebase.User, {id, ...workout}: WorkoutMetadata): Promise<void> {
  return firebase.database().ref().update({
    [`users/${user.uid}/workouts/${id}`]: workout
  });
}
