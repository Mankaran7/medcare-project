"use client";

import { ChangeEvent, useState, useEffect } from "react";
import CardComp from "../Card/Card";
import Search from "../SearchBar/Search";
import styles from "./CardsGrid.module.css";

interface Doctor {
    doctor_id: number;
    doctor_name: string;
    doctor_photo: string;
    degree: string;
    speciality: string;
    experience_years: number;
    location: string;
    rating?: number; // Optional since it's not in DB
}

export default function ShowCards() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [filters, setFilters] = useState({
        rating: "any",
        experience: "15+",
        gender: "any",
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/admin/doctors/public');
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            const data = await response.json();
            // Add default rating if not present
            const doctorsWithRating = data.map((doc: Doctor) => ({
                ...doc,
                rating: doc.rating || 4 // Default rating of 4
            }));
            setDoctors(doctorsWithRating);
        } catch (err) {
            setError("Failed to load doctors");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters({
            rating: "any",
            experience: "15+",
            gender: "any",
        });
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    if (loading) {
        return <div className={styles.loading}>Loading doctors...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <Search />
            <div className={styles.infoText}>
                <p className={styles.docCount}>
                    {doctors.length} doctors available
                </p>
                <p className={styles.subText}>
                    Book appointments with minimum wait-time & verified doctor
                    details
                </p>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.filtersContainer}>
                    <div className={styles.filterHeader}>
                        <p>Filter By:</p>
                        <button
                            onClick={resetFilters}
                            className={styles.resetButton}
                        >
                            Reset
                        </button>
                    </div>

                    <div className={styles.filterSection}>
                        <h4 className={styles.filterTitle}>Rating</h4>
                        <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value="any"
                                    checked={filters.rating === "any"}
                                    onChange={handleFilterChange}
                                />
                                <span>Show All</span>
                            </label>

                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value="1"
                                    checked={filters.rating === "1"}
                                    onChange={handleFilterChange}
                                />
                                <span>1 star</span>
                            </label>

                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value="2"
                                    checked={filters.rating === "2"}
                                    onChange={handleFilterChange}
                                />
                                <span>2 star</span>
                            </label>

                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value="3"
                                    checked={filters.rating === "3"}
                                    onChange={handleFilterChange}
                                />
                                <span>3 star</span>
                            </label>

                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value="4"
                                    checked={filters.rating === "4"}
                                    onChange={handleFilterChange}
                                />
                                <span>4 star</span>
                            </label>

                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value="5"
                                    checked={filters.rating === "5"}
                                    onChange={handleFilterChange}
                                />
                                <span>5 star</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h4 className={styles.filterTitle}>Experience</h4>
                        <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="experience"
                                    value="15+"
                                    checked={filters.experience === "15+"}
                                    onChange={handleFilterChange}
                                />
                                <span>15+ years</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="experience"
                                    value="10-15"
                                    checked={filters.experience === "10-15"}
                                    onChange={handleFilterChange}
                                />
                                <span>10-15 years</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="experience"
                                    value="5-10"
                                    checked={filters.experience === "5-10"}
                                    onChange={handleFilterChange}
                                />
                                <span>5-10 years</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="experience"
                                    value="3-5"
                                    checked={filters.experience === "3-5"}
                                    onChange={handleFilterChange}
                                />
                                <span>3-5 years</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="experience"
                                    value="1-3"
                                    checked={filters.experience === "1-3"}
                                    onChange={handleFilterChange}
                                />
                                <span>1-3 years</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="experience"
                                    value="0-1"
                                    checked={filters.experience === "0-1"}
                                    onChange={handleFilterChange}
                                />
                                <span>0-1 years</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h4 className={styles.filterTitle}>Gender</h4>
                        <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="any"
                                    checked={filters.gender === "any"}
                                    onChange={handleFilterChange}
                                />
                                <span>Show all</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={filters.gender === "male"}
                                    onChange={handleFilterChange}
                                />
                                <span>Male</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={filters.gender === "female"}
                                    onChange={handleFilterChange}
                                />
                                <span>Female</span>
                            </label>
                        </div>
                    </div>
                    <button className={styles.applyBtn}>Apply Filters</button>
                </div>

                <div className={styles.gridContainer}>
                    {doctors.map((doctor) => (
                        <CardComp 
                            key={doctor.doctor_id} 
                            doctor={{
                                id: doctor.doctor_id,
                                name: doctor.doctor_name,
                                degree: doctor.degree,
                                specialty: doctor.speciality,
                                experience: `${doctor.experience_years} Years Experience`,
                                rating: doctor.rating || 4,
                                image: doctor.doctor_photo || '/default-doctor.png'
                            }} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
