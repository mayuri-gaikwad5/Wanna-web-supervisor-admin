import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../../firebase/firebaseConfig";
import loginImg from "../../../assets/Login.png";

import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleForgotPassword = async () => {
    if (!formData.email) return setError("Enter email first");
    await sendPasswordResetEmail(auth, formData.email);
    setMessage("Password reset email sent");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 🔐 Firebase login
      const cred = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = cred.user;

      // 🔎 Ask backend who this user is
      const res = await fetch(
        `http://localhost:3000/auth/status/${user.uid}`
      );

      if (!res.ok) {
        throw new Error("Account not found");
      }

      const data = await res.json();

      /**
       * 🚨 EMAIL VERIFICATION RULE
       * ❌ Supervisor → MUST verify email
       * ✅ Admin → NO email verification required
       */
      if (!user.emailVerified && data.role !== "admin") {
        setError("Email not verified");
        setShowResend(true);
        setUnverifiedUser(user);
        await signOut(auth);
        return;
      }

      /**
       * 🚨 APPROVAL RULE (Supervisor only)
       */
      if (data.role === "supervisor" && !data.isApproved) {
        setError("Awaiting admin approval");
        await signOut(auth);
        return;
      }

      // ✅ Save auth session
      const token = await user.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("region", data.region);
      localStorage.setItem("isApproved", "true");

      await fetch("http://localhost:3000/logs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventType: "login",
          actionDescription: "Supervisor logged in",
        }),
      });

      // 🚀 Redirect
      navigate(
        data.role === "admin"
          ? "/admin/approval"
          : "/supervisor/dashboard"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    await sendEmailVerification(unverifiedUser);
    setMessage("Verification email resent");
    setShowResend(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <img src={loginImg} alt="login" />
        </div>

        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to your account</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}

            {showResend && (
              <button
                type="button"
                className="link-btn"
                onClick={handleResendVerification}
              >
                Resend Verification Email
              </button>
            )}

            <button className="primary-btn" disabled={loading}>
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>

          <div className="footer-links">
            <button onClick={handleForgotPassword} className="link-btn">
              Forgot Password?
            </button>
            <p>
              Don’t have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
