import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHome } from 'react-icons/fa';
import '../styles/AllOrders.css';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/orders')
      .then(res => {
        const deliveredOrders = res.data
          .filter(order => order.orderStatus === 'Delivered Successful')
          .sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt));
        setOrders(deliveredOrders);
      })
      .catch(err => console.error('Error fetching orders:', err));
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    return date.toISOString().split('T')[0];
  };

  const filteredOrders = orders.filter(order => {
    const deliveredDate = formatDate(order.deliveredAt);
    if (!searchDate) return true;
    return deliveredDate === searchDate;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="page">
      <div className="orders-container">
        <button className="back-btn" onClick={() => navigate('/admin-dashboard')}>
          <FaHome style={{ marginRight: '8px' }} />
          Back to Dashboard
        </button>

        <h2>Delivered Orders</h2>

        <div className="date-filter-container">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => {
              setSearchDate(e.target.value);
              setCurrentPage(1);
            }}
            className="order-search-input"
          />
          {searchDate && (
            <button className="clear-btn" onClick={() => setSearchDate('')}>
              Clear
            </button>
          )}
        </div>

        <div className="orders-list">
          {currentOrders.length > 0 ? (
            currentOrders.map(order => (
              <div
                key={order._id}
                className="order-card"
                onClick={() => navigate(`/order/${order._id}`)}
              >
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Date:</strong> {formatDate(order.deliveredAt)}</p>
                <p><strong>Status:</strong> {order.orderStatus}</p>
              </div>
            ))
          ) : (
            <p>No "Delivered Successful" orders found for this date.</p>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredOrders.length > 0 && (
          <div className="pagination">
            <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>

            {totalPages > 1 && (
              [...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))
            )}

            <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
