const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 🧾 Order and employee routes
router.get('/', orderController.getAllOrders);
router.get('/available-employees', orderController.getAvailableEmployees);
router.put('/assign-employee', orderController.assignEmployee);

// ✅ Agent related routes
router.get('/available-agents', orderController.getAvailableAgents);
router.put('/assign-agent', orderController.assignDeliveryAgent);

// ✅ Completion route
router.put('/mark-completed', orderController.markOrderCompleted);
router.post('/update-item-status', orderController.updateItemStatus);
router.post('/decline-order', orderController.declineOrder);


module.exports = router;
