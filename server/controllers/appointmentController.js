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

        // Get booked appointments for that doctor and date
        const bookedSlots = await db.any(
            'SELECT slot_id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2',
            [doctorId, date]
        );

        // Mark slots as unavailable if they're booked
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
        const { doctorId, slotId, mode, patientName } = req.body;

        if (!patientName) {
            return res.status(400).json({ message: 'Patient name is required' });
        }

        // Check if slot is available
        const slotCheck = await db.oneOrNone(
            'SELECT date, time_slot FROM slots WHERE id = $1 AND doctor_id = $2 AND is_available = true',
            [slotId, doctorId]
        );

        if (!slotCheck) {
            return res.status(400).json({ message: 'Slot is not available' });
        }

        // Book the appointment
        const appointment = await db.one(
            'INSERT INTO appointments (doctor_id, patient_name, slot_id, mode, booked_at, appointment_date, mode_of_appointment) VALUES ($1, $2, $3, $4, NOW(), $5, $6) RETURNING *',
            [doctorId, patientName, slotId, mode, slotCheck.date, mode]
        );

        // Update slot availability
        await db.none(
            'UPDATE slots SET is_available = false WHERE id = $1',
            [slotId]
        );

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
                s.date
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