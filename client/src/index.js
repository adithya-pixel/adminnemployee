import React from 'react';
import ReactDOM from 'react-dom/client';
import DeliveryAgentManager from './components/DeliveryAgentManager'; // ✅ Correct file

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <DeliveryAgentManager />
  </React.StrictMode>
);
