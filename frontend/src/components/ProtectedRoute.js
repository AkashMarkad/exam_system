import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../services/api';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const user = getUser();

    if (!user) {
        // Not logged in -> Redirect to Landing page
        return <Navigate to="/" replace />;
    }

    if (adminOnly && user.role !== 'ADMIN') {
        // Not an admin but trying to access admin page -> Redirect to Home
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
