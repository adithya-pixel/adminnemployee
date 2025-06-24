// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ Register all models before using them
require('./models/Address');
require('./models/User');
require('./models/Feedback');

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employeeRoutes');
const deliveryAgentRoutes = require('./routes/deliveryAgentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const employeeActionRoutes = require('./routes/employeeActionRoutes');

// ✅ Use Routes
app.use('/admin', adminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/delivery-agents', deliveryAgentRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeActionRoutes); // ✅ Keep after /api/auth to avoid path conflicts

// ✅ Default health route
app.get('/', (req, res) => {
  res.json({ message: 'Employee Login API Server Running' });
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
})
.catch(err => console.error('❌ MongoDB connection error:', err));
