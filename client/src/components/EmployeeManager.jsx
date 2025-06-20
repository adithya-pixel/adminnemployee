import React, { useState } from 'react';
import useEmployeeViewModel from '../viewmodels/useEmployeeViewModel';
import '../styles/EmployeeManager.css';

const EmployeeManager = () => {
  const { employees, form, setForm, handleChange, save, edit, remove } = useEmployeeViewModel();
  const [error, setError] = useState('');
  const [showList, setShowList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

const validateForm = () => {
  const isEditMode = !!form._id;

  // If adding a new employee (no _id), require all fields
  if (!isEditMode) {
    if (!form.name || !form.address || !form.phoneNumber || !form.password || !form.idProof) {
      setError('⚠️ All fields are required, including PNG proof');
      return false;
    }
  }

  // Always validate phone number if it's entered
  if (form.phoneNumber && !/^\d{10}$/.test(form.phoneNumber)) {
    setError('⚠️ Phone number must be exactly 10 digits');
    return false;
  }

  // Only validate image type if new file selected
  if (form.idProof && form.idProof.type && form.idProof.type !== 'image/png') {
    setError('⚠️ Only PNG format is allowed for ID proof');
    return false;
  }

  // Only validate password strength if it's entered (editing)
  if (form.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) {
    setError('⚠️ Password must be 8+ characters with uppercase, lowercase, number, and symbol');
    return false;
  }

  setError('');
  return true;
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      save();
    }
  };

  const handleCancelEdit = () => {
    setForm({
      name: '',
      address: '',
      phoneNumber: '',
      password: '',
      idProof: null,
      _id: null,
    });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="emp-wrapper">
      <h2>👷 Employee Management</h2>

      {form._id && (
        <div className="edit-banner">
          ✏️ <strong>Editing: {form.name || 'Unnamed'}</strong>
          <button className="cancel-btn" onClick={handleCancelEdit}>❌ Cancel Edit</button>
        </div>
      )}

      <form className="emp-form" onSubmit={handleSubmit}>
        {error && <p>{error}</p>}

        <input
          type="text"
          name="name"
          value={form.name || ''}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="address"
          value={form.address || ''}
          onChange={handleChange}
          placeholder="Address"
        />
        <input
          type="text"
          name="phoneNumber"
          value={form.phoneNumber || ''}
          onChange={handleChange}
          placeholder="Phone Number (10 digits)"
          maxLength={10}
        />
        <input
          type="password"
          name="password"
          value={form.password || ''}
          onChange={handleChange}
          placeholder="Password"
        />
        <input
          type="file"
          name="idProof"
          onChange={handleChange}
          accept="image/png"
        />

        <button type="submit">💾 {form._id ? 'Update' : 'Add'} Employee</button>
      </form>

      <button onClick={() => setShowList(!showList)}>
        👁️ {showList ? 'Hide Employees' : 'View Employees'}
      </button>

      {showList && (
        <div className="emp-list">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredEmployees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            filteredEmployees.map((emp) => (
              <div className="emp-card" key={emp._id}>
                <p><b>ID:</b> {emp.empId}</p>
                <p><b>Name:</b> {emp.name}</p>
                <p><b>Phone:</b> {emp.phoneNumber}</p>
                <p><b>Address:</b> {emp.address}</p>
                {emp.idProof && (
                  <img
                    src={`http://localhost:5000/uploads/${emp.idProof}`}
                    alt="ID Proof"
                    className="proof-image"
                  />
                )}
                <div className="actions">
                  <button onClick={() => edit(emp)}>✏️ Edit</button>
                  <button onClick={() => remove(emp._id)}>🗑️ Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
