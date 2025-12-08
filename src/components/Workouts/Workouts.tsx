import React, { useState } from "react";
import styles from "./Workouts.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faRuler, faBiking, faRunning } from "@fortawesome/free-solid-svg-icons";
import { firebaseApp } from "../firebase";
import {
  getDatabase,
  onValue,
  ref,
  query,
} from "firebase/database";
import { Workout } from "../../types";

const Workouts = (props: { userId: string }) => {
  const db = getDatabase(firebaseApp);
  const [workouts, setWorkouts] = useState<Array<Workout>>([]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined 
    });
  };

  React.useEffect(() => {
    const starCountRef = query(
      ref(db, "users/" + props.userId + "/workouts")
    );
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      const workoutsList: Array<Workout> = [];
      snapshot.forEach((child) => {
        workoutsList.push({
          id: child.key || "",
          name: child.val().name || "No name",
          description: child.val().description,
          updatedAt: new Date(child.val().updatedAt),
          durationType: child.val().durationType,
          sportType: child.val().sportType,
          workoutTime: child.val().workoutTime,
          workoutDistance: child.val().workoutDistance,
        });
      });
      workoutsList.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setWorkouts(workoutsList);
    });

    return () => unsubscribe();
  }, [props.userId, db]);

  return (
    <div className={styles.workouts}>
      <div className={styles.workoutsHeader}>
        <h2>Your workouts</h2>
      </div>
      <div className={styles.workoutsList}>
        {workouts.map((item, index) => (
          <a
            href={`/editor/${item.id}`}
            key={item.id}
            className={styles.workoutItem}
          >
            <div className={styles.workoutSportIcon}>
              <FontAwesomeIcon 
                icon={item.sportType === "run" ? faRunning : faBiking} 
                size="lg" 
                fixedWidth 
              />
            </div>
            <div className={styles.workoutContent}>
              <div className={styles.workoutTitle}>{item.name}</div>
              <div className={styles.workoutMeta}>
                {item.durationType === "time" ? (
                  <>
                    <FontAwesomeIcon icon={faClock} size="sm" fixedWidth />{" "}
                    {item.workoutTime}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faRuler} size="sm" fixedWidth />{" "}
                    {item.workoutDistance}
                  </>
                )}
                <span className={styles.workoutDate}>- {formatDate(item.updatedAt)}</span>
              </div>
            </div>
          </a>
        ))}
        {workouts.length < 1 && <p className={styles.noWorkouts}>No saved workouts yet</p>}
      </div>
    </div>
  );
};

export default Workouts;
