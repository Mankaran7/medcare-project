"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';
import styles from "./DoctorList.module.css";

const DEFAULT_DOCTOR_IMAGE = '/default-doctor.png';

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

interface EditFormErrors {
  doctor_name?: string;
  speciality?: string;
  degree?: string;
  experience_years?: string;
  location?: string;
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formErrors, setFormErrors] = useState<EditFormErrors>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/doctors/all', {
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

  const validateForm = (doctor: Doctor): boolean => {
    const errors: EditFormErrors = {};
    
    if (!doctor.doctor_name?.trim()) {
      errors.doctor_name = "Doctor name is required";
    }
    
    if (!doctor.speciality?.trim()) {
      errors.speciality = "Speciality is required";
    }
    
    if (!doctor.degree?.trim()) {
      errors.degree = "Degree is required";
    }
    
    if (!doctor.experience_years || doctor.experience_years < 0) {
      errors.experience_years = "Valid experience years required";
    }
    
    if (!doctor.location?.trim()) {
      errors.location = "Location is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor({ ...doctor });
    setFormErrors({});
    setUpdateSuccess(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingDoctor) return;
    
    const { name, value } = e.target;
    const updatedValue = name === 'experience_years' ? parseInt(value) || 0 : value;
    
    setEditingDoctor({
      ...editingDoctor,
      [name]: updatedValue
    });

    // Clear error for this field if it exists
    if (formErrors[name as keyof EditFormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  const handleSave = async () => {
    if (!editingDoctor) return;

    // Validate form before submitting
    if (!validateForm(editingDoctor)) {
      return;
    }

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

      const result = await response.json();
      
      if (result.ok) {
        setUpdateSuccess(true);
        // Refresh the doctors list
        fetchDoctors();
        // Close the edit form after a short delay
        setTimeout(() => {
          setEditingDoctor(null);
          setUpdateSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError('Failed to update doctor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

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

  const getImageUrl = (photoUrl: string | null | undefined): string => {
    if (!photoUrl) return DEFAULT_DOCTOR_IMAGE;
    if (photoUrl.startsWith('http')) return photoUrl;
    if (photoUrl.startsWith('/')) return photoUrl;
    return DEFAULT_DOCTOR_IMAGE;
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
                <div className={styles.formGroup}>
                  <label>Name:</label>
                  <input 
                    className={`${styles.inputField} ${formErrors.doctor_name ? styles.errorInput : ''}`}
                    type="text" 
                    name="doctor_name" 
                    value={editingDoctor.doctor_name} 
                    onChange={handleChange}
                  />
                  {formErrors.doctor_name && <span className={styles.errorText}>{formErrors.doctor_name}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Speciality:</label>
                  <input 
                    className={`${styles.inputField} ${formErrors.speciality ? styles.errorInput : ''}`}
                    type="text" 
                    name="speciality" 
                    value={editingDoctor.speciality} 
                    onChange={handleChange}
                  />
                  {formErrors.speciality && <span className={styles.errorText}>{formErrors.speciality}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Degree:</label>
                  <input 
                    className={`${styles.inputField} ${formErrors.degree ? styles.errorInput : ''}`}
                    type="text" 
                    name="degree" 
                    value={editingDoctor.degree} 
                    onChange={handleChange}
                  />
                  {formErrors.degree && <span className={styles.errorText}>{formErrors.degree}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Experience (years):</label>
                  <input 
                    className={`${styles.inputField} ${formErrors.experience_years ? styles.errorInput : ''}`}
                    type="number" 
                    name="experience_years" 
                    value={editingDoctor.experience_years} 
                    onChange={handleChange}
                    min="0"
                  />
                  {formErrors.experience_years && <span className={styles.errorText}>{formErrors.experience_years}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Location:</label>
                  <input 
                    className={`${styles.inputField} ${formErrors.location ? styles.errorInput : ''}`}
                    type="text" 
                    name="location" 
                    value={editingDoctor.location} 
                    onChange={handleChange}
                  />
                  {formErrors.location && <span className={styles.errorText}>{formErrors.location}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Gender:</label>
                  <select 
                    className={styles.inputField}
                    name="gender" 
                    value={editingDoctor.gender} 
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className={styles.editButtons}>
                  <button 
                    className={`${styles.saveBtn} ${updateSuccess ? styles.success : ''}`} 
                    onClick={handleSave}
                  >
                    {updateSuccess ? 'Saved!' : 'Save'}
                  </button>
                  <button 
                    className={styles.cancelBtn} 
                    onClick={() => {
                      setEditingDoctor(null);
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </button>
                </div>
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
                  <div className={styles.imageContainer}>
                    <Image 
                      src={getImageUrl(doctor.doctor_photo)}
                      alt={`Dr. ${doctor.doctor_name}`}
                      className={styles.doctorImage}
                      width={120}
                      height={120}
                      priority={true}
                      unoptimized={doctor.doctor_photo.startsWith('data:')}
                    />
                  </div>
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




