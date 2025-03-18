import React from 'react';
import styles from '../../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <span className={styles.copyright}>&copy;2025 Zippify</span>
      <div className={styles.links}>
        <a href="/privacy" className={styles.link}>Privacy Policy</a>
        <a href="/terms" className={styles.link}>Terms & Conditions</a>
      </div>
    </footer>
  );
};

export default Footer;
