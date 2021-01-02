import React, { useState } from 'react'
import './Viewer.css'
import firebase from '../../network/firebase'
import {RouteComponentProps} from 'react-router-dom';

type TParams = { id: string };

const Viewer = ({ match }: RouteComponentProps<TParams>) => {

  const id = match.params.id
  const [workout, setWorkout] = useState()

  React.useEffect(() => {
    firebase.database().ref('workouts/' + id).once('value').then(function(snapshot) {
      setWorkout(snapshot.val().author)
    })
  })

  return (
    <div className="container">      
      {workout}
    </div>
  )
}

export default Viewer