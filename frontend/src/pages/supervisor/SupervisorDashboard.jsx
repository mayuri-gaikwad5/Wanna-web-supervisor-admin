import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Map from "../dashboard/Map.jsx";
import "./SupervisorDashboard.css";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const mapComponentRef = useRef(null);

  const [alerts, setAlerts] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);

  const [supervisor, setSupervisor] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // 🔑 IMPORTANT
  const [dataLoading, setDataLoading] = useState(true);

  /* 🔐 AUTH + PROFILE (SAFE ON RELOAD) */
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const idToken = await user.getIdToken();

        const res = await fetch("http://localhost:3000/supervisor/profile", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) throw new Error("Profile fetch failed");

        const profile = await res.json();

        if (profile.role !== "supervisor" || !profile.isApproved) {
          navigate("/login");
          return;
        }

        setSupervisor(profile);
        setAuthLoading(false);
      } catch (err) {
        console.error("❌ Auth/Profile error:", err.message);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* 🚨 FIRESTORE SOS LISTENER */
  useEffect(() => {
    if (!supervisor) return;

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
        setDataLoading(false);
      },
      (error) => {
        console.error("❌ Firestore snapshot error:", error);
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [supervisor]);

  /* 📍 LOCATE VICTIM */
  const handleLocateVictim = (lat, lng) => {
    if (!lat || !lng) return;
    mapComponentRef.current?.focusLocation(lat, lng);
  };

  /* ⏳ GLOBAL LOADING */
  if (authLoading || dataLoading || !supervisor) {
    return <p style={{ padding: "20px" }}>Loading supervisor dashboard...</p>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Supervisor Command Center</h1>
        <div className="header-stats">
          <span>
            Region: <strong>{supervisor.region}</strong>
          </span>
          <span>
            Active Alerts: <strong>{activeUsers}</strong>
          </span>
        </div>
      </header>

      <div className="dashboard-vertical-layout">
        {/* 🗺️ MAP */}
        <section className="map-frame-container">
          <Map
            ref={mapComponentRef}
            alerts={alerts}
            region={supervisor.region}
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










// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { db } from "../../firebase/firebaseConfig";
// import { collection, onSnapshot, query, where } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import Map from "../dashboard/Map.jsx";
// import "./SupervisorDashboard.css";

// const SupervisorDashboard = () => {
//   const navigate = useNavigate();
//   const mapComponentRef = useRef(null);

//   const [alerts, setAlerts] = useState([]);
//   const [activeUsers, setActiveUsers] = useState(0);
//   const [loading, setLoading] = useState(true);

//   // ✅ Logged-in supervisor profile (from backend)
//   const [supervisor, setSupervisor] = useState(null);

//   /* 🔐 AUTH: ONLY CHECK FIREBASE USER */
//   useEffect(() => {
//     const auth = getAuth();

//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (!user) {
//         navigate("/login");
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   /* 👤 FETCH SUPERVISOR PROFILE (ROLE + APPROVAL + REGION) */
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const auth = getAuth();
//         const user = auth.currentUser;

//         if (!user) return;

//         const idToken = await user.getIdToken();

//         const res = await fetch("http://localhost:3000/supervisor/profile", {
//           headers: {
//             Authorization: `Bearer ${idToken}`,
//           },
//         });

//         if (!res.ok) throw new Error("Unauthorized");

//         const data = await res.json();

//         // 🔐 AUTHORITATIVE CHECK (BACKEND DATA)
//         if (data.role !== "supervisor" || !data.isApproved) {
//           navigate("/login");
//           return;
//         }

//         setSupervisor(data);
//       } catch (err) {
//         console.error("❌ Fetch supervisor profile error:", err.message);
//         navigate("/login");
//       }
//     };

//     fetchProfile();
//   }, [navigate]);

//   /* 🚨 FIRESTORE: ACTIVE SOS ALERTS */
//   useEffect(() => {
//     const sosQuery = query(
//       collection(db, "sos_alerts"),
//       where("status", "==", "active")
//     );

//     const unsubscribe = onSnapshot(
//       sosQuery,
//       (snapshot) => {
//         const data = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setAlerts(data);
//         setActiveUsers(data.length);
//         setLoading(false);
//       },
//       (error) => {
//         console.error("❌ Firestore snapshot error:", error);
//         setLoading(false);
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   /* 📍 LOCATE VICTIM ON MAP */
//   const handleLocateVictim = (lat, lng) => {
//     if (!lat || !lng) return;

//     if (mapComponentRef.current) {
//       mapComponentRef.current.focusLocation(lat, lng);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   if (loading || !supervisor) {
//     return <p style={{ padding: 20 }}>Loading supervisor dashboard…</p>;
//   }

//   return (
//     <div className="dashboard-container">
//       <header className="dashboard-header">
//         <h1>Supervisor Command Center</h1>
//         <div className="header-stats">
//           <span>
//             Region: <strong>{supervisor.region}</strong>
//           </span>
//           <span>
//             Active Alerts: <strong>{activeUsers}</strong>
//           </span>
//         </div>
//       </header>

//       <div className="dashboard-vertical-layout">
//         {/* 🗺️ MAP */}
//         <section className="map-frame-container">
//           <Map
//             ref={mapComponentRef}
//             alerts={alerts}
//             region={supervisor.region}
//           />
//         </section>

//         {/* 📋 ALERT TABLE */}
//         <section className="table-container">
//           <h2>Live Emergency Registry</h2>

//           {alerts.length === 0 ? (
//             <p className="no-data">No active alerts.</p>
//           ) : (
//             <table className="alerts-table">
//               <thead>
//                 <tr>
//                   <th>Victim</th>
//                   <th>Coordinates</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {alerts.map((alert) => (
//                   <tr key={alert.id}>
//                     <td>{alert.userName || "Unknown"}</td>
//                     <td>
//                       {alert.lat?.toFixed(4)}, {alert.lng?.toFixed(4)}
//                     </td>
//                     <td>
//                       <span className="status-badge pulse">LIVE</span>
//                     </td>
//                     <td>
//                       <button
//                         className="locate-btn"
//                         onClick={() =>
//                           handleLocateVictim(alert.lat, alert.lng)
//                         }
//                       >
//                         Locate
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// };

// export default SupervisorDashboard;
