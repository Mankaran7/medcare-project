"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
    user_name: string;
    user_emailid: string;
    user_id: number;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    fetchUser: () => Promise<void>;
    logout: () => Promise<void>;
    isInitialized: boolean;
}

const LoginContext = createContext<UserContextType | undefined>(undefined);

export const LoginProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitialized, setIsInitialized] = useState(true); // Start as true to match SSR

    const fetchUser = async () => {
        if (typeof window === 'undefined') return; // Skip on server-side

        try {
            const res = await fetch("http://localhost:3001/api/users/me", {
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                },
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
        }
    };

    const logout = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/users/logout", {
                method: "POST",
                credentials: "include",
            });
            
            if (res.ok) {
                setUser(null);
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    useEffect(() => {
    
        setIsInitialized(false);
        
        let mounted = true;

        const initializeAuth = async () => {
            try {
                await fetchUser();
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
        user,
        setUser,
        fetchUser,
        logout,
        isInitialized
    };

    return (
        <LoginContext.Provider value={value}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => {
    const context = useContext(LoginContext);
    if (!context) {
        throw new Error("useLogin must be used within a LoginProvider");
    }
    return context;
};