import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "../../../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import PasswordStrengthBar from "react-password-strength-bar";
import "./Signup.css";

import signupimage from "../../../assets/Signup.png";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    region: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { name, email, password, region } = formData;

      // 1️⃣ Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 2️⃣ Send email verification
      await sendEmailVerification(user);

      // 3️⃣ Save supervisor in MongoDB
      const response = await fetch(
        "http://localhost:3000/supervisor/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            region,
            firebaseUid: user.uid,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.warn("MongoDB sync failed, but Firebase signup succeeded");
      }

      alert(
        "Signup successful! Please verify your email. Admin approval is required before login."
      );

      navigate("/login");
    } catch (err) {
      console.error("Signup Error:", err);

      if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already registered.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        region: "",
      });
    }
  };

  return (
    <div className="signup-container">
      <div className="image-section">
        <img src={signupimage} alt="Signup" className="Signup-image" />
      </div>

      <div className="form-section">
        <h2 className="heading">Supervisor Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Work Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Enter region (e.g. Solapur)"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
            <PasswordStrengthBar
              password={formData.password}
              style={{ marginTop: "10px" }}
            />
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Register as Supervisor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
