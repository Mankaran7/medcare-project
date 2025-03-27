const db = require('../../config/db');

exports.getAllDoctors = async (req, res) => {
    try {
        const { page = 1, rating, experience, gender, search } = req.query;
        const limit = 6;
        const offset = (parseInt(page) - 1) * limit;

        let query = 'SELECT * FROM doctors WHERE 1=1';
        const queryParams = [];
        let paramCount = 1;

        // Add search filter
        if (search) {
            query += ` AND (
                doctor_name ILIKE $${paramCount} 
                OR speciality ILIKE $${paramCount}
                OR degree ILIKE $${paramCount}
            )`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        // Add rating filter
        if (rating) {
            query += ` AND ratings = $${paramCount}`;
            queryParams.push(parseInt(rating));
            paramCount++;
        }

        // Add experience filter
        if (experience) {
            if (experience === '15+') {
                query += ` AND experience_years >= $${paramCount}`;
                queryParams.push(15);
            } else {
                const [min, max] = experience.split('-').map(Number);
                query += ` AND experience_years >= $${paramCount} AND experience_years < $${paramCount + 1}`;
                queryParams.push(min, max);
                paramCount += 2;
            }
        }

        // Add gender filter
        if (gender) {
            query += ` AND gender = $${paramCount}`;
            queryParams.push(gender);
            paramCount++;
        }

        // Get total count with filters
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_doctors`;
        const totalCount = await db.one(countQuery, queryParams);

        // Add pagination
        query += ` ORDER BY doctor_id LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        queryParams.push(limit, offset);

        const doctors = await db.any(query, queryParams);

        res.json({
            ok: true,
            data: {
                rows: doctors,
                total: parseInt(totalCount.total)
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

exports.searchDoctors = async (req, res) => {
    try {
        const { q, page = 1 } = req.query;
        const limit = 6;
        const offset = (parseInt(page) - 1) * limit;

        // Create search pattern for case-insensitive search
        const searchPattern = `%${q}%`;

        // Build the search query
        const query = `
            SELECT * FROM doctors 
            WHERE doctor_name ILIKE $1 
            OR speciality ILIKE $1 
            OR degree ILIKE $1
            ORDER BY ratings DESC
            LIMIT $2 OFFSET $3
        `;

        // Get total count with search filter
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM doctors 
            WHERE doctor_name ILIKE $1 
            OR speciality ILIKE $1 
            OR degree ILIKE $1
        `;

        const totalCount = await db.one(countQuery, [searchPattern]);
        const doctors = await db.any(query, [searchPattern, limit, offset]);

        res.json({
            ok: true,
            data: {
                rows: doctors,
                total: parseInt(totalCount.total)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            ok: false,
            message: 'Error searching doctors',
            error: error.message 
        });
    }
}; 