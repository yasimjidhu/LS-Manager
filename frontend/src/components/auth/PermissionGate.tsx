import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../config/permissions';

interface PermissionGateProps {
    children: React.ReactNode;
    requiredPermissions: Permission[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
}

/**
 * PermissionGate - Conditionally render children based on user permissions
 * 
 * @example
 * // Render button only if user can create jobs
 * <PermissionGate requiredPermissions={[Permission.CREATE_JOB]}>
 *   <button>Create Job</button>
 * </PermissionGate>
 * 
 * @example
 * // Render if user has ANY of the permissions
 * <PermissionGate 
 *   requiredPermissions={[Permission.VIEW_ADMIN_DASHBOARD, Permission.VIEW_SUPERVISOR_DASHBOARD]}
 *   requireAll={false}
 * >
 *   <AdminPanel />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    requiredPermissions,
    requireAll = false,
    fallback = null,
}) => {
    const { hasAnyPermission, hasAllPermissions } = usePermissions();

    const hasAccess = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
