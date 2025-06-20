// routes/admin.js
const express = require('express');
const router = express.Router();
const {
  getStore,
  updateStore
} = require('../controllers/adminController');

router.get('/get-store', getStore);
router.put('/update-store/:id', updateStore);

module.exports = router;
