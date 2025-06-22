import React, { useEffect } from 'react';
import { useEmployeePannelViewModel } from '../viewmodels/useEmployeePannelViewModel';
import { useNavigate } from 'react-router-dom';
import '../styles/EmployeePanel.css';

const EmployeePanel = () => {
  const navigate = useNavigate();
  const {
  employee,
  orders,
  loading,
  error,
  fetchEmployeeData,
  updateItemStatus,
  completeOrder,
  declineOrder
} = useEmployeePannelViewModel(); // ✅ correct name


  useEffect(() => {
    fetchEmployeeData(); // 🔁 Fetch once when component mounts
  }, [fetchEmployeeData]); // ✅ No warning now

  if (loading) return <p>Loading employee dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="employee-panel">
      <h2>Employee Dashboard</h2>

      {employee && (
        <div className="employee-info">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Employee ID:</strong> {employee.empId}</p>
        </div>
      )}

      <h3>Assigned Orders</h3>

      {orders.length === 0 ? (
        <p>No orders assigned.</p>
      ) : (
        orders.map((order) => {
          const allPacked = order.items.every((item) => item.status === 'Packed');

          return (
            <div key={order._id} className="employee-order-card">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Status:</strong> {order.employeeStatus || 'Pending'}</p>
              <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>

              <div className="order-items">
                <strong>Items:</strong>
                <table className="item-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.ProductName || 'Unnamed Product'}</td>
                        <td>{item.quantity || 1}</td>
                        <td>
                          <select
                            value={item.status || 'Pending'}
                            onChange={(e) =>
                              updateItemStatus(order._id, idx, e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Packed">Packed</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-actions">
                {allPacked ? (
                  <button
                    className="complete-btn"
                    onClick={() => completeOrder(order._id)}
                  >
                    ✅ Complete Order
                  </button>
                ) : (
                  <button
                    className="decline-btn"
                    onClick={() => declineOrder(order._id)}
                  >
                    ❌ Decline Order
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem('employeeId');
          navigate('/');
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default EmployeePanel;
