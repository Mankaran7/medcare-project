import Image from "next/image";
import styles from "./Card.module.css";
import Link from "next/link";

// Database doctor interface
interface DatabaseDoctor {
    doctor_id: number;
    doctor_name: string;
    doctor_photo: string;
    degree: string;
    speciality: string;
    experience_years: number;
    location: string;
    rating?: number;
}

// Original doctor interface that the component expects
interface Doctor {
    id: number;
    name: string;
    degree: string;
    specialty: string;
    experience: string;
    ratings: number;
    image: string;
}

interface CardProps {
    doctor: Doctor;
}

export default function CardComp({ doctor }: CardProps) {
    return (
        <div className={styles.card}>
            {/* Doctor Image */}
            <Link href={`/doctor/${doctor.id}`} className={styles.imageContainer}>
                <Image
                    src={doctor.image}
                    alt={doctor.name}
                    width={100}
                    height={100}
                    className={styles.profileImage}
                />
            </Link>

            {/* Doctor Name and Degree */}
            <Link href={`/doctor/${doctor.id}`} className={styles.name}>
                {doctor.name}, {doctor.degree}
            </Link>

            {/* Specialty */}
            <div className={styles.infoContainer}>
                <Image
                    src={"/Stethoscope.svg"}
                    width={20}
                    height={20}
                    alt="Stethoscope"
                />
                <p className={styles.experience}>{doctor.specialty}</p>
                <Image
                    src={"/Hourglass.svg"}
                    width={20}
                    height={20}
                    alt="Hourglass"
                />
                <p className={styles.experience}>{doctor.experience}</p>
            </div>

            {/* Rating */}
            <div className={styles.ratingContainer}>
                {Array.from({ length: 5 }, (_, index) => (
                    <Image
                        key={index}
                        src={index < doctor.ratings ? "/star.svg" : "/blankStar.svg"}
                        alt="star"
                        width={20}
                        height={20}
                    />
                ))}
            </div>

            {/* Book Appointment Button */}
            <Link href={`/bookingpage/${doctor.id}`} className={styles.bookButton}>
                Book Appointment
            </Link>
        </div>
    );
}
