"use client";

import { useState, useEffect } from "react";
import styles from "./DoctorList.module.css";

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
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/doctors', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      setDoctors(data.data.rows);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
      setLoading(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor({ ...doctor });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingDoctor) return;
    
    const { name, value } = e.target;
    setEditingDoctor({
      ...editingDoctor,
      [name]: value
    });
  };

  const handleSave = async () => {
    if (!editingDoctor) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/doctors/${editingDoctor.doctor_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editingDoctor)
      });

      if (!response.ok) {
        throw new Error('Failed to update doctor');
      }

      // Refresh the doctors list
      fetchDoctors();
      setEditingDoctor(null);
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError('Failed to update doctor');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/doctors/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete doctor');
      }

      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setError('Failed to delete doctor');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading doctors...</div>;
  }

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
            {editingDoctor && editingDoctor.doctor_id === doctor.doctor_id ? (
              <div className={styles.editForm}>
                <input 
                  className={styles.inputField} 
                  type="text" 
                  name="doctor_name" 
                  value={editingDoctor.doctor_name} 
                  onChange={handleChange} 
                />
                <input 
                  className={styles.inputField} 
                  type="text" 
                  name="speciality" 
                  value={editingDoctor.speciality} 
                  onChange={handleChange} 
                />
                <input 
                  className={styles.inputField} 
                  type="text" 
                  name="degree" 
                  value={editingDoctor.degree} 
                  onChange={handleChange} 
                />
                <input 
                  className={styles.inputField} 
                  type="number" 
                  name="experience_years" 
                  value={editingDoctor.experience_years} 
                  onChange={handleChange} 
                />
                <input 
                  className={styles.inputField} 
                  type="text" 
                  name="location" 
                  value={editingDoctor.location} 
                  onChange={handleChange} 
                />
                <select 
                  className={styles.inputField} 
                  name="gender" 
                  value={editingDoctor.gender} 
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                <button className={styles.cancelBtn} onClick={() => setEditingDoctor(null)}>Cancel</button>
              </div>
            ) : (
              <div className={styles.doctorDetails}>
                <div className={styles.doctorHeader}>
                  <h3 className={styles.doctorName}>{doctor.doctor_name}</h3>
                  <span className={styles.speciality}>{doctor.speciality}</span>
                </div>
                <div className={styles.doctorInfo}>
                  <p className={styles.doctorText}>Degree: {doctor.degree}</p>
                  <p className={styles.doctorText}>Experience: {doctor.experience_years} years</p>
                  <p className={styles.doctorText}>Location: {doctor.location}</p>
                  <p className={styles.doctorText}>Gender: {doctor.gender}</p>
                  <p className={styles.doctorText}>Rating: {doctor.ratings}</p>
                </div>
                {doctor.doctor_photo && (
                  <img 
                    src={doctor.doctor_photo} 
                    alt={doctor.doctor_name} 
                    className={styles.doctorImage}
                    width={200}
                    height={200}
                  />
                )}
                <div className={styles.actionButtons}>
                  <button className={styles.editBtn} onClick={() => handleEdit(doctor)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(doctor.doctor_id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}




