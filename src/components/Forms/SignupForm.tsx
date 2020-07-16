import React, { useState } from 'react'
import firebase, { auth } from '../firebase'
import './Form.css'

const SignupForm = (props: {signUp: Function, showLogin: Function}) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function signUp(email: string, password: string) {
    auth.createUserWithEmailAndPassword(email, password)
      .then((result: { user: any }) => {
        const user = result.user
        props.signUp(user)
      })
      .catch(error => setError(error.message))
  }

  return (
    <div>
      <h2>SignUp</h2>
      <p>Already have and account? <a href="#" onClick={() => props.showLogin()}>Click here</a> to Login</p>
      <div className="alert">{error}</div>
      <div className="form-control">
        <label htmlFor="email">email</label>
        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-control">
        <label htmlFor="password">password</label>
        <input type="password" name="password" autoComplete='new-password' value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="form-control">
        <button className='btn btn-primary' onClick={() => signUp(email, password)}>Signup</button>
      </div>
    </div>
  )
}

export default SignupForm