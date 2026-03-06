// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export const PermissionRoute = ({ permission, children }) => {
//     const { can, loading } = useAuth();

//     if (loading) return null;

//     if (!can(permission)) {
//         // If they don't have permission, kick them to dashboard
//         return <Navigate to="/dashboard" replace />;
//     }

//     return children;
// };

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PermissionRoute = ({ permission, children }) => {
    const { can, loading, isAuthenticated } = useAuth();

    if (loading) return null; // Wait for the user data to load

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (!can(permission)) {
        console.warn(`Access denied for ${permission}. Redirecting to Dashboard.`);
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};