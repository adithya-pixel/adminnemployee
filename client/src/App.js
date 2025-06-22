// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/OrderManager';
import EmployeePanel from './components/EmployeePannel';

// import AdminPanel from './components/AdminPanel'; // Uncomment if needed

const App = () => {
  const employeeId = localStorage.getItem('employeeId');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Optional Admin Panel */}
        {/* <Route
          path="/admin-panel"
          element={token ? <AdminPanel /> : <Navigate to="/" />}
        /> */}

        <Route
          path="/employee-panel"
          element={employeeId ? <EmployeePanel /> : <Navigate to="/" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
