import React, { useState } from 'react';
import styles from '../../styles/Sidebar.module.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '→' : '←'}
      </button>
      <div className={styles.nav}>
        <a href="/dashboard" className={styles.navLink}>Dashboard</a>
        <a href="/create" className={styles.navLink}>Create Listing</a>
        <a href="/listings" className={styles.navLink}>My Listings</a>
        <a href="/profile" className={styles.navLink}>Profile</a>
      </div>
    </nav>
  );
};

export default Sidebar;
