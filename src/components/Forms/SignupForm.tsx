import React, { useState } from "react";
import { firebaseApp } from "../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import "./Form.css";

const SignupForm = (props: {
  signUp: Function;
  showLogin: Function;
  dismiss: Function;
}) => {
  const auth = getAuth(firebaseApp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function signUp(email: string, password: string) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((result: { user: any }) => {
        const user = result.user;
        props.signUp(user);
      })
      .catch((error) => setError(error.message));
  }

  return (
    <form
      onSubmit={(e) => {
        signUp(email, password);
        e.preventDefault();
      }}
    >
      <h2>SignUp</h2>
      <p>
        Already have an account?{" "}
        <button
          type="button"
          className="link-button"
          onClick={() => props.showLogin()}
        >
          Click here
        </button>{" "}
        to Login
      </p>
      <div className="alert">{error}</div>
      <div className="form-control">
        <label htmlFor="email">email</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          required
        />
      </div>
      <div className="form-control">
        <label htmlFor="password">password</label>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          required
        />
      </div>
      <div className="form-control">
        <button className="btn btn-primary" type="submit">
          Signup
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => props.dismiss()}
        >
          Dismiss
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
