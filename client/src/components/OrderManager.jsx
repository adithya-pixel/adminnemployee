import React from 'react';
import useAdminOrderViewModel from '../viewmodels/useAdminOrderViewModel';

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="order-manager">
      <h2>Admin: Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            {order.addressId ? (
              <div>
                <p><strong>Customer:</strong> {order.addressId.full_name}</p>
                <p><strong>Phone:</strong> {order.addressId.phone_no}</p>
                <p><strong>Address:</strong><br />
                  {order.addressId.house_building_name},<br />
                  {order.addressId.street_area},<br />
                  {order.addressId.locality && `${order.addressId.locality},`}<br />
                  {order.addressId.city} - {order.addressId.pincode},<br />
                  {order.addressId.state}
                </p>
              </div>
            ) : (
              <p><strong>Address:</strong> N/A</p>
            )}

            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>

            <p><strong>Assigned Employee:</strong>{' '}
              {order.assignedEmployee
                ? `${order.assignedEmployee.empId} - ${order.assignedEmployee.name}`
                : 'None'}
            </p>
            <p><strong>Employee Status:</strong> {order.employeeStatus || '-'}</p>

            <p><strong>Assigned Delivery Agent:</strong>{' '}
              {order.assignedAgent
                ? `${order.assignedAgent.agentId} - ${order.assignedAgent.name}`
                : 'None'}
            </p>
            <p><strong>Agent Status:</strong> {order.agentStatus || '-'}</p>

            <div>
              <strong>Delivery Proof:</strong><br />
              {order.deliveryProofImage ? (
                <img
                  src={order.deliveryProofImage}
                  alt="Proof of Delivery"
                  style={{ width: '200px', marginTop: '8px', borderRadius: '8px' }}
                />
              ) : (
                <p>Not uploaded</p>
              )}
            </div>

            <p><strong>Customer Note:</strong> {order.customerConfirmationNote || 'Not provided'}</p>

            <div>
              <strong>Items:</strong>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.ProductName} x {item.quantity} @ ₹{item.Price} — Status: {item.status}
                  </li>
                ))}
              </ul>
            </div>

            {/* ✅ Assign Employee */}
            {!order.assignedEmployee && (
              <div>
                <label>
                  Assign Employee:{' '}
                  <select
                    onChange={(e) => {
                      const empId = e.target.value;
                      if (empId) assignEmployee(order._id, empId);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.empId} - {emp.name} ({emp.activeOrders || 0} active)
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {/* ✅ Assign Agent only if Employee completed */}
            {order.employeeStatus === 'Completed' && !order.assignedAgent && (
              <div>
                <label>
                  Assign Delivery Agent:{' '}
                  <select
                    onChange={(e) => {
                      const agentId = e.target.value;
                      if (agentId) assignAgent(order._id, agentId);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select</option>
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
        ))
      )}
    </div>
  );
};

export default OrderManager;
