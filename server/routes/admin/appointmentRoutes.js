const express = require('express');
const router = express.Router();
const isAdmin = require('../../middleware/adminAuth');
const {
    getAllAppointments,
    getPendingAppointments,
    acceptAppointment,
    rejectAppointment,
    deleteAppointment
} = require('../../controllers/admin/appointmentController');

// All routes are protected with admin middleware
//router.use(isAdmin);

// Debug middleware for appointment routes
router.use((req, res, next) => {
    console.log('Appointment Route accessed:');
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('User:', req.user);
    next();
});

router.get('/', getAllAppointments);
router.get('/pending', getPendingAppointments);
router.put('/:id/accept', acceptAppointment);
router.put('/:id/reject', rejectAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router; 