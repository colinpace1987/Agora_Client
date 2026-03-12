import React, { useState } from "react";
import "./Login.css";

export default function Login({ formToFetchLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetStatus, setResetStatus] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Both fields are required.");
      return;
    }

    try {
      setError("");
      await formToFetchLogin(form.email, form.password, "login");
    } catch (err) {
      setError(err?.message || "Login failed.");
    }
  }

  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetPassword || !resetConfirm) {
      setResetStatus("Email and both password fields are required.");
      return;
    }
    if (resetPassword !== resetConfirm) {
      setResetStatus("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword: resetPassword }),
      });

      if (!res.ok) throw new Error("Reset failed");
      setResetStatus("Password updated. You can log in now.");
      setShowReset(false);
      setResetEmail("");
      setResetPassword("");
      setResetConfirm("");
    } catch (err) {
      setResetStatus("Reset failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="input"
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="input"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="button">
          Sign In
        </button>

        <button
          type="button"
          className="link-button"
          onClick={() => setShowReset(true)}
        >
          Forgot password?
        </button>

        {resetStatus && <p className="reset-status">{resetStatus}</p>}
      </form>

      {showReset && (
        <div className="modal-backdrop">
          <div className="modal reset-modal">
            <h2>Reset Password</h2>
            <form className="reset-form" onSubmit={handleReset}>
              <label>Email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="input"
              />
              <label>New Password</label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="input"
              />
              <label>Confirm Password</label>
              <input
                type="password"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                className="input"
              />
              {resetStatus && <p className="reset-status">{resetStatus}</p>}
              <div className="reset-actions">
                <button type="button" onClick={() => setShowReset(false)}>
                  Cancel
                </button>
                <button type="submit" className="button">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
