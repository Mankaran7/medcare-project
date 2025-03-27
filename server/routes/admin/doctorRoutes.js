const express = require('express');
const router = express.Router();
const isAdmin = require('../../middleware/adminAuth');
const { upload } = require('../../config/cloudinary');
const {
    getAllDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorById,
    searchDoctors
} = require('../../controllers/admin/doctorController');

// Public routes
router.get('/public', getAllDoctors);
router.get('/public/:id', getDoctorById);
router.get('/search', searchDoctors);

// Admin protected routes
//router.use(isAdmin);

router.get('/', getAllDoctors);
router.post('/create', upload.single('image'), addDoctor);
router.put('/:id', upload.single('image'), updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router; 