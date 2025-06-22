const Order = require('../models/Order');
const Employee = require('../models/Employee');
const DeliveryAgent = require('../models/DeliveryAgent');

// ✅ Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('addressId')
      .populate('assignedEmployee', 'name empId availability activeOrders')
      .populate('assignedAgent', 'name agentId availability activeDeliveries');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get available employees
exports.getAvailableEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('name empId activeOrders');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get available agents
exports.getAvailableAgents = async (req, res) => {
  try {
    const agents = await DeliveryAgent.find().select('name agentId activeDeliveries');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Assign employee to an order
exports.assignEmployee = async (req, res) => {
  const { orderId, employeeId } = req.body;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (employee.activeOrders >= 5) {
      return res.status(400).json({ message: 'Employee has max active orders' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.assignedEmployee) {
      return res.status(400).json({ message: 'Order already has an assigned employee' });
    }

    order.assignedEmployee = employeeId;
    order.employeeStatus = 'Ready for Assembly';
    order.orderStatus = 'Ready for Assembly';
    await order.save();

    employee.activeOrders += 1;
    await employee.save();

    res.json({ message: 'Employee assigned successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Assign agent to an order
exports.assignDeliveryAgent = async (req, res) => {
  const { orderId, agentId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.assignedAgent) {
      return res.status(400).json({ message: 'Agent already assigned to this order' });
    }

    const agent = await DeliveryAgent.findById(agentId);
    if (!agent) return res.status(404).json({ message: 'Delivery Agent not found' });

    if (agent.activeDeliveries >= 5) {
      return res.status(400).json({ message: 'Agent has max active deliveries' });
    }

    order.assignedAgent = agentId;
    order.agentStatus = 'Delivery in-progress';
    order.orderStatus = 'Delivery in-progress';
    await order.save();

    agent.activeDeliveries += 1;
    await agent.save();

    res.json({ message: 'Agent assigned successfully', order });
  } catch (err) {
    console.error('❌ Error assigning agent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Mark order as completed and decrement counts
// ✅ Mark order as completed by employee only
exports.markOrderCompleted = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // ✅ Only update employeeStatus, NOT agentStatus
    order.employeeStatus = 'Completed';
    order.orderStatus = 'Awaiting Delivery Agent'; // 🟡 Optional: Update this for clarity
    await order.save();

    // ✅ Recalculate employee activeOrders
    const employeeId = order.assignedEmployee;
    if (employeeId) {
      const activeCount = await Order.countDocuments({
        assignedEmployee: employeeId,
        employeeStatus: { $nin: ['Completed', 'Declined'] }
      });

      await Employee.findByIdAndUpdate(employeeId, {
        activeOrders: activeCount
      });

      console.log(`✅ Updated activeOrders to ${activeCount} for employee`);
    }

    res.json({ message: 'Order marked as completed by employee', updatedOrder: order });
  } catch (err) {
    console.error('❌ Error marking order completed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Update status of a specific item in an order
exports.updateItemStatus = async (req, res) => {
  const { orderId, itemIndex, status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // update specific item status
    if (order.items[itemIndex]) {
      order.items[itemIndex].status = status;
      await order.save();
      res.json({ message: 'Item status updated', order });
    } else {
      res.status(400).json({ message: 'Invalid item index' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Allow employee to decline an order
// ✅ Allow employee to decline an order
exports.declineOrder = async (req, res) => {
  const { orderId, reason } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const employeeId = order.assignedEmployee;

    // Save reason inside the order
    order.assignedEmployee = null;
    order.employeeStatus = 'Declined';
    order.orderStatus = 'Pending';
    order.declineReason = reason || ''; // 📝 Add reason here
    await order.save();

    // Decrease activeOrders count of employee
    if (employeeId) {
      const employee = await Employee.findById(employeeId);
      if (employee && employee.activeOrders > 0) {
        employee.activeOrders -= 1;
        await employee.save();
      }
    }

    res.json({ message: 'Order declined successfully', order });
  } catch (err) {
    console.error('❌ Error declining order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
