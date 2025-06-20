// src/components/Settings.jsx
import React from 'react';
import '../styles/Settings.css'; // ✅ Correct path

import { FaStore, FaMapMarkerAlt, FaClock, FaGlobe, FaEdit, FaSave } from 'react-icons/fa';
import useStoreViewModel from '../viewmodels/useSettingsViewModel';

const Settings = () => {
  const {
    storeData,
    formData,
    isEditing,
    loading,
    setIsEditing,
    handleChange,
    saveChanges
  } = useStoreViewModel();

  const fields = [
    ['storeName', 'Store Name', <FaStore />],
    ['address', 'Address', <FaMapMarkerAlt />],
    ['workingHours', 'Working Hours', <FaClock />],
    ['latitude', 'Latitude', <FaGlobe />],
    ['longitude', 'Longitude', <FaGlobe />],
    ['deliveryRadius', 'Delivery Radius (km)', <FaGlobe />]
  ];

  if (loading) return <div className="settings-loading">Loading store details...</div>;

  return (
    <div className="settings-wrapper">
      <div className="settings-card">
        <h2>🛒 Supermarket Settings</h2>
        {fields.map(([field, label, icon]) => (
          <div key={field} className="form-group">
            <label htmlFor={field}>{icon} {label}</label>
            {isEditing ? (
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
              />
            ) : (
              <div className="static-value">{storeData[field]}</div>
            )}
          </div>
        ))}

        <div className="btn-group">
          {isEditing ? (
            <button className="btn save" onClick={saveChanges}><FaSave /> Save</button>
          ) : (
            <button className="btn edit" onClick={() => setIsEditing(true)}><FaEdit /> Edit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
