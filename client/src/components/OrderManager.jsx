import React from 'react';
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-manager">
      <h2 className="page-title">Admin: Orders</h2>

      {orders.length === 0 ? (
        <div className="no-orders">No orders found.</div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span className="label">Order ID:</span>
                  <span className="value">{order._id}</span>
                </div>
                <div className="order-date">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {order.addressId ? (
                <div className="customer-info">
                  <h4 className="section-title">Customer Information</h4>
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{order.addressId.full_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{order.addressId.phone_no}</span>
                  </div>
                  <div className="address-section">
                    <span className="label">Address:</span>
                    <div className="address-value">
                      {order.addressId.house_building_name},<br />
                      {order.addressId.street_area},<br />
                      {order.addressId.locality ? `${order.addressId.locality},` : null}<br />
                      {order.addressId.city} - {order.addressId.pincode},<br />
                      {order.addressId.state}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="customer-info">
                  <span className="label">Address:</span>
                  <span className="value na">N/A</span>
                </div>
              )}

              <div className="payment-status">
                <span className="label">Payment Status:</span>
                <span className={`status-badge payment-${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>

              <div className="assignment-section">
                <h4 className="section-title">Employee Assignment</h4>
                <div className="info-row">
                  <span className="label">Assigned Employee:</span>
                  <span className="value">
                    {order.assignedEmployee
                      ? `${order.assignedEmployee.empId} - ${order.assignedEmployee.name}`
                      : 'None'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Employee Status:</span>
                  <span className={`status-badge employee-${order.employeeStatus?.toLowerCase()}`}>
                    {order.employeeStatus || '-'}
                  </span>
                </div>
                {(order.employeeStatus === 'Declined' || order.orderStatus === 'Declined by Employee') && (
                  <div className="decline-reason">
                    <span className="label">Decline Reason:</span>
                    <span className="value">{order.declineReason || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div className="assignment-section">
                <h4 className="section-title">Delivery Agent Assignment</h4>
                <div className="info-row">
                  <span className="label">Assigned Agent:</span>
                  <span className="value">
                    {order.assignedAgent
                      ? `${order.assignedAgent.agentId} - ${order.assignedAgent.name}`
                      : 'None'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Agent Status:</span>
                  <span className={`status-badge agent-${order.agentStatus?.toLowerCase()}`}>
                    {order.agentStatus || '-'}
                  </span>
                </div>
              </div>

              <div className="delivery-proof">
                <h4 className="section-title">Delivery Proof</h4>
                {order.deliveryProofImage ? (
                  <img
                    src={order.deliveryProofImage}
                    alt="Proof of Delivery"
                    className="proof-image"
                  />
                ) : (
                  <div className="no-proof">Not uploaded</div>
                )}
              </div>

              <div className="customer-note">
                <span className="label">Customer Note:</span>
                <span className="value">{order.customerConfirmationNote || 'Not provided'}</span>
              </div>

              <div className="items-section">
                <h4 className="section-title">Order Items</h4>
                <div className="items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-name">{item.ProductName}</div>
                      <div className="item-details">
                        <span>Qty: {item.quantity}</span>
                        <span>Price: ₹{item.Price}</span>
                        <span className={`item-status status-${item.status?.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment Controls */}
              <div className="assignment-controls">
                {!order.assignedEmployee && (
                  <div className="assign-section">
                    <label className="assign-label">
                      Assign Employee:
                      <select
                        className="assign-select"
                        onChange={(e) => {
                          const empId = e.target.value;
                          if (empId) assignEmployee(order._id, empId);
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Employee</option>
                        {availableEmployees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.empId} - {emp.name} ({emp.activeOrders || 0} active)
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                {order.employeeStatus === 'Completed' && !order.assignedAgent && (
                  <div className="assign-section">
                    <label className="assign-label">
                      Assign Delivery Agent:
                      <select
                        className="assign-select"
                        onChange={(e) => {
                          const agentId = e.target.value;
                          if (agentId) assignAgent(order._id, agentId);
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Agent</option>
                        {availableAgents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.agentId} - {agent.name} ({agent.activeDeliveries || 0} deliveries)
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
