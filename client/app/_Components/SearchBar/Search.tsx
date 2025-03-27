"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Search.module.css";

interface SearchProps {
    handleSearch: (searchTerm: string) => Promise<void>;
}

export default function Search({ handleSearch }: SearchProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSearch = async () => {
        if (!searchTerm.trim()) return;
        
        try {
            setIsLoading(true);
            await handleSearch(searchTerm.trim());
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.heading}>
                <span>Find a doctor at your own ease</span>
            </div>

            <div className={styles.searchBar}>
                <span className={styles.icon}>
                    <Image src="/search.svg" alt="Search logo" height={20} width={20} />
                </span>
                <input
                    type="text"
                    placeholder="Search doctors"
                    className={styles.input}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button 
                    className={styles.button}
                    onClick={onSearch}
                    disabled={isLoading}
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </div>
        </div>
    );
}