import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function Login() {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Public signup is always Student
  const role = "student";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Watch Firebase login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  // If already logged in, leave the login page
  if (checkingAuth) {
    return (
      <div className="container">
        <h2>Loading AccessResQ...</h2>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        const credential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await setDoc(
          doc(db, "users", credential.user.uid),
          {
            name,
            email,
            role,
            createdAt: serverTimestamp(),
          }
        );
      }

      // onAuthStateChanged will redirect us automatically
    } catch (err) {
      console.error(err);

      if (err.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <div className="formHeader">
        <span className="eyebrow">ACCESSRESQ</span>

        <h1>
          {mode === "login"
            ? "Welcome back."
            : "Create your account."}
        </h1>

        <p>
          Emergency response with safer,
          accessibility-aware routing.
        </p>
      </div>

      <form className="formCard" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <>
            <label>Name</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />

            <label>Account type</label>

            <input
              type="text"
              value="Student"
              disabled
            />
          </>
        )}

        <label>Email</label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
        />

        {error && (
          <div
            style={{
              color: "crimson",
              marginTop: 12,
            }}
          >
            {error}
          </div>
        )}

        <button
          className="primary big"
          type="submit"
          disabled={loading}
          style={{ marginTop: 20 }}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Login"
            : "Create account"}
        </button>

        <button
          type="button"
          className="secondary big"
          onClick={() =>
            setMode(
              mode === "login"
                ? "signup"
                : "login"
            )
          }
          style={{ marginTop: 10 }}
        >
          {mode === "login"
            ? "Create new account"
            : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
}