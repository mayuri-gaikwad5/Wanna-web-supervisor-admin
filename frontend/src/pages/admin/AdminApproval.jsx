import React, { useEffect, useState } from "react";
import { Container, Table, Button, Badge, Tabs, Tab, Card, Spinner, Alert } from "react-bootstrap";

const AdminApproval = () => {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [logs, setLogs] = useState([]); // 🔥 New state for logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Pending
      const pendingRes = await fetch("http://localhost:3000/admin/supervisors/pending", { headers });
      const pendingData = await pendingRes.json();

      // 2. Fetch Approved
      const approvedRes = await fetch("http://localhost:3000/admin/supervisors/approved", { headers });
      const approvedData = await approvedRes.json();

      // 3. Fetch Regional Logs 🔥
      const logsRes = await fetch("http://localhost:3000/logs/region", { headers });
      const logsData = await logsRes.json();

      if (pendingRes.ok && approvedRes.ok && logsRes.ok) {
        setPending(pendingData);
        setApproved(approvedData);
        setLogs(logsData);
      } else {
        setError("Failed to fetch dashboard data.");
      }
    } catch (err) {
      setError("Network error. Ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/admin/supervisors/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert("Approval failed.");
    }
  };

  const handleRevoke = async (id) => {
    if (window.confirm("Revoke access? This will reset the supervisor's region.")) {
      try {
        const res = await fetch(`http://localhost:3000/admin/supervisors/${id}/revoke`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) fetchData();
      } catch (err) {
        alert("Revocation failed.");
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-4">
      <header className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold text-dark">Control Center</h2>
          <p className="text-muted">Regional Admin: <strong>{localStorage.getItem("region")}</strong></p>
        </div>
        <Button variant="outline-primary" size="sm" onClick={fetchData}>Refresh Dashboard</Button>
      </header>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            
            {/* ========== PENDING REQUESTS ========== */}
            <Tab eventKey="pending" title={`Pending (${pending.length})`}>
              <Table responsive hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Region</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((sup) => (
                    <tr key={sup._id}>
                      <td className="fw-bold">{sup.name}</td>
                      <td>{sup.email}</td>
                      <td><Badge bg="info" text="dark">{sup.region}</Badge></td>
                      <td className="text-end">
                        <Button variant="success" size="sm" onClick={() => handleApprove(sup._id)}>Approve</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            {/* ========== ACTIVE SUPERVISORS ========== */}
            <Tab eventKey="approved" title={`Active (${approved.length})`}>
              <Table responsive hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Region</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approved.map((sup) => (
                    <tr key={sup._id}>
                      <td className="fw-bold">{sup.name}</td>
                      <td>{sup.email}</td>
                      <td><Badge bg="primary">{sup.region}</Badge></td>
                      <td className="text-end">
                        <Button variant="outline-danger" size="sm" onClick={() => handleRevoke(sup._id)}>Revoke Access</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            {/* ========== ACTIVITY LOGS 🔥 ========== */}
            <Tab eventKey="logs" title="Activity History">
              <Table responsive hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Description</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-4 text-muted">No activity logs found for this region.</td></tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id}>
                        <td className="small">{log.email}</td>
                        <td>
                          <Badge bg={log.eventType === "login" ? "success" : log.eventType === "logout" ? "warning" : "secondary"}>
                            {log.eventType.toUpperCase()}
                          </Badge>
                        </td>
                        <td>{log.actionDescription}</td>
                        <td className="text-muted small">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Tab>

          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminApproval;