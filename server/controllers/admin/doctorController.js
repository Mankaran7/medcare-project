const db = require('../../config/db');

exports.getAllDoctors = async (req, res) => {
    try {
        const { page = 1, limit = 6 } = req.query;
        const offset = (page - 1) * limit;

        // Get total count
        const totalCount = await db.one(
            'SELECT COUNT(*) as total FROM doctors'
        );

        // Get paginated doctors
        const doctors = await db.any(
            'SELECT * FROM doctors ORDER BY doctor_id LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        res.json({
            ok: true,
            data: {
                rows: doctors,
                total: parseInt(totalCount.total),
                currentPage: parseInt(page),
                totalPages: Math.ceil(parseInt(totalCount.total) / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            ok: false,
            message: 'Error fetching doctors',
            error: error.message 
        });
    }
};

exports.addDoctor = async (req, res) => {
    try {
        const {
            doctor_name,
            degree,
            speciality,
            experience_years,
            location,
            available_time,
            ratings,
            gender,
            image,
        } = req.body;
        let imageUrl = req.file ? req.file.path : image;

        const availableTimeValue = available_time || "Not Available"; 
        const ratingsValue = ratings || 0; 
        const doctor = await db.one(
            `INSERT INTO doctors 
                (doctor_name, degree, speciality, experience_years, location, available_time, ratings, gender, doctor_photo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                doctor_name,
                degree,
                speciality,
                experience_years,
                location,
                availableTimeValue,
                ratingsValue,
                gender,
                imageUrl,
            ]
        );
        res.status(201).json({
            message: "Doctor added successfully",
            doctor,
        });
    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({ 
            message: "Error adding doctor", 
            error: error.message 
        });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { field, value } = req.body; 
        const validFields = ['doctor_name', 'degree', 'speciality', 'experience_years', 'location', 'available_time', 'ratings', 'gender', 'image'];
        if (!validFields.includes(field)) {
            return res.status(400).json({ message: 'Invalid field for update' });
        }

        const query = `UPDATE doctors SET ${field} = $1 WHERE id = $2 RETURNING *`;

        const doctor = await db.one(query, [value, id]);

        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Error updating doctor', error: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const  id  = parseInt(req.params.id);
        await db.none('DELETE FROM doctors WHERE doctor_id = $1', [id]);
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting doctor', error: error.message });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const doctor = await db.one('SELECT * FROM doctors WHERE doctor_id = $1', [id]);
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctor', error: error.message });
    }
}; 