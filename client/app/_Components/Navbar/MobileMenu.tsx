"use client";

import Link from "next/link";
import { useLogin } from "../../providers/loginProvider";
import styles from "./Navbar.module.css";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { user, logout, isInitialized } = useLogin();

    return (
        <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}>
            <div className={styles.mobileMenuContent}>
                <span className={styles.closeMenu} onClick={onClose}>
                    ×
                </span>
                <h2>Welcome to MedCare!</h2>
                {isInitialized && user && (
                    <p className={styles.mobileUserName}>
                        Hi, {user.user_name}!
                    </p>
                )}
                <hr className={styles.line} />
                <ul>
                    <li>
                        <Link href="/" onClick={onClose}>
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/appointments" onClick={onClose}>
                            Appointments
                        </Link>
                    </li>
                    <li>
                        <Link href="/" onClick={onClose}>
                            Health Blog
                        </Link>
                    </li>
                    <li>
                        <Link href="/" onClick={onClose}>
                            Reviews
                        </Link>
                    </li>
                </ul>
                <div className={styles.btncon}>
                    {!isInitialized ? null : user ? (
                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className={styles.mobileLogoutBtn}
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link href="/login" className={styles.loginBtn} onClick={onClose}>
                                Login
                            </Link>
                            <Link href="/register" className={styles.registerBtn} onClick={onClose}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 
 

import Link from "next/link";
import { useLogin } from "../../providers/loginProvider";
import styles from "./Navbar.module.css";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { user, logout, isInitialized } = useLogin();

    return (
        <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}>
            <div className={styles.mobileMenuContent}>
                <span className={styles.closeMenu} onClick={onClose}>
                    ×
                </span>
                <h2>Welcome to MedCare!</h2>
                {isInitialized && user && (
                    <p className={styles.mobileUserName}>
                        Hi, {user.user_name}!
                    </p>
                )}
                <hr className={styles.line} />
                <ul>
                    <li>
                        <Link href="/" onClick={onClose}>
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/appointments" onClick={onClose}>
                            Appointments
                        </Link>
                    </li>
                    <li>
                        <Link href="/" onClick={onClose}>
                            Health Blog
                        </Link>
                    </li>
                    <li>
                        <Link href="/" onClick={onClose}>
                            Reviews
                        </Link>
                    </li>
                </ul>
                <div className={styles.btncon}>
                    {!isInitialized ? null : user ? (
                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className={styles.mobileLogoutBtn}
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link href="/login" className={styles.loginBtn} onClick={onClose}>
                                Login
                            </Link>
                            <Link href="/register" className={styles.registerBtn} onClick={onClose}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 
 
 
 
 