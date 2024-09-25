import { useState, useEffect } from 'react';
import styles from './navbar.module.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // State for storing user's name

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    // Retrieve user's name from local storage if available
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const handleLogout = () => {
    // Clear user information from local storage
    localStorage.removeItem('jwt'); // Remove JWT token
    localStorage.removeItem('userName'); // Remove user name
    setUserName(null); // Reset user name in state
    // Optionally, redirect to login page
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <a href="/">HealthSync</a>
      </div>

      {/* Desktop Menu */}
      <div className={`${styles.menu} ${mobileMenuOpen ? styles.mobile : ''}`}>
        <a href="/team">Our Team</a>
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
