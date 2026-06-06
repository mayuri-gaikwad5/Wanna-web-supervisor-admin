import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; 
import "./curr.css"
import { apiUrl } from "../../config/api";


const CurrentStatus = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncToMongoDB = async (eventsToSync) => {
      try {
        for (const event of eventsToSync) {
          await fetch(apiUrl("/events/sync"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          });
        }
        console.log("Successfully synced events to MongoDB");
      } catch (error) {
        console.error("Error syncing to MongoDB:", error);
      }
    };

    const fetchRecords = async () => {
      try {
        const eventsCollection = collection(db, "ongoingEvents");
        const unresolvedQuery = query(eventsCollection, where("is_resolved", "==", false));
        const querySnapshot = await getDocs(unresolvedQuery);

        const unresolvedEvents = [];
        querySnapshot.forEach((doc) => {
          unresolvedEvents.push({ id: doc.id, ...doc.data() });
        });

        setEvents(unresolvedEvents);
        setLoading(false);

        if (unresolvedEvents.length > 0) {
          syncToMongoDB(unresolvedEvents);
        }
      } catch (error) {
        console.error("Error fetching records:", error);
        setLoading(false);
      }
    };

    fetchRecords();
  }, []); // Empty dependency array is now correct

  return (
    <div>
      <h1>Current Status</h1>
      {loading ? (
        <p>Loading...</p>
      ) : events.length > 0 ? (
        <table border="1" style={{ borderCollapse: "collapse", width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>City</th>
              <th>Emergency Type</th>
              <th>Message</th>
              <th>Location</th>
              <th>Notified To</th>
              <th>SOS Clicked By</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td>{event.city || "N/A"}</td>
                <td>{event.emergency_type || "N/A"}</td>
                <td>{event.emergency_message || "No message available"}</td>
                <td>
                  {event.location
                    ? `${event.location.latitude}° N, ${event.location.longitude}° E`
                    : "Location data not available"}
                </td>
                <td>{event.notified_to && event.notified_to.length > 0 ? event.notified_to.join(", ") : "N/A"}</td>
                <td>{event.sos_clicked_by_email || "N/A"}</td>
                <td>
                  {event.timestamp
                    ? new Date(event.timestamp.seconds * 1000).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No unresolved events.</p>
      )}
    </div>
  );
};

export default CurrentStatus;