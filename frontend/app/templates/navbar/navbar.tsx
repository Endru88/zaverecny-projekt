import { useState } from 'react';
import styles from './navbar.module.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        
        <a href="/">HealthSync</a>
      </div>

      {/* Desktop Menu */}
      <div className={`${styles.menu} ${mobileMenuOpen ? styles.mobile : ''}`}>
        <a href="/team">Our Team</a>
        <a href="#team" className={styles.cta}>Login/Register</a>
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
