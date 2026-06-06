import React, { useState, useEffect } from 'react';
import { apiUrl } from "../../config/api";


const CurrentStatus = () => {
  // State to store SOS data
  const [sosData, setSosData] = useState([]);

  // Fetch SOS data from the backend on component mount
  useEffect(() => {
    const fetchSosData = async () => {
      try {
        const response = await fetch(apiUrl("/sos"));
        const data = await response.json();
        setSosData(data); // Set the fetched SOS data into state
      } catch (error) {
        console.error("Error fetching SOS data:", error);
      }
    };

    fetchSosData(); // Call the function to fetch data
  }, []); // Empty dependency array means it runs once after the component mounts

  return (
    <div style={{ margin: '20px' }}>
      <h2>Current SOS Status</h2>

      {/* Table to display SOS records */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Latitude</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Longitude</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through SOS data and create rows */}
          {sosData.length > 0 ? (
            sosData.map((record) => (
              <tr key={record._id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {record.userId}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {record.latitude}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {record.longitude}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {new Date(record.timestamp).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>
                No SOS records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CurrentStatus;
