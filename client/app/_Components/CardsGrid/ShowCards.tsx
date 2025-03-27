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
    rating?: number;
}

export default function ShowCards() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const itemsPerPage = 6;
    
    const [filters, setFilters] = useState({
        rating: "any",
        experience: "15+",
        gender: "any",
    });

    useEffect(() => {
        fetchDoctors();
    }, [currentPage]); // Add currentPage as dependency

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/admin/doctors/public?page=${currentPage}&limit=${itemsPerPage}`);
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            const data = await response.json();
            if (data.ok) {
                // Add default rating if not present
                const doctorsWithRating = data.data.rows.map((doc: Doctor) => ({
                    ...doc,
                    rating: doc.rating || 4 // Default rating of 4
                }));
                setDoctors(doctorsWithRating);
                setTotalPages(data.data.totalPages);
                setTotalDoctors(data.data.total);
            } else {
                throw new Error(data.message || 'Failed to fetch doctors');
            }
        } catch (err) {
            setError("Failed to load doctors");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
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
                    {totalDoctors} doctors available
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

                    {/* Rating Filter */}
                    <div className={styles.filterSection}>
                        <p>Rating</p>
                        <div className={styles.filterOptions}>
                            <label>
                                <input
                                    type="radio"
                                    name="rating"
                                    value="any"
                                    checked={filters.rating === "any"}
                                    onChange={handleFilterChange}
                                />
                                Show All
                            </label>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <label key={star}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={star}
                                        checked={filters.rating === star.toString()}
                                        onChange={handleFilterChange}
                                    />
                                    {star} star
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Experience Filter */}
                    <div className={styles.filterSection}>
                        <p>Experience</p>
                        <div className={styles.filterOptions}>
                            {[
                                "15+",
                                "10-15",
                                "5-10",
                                "3-5",
                                "1-3",
                                "0-1",
                            ].map((exp) => (
                                <label key={exp}>
                                    <input
                                        type="radio"
                                        name="experience"
                                        value={exp}
                                        checked={filters.experience === exp}
                                        onChange={handleFilterChange}
                                    />
                                    {exp} years
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Gender Filter */}
                    <div className={styles.filterSection}>
                        <p>Gender</p>
                        <div className={styles.filterOptions}>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="any"
                                    checked={filters.gender === "any"}
                                    onChange={handleFilterChange}
                                />
                                Show All
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={filters.gender === "male"}
                                    onChange={handleFilterChange}
                                />
                                Male
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={filters.gender === "female"}
                                    onChange={handleFilterChange}
                                />
                                Female
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    {/* Cards Grid */}
                    <div className={styles.cardsGrid}>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={styles.paginationButton}
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`${styles.paginationButton} ${
                                        currentPage === pageNum ? styles.activePage : ''
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={styles.paginationButton}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
