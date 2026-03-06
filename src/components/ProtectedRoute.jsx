import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // Or a loading spinner

    if (!isAuthenticated) {
        // Redirect to login, saving the location the user tried to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}