import React, { useEffect, useState } from "react";

const AdminApproval = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch pending supervisors
  const fetchPending = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/admin/supervisors/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setPending(data);
    } catch (err) {
      console.error("Error fetching pending supervisors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Approve supervisor
  const approveSupervisor = async (id) => {
    try {
      await fetch(
        `http://localhost:3000/admin/supervisors/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove approved supervisor from list
      setPending((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  if (loading) return <p>Loading pending supervisors...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pending Supervisor Approvals</h2>

      {pending.length === 0 ? (
        <p>No pending supervisors 🎉</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
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
                  <button onClick={() => approveSupervisor(sup._id)}>
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminApproval;
