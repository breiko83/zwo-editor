import firebase from './firebase';

export interface WorkoutMetadata {
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

export async function fetchAll(userId: string): Promise<WorkoutMetadata[]> {
  const snapshot = await firebase.database().ref('users/' + userId + '/workouts').orderByChild('name').once('value');

  const workouts: WorkoutMetadata[] = [];

  snapshot.forEach(child => {
    workouts.push({
      id: child.key || "",
      name: child.val().name || "No name",
      description: child.val().description,
      updatedAt: child.val().updatedAt,
      sportType: child.val().sportType,
      durationType: child.val().durationType,
      workoutTime: child.val().workoutTime,
      workoutDistance: child.val().workoutDistance
    });
  });

  return workouts;
}