import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Table, Container, Spinner, Badge, Card } from "react-bootstrap";
import "./History.css";

const History = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const eventsCollection = collection(db, "pastEvents");
      const resolvedQuery = query(
        eventsCollection,
        where("is_resolved", "==", true),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(resolvedQuery);
      const resolvedEvents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setEvents(resolvedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <Container fluid className="history-page mt-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0 fw-bold">Past Events Detailed History</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <div className="table-responsive">
              <Table hover className="history-table mb-0">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>City</th>
                    <th>Type</th>
                    <th>Emergency Message</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Notified To</th>
                    <th>Clicked By (Email)</th>
                    <th>User UID</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="fw-medium text-primary">#{event.event_id || event.id.substring(0, 6)}</td>
                      <td>{event.city || "N/A"}</td>
                      <td><Badge bg="secondary">{event.emergency_type || "N/A"}</Badge></td>
                      <td className="text-wrap" style={{ minWidth: "150px" }}>{event.emergency_message || "N/A"}</td>
                      <td className="font-monospace small">{event.location?.latitude?.toFixed(5) || "N/A"}</td>
                      <td className="font-monospace small">{event.location?.longitude?.toFixed(5) || "N/A"}</td>
                      <td className="small">{Array.isArray(event.notified_to) ? event.notified_to.join(", ") : "N/A"}</td>
                      <td>{event.sos_clicked_by_email || "N/A"}</td>
                      <td className="small text-muted">{event.sos_clicked_by_uid?.substring(0, 8)}...</td>
                      <td><Badge bg="success">Resolved</Badge></td>
                      <td className="small">
                        {event.timestamp?.seconds 
                          ? new Date(event.timestamp.seconds * 1000).toLocaleString() 
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default History;