import React, { useState } from "react";
import "./Viewer.css";
import { firebaseApp } from "../firebase";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { RouteComponentProps } from "react-router-dom";

type TParams = { id: string };

const Viewer = ({ match }: RouteComponentProps<TParams>) => {
  const db = getDatabase(firebaseApp);
  const id = match.params.id;
  const [workout, setWorkout] = useState();

  React.useEffect(() => {
    const starCountRef = ref(db, "workouts/" + id);
    onValue(starCountRef, (snapshot) => {
      setWorkout(snapshot.val().author);
    });
  });

  return <div className="container">{workout}</div>;
};

export default Viewer;
