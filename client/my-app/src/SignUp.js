import React, { useState } from "react";
import axios from "axios";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignUp = () => {
    // Perform validation checks here if needed
    const userData = {
      name: name,
      email: email,
      password: password,
    };

    // Replace 'YOUR_SIGNUP_API_ENDPOINT' with your Django backend's sign-up API endpoint
    axios
      .post("http://127.0.0.1:8000/api/signup/", userData)
      .then((response) => {
        setSuccessMessage("Sign-up successful!");
        setError("");
        // Clear form fields after successful sign-up
        setName("");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        setError("Sign-up failed. Please try again.");
        setSuccessMessage("");
        console.error("Sign-up failed!", error.response.data);
      });
  };

  return (
    <div className="signup-form">
      <h2>Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default SignUp;
