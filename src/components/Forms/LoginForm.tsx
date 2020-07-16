import React, { useState } from 'react'
import firebase, { auth } from '../firebase'
import './Form.css'

const LoginForm = (props: { login: Function, showSignup: Function }) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')


  function login(email: string, password: string) {
    auth.signInWithEmailAndPassword(email, password)
      .then((result: { user: any }) => {
        const user = result.user
        props.login(user)
      })
      .catch(error => setError(error.message))
  }

  return (
    <div>
      <h2>Login</h2>
      <p>Not registered yet? <a href="#" onClick={() => props.showSignup()}>Click here</a> to Signup</p>
      <div className="alert">{error}</div>
      <div className="form-control">
        <label htmlFor="email">email</label>
        <input type="email" name="email" value={email} onChange={(e) => {
          setEmail(e.target.value)
          setError('')
        }} />
      </div>
      <div className="form-control">
        <label htmlFor="password">password</label>
        <input type="password" name="password" autoComplete='new-password' value={password} onChange={(e) => {
          setPassword(e.target.value)
          setError('')
        }} />
      </div>
      <div className="form-control">
        <button className="btn btn-primary" type="submit" onClick={() => login(email, password)}>Login</button>
      </div>
    </div>
  )
}

export default LoginForm