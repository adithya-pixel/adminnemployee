import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="topbar">
        <h2>Admin Panel</h2>
      </div>
      <div className="dashboard-body">
        <div className="sidebar">
          <Link to="/order-manager" className="sidebar-item">Incoming Request</Link>
          <Link to="/employee-manager" className="sidebar-item">Manage Employee</Link>
          <Link to="/delivery-agent-manager" className="sidebar-item">Manage Delivery Agent</Link>
          <Link to="/view-complaints" className="sidebar-item">View Complaints</Link>
          <Link to="/order-manager" className="sidebar-item">All Orders</Link> {/* You can change if different */}
          <Link to="/settings" className="sidebar-item">Settings</Link>
        </div>

        <div className="main-content">
          <h2>Welcome to the Admin Dashboard</h2>
          <p>Select an option from the sidebar to manage the system.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
