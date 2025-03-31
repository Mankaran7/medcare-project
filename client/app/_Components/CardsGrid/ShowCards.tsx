"use client";

import { ChangeEvent, useState, useEffect, useCallback } from "react";
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
        experience: "any",
        gender: "any",
    });

    const [appliedFilters, setAppliedFilters] = useState({
        rating: "any",
        experience: "any",
        gender: "any",
    });

    // Map experience string values to integer values for the backend
    const experienceToIntMap: Record<string, number> = {
        "15+": 15,
        "10-15": 10,
        "5-10": 5,
        "3-5": 3,
        "1-3": 1,
        "0-1": 0,
    };

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isResetting, setIsResetting] = useState(false);
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [searchApplied, setSearchApplied] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const itemsPerPage = 6;

    const fetchData = useCallback(async () => {
        if (isResetting) return;

        try {
            setLoading(true);
            setError(null);

            let url = '/api/admin/doctors/public';
            let queryParams = new URLSearchParams();

            if (searchApplied && searchQuery) {
                url = '/api/admin/doctors/search';
                queryParams.append('q', searchQuery);
            } else if (filtersApplied) {
                // Format gender value to match database (capitalize first letter)
                const formattedGender = appliedFilters.gender !== "any" 
                    ? appliedFilters.gender.charAt(0).toUpperCase() + appliedFilters.gender.slice(1)
                    : appliedFilters.gender;

                if (appliedFilters.rating !== "any") {
                    queryParams.append('rating', appliedFilters.rating);
                }
                if (appliedFilters.experience !== "any") {
                    queryParams.append('experience', appliedFilters.experience);
                }
                if (appliedFilters.gender !== "any") {
                    queryParams.append('gender', formattedGender);
                }
            }

            // Always append page
            queryParams.append('page', currentPage.toString());

            const response = await fetch(`${url}?${queryParams}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data: DoctorsResponse = await response.json();

            if (!data.ok) {
                throw new Error(data.message || "Failed to fetch doctors");
            }

            setDoctors(data.data.rows);
            setTotalDoctors(data.data.total || 0);
        } catch (err) {
            console.error("Error fetching doctors:", err);
            setError(err instanceof Error ? err.message : "An error occurred while fetching doctors");
            setDoctors([]);
            setTotalDoctors(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, appliedFilters, searchQuery, searchApplied, filtersApplied, isResetting]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = async (searchTerm: string) => {
        setSearchQuery(searchTerm);
        setCurrentPage(1);
        setFiltersApplied(false);
        setSearchApplied(true);
    };

    const handleFilters = () => {
        try {
            setCurrentPage(1);
            setSearchApplied(false);
            setFiltersApplied(true);
            setAppliedFilters(filters);
        } catch (error) {
            console.error('Error applying filters:', error);
            setError('Failed to apply filters. Please try again.');
        }
    };

    const resetFilters = () => {
        setIsResetting(true);
        const defaultFilters = {
            rating: "any",
            experience: "any",
            gender: "any",
        };
        setFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        setCurrentPage(1);
        setFiltersApplied(false);
        setSearchApplied(false);
        setSearchQuery("");
        setIsResetting(false);
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return <div className={styles.loading}>Loading doctors...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button onClick={fetchData} className={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
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

                    {/* Rating Filter */}
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

                    {/* Experience Filter */}
                    <div className={styles.filterSection}>
                        <h4 className={styles.filterTitle}>Experience</h4>
                        <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                                <input
                                    type="radio"
                                    name="experience"
                                    value="any"
                                    checked={filters.experience === "any"}
                                    onChange={handleFilterChange}
                                />
                                <span>Show All</span>
                            </label>
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

                    {/* Gender Filter */}
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

                    <button 
                        onClick={handleFilters}
                        className={styles.applyBtn}
                        disabled={loading}
                    >
                        Apply Filters
                    </button>
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
