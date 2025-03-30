const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAvailableSlots,
    bookAppointment,
  
} = require('../controllers/appointmentController');


router.get('/available-slots/:doctorId/:date', getAvailableSlots);

// Protected routes (require authentication)
router.post('/book', protect, bookAppointment);


module.exports = router; 