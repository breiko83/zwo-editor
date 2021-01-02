import firebase from "firebase";
import { Workout } from "../types/Workout";

export default async function loadFirebaseWorkout(db: firebase.database.Database, id: string): Promise<Workout | undefined> {
  const snapshot = await db.ref('workouts/' + id).once('value');

  if (!snapshot.val()) {
    return undefined;
  }

  return {
    author: (snapshot.val().author),
    name: (snapshot.val().name),
    description: (snapshot.val().description),
    intervals: (snapshot.val().workout || []),
    instructions: (snapshot.val().instructions || []),
    tags: (snapshot.val().tags || []),
    sportType: (snapshot.val().sportType),
  };
}
