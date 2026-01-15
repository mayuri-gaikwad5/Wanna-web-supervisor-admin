import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { auth } from '../../../firebase/firebaseConfig.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';

import PasswordStrengthBar from 'react-password-strength-bar';
import './Signup.css';

import signupimage from "../../../assets/Signup.png";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { email, password, name } = formData;

      // 1. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Send verification email
      await sendEmailVerification(user);
      setVerificationSent(true);
      setSuccessMessage(
        "Signup successful! Please verify your email. You can resend the verification email if it expires."
      );

      // 3. Sync with MongoDB
      const response = await fetch("http://localhost:3000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          firebaseUid: user.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sync with database");
      }

    } catch (err) {
      if (err.code === 'auth/weak-password') {
        setError('The password is too weak.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else {
        setError(err.message);
      }
      console.error("Signup Error:", err.message);
    } finally {
      setLoading(false);
      setFormData({ name: '', email: '', password: '' });
    }
  };

  // RESEND VERIFICATION EMAIL
  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login again to resend verification email.");
        return;
      }

      await sendEmailVerification(user);
      setSuccessMessage("Verification email resent. Please check your inbox.");

      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Resend error:", err);
      setError("Failed to resend verification email.");
    }
  };

  return (
    <div className="signup-container">
      <div className="image-section">
        <img
          src={signupimage}
          alt="Background"
          className="Signup-image"
        />
      </div>

      <div className="form-section">
        <h2 className="heading">Supervisor Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="label">Work Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="input"
              required
            />
            <PasswordStrengthBar
              password={formData.password}
              style={{ marginTop: '10px' }}
            />
          </div>

          {error && (
            <div className="error" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{ color: 'green', marginBottom: '10px', fontSize: '14px' }}>
              {successMessage}
            </div>
          )}

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Processing...' : 'Register as Supervisor'}
          </button>
        </form>

        {verificationSent && (
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <p style={{ fontSize: "14px" }}>
              Didn’t receive the verification email?
            </p>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendCooldown > 0}
              className="button"
              style={{ marginTop: "5px" }}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Verification Email"}
            </button>

            <button
              type="button"
              className="button"
              style={{ marginTop: "10px", backgroundColor: "#6c757d" }}
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
