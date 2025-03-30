"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface Admin {
    id: number;
    email: string;
    role: string;
}

interface AdminContextType {
    admin: Admin | null;
    setAdmin: (admin: Admin | null) => void;
    fetchAdmin: () => Promise<void>;
    logout: () => Promise<void>;
    isInitialized: boolean;
}

const AdminLoginContext = createContext<AdminContextType | undefined>(undefined);

export const AdminLoginProvider = ({ children }: { children: React.ReactNode }) => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isInitialized, setIsInitialized] = useState(true);

    const fetchAdmin = async () => {
        if (typeof window === 'undefined') return;

        try {
            const res = await fetch("http://localhost:3001/api/admin/me", {
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                },
            });

            if (res.ok) {
                const adminData = await res.json();
                setAdmin(adminData);
            } else {
                setAdmin(null);
            }
        } catch (error) {
            console.error("Error fetching admin:", error);
            setAdmin(null);
        }
    };

    const logout = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/admin/logout", {
                method: "POST",
                credentials: "include",
            });
            
            if (res.ok) {
                setAdmin(null);
                localStorage.removeItem("adminToken");
            }
        } catch (error) {
            console.error("Error during logout:", error);
            // Still clear admin state on error
            setAdmin(null);
            localStorage.removeItem("adminToken");
        }
    };

    useEffect(() => {
        setIsInitialized(false);
        
        let mounted = true;

        const initializeAuth = async () => {
            try {
                await fetchAdmin();
            } catch (error) {
                console.error("Error during initialization:", error);
            } finally {
                if (mounted) {
                    setIsInitialized(true);
                }
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const value = {
        admin,
        setAdmin,
        fetchAdmin,
        logout,
        isInitialized
    };

    return (
        <AdminLoginContext.Provider value={value}>
            {children}
        </AdminLoginContext.Provider>
    );
};

export const useAdminLogin = () => {
    const context = useContext(AdminLoginContext);
    if (!context) {
        throw new Error("useAdminLogin must be used within an AdminLoginProvider");
    }
    return context;
}; 