import React, { useState } from 'react'
import './Workouts.css'
import firebase from '../firebase'
import { RouteComponentProps } from 'react-router-dom';
import { CloudWatchLogs, WorkDocs } from 'aws-sdk';

interface Workout {
  id: string,
  name: string,
  description: string,
  updatedAt: string
}

type TParams = { id: string };

const Workouts = (props: {userId: string} ) => {
  
  const [workouts, setWorkouts] = useState<Array<Workout>>([])

  React.useEffect(() => {

    firebase.database().ref('users/' + props.userId + '/workouts').orderByChild('name').once('value').then(function (snapshot) {
      snapshot.forEach(child => {
        setWorkouts(workouts => [...workouts, {
          id: child.key || "",
          name: child.val().name || "No name",
          description: child.val().description,
          updatedAt: child.val().name.updatedAt
        }
        ])
      });
    })
  }, [])

  return (
    <div>
      <h2>Your workouts</h2>
    <div className="workouts">
      {workouts.map(item => (
        <a href={`/editor/${item.id}`} key={item.id}>
          {item.name}
        </a>
      ))
      }
      {workouts.length < 1 &&
        <p>No saved workouts yet</p>
      } 
    </div>
    </div>
  )
}

export default Workouts