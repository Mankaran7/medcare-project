"use client";

import Link from "next/link";
import { useLogin } from "../../providers/loginProvider";
import styles from "./Navbar.module.css";

export default function AuthSection() {
    const { user, logout, isInitialized } = useLogin();

    if (!isInitialized) {
        return <div className={styles.RightNav}></div>;
    }

    if (user) {
        return (
            <div className={styles.RightNav}>
                <div className={styles.userSection}>
                    <span className={styles.userName}>
                        {user.user_name}
                    </span>
                    <button onClick={logout} className={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.RightNav}>
            <div className={styles.buttons}>
                <Link href="/login" className={styles.loginBtn}>
                    Login
                </Link>
                <Link href="/register" className={styles.registerBtn}>
                    Register
                </Link>
            </div>
        </div>
    );
} 
 

