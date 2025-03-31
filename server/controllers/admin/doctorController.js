const db = require('../../config/db');
const multer = require('multer');
const {cloudinary} = require('../../config/cloudinary.js')
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
            
        } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload image to Cloudinary
        const imageUrl = await uploadImage(req.file);

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



// Function to upload image to Cloudinary
const uploadImage = async (file) => {
    if (!file) {
        throw new Error('No file provided for upload');
    }

    const base64Image = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;

    try {
        const uploadResponse = await cloudinary.uploader.upload(dataURI);
        return uploadResponse.url;  // Return the uploaded image URL
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};




exports.getAllDoctors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const offset = (page - 1) * limit;
        
        const { search, rating, experience, gender } = req.query;
   
        const conditions = [];
        const params = [];
        
        if (search) {
            conditions.push(`(doctor_name ILIKE $1 OR speciality ILIKE $1)`);
            params.push(`%${search}%`);
        }
        
        if (rating && rating !== 'any') {
            conditions.push(`ratings >= $${params.length + 1}`);
            params.push(parseFloat(rating));
        }
        
        if (experience && experience !== 'any') {
            if (experience === '15+') {
                conditions.push(`experience_years >= $${params.length + 1}`);
                params.push(15);
            } else {
                const [min, max] = experience.split('-').map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    conditions.push(`experience_years >= $${params.length + 1} AND experience_years < $${params.length + 2}`);
                    params.push(min);
                    params.push(max);
                }
            }
        }
        
        if (gender && gender !== 'any') {
            // Capitalize first letter and make rest lowercase to match database format
            const formattedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
            conditions.push(`gender = $${params.length + 1}`);
            params.push(formattedGender);
        }
        
        params.push(limit);
        params.push(offset);
        
        const whereClause = conditions.length > 0 
            ? `WHERE ${conditions.join(" AND ")}`
            : "";
    
        const totalResult = await db.one(
            `SELECT COUNT(*) FROM doctors ${whereClause}`,
            params.slice(0, -2) 
        );
        
        const doctors = await db.any(
            `SELECT 
                doctor_id,
                doctor_name,
                doctor_photo,
                degree,
                speciality,
                experience_years,
                location,
                available_time,
                ratings,
                gender
            FROM doctors 
            ${whereClause}
            ORDER BY doctor_name 
            LIMIT $${params.length - 1} 
            OFFSET $${params.length}`,
            params
        );
        
        // Send response with pagination info
        res.json({
            ok: true,
            data: {
                rows: doctors,
                total: parseInt(totalResult.count),
                page: page,
                limit: limit,
                totalPages: Math.ceil(parseInt(totalResult.count) / limit)
            }
        });
        
    } catch (error) {
        console.error("Error in getAllDoctors:", error);
        res.status(500).json({
            ok: false,
            message: "Failed to fetch doctors",
            error: error.message
        });
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
        const { q, page } = req.query;
        const pageNum = Math.max(1, parseInt(page || 1));
        const offset = (pageNum - 1) * 6;

    
        const searchPattern = `%${q}%`;

      
        const query = `
            SELECT 
                doctor_id,
                doctor_name,
                speciality,
                experience_years,
                ratings,
                COALESCE(
                    CASE 
                        WHEN doctor_photo LIKE 'http%' THEN doctor_photo
                        WHEN doctor_photo IS NULL OR doctor_photo = '' THEN '/default-doctor.png'
                        ELSE '/default-doctor.png'
                    END,
                    '/default-doctor.png'
                ) as doctor_photo
            FROM doctors 
            WHERE doctor_name ILIKE $1 
            OR speciality ILIKE $1
            ORDER BY ratings DESC
            LIMIT 6 OFFSET $2
        `;

    
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM doctors 
            WHERE doctor_name ILIKE $1 
            OR speciality ILIKE $1
        `;

        const countResult = await db.one(countQuery, [searchPattern]);
        const total = parseInt(countResult.total) || 0;

        const doctors = await db.any(query, [searchPattern, offset]);

     
        const processedDoctors = doctors.map(doctor => ({
            ...doctor,
            doctor_photo: doctor.doctor_photo.startsWith('http') 
                ? doctor.doctor_photo 
                : '/default-doctor.png'
        }));

        res.status(200).json({
            ok: true,
            data: {
                rows: processedDoctors,
                total,
                page: pageNum,
                limit: 6,
                totalPages: Math.ceil(total / 6)
            }
        });
    } catch (error) {
        console.error("Database error:", error.message);
        res.status(500).json({ 
            ok: false,
            message: "An error occurred while searching doctors: " + error.message
        });
    }
};

exports.getAllDoctorsAdmin = async (req, res) => {
    try {
    
        const doctors = await db.any(
            `SELECT 
                doctor_id,
                doctor_name,
                doctor_photo,
                degree,
                speciality,
                experience_years,
                location,
                available_time,
                ratings,
                gender
            FROM doctors 
            ORDER BY doctor_name`
        );
        
      
        res.json({
            ok: true,
            data: {
                rows: doctors
            }
        });
        
    } catch (error) {
        console.error("Error in getAllDoctorsAdmin:", error);
        res.status(500).json({
            ok: false,
            message: "Failed to fetch doctors",
            error: error.message
        });
    }
}; 