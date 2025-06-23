import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/EmployeePanel.css';

const EmployeeOrderHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const empId = localStorage.getItem('employeeId');
      if (!empId) {
        alert('No employee ID found!');
        navigate('/');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/employee/history/${empId}`);
        setHistory(res.data.history || []);
      } catch (err) {
        console.error('❌ Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  return (
    <div className="employee-panel">
      <div className="top-bar">
        <h2>Order History</h2>
        {/* <button className="settings-btn" onClick={() => navigate('/employee-pannel')}>🔙 Back</button> */}
      </div>

      {loading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        history.map((entry) => (
          <div key={entry._id} className="employee-order-card">
            <p><strong>Order ID:</strong> {entry.orderId?._id || 'N/A'}</p>
            <p><strong>Status:</strong> {entry.status}</p>
            {entry.status === 'Declined' && (
              <p><strong>Reason:</strong> {entry.declineReason || 'Not provided'}</p>
            )}
            <p><strong>Date:</strong> {new Date(entry.date).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeOrderHistory;
