// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EmployeePanel from './components/EmployeePannel'; 
import EmployeeOrderHistory from './components/EmployeeOrderHistory';

const App = () => {
  const employeeId = localStorage.getItem('employeeId');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Employee Panel */}
        <Route
          path="/employee-panel"
          element={employeeId ? <EmployeePanel /> : <Navigate to="/" />}
        />

        <Route
          path="/employee/order-history"
          element={employeeId ? <EmployeeOrderHistory /> : <Navigate to="/" />}
        />

        {/* Default redirect for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
