import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const ProtectedRoute = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    return isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to="/auth/login" state={{ from: location }} replace />
    );
};

export default ProtectedRoute;
