import React, { useState } from 'react';
import useDeliveryAgentViewModel from '../viewmodels/useDeliveryAgentViewModel';
import '../styles/DeliveryAgent.css';

const DeliveryAgentManager = () => {
  const {
    agents,
    form,
    handleChange,
    save,
    edit,
    remove,
    error,
    editingId,
    resetForm
  } = useDeliveryAgentViewModel();

  const [showList, setShowList] = useState(false); // Toggle agent list visibility

  return (
    <div className="agent-wrapper">
      <h2>{editingId ? '✏️ Edit Agent' : '➕ Add Delivery Agent'}</h2>

      {error && <p className="error-message">{error}</p>}

      <form className="agent-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name || ''}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address || ''}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={form.phoneNumber || ''}
          onChange={handleChange}
        />
        <input
          type="text"
          name="licenseNumber"
          placeholder="License Number"
          value={form.licenseNumber || ''}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password || ''}
          onChange={handleChange}
        />

        <select name="vehicleType" value={form.vehicleType || ''} onChange={handleChange}>
          <option value="">Select Vehicle Type</option>
          <option value="Bike">Bike</option>
          <option value="Scooter">Scooter</option>
          <option value="Car">Car</option>
        </select>

        <input
          type="file"
          name="license"
          onChange={handleChange}
        />

        <button type="button" onClick={save}>
          {editingId ? 'Update Agent' : 'Add Agent'}
        </button>

        {editingId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={(e) => {
              e.preventDefault();
              resetForm();
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Toggle agent list */}
      <button className="toggle-agent-btn" onClick={() => setShowList(prev => !prev)}>
        {showList ? 'Hide Delivery Agents' : 'Show Delivery Agents'}
      </button>

      {showList && (
        <>
          <h3>📋 Delivery Agents</h3>
          <div className="agent-list">
            {agents.map(agent => (
              <div key={agent._id} className="agent-card">
                <p>🆔 Agent ID: <strong>{agent.agentId || 'Generating...'}</strong></p>
                <p><strong>{agent.name}</strong> ({agent.vehicleType})</p>
                <p>📍 {agent.address}</p>
                <p>📞 {agent.phoneNumber}</p>
                <p>🔢 License #: {agent.licenseNumber}</p>
                <p>✅ Available: {agent.availability === null ? 'Unknown' : agent.availability ? 'Yes' : 'No'}</p>

                {agent.license && (
                  <img
                    className="proof-image"
                    src={`http://localhost:5000/uploads/${agent.license}`}
                    alt="License"
                  />
                )}

                <div className="actions">
                  <button onClick={() => edit(agent)}>Edit</button>
                  <button onClick={() => remove(agent._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryAgentManager;
