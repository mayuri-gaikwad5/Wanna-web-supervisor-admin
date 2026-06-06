import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot, query, where, getDocs, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Map from "../dashboard/Map.jsx";
import "./SupervisorDashboard.css";
import { apiUrl } from "../../config/api";


/* 🔥 UNIVERSAL LOCATION PARSER */
const extractLatLng = (location) => {
  if (!location) {
    return { lat: null, lng: null };
  }
  
  // Case 1: Firestore GeoPoint
  if (location.latitude !== undefined && location.longitude !== undefined) {
    return {
      lat: location.latitude,
      lng: location.longitude,
    };
  }

  // Case 2: Object { lat, lng }
  if (location.lat !== undefined && location.lng !== undefined) {
    return {
      lat: Number(location.lat),
      lng: Number(location.lng),
    };
  }

  // Case 3: Array ["17.65° N", "75.94° E"] or [17.65, 75.94]
  if (Array.isArray(location) && location.length === 2) {
    // Check if it's already numbers
    if (typeof location[0] === 'number' && typeof location[1] === 'number') {
      return { lat: location[0], lng: location[1] };
    }
    
    // Parse string format
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
  const mapContainerRef = useRef(null); // Reference to map container for scrolling

  const [alerts, setAlerts] = useState([]);
  const [acceptors, setAcceptors] = useState([]);
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔐 AUTH + PROFILE */
  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/login");

      const token = await user.getIdToken();
      const res = await fetch(apiUrl("/supervisor/profile"), {
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

  /* 👥 FETCH ACCEPTORS FOR ONGOING EVENTS */
  useEffect(() => {
    if (!supervisor) {
      return;
    }
    
    if (alerts.length === 0) {
      setAcceptors([]);
      return;
    }

    const fetchAcceptors = async () => {
      const acceptorsList = [];

      try {
        // For each alert, check if there's an acceptedEvents document with that ID
        for (const alert of alerts) {
          const acceptedEventDocRef = doc(db, "acceptedEvents", alert.id);
          const acceptorsCollectionRef = collection(acceptedEventDocRef, "acceptors");
          
          try {
            const acceptorsSnapshot = await getDocs(acceptorsCollectionRef);

            if (!acceptorsSnapshot.empty) {
              acceptorsSnapshot.forEach((acceptorDoc) => {
                const acceptorData = acceptorDoc.data();

                // Use userLocation for acceptor's actual position
                const { lat, lng } = extractLatLng(acceptorData.userLocation);

                if (lat && lng) {
                  const uniqueId = `${acceptorDoc.id}_${alert.id}`;
                  acceptorsList.push({
                    id: uniqueId,
                    acceptorDocId: acceptorDoc.id,
                    eventId: alert.id,
                    name: acceptorData.name,
                    email: acceptorData.email,
                    acceptedAt: acceptorData.acceptedAt,
                    lat,
                    lng,
                  });
                }
              });
            }
          } catch (error) {
            // Silently handle errors for individual events
          }
        }

        setAcceptors(acceptorsList);
      } catch (error) {
        console.error("Error fetching acceptors:", error);
      }
    };

    fetchAcceptors();
  }, [alerts, supervisor]);

  const locate = (lat, lng) => {
    if (!lat || !lng) return;
    
    // Scroll to top of page
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
    
    // Focus on location after a short delay to allow scroll to complete
    setTimeout(() => {
      mapRef.current?.focusLocation(lat, lng);
    }, 500);
  };

  if (loading || !supervisor) {
    return <p style={{ padding: 20 }}>Loading supervisor dashboard...</p>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Supervisor Command Center</h1>
        <div className="header-stats">
          <span>Region: <strong>{supervisor.region}</strong></span>
          <span>Active Events: <strong>{alerts.length}</strong></span>
          <span>Responders: <strong>{acceptors.length}</strong></span>
        </div>
      </header>

      <section className="map-frame-container" ref={mapContainerRef}>
        <Map ref={mapRef} alerts={alerts} acceptors={acceptors} region={supervisor.region} />
      </section>

      <section className="table-container">
        <h2>Ongoing Events</h2>

        <table className="alerts-table">
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Email</th>
              <th>Type</th>
              <th>Coordinates</th>
              <th>Acceptors</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => {
              const eventAcceptors = acceptors.filter(acc => acc.eventId === a.id);
              return (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85em', color: '#666' }}>
                    {a.id.substring(0, 8)}...
                  </td>
                  <td>{a.email}</td>
                  <td>{a.type}</td>
                  <td>
                    {a.lat && a.lng ? `${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}` : "N/A"}
                  </td>
                  <td>
                    {eventAcceptors.length > 0 ? (
                      <span style={{ color: 'green', fontWeight: 'bold' }}>
                        ✓ {eventAcceptors.length} {eventAcceptors.length === 1 ? 'person' : 'people'}
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>No acceptors yet</span>
                    )}
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
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="table-container">
        <h2>Acceptors (People Responding)</h2>

        <table className="alerts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Responding To</th>
              <th>Accepted At</th>
              <th>Coordinates</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {acceptors.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#999" }}>
                  No acceptors yet
                </td>
              </tr>
            ) : (
              acceptors.map((acceptor) => {
                const relatedEvent = alerts.find(a => a.id === acceptor.eventId);
                return (
                  <tr key={acceptor.id}>
                    <td>{acceptor.name}</td>
                    <td>{acceptor.email}</td>
                    <td>
                      {relatedEvent ? (
                        <div style={{ fontSize: '0.9em' }}>
                          <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>
                            🚨 {relatedEvent.type || 'SOS'}
                          </div>
                          <div style={{ color: '#666', fontSize: '0.85em' }}>
                            {relatedEvent.email}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>Event resolved</span>
                      )}
                    </td>
                    <td>
                      {acceptor.acceptedAt?.toDate
                        ? acceptor.acceptedAt.toDate().toLocaleString()
                        : "N/A"}
                    </td>
                    <td>
                      {acceptor.lat && acceptor.lng
                        ? `${acceptor.lat.toFixed(4)}, ${acceptor.lng.toFixed(4)}`
                        : "N/A"}
                    </td>
                    <td>
                      <button
                        className="locate-btn"
                        onClick={() => locate(acceptor.lat, acceptor.lng)}
                      >
                        Locate
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SupervisorDashboard;
