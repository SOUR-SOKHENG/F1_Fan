import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../lib/firebase";
import "../Css/Auth.css";

const initialForm = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
};

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const cleanUsername = (username) => {
    return username.trim().replace(/^#/, "").toLowerCase();
  };

  const registerUser = async () => {
    const username = cleanUsername(form.username);

    if (!/^[a-z0-9_]{4,20}$/.test(username)) {
      throw new Error(
        "Username must contain 4–20 letters, numbers, or underscores.",
      );
    }

    if (form.password !== form.confirmPassword) {
      throw new Error("The passwords do not match.");
    }

    const usernameReference = doc(db, "usernames", username);
    const usernameSnapshot = await getDoc(usernameReference);

    if (usernameSnapshot.exists()) {
      throw new Error(
        `#${username} is already used. Please choose another username.`,
      );
    }

    const credential = await createUserWithEmailAndPassword(
      auth,
      form.email.trim(),
      form.password,
    );

    try {
      await runTransaction(db, async (transaction) => {
        const latestUsernameSnapshot = await transaction.get(usernameReference);

        if (latestUsernameSnapshot.exists()) {
          throw new Error(
            `#${username} was just taken. Please choose another username.`,
          );
        }

        transaction.set(usernameReference, {
          uid: credential.user.uid,
          createdAt: serverTimestamp(),
        });

        transaction.set(
          doc(db, "users", credential.user.uid),
          {
            username,
            displayName: `#${username}`,
            email: credential.user.email,
            banned: false,
            createdAt: serverTimestamp(),
            lastActiveAt: serverTimestamp(),
          },
          { merge: true },
        );
      });
    } catch (registrationError) {
      await deleteUser(credential.user);
      throw registrationError;
    }

    navigate("/Profile");
  };

  const loginUser = async () => {
    const credential = await signInWithEmailAndPassword(
      auth,
      form.email.trim(),
      form.password,
    );

    const [adminSnapshot, userSnapshot] = await Promise.all([
      getDoc(doc(db, "admins", credential.user.uid)),
      getDoc(doc(db, "users", credential.user.uid)),
    ]);

    if (adminSnapshot.exists()) {
      navigate("/Admin");
      return;
    }

    if (userSnapshot.exists() && userSnapshot.data().banned === true) {
      await signOut(auth);
      navigate("/Banned");
      return;
    }

    navigate("/Home");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, form.email.trim());
        setMessage("Password-reset email sent. Check your inbox.");
      } else if (isRegister) {
        await registerUser();
      } else {
        await loginUser();
      }
    } catch (requestError) {
      const errorMessage = requestError.message.replace("Firebase: ", "");
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setForm(initialForm);
    setError("");
    setMessage("");
  };

  const title =
    mode === "reset"
      ? "Reset password"
      : isRegister
        ? "Create account"
        : "Welcome back";

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-eyebrow">F1 FAN</p>
        <h1 id="auth-title">{title}</h1>

        <p className="auth-copy">
          Create your fan profile and choose your own racing identity.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          {isRegister && (
            <label>
              Unique username
              <div className="username-input">
                <span>#</span>

                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  minLength="4"
                  maxLength="20"
                  placeholder="yourname"
                  autoComplete="username"
                  required
                />
              </div>
              <small>Use 4–20 letters, numbers, or underscores.</small>
            </label>
          )}

          {mode !== "reset" && (
            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                minLength="6"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
            </label>
          )}

          {isRegister && (
            <label>
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                minLength="6"
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

          <button type="submit" disabled={submitting}>
            {submitting
              ? "Please wait…"
              : mode === "reset"
                ? "Send reset link"
                : isRegister
                  ? "Create account"
                  : "Sign in"}
          </button>
        </form>

        <div className="auth-actions">
          {mode === "login" && (
            <button type="button" onClick={() => switchMode("reset")}>
              Forgot password?
            </button>
          )}

          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create an account" : "Back to sign in"}
          </button>
        </div>
      </section>
    </main>
  );
};

export default Auth;
