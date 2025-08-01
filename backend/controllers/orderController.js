// controllers/orderController.js


const Order         = require('../models/Order');
const Employee      = require('../models/Employee');
const DeliveryAgent = require('../models/DeliveryAgent');


const MAX_ACTIVE_ORDERS      = 5; 
const MAX_ACTIVE_DELIVERIES  = 5; 

// ─────────────────────────────────────────────────────────
//  GETTERS
// ─────────────────────────────────────────────────────────
/**  List *all* orders (populated) */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('addressId')
      .populate('assignedEmployee', 'name empId availability activeOrders')
      .populate('assignedAgent',    'name agentId availability activeDeliveries');

    res.json(orders);
  } catch (err) {
    console.error('❌ getAllOrders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**  Employees with room for more active orders */
exports.getAvailableEmployees = async (_req, res) => {
  try {
    const employees = await Employee.find({
      activeOrders: { $lt: MAX_ACTIVE_ORDERS }
    }).select('name empId activeOrders');

    res.json(employees);
  } catch (err) {
    console.error('❌ getAvailableEmployees:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Agents with room for more active deliveries */
exports.getAvailableAgents = async (_req, res) => {
  try {
    const agents = await DeliveryAgent.find({
      activeDeliveries: { $lt: MAX_ACTIVE_DELIVERIES }
    }).select('name agentId activeDeliveries');

    res.json(agents);
  } catch (err) {
    console.error('❌ getAvailableAgents:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────
//  EMPLOYEE FLOW
// ─────────────────────────────────────────────────────────
/** Assign an employee to pick / assemble an order */
exports.assignEmployee = async (req, res) => {
  const { orderId, employeeId } = req.body;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)                    return res.status(404).json({ message: 'Employee not found' });
    if (employee.activeOrders >= MAX_ACTIVE_ORDERS)
                                      return res.status(400).json({ message: 'Employee has max active orders' });

    const order = await Order.findById(orderId);
    if (!order)                       return res.status(404).json({ message: 'Order not found' });
    if (order.assignedEmployee)       return res.status(400).json({ message: 'Order already has an assigned employee' });

    order.assignedEmployee = employeeId;
    order.employeeStatus   = 'Ready for Assembly';
    order.orderStatus      = 'Ready for Assembly';
    await order.save();

    employee.activeOrders += 1;
    await employee.save();

    res.json({ message: 'Employee assigned successfully', order });
  } catch (err) {
    console.error('❌ assignEmployee:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**  Employee finishes picking items */
exports.markOrderCompletedByEmployee = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only employee status changes here
    order.employeeStatus = 'Completed';
    order.orderStatus    = 'Awaiting Delivery Agent';
    await order.save();

    // Recompute the employee’s active‑order count
    const employeeId  = order.assignedEmployee;
    if (employeeId) {
      const activeCnt = await Order.countDocuments({
        assignedEmployee: employeeId,
        employeeStatus: { $nin: ['Completed', 'Declined'] }
      });
      await Employee.findByIdAndUpdate(employeeId, { activeOrders: activeCnt });
    }

    res.json({ message: 'Order marked completed by employee', order });
  } catch (err) {
    console.error('❌ markOrderCompletedByEmployee:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**  Employee declines the order */
exports.declineOrderByEmployee = async (req, res) => {
  const { orderId, reason = '' } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const employeeId = order.assignedEmployee;

    order.assignedEmployee = null;
    order.employeeStatus   = 'Declined';
    order.orderStatus      = 'Pending';
    order.declineReason    = reason;
    await order.save();

    // Decrement employee activeOrders safely
    if (employeeId) {
      const activeCnt = await Order.countDocuments({
        assignedEmployee: employeeId,
        employeeStatus: { $nin: ['Completed', 'Declined'] }
      });
      await Employee.findByIdAndUpdate(employeeId, { activeOrders: activeCnt });
    }

    res.json({ message: 'Order declined by employee', order });
  } catch (err) {
    console.error('❌ declineOrderByEmployee:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────
//  AGENT FLOW
// ─────────────────────────────────────────────────────────
/** Tentatively assign an agent (awaits their acceptance) */
exports.assignDeliveryAgent = async (req, res) => {
  const { orderId, agentId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // ⛔ Allow reassign only if no agent assigned OR status is Declined
    if (order.assignedAgent && order.agentStatus !== 'Declined') {
      return res.status(400).json({ message: 'Agent already assigned to this order' });
    }

    const agent = await DeliveryAgent.findById(agentId);
    if (!agent) return res.status(404).json({ message: 'Delivery agent not found' });
    if (agent.activeDeliveries >= MAX_ACTIVE_DELIVERIES) {
      return res.status(400).json({ message: 'Agent has max active deliveries' });
    }

    order.assignedAgent = agentId;
    order.agentStatus = 'Waiting for Acceptance';
    order.orderStatus = 'Waiting for Acceptance';
    order.declineReason = ''; // Optional: clear previous decline reason
    await order.save();

    res.json({ message: 'Agent invited, awaiting acceptance', order });
  } catch (err) {
    console.error('❌ assignDeliveryAgent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**  Agent accepts the delivery invitation */
exports.agentAcceptOrder = async (req, res) => {
  const { orderId, agentId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order)                              return res.status(404).json({ message: 'Order not found' });
    if (String(order.assignedAgent) !== agentId)
                                             return res.status(400).json({ message: 'Agent not assigned to this order' });
    if (order.agentStatus !== 'Waiting for Acceptance')
                                             return res.status(400).json({ message: 'Order already accepted / cancelled' });

    const agent = await DeliveryAgent.findById(agentId);
    if (!agent)                              return res.status(404).json({ message: 'Delivery agent not found' });
    if (agent.activeDeliveries >= MAX_ACTIVE_DELIVERIES)
                                             return res.status(400).json({ message: 'Agent has max active deliveries' });

    order.agentStatus = 'Delivery in‑progress';
    order.orderStatus = 'Delivery in‑progress';
    await order.save();

    agent.activeDeliveries += 1;
    await agent.save();

    res.json({ message: 'Order accepted – delivery started', order });
  } catch (err) {
    console.error('❌ agentAcceptOrder:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Agent declines the invitation */
exports.agentDeclineOrder = async (req, res) => {
  const { orderId, agentId, reason = '' } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order)                              return res.status(404).json({ message: 'Order not found' });
    if (String(order.assignedAgent) !== agentId)
                                             return res.status(400).json({ message: 'Agent not assigned to this order' });

    order.assignedAgent = null;
    order.agentStatus   = 'Declined';
    order.orderStatus   = 'Awaiting Delivery Agent';
    order.declineReason = reason;
    await order.save();

    // Agent’s activeDeliveries only increments on accept, so nothing to decrement
    res.json({ message: 'Order declined by agent', order });
  } catch (err) {
    console.error('❌ agentDeclineOrder:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**  Agent finishes the delivery */
exports.markOrderDeliveredByAgent = async (req, res) => {
  const { orderId, agentId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order)                              return res.status(404).json({ message: 'Order not found' });
    if (String(order.assignedAgent) !== agentId)
                                             return res.status(400).json({ message: 'Agent not assigned to this order' });

    order.agentStatus = 'Completed';
    order.orderStatus = 'Completed';
    await order.save();

    // Re‑compute agent’s active deliverables
    const activeCnt = await Order.countDocuments({
      assignedAgent: agentId,
      agentStatus: { $nin: ['Completed', 'Declined'] }
    });
    await DeliveryAgent.findByIdAndUpdate(agentId, { activeDeliveries: activeCnt });

    res.json({ message: 'Order delivered successfully', order });
  } catch (err) {
    console.error('❌ markOrderDeliveredByAgent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────
//  ITEM‑LEVEL STATUS
// ─────────────────────────────────────────────────────────
/**  Update the status of a single item inside an order */
exports.updateItemStatus = async (req, res) => {
  const { orderId, itemIndex, status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.items[itemIndex])
      return res.status(400).json({ message: 'Invalid item index' });

    order.items[itemIndex].status = status;
    await order.save();

    res.json({ message: 'Item status updated', order });
  } catch (err) {
    console.error('❌ updateItemStatus:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// ✅ Get a single order by ID
exports.getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
    .populate('user', 'name phone_no')
      .populate('addressId')
      .populate('assignedEmployee', 'name empId')
      .populate('assignedAgent', 'name agentId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('❌ getOrderById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};