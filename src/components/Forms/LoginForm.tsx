import React, { useState } from 'react'
import { auth } from '../firebase'
import './Form.css'

const LoginForm = (props: { login: Function, showSignup: Function, showForgotPassword: Function, dismiss: Function }) => {

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
    <form onSubmit={(e) => {login(email, password); e.preventDefault()}}>
      <h2>Login</h2>
      <p>Not registered yet? <button type="button" className="link-button" onClick={() => props.showSignup()}>Click here</button> to Signup</p>
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
        <button className="btn btn-primary" type="submit">Login</button>
        <button className="btn btn-secondary" type="button" onClick={() => props.dismiss()}>Dismiss</button>
      </div>
      <div><button className="btn link-button" onClick={() => props.showForgotPassword()}>Forgot Your Password?</button></div>
    </form>
  )
}

export default LoginForm