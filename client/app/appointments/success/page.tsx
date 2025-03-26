"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './success.module.css';
import Link from 'next/link';

export default function AppointmentSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

    useEffect(() => {
        const details = {
            doctorName: searchParams.get('doctorName'),
            date: searchParams.get('date'),
            time: searchParams.get('time'),
            mode: searchParams.get('mode')
        };
        setAppointmentDetails(details);
    }, [searchParams]);

    if (!appointmentDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.successContainer}>
            <div className={styles.successCard}>
                <div className={styles.checkmark}>
                    <svg className={styles.checkmarkSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
                        <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
                
                <h1>Appointment Booked Successfully!</h1>
                
                <div className={styles.appointmentDetails}>
                    <p><strong>Doctor:</strong> {appointmentDetails.doctorName}</p>
                    <p><strong>Date:</strong> {appointmentDetails.date}</p>
                    <p><strong>Time:</strong> {appointmentDetails.time}</p>
                    <p><strong>Mode:</strong> {appointmentDetails.mode}</p>
                </div>

                <div className={styles.actions}>
                   
                    <Link href="/" className={styles.backHome}>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
} 
 