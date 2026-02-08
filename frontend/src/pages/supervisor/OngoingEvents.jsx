import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./SupervisorDashboard.css"; // Reuse existing styles

/* 🔥 UNIVERSAL LOCATION PARSER (Copied to avoid refactoring) */
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

const OngoingEvents = () => {
    const navigate = useNavigate();

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
        // Navigate to dashboard and pass coordinates to focus
        navigate("/supervisor/dashboard", { state: { focusLat: lat, focusLng: lng } });
    };

    if (loading || !supervisor) {
        return <p style={{ padding: 20 }}>Loading events...</p>;
    }

    return (
        <div className="dashboard-container">
            <section className="table-container">
                <h2>Ongoing Events</h2>

                <div className="table-wrapper">
                    <table className="alerts-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Type</th>
                                <th>Coordinates</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.email}</td>
                                    <td>{a.type}</td>
                                    <td>
                                        {a.lat && a.lng ? `${a.lat}, ${a.lng}` : "N/A"}
                                    </td>
                                    <td>
                                        <button
                                            className="locate-btn"
                                            onClick={() => locate(a.lat, a.lng)}
                                        >
                                            Locate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default OngoingEvents;
