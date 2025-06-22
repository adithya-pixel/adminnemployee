const Employee = require('../models/Employee');
const Order = require('../models/Order');

// ✅ Get employee profile
const getEmployeeProfile = async (req, res) => {
  const empId = req.params.empId;
  try {
    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const activeOrderCount = await Order.countDocuments({
      assignedEmployee: employee._id,
      employeeStatus: { $nin: ['Completed', 'Declined'] }
    });

    if (employee.activeOrders !== activeOrderCount) {
      employee.activeOrders = activeOrderCount;
      await employee.save();
    }

    res.json({ employee });
  } catch (err) {
    console.error('❌ Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch employee profile' });
  }
};

// ✅ Get orders assigned to an employee
const getEmployeeOrders = async (req, res) => {
  const empId = req.params.empId;
  try {
    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const orders = await Order.find({ assignedEmployee: employee._id }).populate('addressId');
    res.json({ orders });
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// ✅ Update item status
const updateItemStatus = async (req, res) => {
  const { orderId, itemIndex, newStatus } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!order.items[itemIndex]) return res.status(400).json({ error: 'Invalid item index' });

    order.items[itemIndex].status = newStatus;
    const updatedOrder = await order.save();
    res.json({ updatedOrder });
  } catch (err) {
    console.error('❌ Error updating item status:', err);
    res.status(500).json({ error: 'Failed to update item status' });
  }
};
const completeOrder = async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.employeeStatus === 'Completed') {
      return res.status(400).json({ error: 'Order already completed' });
    }

    const allPacked = order.items.every(item => item.status === 'Packed');
    if (!allPacked) {
      return res.status(400).json({ error: 'Not all items are packed' });
    }

    // ✅ Update order first
    order.employeeStatus = 'Completed';
    order.orderStatus = 'Ready for Delivery'; // you can set whatever next status
    await order.save();

    // ✅ 🔥 Recalculate activeOrders for employee
    if (order.assignedEmployee) {
      const activeCount = await Order.countDocuments({
        assignedEmployee: order.assignedEmployee,
        employeeStatus: { $nin: ['Completed', 'Declined'] }
      });

      await Employee.findByIdAndUpdate(order.assignedEmployee, {
        activeOrders: activeCount
      });

      console.log(`✅ Updated activeOrders to ${activeCount}`);
    }

    res.json({ updatedOrder: order });
  } catch (err) {
    console.error('❌ Error completing order:', err);
    res.status(500).json({ error: 'Failed to complete order' });
  }
};


// ✅ Employee declines order
const declineOrder = async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const employeeId = order.assignedEmployee;

    order.assignedEmployee = null;
    order.employeeStatus = 'Declined';
    order.orderStatus = 'Pending';
    await order.save();

    if (employeeId) {
      const employee = await Employee.findById(employeeId);
      if (employee) {
        const activeCount = await Order.countDocuments({
          assignedEmployee: employee._id,
          employeeStatus: { $nin: ['Completed', 'Declined'] }
        });
        employee.activeOrders = activeCount;
        await employee.save();
        console.log(`❌ Order declined. activeOrders now ${activeCount} for ${employee.empId}`);
      }
    }

    res.json({ message: 'Order declined', updatedOrder: order });
  } catch (err) {
    console.error('❌ Error declining order:', err);
    res.status(500).json({ error: 'Failed to decline order' });
  }
};

module.exports = {
  getEmployeeProfile,
  getEmployeeOrders,
  updateItemStatus,
  completeOrder,
  declineOrder
};
