import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface RoleRouteProps {
    allowedRoles: string[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to a dashboard based on their role if they try to access unauthorized page
        // Or just redirect to their home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
