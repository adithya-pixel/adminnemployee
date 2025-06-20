// models/settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: String,
  address: String,
  workingHours: String,
  latitude: Number,
  longitude: Number,
  deliveryRadius: Number
}, { collection: 'settings' }); // 👈 make sure it matches your MongoDB collection name

module.exports = mongoose.model('Settings', settingsSchema);