import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ViewComplaints.css';

const ViewComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [statusQuery, setStatusQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/admin/complaints')
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setComplaints(sorted);
        setFilteredComplaints(sorted);
      })
      .catch(err => console.error('Error:', err));
  }, []);

  const formatStatus = (status) => {
    const validStatuses = ['Pending', 'In Review', 'Resolved', 'Rejected'];
    if (!status || typeof status !== 'string') return 'Pending';
    const formatted = status.trim();
    return validStatuses.includes(formatted) ? formatted : 'Pending';
  };

  const getStatusClass = (status) => {
    const key = formatStatus(status).replace(/\s+/g, '-');
    return `status-badge ${key}`;
  };

  const filterComplaints = (date, statusSearch) => {
    let filtered = [...complaints];

    if (date) {
      filtered = filtered.filter(c => {
        const complaintDate = new Date(c.created_at).toISOString().split('T')[0];
        return complaintDate === date;
      });
    }

    if (statusSearch) {
      filtered = filtered.filter(c =>
        formatStatus(c.status).toLowerCase().includes(statusSearch.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setSearchDate(selectedDate);
    filterComplaints(selectedDate, statusQuery);
  };

  const handleStatusChange = (e) => {
    const query = e.target.value;
    setStatusQuery(query);
    filterComplaints(searchDate, query);
  };

  const handleClear = () => {
    setSearchDate('');
    setStatusQuery('');
    setFilteredComplaints(complaints);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLast = currentPage * complaintsPerPage;
  const indexOfFirst = indexOfLast - complaintsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="complaints-page">
      <button onClick={() => navigate('/admin-dashboard')} className="home-button" title="Go to Dashboard">
        Back to Dashboard
      </button>

      <div className="complaints-container">
        <h2 className="complaints-title">Complaints Management</h2>

        <div className="search-controls">
          <input
            type="date"
            value={searchDate}
            onChange={handleDateChange}
            className="date-input"
          />
          <input
            type="text"
            value={statusQuery}
            onChange={handleStatusChange}
            placeholder="Search by status..."
            className="status-input"
          />
          <button onClick={handleClear} className="clear-button">Clear</button>
        </div>

        {currentComplaints.length === 0 ? (
          <p className="no-complaints">No complaints found.</p>
        ) : (
          <>
            <div className="complaints-list">
              {currentComplaints.map((c) => (
                <div
                  key={c._id}
                  className="complaint-card"
                  onClick={() => navigate(`/view-complaints/${c._id}`)}
                >
                  <p><strong>User ID:</strong> {c.user_id?._id || 'Unknown'}</p>
                  <p><strong>Date:</strong> {new Date(c.created_at).toLocaleString()}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={getStatusClass(c.status)}>
                      {formatStatus(c.status)}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewComplaints;
