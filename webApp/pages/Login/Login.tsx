import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      navigate("/Home");
    }
  }, [navigate]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (!isValidEmail(value)) {
      setError("Please enter a valid email address.");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!email || !password) {
      setError("Username or password is incorrect.");
      return;
    }

    setError("");

    const loginData = { email, password };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data._id);
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);
      localStorage.setItem("email", data.email);
      localStorage.setItem("picture", data.picture);

      navigate("/Home");
    } catch (error) {
      setError("Login failed. Please check your credentials.");
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logInWithGoogle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: credentialResponse.credential,
            password: Math.random().toString(36).slice(-8),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Google login failed");
      }

      const data = await response.json();

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("firstName", data.user.firstName);
      localStorage.setItem("lastName", data.user.lastName);

      navigate("/Home");
    } catch (error) {
      console.error("Error:", error);
      setError("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <h2 className={styles.title}>Go Electric</h2>
        <p className={styles.subtitle}>Please log in to continue</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your email"
            className={styles.input}
            value={email}
            onChange={handleEmailChange}
          />
          <input
            type="password"
            placeholder="Enter your password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.button} type="submit">
            Login
          </button>
          <p
            className={`${styles.error} ${
              error ? styles.visible : styles.hidden
            }`}
          >
            {error || " "}
          </p>
        </form>

        <div className={styles.googleLogin}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>

        <div className={styles.linkContainer}>
          <p>Don’t have an account?</p>
          <Link to="/signup" className={styles.link}>
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
