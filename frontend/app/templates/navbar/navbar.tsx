import { useState, useEffect } from 'react';
import styles from './navbar.module.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // State for storing user's name
  const [userRole, setUserRole] = useState<string | null>(null); // State for storing user's role

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    // Retrieve user's name and role from local storage if available
    const storedUserName = localStorage.getItem('username');
    const storedUserRole = localStorage.getItem('userRole'); // Ensure this key matches what you stored
    if (storedUserName) {
      setUserName(storedUserName);
    }
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);

  const handleLogout = () => {
    // Clear user information from local storage
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('role'); // Clear user role
    setUserName(null);
    setUserRole(null); // Reset user role in state
    window.location.href = '/login';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <a href="/">HealthSync</a>
      </div>

      {/* Desktop Menu */}
      <div className={`${styles.menu} ${mobileMenuOpen ? styles.mobile : ''}`}>
        <a href="/team">Our Team</a>
        {userRole === 'admin' && <a href="/osoby">People</a>} {/* Show link if user is admin */}
        {userRole === 'admin' && <a href="/lesson">Lessons</a>} {/* Show link if user is admin */}
        {userRole === 'admin' && <a href="/room">Rooms</a>} {/* Show link if user is admin */}
        {userName ? (
          <>
            <span className={styles.userName}>{userName}</span>
            <button onClick={handleLogout} className={styles.cta}>Logout</button>
          </>
        ) : (
          <a href="/login" className={styles.cta}>Login/Register</a>
        )}
      </div>

      {/* Hamburger Menu for mobile */}
      <div className={styles.hamburger} onClick={toggleMobileMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </nav>
  );
};

export default Navbar;
