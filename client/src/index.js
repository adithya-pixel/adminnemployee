import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ✅ Import App component

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App /> {/* ✅ Render App */}
  </React.StrictMode>
);
