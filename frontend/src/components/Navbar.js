import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUser, clearUser } from '../services/api';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        clearUser();
        navigate('/login');
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
            <div className="navbar-brand">
                <div className="navbar-brand-icon">📝</div>
                <span>Exam System</span>
            </div>
            <div className="navbar-right">
                {user && (
                    <>
                        <div className="navbar-user">
                            <div className="navbar-avatar">
                                {getInitials(user.name)}
                            </div>
                            <div className="navbar-user-info">
                                <span className="navbar-user-name">{user.name}</span>
                                <span className="navbar-user-email">{user.email}</span>
                            </div>
                        </div>
                        <Link to="/profile" className="navbar-logout" style={{ textDecoration: 'none' }}>
                            Profile
                        </Link>
                        <button className="navbar-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
