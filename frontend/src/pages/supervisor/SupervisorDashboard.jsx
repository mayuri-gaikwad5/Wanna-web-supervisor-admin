import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Map from "../dashboard/Map.jsx";
import "./SupervisorDashboard.css";

/* 🔥 UNIVERSAL LOCATION PARSER */
const extractLatLng = (location) => {
  if (!location) return { lat: null, lng: null };

  // Case 1: Firestore GeoPoint
  if (location.latitude && location.longitude) {
    return {
      lat: location.latitude,
      lng: location.longitude,
    };
  }

  // Case 2: Object { lat, lng }
  if (location.lat && location.lng) {
    return {
      lat: Number(location.lat),
      lng: Number(location.lng),
    };
  }

  // Case 3: Array ["17.65° N", "75.94° E"]
  if (Array.isArray(location) && location.length === 2) {
    const lat = parseFloat(
      location[0].toString().replace(/[^\d.-]/g, "")
    );
    const lng = parseFloat(
      location[1].toString().replace(/[^\d.-]/g, "")
    );

    return { lat, lng };
  }

  return { lat: null, lng: null };
};

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [alerts, setAlerts] = useState([]);
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔐 AUTH + PROFILE */
  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/login");

      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3000/supervisor/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = await res.json();

      if (profile.role !== "supervisor" || !profile.isApproved) {
        navigate("/login");
        return;
      }

      setSupervisor(profile);
    });

    return () => unsub();
  }, [navigate]);

  /* 🔥 ONGOING EVENTS (REGION SAFE) */
  useEffect(() => {
    if (!supervisor) return;

    const q = query(
      collection(db, "ongoingEvents"),
      where("city", "==", supervisor.region),
      where("is_resolved", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        const { lat, lng } = extractLatLng(d.location);

        console.log("📍 EVENT:", doc.id, lat, lng); // DEBUG (IMPORTANT)

        return {
          id: doc.id,
          email: d.sos_clicked_by_email,
          type: d.emergency_type,
          lat,
          lng,
        };
      });

      setAlerts(data);
      setLoading(false);
    });

    return () => unsub();
  }, [supervisor]);

  const locate = (lat, lng) => {
    if (!lat || !lng) return;
    mapRef.current?.focusLocation(lat, lng);
  };

  /* 🔥 HANDLE "LOCATE" NAVIGATION FROM ONGOING EVENTS */
  const location = useLocation(); // Hook to access state passed from navigate

  useEffect(() => {
    if (location.state && location.state.focusLat && location.state.focusLng) {
      const { focusLat, focusLng } = location.state;
      // Small timeout to allow map to load if needed
      setTimeout(() => {
        mapRef.current?.focusLocation(focusLat, focusLng);
      }, 500);

      // Clear state to prevent re-focusing on refresh (optional, but good practice)
      // window.history.replaceState({}, document.title); 
    }
  }, [location]);

  if (loading || !supervisor) {
    return <p style={{ padding: 20 }}>Loading supervisor dashboard...</p>;
  }

  return (
    <div className="dashboard-container-full">
      <section className="map-frame-container-full">
        <Map ref={mapRef} alerts={alerts} region={supervisor.region} />
      </section>
    </div>
  );
};

export default SupervisorDashboard;
