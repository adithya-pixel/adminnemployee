import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ViewComplaints.css';

const ViewComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
       const res = await axios.get('http://localhost:5000/admin/complaints'); // ✅ correct
        setComplaints(res.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="complaints-container">
      <button onClick={() => navigate('/')} className="back-button">← Back to Dashboard</button>
      <h2>User Complaints</h2>
      {complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        complaints.map((c) => (
          <div key={c._id} className="complaint-card">
            <p><strong>Name:</strong> {c.user_id?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> {c.user_id?.email || 'Unknown'}</p>
            <p><strong>Phone:</strong> {c.user_id?.phone_no || 'Unknown'}</p>
            <p><strong>Complaint:</strong> {c.complaints}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewComplaints;
