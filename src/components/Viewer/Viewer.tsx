import React, { useState } from 'react'
import './Viewer.css'
import firebase, { auth } from '../firebase'
import {RouteComponentProps} from 'react-router-dom';
import Editor from '../Editor/Editor'

type TParams = { id: string };

const Viewer = ({ match }: RouteComponentProps<TParams>) => {

  const id = match.params.id
  const [workout, setWorkout] = useState([])
  const [instructions, setInstructions] = useState([])
  const [name, setName] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')


  React.useEffect(() => {
    console.log('once');
    
    firebase.database().ref('workouts/' + id).once('value').then(function(snapshot) {      
      setWorkout(snapshot.val().workout)
      setInstructions(snapshot.val().instructions)
      setName(snapshot.val().name)
      setAuthor(snapshot.val().author)
      setDescription(snapshot.val().description)
    })

  },[id])

  return (
    <div className="container">   
      {name}   
      <Editor id={id} bars={workout} instructions={instructions} name={name} author={author} description={description} />
    </div>
  )
}

export default Viewer