const db = require('../config/db');

// Get available slots for a specific doctor and date
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.params;
        
        // Get all slots for the doctor on that date
        const slots = await db.any(
            'SELECT * FROM slots WHERE doctor_id = $1 AND date = $2 ORDER BY time_slot',
            [doctorId, date]
        );

        // Get slots with approved appointments for that doctor and date
        const bookedSlots = await db.any(
            'SELECT slot_id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND status = $3',
            [doctorId, date, 'approved']
        );

        // Mark slots as unavailable only if they have approved appointments
        const availableSlots = slots.map(slot => ({
            ...slot,
            is_available: !bookedSlots.some(booked => booked.slot_id === slot.id)
        }));

        res.json(availableSlots);
    } catch (error) {
        console.error('Error getting available slots:', error);
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
            'SELECT id, is_available FROM slots WHERE doctor_id = $1 AND date = $2 AND time_slot = $3',
            [doctorId, date, timeSlot]
        );

        // If slot doesn't exist, create it
        if (!slot) {
            slot = await db.one(
                'INSERT INTO slots (doctor_id, date, time_slot, is_available) VALUES ($1, $2, $3, true) RETURNING id, is_available',
                [doctorId, date, timeSlot]
            );
        }

        // Check if slot already has an approved appointment
        const existingApprovedAppointment = await db.oneOrNone(
            'SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND slot_id = $3 AND status = $4',
            [doctorId, date, slot.id, 'approved']
        );

        if (existingApprovedAppointment) {
            return res.status(400).json({ message: 'Slot is already booked' });
        }

        // Check if the user already has a pending appointment for this slot
        const existingPendingAppointment = await db.oneOrNone(
            'SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND slot_id = $3 AND patient_name = $4 AND status = $5',
            [doctorId, date, slot.id, patientName, 'pending']
        );

        if (existingPendingAppointment) {
            return res.status(400).json({ message: 'You already have a pending appointment for this slot' });
        }

        // Book the appointment with pending status
        const appointment = await db.one(
            'INSERT INTO appointments (doctor_id, patient_name, slot_id, mode, booked_at, appointment_date, mode_of_appointment, status) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7) RETURNING *',
            [doctorId, patientName, slot.id, mode, date, mode, 'pending']
        );

        // Note: We don't update slot availability until the appointment is approved
        // This way other patients can still book the same slot until admin approves one

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Error booking appointment' });
    }
};

// Get user's appointments
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await db.any(
            `SELECT 
                a.*,
                d.name as doctor_name,
                s.time_slot,
                s.date,
                CASE 
                    WHEN a.status = 'pending' THEN 'Waiting for approval'
                    WHEN a.status = 'approved' THEN 'Confirmed'
                    WHEN a.status = 'rejected' THEN 'Rejected'
                    WHEN a.status = 'cancelled' THEN 'Cancelled'
                END as status_display
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN slots s ON a.slot_id = s.id
            WHERE a.patient_name = $1
            ORDER BY s.date DESC, s.time_slot DESC`,
            [req.user.user_name]
        );

        res.json(appointments);
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({ message: 'Error getting appointments' });
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

        // Make the slot available again
        await db.none(
            'UPDATE slots SET is_available = true WHERE id = $1',
            [appointment.slot_id]
        );

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Error cancelling appointment' });
    }
};

module.exports = {
    getAvailableSlots,
    bookAppointment,
    getMyAppointments,
    cancelAppointment
};