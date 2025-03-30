"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminLogin } from "../../providers/adminLoginProvider";
import styles from "./navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminLogin();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Redirect anyway on error
      router.push("/");
    }
  };

  return (
    <nav className={styles.navbar}>
      <h2 className={styles.logo}>Admin Panel</h2>
      <ul className={styles.navLinks}>
        <li className={pathname === "/list-doctors" ? styles.active : ""}>
          <Link href="/list-doctors">List Doctors</Link>
        </li>
        <li className={pathname === "/pending-requests" ? styles.active : ""}>
          <Link href="/appointment">Pending Requests</Link>
        </li>
      </ul>
      <button onClick={handleLogout} className={styles.logoutBtn}>
        Logout
      </button>
    </nav>
  );
}



