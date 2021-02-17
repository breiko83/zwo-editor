import React, { useState } from "react";
import { useLocation } from "react-router";
import { auth } from "../firebase";
import "./Form.css";

const UpdatePasswordForm = (props: { dismiss: Function }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [disabled, setDisabled] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get("oobCode") || '';

  function resetPassword(code: string, password: string) {
    auth
      .confirmPasswordReset(code, password)
      .then(function () {
        setSuccess("Your password has been updated");
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
        setError('');
        
        if(password === confirmPassword)
          resetPassword(code, password);
        else
          setError('Passwords do not match');

        e.preventDefault();
      }}
    >
      <h2>Reset Your Password</h2>
      <div className="alert">{error}</div>
      <div className="form-control">
        <label htmlFor="password">New password</label>
        <input type="password" name="password" autoComplete='new-password' value={password} onChange={(e) => {
          setPassword(e.target.value)
          setError('')
        }} />
      </div>
      <div className="form-control">
        <label htmlFor="password">Confirm password</label>
        <input type="password" name="confirmPassword" autoComplete='new-password' value={confirmPassword} onChange={(e) => {
          setConfirmPassword(e.target.value)
          setError('')
        }} />
      </div>
      <div className="form-control">
        <button className="btn btn-primary" type="submit" disabled={disabled}>
          Update Password
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

export default UpdatePasswordForm;
