"use client"
import Image from 'next/image';
import styles from './DoctorPage.module.css';
import Link from 'next/link';

interface Doctor {
    id: number;
    name: string;
    degree: string;
    specialty: string;
    experience: string;
    rating: number;
    image: string;
    hospital: string;
    consultationFee: number;
}

interface DoctorPageProps {
    doctor: Doctor;
}

export default function DoctorPage({ doctor }: DoctorPageProps) {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.doctorInfo}>
                    <div className={styles.imageContainer}>
                        <Image
                            src={doctor.image}
                            alt={doctor.name}
                            width={200}
                            height={200}
                            className={styles.doctorImage}
                        />
                    </div>
                    <div className={styles.basicInfo}>
                        <h1>{doctor.name}</h1>
                        <p className={styles.specialty}>{doctor.specialty} | {doctor.degree}</p>
                        <p className={styles.experience}>{doctor.experience} Experience</p>
                        <div className={styles.ratingContainer}>
                            {Array.from({ length: 5 }, (_, index) => (
                                <Image
                                    key={index}
                                    src={index < doctor.rating ? "/star.svg" : "/blankStar.svg"}
                                    alt="star"
                                    width={20}
                                    height={20}
                                />
                            ))}
                        </div>
                        <p className={styles.hospital}>{doctor.hospital}</p>
                        <p className={styles.fee}>₹{doctor.consultationFee} Consultation fee</p>
                        
                        <Link href={`/bookingpage/${doctor.id}`}>
                            <button className={styles.bookButton}>
                                Book Appointment
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 