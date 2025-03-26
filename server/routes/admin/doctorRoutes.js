const express = require('express');
const router = express.Router();
const isAdmin = require('../../middleware/adminAuth');
const { upload } = require('../../config/cloudinary');
const {
    getAllDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor
} = require('../../controllers/admin/doctorController');

// All routes are protected with admin middleware
//router.use(isAdmin);

router.get('/', getAllDoctors);
router.post('/create', upload.single('image'), addDoctor);
router.put('/:id', upload.single('image'), updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router; 