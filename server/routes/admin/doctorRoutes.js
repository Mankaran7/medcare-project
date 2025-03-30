const express = require('express');
const router = express.Router();

const isAdmin = require('../../middleware/adminAuth');
const {
    getAllDoctors,

    deleteDoctor,
    getDoctorById,
    searchDoctors,
    getAllDoctorsAdmin
} = require('../../controllers/admin/doctorController');


// Public routes
router.get('/public', getAllDoctors);
router.get('/public/:id', getDoctorById);
router.get('/search', searchDoctors);

// Admin protected routes
//router.use(isAdmin);

router.get('/', getAllDoctors);
router.get('/all', getAllDoctorsAdmin);

router.delete('/:id',  deleteDoctor);

module.exports = router; 