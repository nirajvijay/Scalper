import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Perform validation checks here if needed
    const userData = {
      email: email,
      password: password,
    };

    // Replace 'YOUR_SIGNIN_API_ENDPOINT' with your Django backend's sign-in API endpoint
    axios
      .post("http://127.0.0.1:8000/api/signin/", userData)
      .then((response) => {
        setSuccessMessage("Sign-in successful!");
        setError("");
        // Clear form fields after successful sign-in
        setEmail("");
        setPassword("");
        // Redirect to /home on successful sign-in
        navigate("/home");
      })
      .catch((error) => {
        setError("Sign-in failed. Please check your credentials.");
        setSuccessMessage("");
        console.error("Sign-in failed!", error.response.data);
      });
  };

  return (
    <div className="signin-form">
      <h2>Sign In</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
};

export default SignIn;
