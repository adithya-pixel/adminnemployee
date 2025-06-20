import { useState, useEffect } from 'react';
import * as api from '../models/employeeModel';

const useEmployeeViewModel = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await api.fetchEmployees();
    setEmployees(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const save = async () => {
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }

    if (editingId) {
      await api.updateEmployee(editingId, formData);
    } else {
      await api.addEmployee(formData);
    }

    setForm({});
    setEditingId(null);
    load();
  };

  const edit = (emp) => {
    setForm({
      _id: emp._id,
      empId: emp.empId,
      name: emp.name,
      address: emp.address,
      phoneNumber: emp.phoneNumber
    });
    setEditingId(emp._id);
  };

  const remove = async (id) => {
    await api.deleteEmployee(id);
    load();
  };

  return {
    employees,
    form,
    setForm,          // ✅ Important fix
    editingId,
    handleChange,
    save,
    edit,
    remove
  };
};

export default useEmployeeViewModel;
