import React, { useEffect, useState } from "react";

const AdminApproval = () => {
  const token = localStorage.getItem("token");

  const [logs, setLogs] = useState([]);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);

  const [tab, setTab] = useState("pending"); // pending | approved

  // ---------------------------
  // FETCH LOGS
  // ---------------------------
  const fetchLogs = async () => {
    const res = await fetch("http://localhost:3000/logs/region", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLogs(await res.json());
  };

  // ---------------------------
  // FETCH PENDING SUPERVISORS
  // ---------------------------
  const fetchPending = async () => {
    const res = await fetch("http://localhost:3000/admin/supervisors/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPending(await res.json());
  };

  // ---------------------------
  // FETCH APPROVED SUPERVISORS
  // ---------------------------
  const fetchApproved = async () => {
    const res = await fetch("http://localhost:3000/admin/supervisors/approved", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setApproved(await res.json());
  };

  // Load all data when page loads
  useEffect(() => {
    fetchLogs();
    fetchPending();
    fetchApproved();
  }, []);

  // ---------------------------
  // APPROVE SUPERVISOR
  // ---------------------------
  const approveSupervisor = async (id) => {
    await fetch(`http://localhost:3000/admin/supervisors/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchPending();
    fetchApproved();
  };

  // ---------------------------
  // REVOKE SUPERVISOR ACCESS
  // ---------------------------
  const revokeSupervisor = async (id) => {
    await fetch(`http://localhost:3000/admin/supervisors/${id}/revoke`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchPending();
    fetchApproved();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Supervisor Activity Logs</h2>

      {/* ========== SECTION 1 — Logs ========== */}
      <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Event</th>
            <th>Description</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.email}</td>
              <td>{log.eventType}</td>
              <td>{log.actionDescription}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ margin: "40px 0" }} />

      {/* ========== SECTION 2 — Supervisor Management ========== */}
      <h2>Supervisor Management</h2>

      {/* Tabs */}
      <div style={{ margin: "20px 0" }}>
        <button
          onClick={() => setTab("pending")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: tab === "pending" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
          }}
        >
          Pending
        </button>

        <button
          onClick={() => setTab("approved")}
          style={{
            padding: "10px 20px",
            background: tab === "approved" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
          }}
        >
          Approved
        </button>
      </div>

      {/* Conditional Rendering */}
      {tab === "pending" ? (
        <>
          <h3>Pending Supervisors</h3>
          <table border="1" cellPadding="10" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Region</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((sup) => (
                <tr key={sup._id}>
                  <td>{sup.name}</td>
                  <td>{sup.email}</td>
                  <td>{sup.region}</td>
                  <td>
                    <button onClick={() => approveSupervisor(sup._id)}>Approve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <h3>Approved Supervisors</h3>
          <table border="1" cellPadding="10" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Region</th>
                <th>Revoke</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((sup) => (
                <tr key={sup._id}>
                  <td>{sup.name}</td>
                  <td>{sup.email}</td>
                  <td>{sup.region || "N/A"}</td>
                  <td>
                    <button
                      onClick={() => revokeSupervisor(sup._id)}
                      style={{ background: "red", color: "white" }}
                    >
                      Revoke Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AdminApproval;
