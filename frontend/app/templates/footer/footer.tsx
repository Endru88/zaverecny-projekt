// components/Footer.tsx
import styles from './Footer.module.css'; // Create a CSS module for styling

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <h3>Contact Us</h3>
          <p>+420 123 456 789</p>
          <p>email@example.com</p>
          <p>Address, City, Postal Code</p>
        </div>
        
        <div className={styles.column}>
          <h3>Follow Us</h3>
          <ul className={styles.socialLinks}>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </div>
        
        <div className={styles.column}>
          <h3>Quick Links</h3>
          <ul className={styles.links}>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; 2024 Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
