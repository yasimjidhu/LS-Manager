import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { hasPermission, hasAnyPermission, hasAllPermissions, UserRole, Permission } from '../config/permissions';

export const usePermissions = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const userRole = (user?.role as UserRole) || UserRole.EMPLOYEE;

    return {
        userRole,
        hasPermission: (permission: Permission) => hasPermission(userRole, permission),
        hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
        hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
        isAdmin: userRole === UserRole.ADMIN,
        isSupervisor: userRole === UserRole.SUPERVISOR,
        isEmployee: userRole === UserRole.EMPLOYEE,
    };
};
