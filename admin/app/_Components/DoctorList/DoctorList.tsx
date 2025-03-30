"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./DoctorList.module.css";

const DEFAULT_DOCTOR_IMAGE = "/default-doctor.png";

interface Doctor {
  doctor_id: number;
  doctor_name: string;
  speciality: string;
  degree: string;
  experience_years: number;
  location: string;
  gender: string;
  ratings: number;
  doctor_photo: string;
  available_time?: string;
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/doctors/all",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();
      setDoctors(data.data.rows);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors");
      setLoading(false);
    }
  };

  // Handle doctor deletion
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/doctors/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }


      fetchDoctors();
    } catch (err) {
      console.error("Error deleting doctor:", err);
      setError("Failed to delete doctor");
    }
  };

  // Get doctor image URL
  const getImageUrl = (photoUrl: string | null | undefined): string => {
    if (!photoUrl) return DEFAULT_DOCTOR_IMAGE;
    if (photoUrl.startsWith("http")) return photoUrl;
    if (photoUrl.startsWith("/")) return photoUrl;
    return DEFAULT_DOCTOR_IMAGE;
  };

  // Loading state
  if (loading) {
    return <div className={styles.loading}>Loading doctors...</div>;
  }

  // Error state
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Doctors List</h2>
      {error && <div className={styles.error}>{error}</div>}
      <ul className={styles.doctorList}>
        {doctors.map((doctor) => (
          <li key={doctor.doctor_id} className={styles.doctorItem}>
            <div className={styles.doctorDetails}>
              <div className={styles.doctorHeader}>
                <h3 className={styles.doctorName}>{doctor.doctor_name}</h3>
                <span className={styles.speciality}>{doctor.speciality}</span>
              </div>
              <div className={styles.doctorInfo}>
                <p className={styles.doctorText}>
                  Degree: {doctor.degree}
                </p>
                <p className={styles.doctorText}>
                  Experience: {doctor.experience_years} years
                </p>
                <p className={styles.doctorText}>
                  Location: {doctor.location}
                </p>
                <p className={styles.doctorText}>
                  Gender: {doctor.gender}
                </p>
                <p className={styles.doctorText}>
                  Rating: {doctor.ratings}
                </p>
              </div>
              {doctor.doctor_photo && (
                <div className={styles.imageContainer}>
                  <Image
                    src={getImageUrl(doctor.doctor_photo)}
                    alt={`Dr. ${doctor.doctor_name}`}
                    className={styles.doctorImage}
                    width={120}
                    height={120}
                    priority={true}
                    unoptimized={doctor.doctor_photo.startsWith("data:")}
                  />
                </div>
              )}
              <div className={styles.actionButtons}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(doctor.doctor_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
