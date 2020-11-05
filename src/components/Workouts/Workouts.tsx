import React, { useState } from 'react'
import './Workouts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faRuler } from '@fortawesome/free-solid-svg-icons'
import firebase from '../firebase'

interface Workout {
  id: string,
  name: string,
  description: string,
  updatedAt: string,
  durationType: string,
  workoutTime: string,
  workoutDistance: string
}

const Workouts = (props: { userId: string }) => {

  const [workouts, setWorkouts] = useState<Array<Workout>>([])

  React.useEffect(() => {

    firebase.database().ref('users/' + props.userId + '/workouts').orderByChild('name').once('value').then(function (snapshot) {
      snapshot.forEach(child => {
        setWorkouts(workouts => [...workouts, {
          id: child.key || "",
          name: child.val().name || "No name",
          description: child.val().description,
          updatedAt: child.val().updatedAt,
          durationType: child.val().durationType,
          workoutTime: child.val().workoutTime,
          workoutDistance: child.val().workoutDistance
        }
        ])
      });
    })
  }, [props.userId])

  return (
    <div className="workouts">
      <h2 className="title">Your workouts</h2>
      {workouts.map((item, index) => (
        <a href={`/editor/${item.id}`} key={item.id} style={index % 2 == 0 ? { backgroundColor: '#DCDCDC' } : { backgroundColor: '#C8C8C8' }}>
          <div className="title">{item.name}</div>
          {item.durationType === 'time' ?
            <div className="description"><FontAwesomeIcon icon={faClock} size="sm" fixedWidth /> {item.workoutTime}</div>
            :
            <div className="description"><FontAwesomeIcon icon={faRuler} size="sm" fixedWidth /> {item.workoutDistance}</div>
          }
        </a>
      ))
      }
      {workouts.length < 1 &&
        <p>No saved workouts yet</p>
      }
    </div>
  )
}

export default Workouts