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
      const cred = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = cred.user;

      const res = await fetch(
        `http://localhost:3000/auth/status/${user.uid}`
      );
      const data = await res.json();

      if (!user.emailVerified && data.role !== "admin") {
        setError("Email not verified");
        setShowResend(true);
        setUnverifiedUser(user);
        await signOut(auth);
        return;
      }

      if (!data.isApproved) {
        setError("Awaiting admin approval");
        await signOut(auth);
        return;
      }

      const token = await user.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem("role", data.role);

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
    await sendEmailVerification(unverifiedUser);
    setMessage("Verification email resent");
    setShowResend(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <img src={loginImg} alt="login"/>
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
