import { useEffect, useState } from 'react';
import {
  fetchOrders,
  fetchAvailableEmployees,
  fetchAvailableAgents,
  assignEmployee,
  assignDeliveryAgent,
} from '../models/orderService';

const useAdminOrderViewModel = () => {
  const [orders, setOrders] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Load all data at once
  const loadData = async () => {
    try {
      const [ordersRes, employeesRes, agentsRes] = await Promise.all([
        fetchOrders(),
        fetchAvailableEmployees(),
        fetchAvailableAgents(),
      ]);
      setOrders(ordersRes.data);
      setAvailableEmployees(employeesRes.data);
      setAvailableAgents(agentsRes.data);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError('❌ Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Assign employee to an order
  const assignEmployeeToOrder = async (orderId, empId) => {
    try {
      await assignEmployee(orderId, empId);
      loadData();
    } catch (err) {
      console.error('❌ Failed to assign employee:', err);
      setError('❌ Failed to assign employee');
    }
  };

  // ✅ Assign delivery agent to an order
  const assignAgentToOrder = async (orderId, agentId) => {
    try {
      await assignDeliveryAgent(orderId, agentId);
      loadData();
    } catch (err) {
      console.error('❌ Failed to assign agent:', err);
      setError('❌ Failed to assign agent');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    orders,
    availableEmployees,
    availableAgents,
    loading,
    error,
    assignEmployee: assignEmployeeToOrder,
    assignAgent: assignAgentToOrder,
  };
};

export default useAdminOrderViewModel;
