// src/viewmodels/useSettingsViewModel.js
import { useState, useEffect } from 'react';
import { getStoreData, updateStoreData } from '../models/settingsModel';

const useStoreViewModel = () => {
  const [storeData, setStoreData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStoreData();
        setStoreData(data);
        setFormData(data);
      } catch (error) {
        console.error('❌ Failed to fetch store data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    try {
      const updated = await updateStoreData(formData._id, formData);
      setStoreData(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Failed to update store data', error);
    }
  };

  return {
    storeData,
    formData,
    isEditing,
    loading,
    setIsEditing,
    handleChange,
    saveChanges
  };
};

export default useStoreViewModel;
