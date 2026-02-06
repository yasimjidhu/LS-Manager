import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../config/permissions';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermissions: Permission[];
    requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredPermissions,
    requireAll = false,
    redirectTo = '/dashboard',
}) => {
    const { hasAnyPermission, hasAllPermissions } = usePermissions();

    const hasAccess = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};
