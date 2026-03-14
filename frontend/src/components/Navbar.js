import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUser, clearUser } from '../services/api';
import logo from '../assets/images/logo.png';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const user = getUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const dropdownRef = useRef(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        clearUser();
        navigate('/login');
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav className="navbar">
            <Link to="/home" className="navbar-brand" style={{ textDecoration: 'none' }}>
                <img src={logo} alt="Exam System Logo" className="navbar-logo-img" />
                <span>Exam System</span>
            </Link>

            <div className="navbar-right">
                {user && (
                    <div className="navbar-user-container" ref={dropdownRef}>
                        <div className={`navbar-user-trigger ${dropdownOpen ? 'active' : ''}`} onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <div className="navbar-avatar">
                                {getInitials(user.name)}
                            </div>
                            <div className="navbar-user-info">
                                <span className="navbar-user-name">{user.name}</span>
                                <span className="navbar-user-email">{user.email}</span>
                            </div>
                            <div className="dropdown-arrow">▾</div>
                        </div>

                        {dropdownOpen && (
                            <div className="navbar-dropdown">
                                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <span className="item-icon">👤</span>
                                    <span>Profile</span>
                                </Link>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <span className="item-icon">🚪</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
