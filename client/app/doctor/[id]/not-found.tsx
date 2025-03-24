import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <h1>Doctor Not Found</h1>
            <p>Could not find the requested doctor profile.</p>
            <Link href="/appointments" className={styles.link}>
                View All Doctors
            </Link>
        </div>
    );
} 