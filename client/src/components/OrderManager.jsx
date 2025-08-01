import React, { useState } from 'react';
import { FaHome } from 'react-icons/fa'; 
import useAdminOrderViewModel from '../viewmodels/useAdminOrderViewModel';
import '../styles/OrderManager.css';

const OrderManager = () => {
  const {
    orders,
    availableEmployees,
    availableAgents,
    loading,
    error,
    assignEmployee,
    assignAgent,
  } = useAdminOrderViewModel();

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(null);

  const toggleCustomerInfo = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  const toggleItems = (orderId) => {
    setExpandedItems((prevId) => (prevId === orderId ? null : orderId));
  };

  const activeOrders = orders.filter(
    (order) => order.agentStatus?.toLowerCase() !== 'delivered successful'
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-manager">
       {/* Home Icon Top Left */}
      <div className="home-icon">
        <a href="/admin-dashboard"><FaHome size={24} /></a>
      </div>

      <h2 className="page-title">📦 Active Orders Management</h2>

      {activeOrders.length === 0 ? (
        <div className="no-orders">No active orders available.</div>
      ) : (
        <div className="orders-grid">
          {activeOrders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Header */}
              <div className="order-card-header">
                <div>
                  <strong>Order ID:</strong> {order._id}
                  <br />
                  <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                </div>
                <button
                  className="toggle-btn"
                  onClick={() => toggleCustomerInfo(order._id)}
                >
                  {expandedOrderId === order._id ? 'Hide Customer ▲' : 'Show Customer ▼'}
                </button>
              </div>

              {/* Customer Info */}
              {expandedOrderId === order._id && order.addressId && (
                <div className="customer-info">
                  <p><strong>Name:</strong> {order.addressId.full_name}</p>
                  <p><strong>Phone:</strong> {order.addressId.phone_no}</p>
                  <p>
                    <strong>Address:</strong><br />
                    {order.addressId.house_building_name}, {order.addressId.street_area},<br />
                    {order.addressId.locality && `${order.addressId.locality}, `}
                    {order.addressId.city} - {order.addressId.pincode},<br />
                    {order.addressId.state}
                  </p>
                </div>
              )}

              {/* Assign Sections */}
              <div className="assignment-sections">
                {/* Employee */}
                <div className="assign-box employee-box">
                  <h4>👨‍💼 Employee</h4>
                  <p><strong>Assigned:</strong> {order.assignedEmployee ? `${order.assignedEmployee.empId} - ${order.assignedEmployee.name}` : 'None'}</p>
                  <p>Status: <span className={`status-badge employee-${order.employeeStatus?.toLowerCase()}`}>{order.employeeStatus || '-'}</span></p>
                  {order.employeeStatus === 'Declined' && (
                    <p><strong>Reason:</strong> {order.declineReason || 'Not specified'}</p>
                  )}
                  {!order.assignedEmployee && (
                    <select
                      className="dropdown"
                      onChange={(e) => assignEmployee(order._id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Select Employee</option>
                      {availableEmployees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.empId} - {emp.name} ({emp.activeOrders || 0} active)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Agent */}
                <div className="assign-box agent-box">
                  <h4>🚚 Agent</h4>
                  <p><strong>Assigned:</strong> {order.assignedAgent ? `${order.assignedAgent.agentId} - ${order.assignedAgent.name}` : 'None'}</p>
                  <p>Status: <span className={`status-badge agent-${order.agentStatus?.toLowerCase()}`}>{order.agentStatus || '-'}</span></p>
                  {order.employeeStatus === 'Completed' &&
                    (!order.assignedAgent || order.agentStatus === 'Declined') && (
                      <select
                        className="dropdown"
                        onChange={(e) => assignAgent(order._id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Agent</option>
                        {availableAgents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.agentId} - {agent.name} ({agent.activeDeliveries || 0} deliveries)
                          </option>
                        ))}
                      </select>
                  )}
                </div>
              </div>

              {/* Order Items Toggle */}
              <button
                className="toggle-btn item-toggle"
                onClick={() => toggleItems(order._id)}
              >
                {expandedItems === order._id ? 'Hide Items ▲' : 'Show Items ▼'}
              </button>

              {/* Items Section */}
              {expandedItems === order._id && (
                <div className="items-section">
                  <h4>🛒 Order Items</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="item-card">
                      <p><strong>{item.ProductName}</strong></p>
                      <p>Qty: {item.quantity} | ₹{item.Price}</p>
                      <span className={`status-badge item-${item.status?.toLowerCase()}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
