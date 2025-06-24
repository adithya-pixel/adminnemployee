// routes/admin.js
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); 
const {
  getStore,
  updateStore
} = require('../controllers/adminController');

router.get('/get-store', getStore);
router.put('/update-store/:id', updateStore);
router.get('/complaints', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user_id', 'name email phone_no');
    // console.log("Fetched Complaints:", feedbacks); // ✅ For debug
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch complaints', error });
  }
});
module.exports = router;