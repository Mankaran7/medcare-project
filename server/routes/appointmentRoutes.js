const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAvailableSlots,
    bookAppointment,
    getMyAppointments,
    cancelAppointment
} = require('../controllers/appointmentController');

// Public routes
router.get('/available-slots/:doctorId/:date', getAvailableSlots);

// Protected routes (require authentication)
router.post('/book', protect, bookAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.delete('/cancel/:appointmentId', protect, cancelAppointment);

module.exports = router; 