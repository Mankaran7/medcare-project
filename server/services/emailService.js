const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendAppointmentConfirmation(patientEmail, appointmentDetails) {
        const { patientName, doctorName, date, time, mode, hospitalName } = appointmentDetails;

        const subject = mode === 'online' 
            ? 'Your Online Consultation Appointment Confirmation'
            : 'Your Hospital Visit Appointment Confirmation';

        const body = mode === 'online'
            ? `
                Dear ${patientName},

                Your online consultation with Dr. ${doctorName} has been confirmed.

                Appointment Details:
                Date: ${date}
                Time: ${time}
                Mode: Video Consultation

                Please ensure you have:
                1. A stable internet connection
                2. A device with camera and microphone
                3. The video consultation link (will be sent 30 minutes before appointment)

                If you need to reschedule, please contact us at least 24 hours in advance.

                Best regards,
                MedCare Team
            `
            : `
                Dear ${patientName},

                Your hospital visit appointment with Dr. ${doctorName} has been confirmed.

                Appointment Details:
                Date: ${date}
                Time: ${time}
                Mode: Hospital Visit
                Hospital: ${hospitalName}

                Please ensure you:
                1. Arrive 15 minutes before your appointment
                2. Carry your ID proof
                3. Wear a mask
                4. Follow all hospital protocols

                If you need to reschedule, please contact us at least 24 hours in advance.

                Best regards,
                MedCare Team
            `;

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: patientEmail,
                subject: subject,
                text: body
            });
            console.log('Appointment confirmation email sent successfully');
        } catch (error) {
            console.error('Error sending appointment confirmation email:', error);
            throw error;
        }
    }
}

module.exports = new EmailService(); 