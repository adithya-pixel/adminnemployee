import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/delivery-agents';

const useDeliveryAgentViewModel = () => {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // ✅ Load agents from backend
  const load = async () => {
    try {
      const res = await axios.get(API);
      setAgents(res.data);
    } catch (err) {
      console.error('❌ Failed to load agents:', err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ Handle input and file change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // ✅ Form validation
  const validate = () => {
    const { name, address, phoneNumber, licenseNumber, password, vehicleType, license } = form;

    if (!name || name.length < 3) return 'Name must be at least 3 characters';
    if (!address || address.length < 5) return 'Address must be at least 5 characters';
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) return 'Phone must be 10 digits';
    if (!licenseNumber || licenseNumber.length < 5) return 'License number must be at least 5 characters';
    if (!vehicleType) return 'Please select a vehicle type';

    if (!editingId && (!password || password.length < 6)) {
      return 'Password must be at least 6 characters';
    }

    if (!editingId && !license) return 'License file is required';

    return '';
  };

  // ✅ Save (Create/Update)
  const save = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      setError(`⚠️ ${errorMsg}`);
      return;
    }

    const formData = new FormData();

    for (let key in form) {
      // Skip empty password if editing
      if (editingId && key === 'password' && !form[key]) continue;

      if (form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    }

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, formData);
      } else {
        await axios.post(API, formData);
      }

      await load(); // refresh agent list
      resetForm();  // clear form
    } catch (err) {
      console.error('❌ Failed to save agent:', err);
      setError('❌ Failed to save agent');
    }
  };

  // ✅ Edit an agent
  const edit = (agent) => {
    setForm({
      _id: agent._id,
      name: agent.name,
      address: agent.address,
      phoneNumber: agent.phoneNumber,
      licenseNumber: agent.licenseNumber,
      vehicleType: agent.vehicleType,
      password: '',
      license: null,
    });
    setEditingId(agent._id);
    setError('');
  };

  // ✅ Delete agent
  const remove = async (id) => {
    if (!window.confirm('Delete this agent?')) return;
    try {
      await axios.delete(`${API}/${id}`);
      await load();
    } catch (err) {
      console.error('❌ Failed to delete agent:', err);
    }
  };

  // ✅ Reset form and editing mode
  const resetForm = () => {
    setForm({});
    setEditingId(null);
    setError('');
  };

  return {
    agents,
    form,
    setForm,
    editingId,
    error,
    handleChange,
    save,
    edit,
    remove,
    resetForm, // ✅ important for cancel button
  };
};

export default useDeliveryAgentViewModel;
