const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

//  ORDER MANAGEMENT ROUTES
router.get('/', orderController.getAllOrders);
router.post('/update-item-status', orderController.updateItemStatus);

//  EMPLOYEE ROUTES
router.get('/available-employees', orderController.getAvailableEmployees);
router.put('/assign-employee', orderController.assignEmployee);
router.put('/mark-completed', orderController.markOrderCompletedByEmployee); 
router.post('/decline-order', orderController.declineOrderByEmployee);       

// AGENT ROUTES
router.get('/available-agents', orderController.getAvailableAgents);
router.put('/assign-agent', orderController.assignDeliveryAgent);
router.post('/agent-accept', orderController.agentAcceptOrder);              
router.post('/agent-decline', orderController.agentDeclineOrder);            
router.put('/mark-delivered', orderController.markOrderDeliveredByAgent);  
// ✅ Route to fetch single order by ID
router.get('/:id', orderController.getOrderById);
module.exports = router;  

module.exports = router;
