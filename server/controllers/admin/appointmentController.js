const db = require('../../config/db');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await db.any(`
            SELECT 
                a.id,
                a.doctor_id,
                a.patient_name,
                d.doctor_name AS doctor_name,
                d.doctor_photo,
                a.slot_id,
                a.mode,
                a.booked_at,
                a.appointment_date,
                a.mode AS mode_of_appointment,
                a.status,
                s.time_slot
            FROM appointments a
            LEFT JOIN slots s ON a.slot_id = s.id
            LEFT JOIN doctors d ON a.doctor_id = d.doctor_id 
            WHERE a.status = 'pending'
            ORDER BY a.booked_at DESC
        `);
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error.message);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

// Get pending appointments
exports.getPendingAppointments = async (req, res) => {
    try {
        const appointments = await db.any(`
            SELECT 
                a.id,
                a.doctor_id,
                a.patient_name,
                d.doctor_name AS doctor_name,
                d.doctor_photo,
                a.slot_id,
                a.mode,
                a.booked_at,
                a.appointment_date,
                a.mode AS mode_of_appointment,
                a.status,
                s.time_slot
            FROM appointments a
            LEFT JOIN slots s ON a.slot_id = s.id
            LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.status = 'pending'
            ORDER BY a.booked_at DESC
        `);
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching pending appointments:", error.message);
        res.status(500).json({ message: 'Error fetching pending appointments', error: error.message });
    }
};

// Accept appointment
exports.acceptAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await db.one(
            `UPDATE appointments 
             SET status = 'approved'
             WHERE id = $1
             RETURNING *`,
            [id]
        );
        res.json(appointment);
    } catch (error) {
        console.error("Error accepting appointment:", error.message);
        res.status(500).json({ message: 'Error accepting appointment', error: error.message });
    }
};

// Reject appointment
exports.rejectAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await db.one(
            `UPDATE appointments 
             SET status = 'rejected'
             WHERE id = $1
             RETURNING *`,
            [id]
        );
        res.json(appointment);
    } catch (error) {
        console.error("Error rejecting appointment:", error.message);
        res.status(500).json({ message: 'Error rejecting appointment', error: error.message });
    }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await db.none('DELETE FROM appointments WHERE id = $1', [id]);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error("Error deleting appointment:", error.message);
        res.status(500).json({ message: 'Error deleting appointment', error: error.message });
    }
}; 