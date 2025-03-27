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
    ratings?: number;
    gender?: string;
}

interface DoctorsResponse {
    ok: boolean;
    data: {
        rows: Doctor[];
        total: number;
    };
    message?: string;
}

export default function ShowCards() {
    const [filters, setFilters] = useState({
        rating: "any",
        experience: "15+",
        gender: "any",
    });

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchDoctors();
    }, [currentPage, filters]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError(null);

            const pageNum = Math.max(1, currentPage);
            const queryParams = new URLSearchParams({
                page: pageNum.toString(),
                ...(filters.rating !== "any" && { rating: filters.rating }),
                ...(filters.experience !== "any" && { experience: filters.experience }),
                ...(filters.gender !== "any" && { gender: filters.gender })
            });

            const response = await fetch(`/api/admin/doctors/public?${queryParams}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data: DoctorsResponse = await response.json();

            if (!data.ok) {
                throw new Error(data.message || "Failed to fetch doctors");
            }

            if (!data.data?.rows) {
                throw new Error("Invalid data format received from server");
            }

            const doctorsWithRating = data.data.rows.map((doc: Doctor) => ({
                ...doc,
                rating: doc.ratings || 4
            }));

            setDoctors(doctorsWithRating);
            setTotalDoctors(data.data.total || 0);
        } catch (err) {
            console.error("Error fetching doctors:", err);
            setError(err instanceof Error ? err.message : "An error occurred while fetching doctors");
            setDoctors([]);
            setTotalDoctors(0);
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
        setCurrentPage(1);
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleSearch = async (searchTerm: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                q: searchTerm,
                page: currentPage.toString()
            });

            const response = await fetch(`/api/admin/doctors/search?${queryParams}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error('Failed to search doctors');
            }

            const data: DoctorsResponse = await response.json();
            if (!data.ok) {
                throw new Error(data.message || "Failed to search doctors");
            }

            const doctorsWithRating = data.data.rows.map((doc: Doctor) => ({
                ...doc,
                ratings: doc.ratings || 4
            }));

            setDoctors(doctorsWithRating);
            setTotalDoctors(data.data.total || 0);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error searching doctors:", err);
            setError(err instanceof Error ? err.message : "An error occurred while searching");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading doctors...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    const totalPages = Math.max(1, Math.ceil(totalDoctors / itemsPerPage));

    return (
        <div className={styles.pageContainer}>
            <Search handleSearch={handleSearch} />
            <div className={styles.infoText}>
                <p className={styles.docCount}>
                    {totalDoctors} doctors available
                </p>
                <p className={styles.subText}>
                    Book appointments with minimum wait-time & verified doctor details
                </p>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.filtersContainer}>
                    <div className={styles.filterHeader}>
                        <p>Filter By:</p>
                        <button onClick={resetFilters} className={styles.resetButton}>
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
                            {[1, 2, 3, 4, 5].map((star) => (
                                <label key={star} className={styles.filterOption}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={star.toString()}
                                        checked={filters.rating === star.toString()}
                                        onChange={handleFilterChange}
                                    />
                                    <span>{star} star</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h4 className={styles.filterTitle}>Experience</h4>
                        <div className={styles.filterOptions}>
                            {[
                                "15+",
                                "10-15",
                                "5-10",
                                "3-5",
                                "1-3",
                                "0-1",
                            ].map((exp) => (
                                <label key={exp} className={styles.filterOption}>
                                    <input
                                        type="radio"
                                        name="experience"
                                        value={exp}
                                        checked={filters.experience === exp}
                                        onChange={handleFilterChange}
                                    />
                                    <span>{exp} years</span>
                                </label>
                            ))}
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
                </div>

                <div className={styles.gridContainer}>
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
                                    ratings: doctor.ratings || 4,
                                    image: doctor.doctor_photo || '/default-doctor.png'
                                }} 
                            />
                        ))}
                    </div>

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
