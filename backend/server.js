// server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
require('./models/Address');
// Import routes
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employeeRoutes');
const deliveryAgentRoutes = require('./routes/deliveryAgentRoutes');
const orderRoutes = require('./routes/orderRoutes'); // ✅ Fix this import

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images (like ID proofs, delivery images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/admin', adminRoutes); // Admin management
app.use('/api/employees', employeeRoutes); // Employee management
app.use('/api/delivery-agents', deliveryAgentRoutes); // Delivery agent routes
app.use('/api/admin/orders', orderRoutes); // ✅ Orders (with assignment and address)

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
