const db = require('../../config/db');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await db.any(`
            SELECT a.*, u.name as patient_name, d.name as doctor_name 
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            JOIN doctors d ON a.doctor_id = d.id
            ORDER BY a.created_at DESC
        `);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

// Get pending appointments
exports.getPendingAppointments = async (req, res) => {
    try {
        const appointments = await db.any(`
            SELECT a.*, u.name as patient_name, d.name as doctor_name 
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.status = 'pending'
            ORDER BY a.created_at DESC
        `);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending appointments', error: error.message });
    }
};

// Accept appointment
exports.acceptAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await db.one(
            `UPDATE appointments 
             SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Error accepting appointment', error: error.message });
    }
};

// Reject appointment
exports.rejectAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await db.one(
            `UPDATE appointments 
             SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );
        res.json(appointment);
    } catch (error) {
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
        res.status(500).json({ message: 'Error deleting appointment', error: error.message });
    }
}; 