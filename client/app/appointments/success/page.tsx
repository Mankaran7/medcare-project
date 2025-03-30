"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './success.module.css';
import Link from 'next/link';

interface AppointmentDetails {
    doctorName: string | null;
    date: string | null;
    time: string | null;
    mode: string | null;
}

export default function AppointmentSuccess() {
    const searchParams = useSearchParams();
    const [details, setDetails] = useState<AppointmentDetails | null>(null);

    useEffect(() => {
        setDetails({
            doctorName: searchParams.get('doctorName'),
            date: searchParams.get('date'),
            time: searchParams.get('time'),
            mode: searchParams.get('mode')
        });
    }, [searchParams]);

    if (!details) return <div>Loading...</div>;

    return (
        <div className={styles.successContainer}>
            <div className={styles.successCard}>
                <div className={styles.checkmark}>
                    <svg className={styles.checkmarkSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25"/>
                        <path className={styles.checkmarkCheck} d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
                
                <h1>Appointment Booked Successfully!</h1>
                
                <div className={styles.appointmentDetails}>
                    <p><strong>Doctor:</strong> {details.doctorName}</p>
                    <p><strong>Date:</strong> {details.date}</p>
                    <p><strong>Time:</strong> {details.time}</p>
                    <p><strong>Mode:</strong> {details.mode}</p>
                </div>

                <Link href="/" className={styles.backHome}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
} 
 