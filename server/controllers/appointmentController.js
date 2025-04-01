const db = require('../config/db');
const emailService = require('../services/emailService');

// Get available slots for a specific doctor and date
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.params;
        
        // Define default time slots
        const defaultMorningSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"
        ];
        const defaultEveningSlots = [
            "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
        ];

        // Get existing slots for the doctor on that date
        let slots = await db.any(
            'SELECT * FROM slots WHERE doctor_id = $1 AND date = $2 ORDER BY time_slot',
            [doctorId, date]
        );

        // If no slots exist, create default slots
        if (slots.length === 0) {
            // Create morning slots
            for (const time of defaultMorningSlots) {
                await db.none(
                    'INSERT INTO slots (doctor_id, date, time_slot) VALUES ($1, $2, $3)',
                    [doctorId, date, time]
                );
            }

            // Create evening slots
            for (const time of defaultEveningSlots) {
                await db.none(
                    'INSERT INTO slots (doctor_id, date, time_slot) VALUES ($1, $2, $3)',
                    [doctorId, date, time]
                );
            }

            // Fetch the newly created slots
            slots = await db.any(
                'SELECT * FROM slots WHERE doctor_id = $1 AND date = $2 ORDER BY time_slot',
                [doctorId, date]
            );
        }

        // Get both approved and pending appointments
        const bookedSlots = await db.any(
            'SELECT slot_id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND status IN ($3, $4)',
            [doctorId, date, 'approved', 'pending']
        );

        // Mark slots as unavailable if they have either approved or pending appointments
        const availableSlots = slots.map(slot => ({
            ...slot,
            is_available: !bookedSlots.some(booked => booked.slot_id === slot.id)
        }));

        res.json(availableSlots);
    } catch (error) {
        console.error('Error getting available slots:', error.message);
        res.status(500).json({ message: 'Error getting available slots' });
    }
};

// Book an appointment
const bookAppointment = async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Please login to book an appointment"
            });
        }

        const { doctorId, timeSlot, date, mode } = req.body;

        // Validate required fields
        if (!doctorId || !timeSlot || !date || !mode) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Get or create time slot
        let slot = await db.oneOrNone(
            'SELECT id FROM slots WHERE doctor_id = $1 AND date = $2 AND time_slot = $3',
            [doctorId, date, timeSlot]
        );

        if (!slot) {
            slot = await db.one(
                'INSERT INTO slots (doctor_id, date, time_slot) VALUES ($1, $2, $3) RETURNING id',
                [doctorId, date, timeSlot]
            );
        }

        // Check if slot is already booked
        const existingAppointment = await db.oneOrNone(
            'SELECT status FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND slot_id = $3 AND status IN ($4, $5)',
            [doctorId, date, slot.id, 'approved', 'pending']
        );

        if (existingAppointment) {
            const message = existingAppointment.status === 'approved' 
                ? 'This time slot is already booked' 
                : 'This time slot is currently pending approval. Please choose another slot';
            return res.status(400).json({ 
                success: false,
                message 
            });
        }

        // Get doctor details for email
        const doctor = await db.one(
            'SELECT doctor_name FROM doctors WHERE doctor_id = $1',
            [doctorId]
        );

        // Book the appointment with pending status
        const appointment = await db.one(
            'INSERT INTO appointments (doctor_id, patient_name, slot_id, mode, booked_at, appointment_date, mode_of_appointment, status) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7) RETURNING *',
            [doctorId, req.user.user_name, slot.id, mode, date, mode, 'pending']
        );

        // Send confirmation email
        try {
            await emailService.sendAppointmentConfirmation(
                req.user.user_emailid,
                {
                    patientName: req.user.user_name,
                    doctorName: doctor.doctor_name,
                    date,
                    time: timeSlot,
                    mode: mode === 'offline' ? 'offline' : 'online',
                    hospitalName: mode === 'offline' ? 'MediCareHeart Institute, Okhla Road' : undefined
                }
            );

            // Send notification to doctor
            await emailService.sendAppointmentConfirmation(
                doctor.doctor_email,
                {
                    patientName: req.user.user_name,
                    doctorName: doctor.doctor_name,
                    date,
                    time: timeSlot,
                    mode: mode === 'offline' ? 'offline' : 'online',
                    hospitalName: mode === 'offline' ? 'MediCareHeart Institute, Okhla Road' : undefined
                }
            );
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the appointment booking if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Error booking appointment:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Error booking appointment',
            error: error.message 
        });
    }
};


module.exports = {
    getAvailableSlots,
    bookAppointment,
  
};