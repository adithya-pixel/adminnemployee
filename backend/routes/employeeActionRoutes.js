// backend/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const {
  getEmployeeProfile,
  getEmployeeOrders,
  updateItemStatus,
  completeOrder,
  declineOrder
} = require('../controllers/employeeActionsController');

router.get('/profile/:empId', getEmployeeProfile);
router.get('/orders/:empId', getEmployeeOrders);
router.put('/update-item-status', updateItemStatus);
router.post('/complete-order', completeOrder);
router.post('/decline-order', declineOrder);

module.exports = router;