import React, { useState } from "react";
import { firebaseApp } from "../firebase";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import "./Form.css";

const ForgotPasswordForm = (props: {
  workoutId: string;
  dismiss: Function;
}) => {
  const auth = getAuth(firebaseApp);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [disabled, setDisabled] = useState(false);

  function forgotPassword(email: string) {
    sendPasswordResetEmail(auth, email)
      .then(function () {
        setSuccess("We have emailed you a password reset link.");
        setDisabled(true);
        // Email sent.
      })
      .catch(function (error) {
        setError(error.message);
      });
  }

  return (
    <form
      onSubmit={(e) => {
        forgotPassword(email);
        e.preventDefault();
      }}
    >
      <h2>Forgotten Password?</h2>
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
        />
      </div>
      <div className="form-control">
        <button className="btn btn-primary" type="submit" disabled={disabled}>
          Reset Password
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => props.dismiss()}
        >
          Dismiss
        </button>
      </div>
      <div className="success">{success}</div>
    </form>
  );
};

export default ForgotPasswordForm;
