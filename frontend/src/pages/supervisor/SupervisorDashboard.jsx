import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Map from "../dashboard/Map.jsx";
import "./SupervisorDashboard.css";

/* 🌍 DEFAULT MAP CENTER (India) */
const DEFAULT_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
};

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const mapComponentRef = useRef(null);

  const [alerts, setAlerts] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isApproved = localStorage.getItem("isApproved") === "true";

  /* 🔐 AUTH GUARD */
  useEffect(() => {
    if (!token || role !== "supervisor" || !isApproved) {
      navigate("/login");
    }
  }, [navigate, token, role, isApproved]);

  /* 🚨 FIRESTORE: ALL ACTIVE SOS ALERTS (NO REGION FILTER) */
  useEffect(() => {
    const sosQuery = query(
      collection(db, "sos_alerts"),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(
      sosQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAlerts(data);
        setActiveUsers(data.length);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Firestore snapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* 📍 LOCATE VICTIM ON MAP */
  const handleLocateVictim = (lat, lng) => {
    if (!lat || !lng) return;

    if (mapComponentRef.current) {
      mapComponentRef.current.focusLocation(lat, lng);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading supervisor dashboard...</p>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Supervisor Command Center</h1>
        <div className="header-stats">
          <span>
            Active Alerts: <strong>{activeUsers}</strong>
          </span>
        </div>
      </header>

      <div className="dashboard-vertical-layout">
        {/* 🗺️ MAP SECTION */}
        <section className="map-frame-container">
          <Map
            ref={mapComponentRef}
            alerts={alerts}
            center={DEFAULT_CENTER}
          />
        </section>

        {/* 📋 ALERT TABLE */}
        <section className="table-container">
          <h2>Live Emergency Registry</h2>

          {alerts.length === 0 ? (
            <p className="no-data">No active alerts.</p>
          ) : (
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Victim</th>
                  <th>Coordinates</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.userName || "Unknown"}</td>
                    <td>
                      {alert.lat?.toFixed(4)}, {alert.lng?.toFixed(4)}
                    </td>
                    <td>
                      <span className="status-badge pulse">LIVE</span>
                    </td>
                    <td>
                      <button
                        className="locate-btn"
                        onClick={() =>
                          handleLocateVictim(alert.lat, alert.lng)
                        }
                      >
                        Locate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
