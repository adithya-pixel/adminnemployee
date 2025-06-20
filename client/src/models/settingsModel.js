// src/models/settingsModel.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/admin';

export const getStoreData = async () => {
  const response = await axios.get(`${API_BASE}/get-store`);
  return response.data;
};

export const updateStoreData = async (id, data) => {
  const response = await axios.put(`${API_BASE}/update-store/${id}`, data);
  return response.data;
};
