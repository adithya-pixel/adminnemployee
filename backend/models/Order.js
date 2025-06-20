// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },

  items: [
    {
      Barcode: String,
      ProductName: String,
      Price: Number,
      quantity: Number,
      image: String,
      status: { type: String, enum: ['Pending','Picked','Packed'], default: 'Pending' }
    },
  ],

  totalPrice: Number,
  gst: Number,
  grandTotal: Number,

  paymentId: String,
  paymentStatus: { type: String, default: 'Pending' },

  createdAt: { type: Date, default: Date.now },

  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  employeeStatus: {
    type: String,
    enum: ['Ready for Assembly','Ready for Packing','Ready for Delivery','Completed', null],
    default: null
  },

  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent', default: null },
  agentStatus: {
    type: String,
    enum: ['Delivery in-progress','Delivered','Completed', null],
    default: null
  },

  deliveryProofImage: { type: String, default: null },
  customerConfirmationNote: { type: String, default: null },

  orderStatus: {
    type: String,
    enum: [
      'Ready for Assembly',
      'Ready for Packing',
      'Ready for Delivery',
      'Delivery in-progress',
      'Delivered',
      'Completed',
    ],
    default: 'Ready for Assembly',
  },
});

module.exports = mongoose.model('Order', orderSchema);
