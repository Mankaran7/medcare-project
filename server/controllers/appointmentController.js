const db = require('../config/db');

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
        const { doctorId, timeSlot, date, mode, patientName } = req.body;

        if (!patientName) {
            return res.status(400).json({ message: 'Patient name is required' });
        }

        // First, try to get the existing slot
        let slot = await db.oneOrNone(
            'SELECT id FROM slots WHERE doctor_id = $1 AND date = $2 AND time_slot = $3',
            [doctorId, date, timeSlot]
        );

        // If slot doesn't exist, create it
        if (!slot) {
            slot = await db.one(
                'INSERT INTO slots (doctor_id, date, time_slot) VALUES ($1, $2, $3) RETURNING id',
                [doctorId, date, timeSlot]
            );
        }

        // Check if slot has any existing appointments (approved or pending)
        const existingAppointment = await db.oneOrNone(
            'SELECT status FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND slot_id = $3 AND status IN ($4, $5)',
            [doctorId, date, slot.id, 'approved', 'pending']
        );

        if (existingAppointment) {
            const message = existingAppointment.status === 'approved' 
                ? 'This time slot is already booked' 
                : 'This time slot is currently pending approval. Please choose another slot';
            return res.status(400).json({ message });
        }

        // Book the appointment with pending status
        const appointment = await db.one(
            'INSERT INTO appointments (doctor_id, patient_name, slot_id, mode, booked_at, appointment_date, mode_of_appointment, status) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7) RETURNING *',
            [doctorId, patientName, slot.id, mode, date, mode, 'pending']
        );

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error booking appointment:', error.message);
        res.status(500).json({ message: 'Error booking appointment' });
    }
};

// Get user's appointments with pagination
const getMyAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const offset = (page - 1) * limit;

        // Get total count
        const totalCount = await db.one(
            'SELECT COUNT(*) as total FROM appointments WHERE patient_name = $1',
            [req.user.user_name]
        );

        // Get paginated appointments
        const appointments = await db.any(
            `SELECT 
                a.*,
                d.doctor_name,
                s.time_slot,
                s.date,
                CASE 
                    WHEN a.status = 'pending' THEN 'Waiting for approval'
                    WHEN a.status = 'approved' THEN 'Confirmed'
                    WHEN a.status = 'rejected' THEN 'Rejected'
                    WHEN a.status = 'cancelled' THEN 'Cancelled'
                END as status_display
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            JOIN slots s ON a.slot_id = s.id
            WHERE a.patient_name = $1
            ORDER BY s.date DESC, s.time_slot DESC
            LIMIT $2::integer OFFSET $3::integer`,
            [req.user.user_name, limit, offset]
        );

        res.json({
            ok: true,
            data: {
                rows: appointments,
                total: parseInt(totalCount.total),
                currentPage: parseInt(page),
                totalPages: Math.ceil(parseInt(totalCount.total) / limit)
            }
        });
    } catch (error) {
        console.error('Error getting appointments:', error.message);
        res.status(500).json({ 
            ok: false,
            message: 'Error getting appointments' 
        });
    }
};

// Cancel an appointment
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Get appointment details
        const appointment = await db.oneOrNone(
            'SELECT * FROM appointments WHERE id = $1 AND patient_name = $2',
            [appointmentId, req.user.user_name]
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Delete the appointment
        await db.none('DELETE FROM appointments WHERE id = $1', [appointmentId]);

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error.message);
        res.status(500).json({ message: 'Error cancelling appointment' });
    }
};

module.exports = {
    getAvailableSlots,
    bookAppointment,
    getMyAppointments,
    cancelAppointment
};