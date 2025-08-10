import styles from './Navbar.module.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaHome } from 'react-icons/fa';
import { MdExitToApp } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import { useLogout } from '../api/useLogout'; 
import { useAuthContext } from '../api/AuthContext'; 

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBatteriUser, setIsBatteriUser] = useState(false);
  const { logout } = useLogout();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthContext();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    logout();
    closeMenu(); 
  };

  useEffect(() => {
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const email = localStorage.getItem('email');

    if (firstName === 'admin' && lastName === 'master' && email === 'adminmaster@gmail.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    if (email === 'batteri@gmail.com') { // ✅ Check for battery user
      setIsBatteriUser(true);
    } else {
      setIsBatteriUser(false);
    }
  }, []);

  const handleNavLinkClick = useCallback(
    (to: string) => {
      if (isAuthenticated) {
        navigate(to);
        closeMenu();
      } else {
        navigate('/'); 
      }
    },
    [isAuthenticated, navigate]
  );

  return (
    <nav className={styles.navbar}>
      <div className={styles.hamburger} onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <ul className={`${styles.navList} ${isMenuOpen ? styles.active : ''}`}>
        {isAdmin && (
          <li className={styles.navItem}>
            <NavLink
              to="/Admin"
              className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}
              onClick={() => handleNavLinkClick('/Admin')}
            >
              Admin
            </NavLink>
          </li>
        )}

        <li className={styles.navItem}>
          <NavLink
            to="/Home"
            className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}
            onClick={() => handleNavLinkClick('/Home')}
          >
            <FaHome style={{ marginRight: '8px' }} />
            Home
          </NavLink>
        </li>

        {isBatteriUser && (
          <li className={styles.navItem}>
            <NavLink
              to="/addBatteriCharger"
              className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}
              onClick={() => handleNavLinkClick('/addBatteriCharger')}
            >
              Add a battery charger
            </NavLink>
          </li>
        )}

        <li className={styles.navItem}>
          <NavLink
            to="/newChargingStation"
            className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}
            onClick={() => handleNavLinkClick('/newChargingStation')}
          >
            Add my own charging station
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="/ActivityHistory"
            className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}
            onClick={() => handleNavLinkClick('/ActivityHistory')}
          >
            Activity history
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="/PersonalArea"
            className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}
            onClick={() => handleNavLinkClick('/PersonalArea')}
          >
            <FaUser style={{ marginRight: '8px' }} />
            Personal area
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <button
            onClick={() => {
              handleLogout();
              closeMenu();
            }}
            className={styles.navLink}
          >
            <MdExitToApp style={{ marginRight: '8px' }} />
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}