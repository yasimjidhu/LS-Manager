// Role-Based Access Control (RBAC) Configuration

export enum UserRole {
    ADMIN = 'ADMIN',
    SUPERVISOR = 'SUPERVISOR',
    EMPLOYEE = 'EMPLOYEE',
}

export enum Permission {
    // Dashboard
    VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
    VIEW_SUPERVISOR_DASHBOARD = 'VIEW_SUPERVISOR_DASHBOARD',
    VIEW_EMPLOYEE_DASHBOARD = 'VIEW_EMPLOYEE_DASHBOARD',

    // Jobs
    VIEW_ALL_JOBS = 'VIEW_ALL_JOBS',
    CREATE_JOB = 'CREATE_JOB',
    EDIT_JOB = 'EDIT_JOB',
    DELETE_JOB = 'DELETE_JOB',
    VIEW_MY_JOBS = 'VIEW_MY_JOBS',
    APPLY_FOR_JOB = 'APPLY_FOR_JOB',

    // Employees
    VIEW_ALL_EMPLOYEES = 'VIEW_ALL_EMPLOYEES',
    CREATE_EMPLOYEE = 'CREATE_EMPLOYEE',
    EDIT_EMPLOYEE = 'EDIT_EMPLOYEE',
    DELETE_EMPLOYEE = 'DELETE_EMPLOYEE',

    // Inventory
    VIEW_INVENTORY = 'VIEW_INVENTORY',
    MANAGE_INVENTORY = 'MANAGE_INVENTORY',
    CHECKOUT_EQUIPMENT = 'CHECKOUT_EQUIPMENT',
    RETURN_EQUIPMENT = 'RETURN_EQUIPMENT',

    // Invoices & Billing
    VIEW_INVOICES = 'VIEW_INVOICES',
    CREATE_INVOICE = 'CREATE_INVOICE',
    EDIT_INVOICE = 'EDIT_INVOICE',
    DELETE_INVOICE = 'DELETE_INVOICE',

    // Quotations
    VIEW_QUOTATIONS = 'VIEW_QUOTATIONS',
    CREATE_QUOTATION = 'CREATE_QUOTATION',
    EDIT_QUOTATION = 'EDIT_QUOTATION',
    DELETE_QUOTATION = 'DELETE_QUOTATION',

    // Wages & Payments
    VIEW_WAGES = 'VIEW_WAGES',
    MANAGE_WAGES = 'MANAGE_WAGES',
    APPROVE_WAGES = 'APPROVE_WAGES',
    VIEW_MY_WAGES = 'VIEW_MY_WAGES',

    // Settings
    VIEW_SETTINGS = 'VIEW_SETTINGS',
    MANAGE_COMPANY_SETTINGS = 'MANAGE_COMPANY_SETTINGS',
    MANAGE_PAYMENT_SETTINGS = 'MANAGE_PAYMENT_SETTINGS',
    MANAGE_WAGE_POLICIES = 'MANAGE_WAGE_POLICIES',
    MANAGE_INVENTORY_SETTINGS = 'MANAGE_INVENTORY_SETTINGS',
    MANAGE_USER_ROLES = 'MANAGE_USER_ROLES',
    MANAGE_SYSTEM_RULES = 'MANAGE_SYSTEM_RULES',

    // Reports
    VIEW_REPORTS = 'VIEW_REPORTS',
    EXPORT_REPORTS = 'EXPORT_REPORTS',
}

// Permission mapping for each role
export const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
        // Admin has ALL permissions
        Permission.VIEW_ADMIN_DASHBOARD,
        Permission.VIEW_SUPERVISOR_DASHBOARD,
        Permission.VIEW_EMPLOYEE_DASHBOARD,

        // Jobs - Full access
        Permission.VIEW_ALL_JOBS,
        Permission.CREATE_JOB,
        Permission.EDIT_JOB,
        Permission.DELETE_JOB,
        Permission.VIEW_MY_JOBS,
        Permission.APPLY_FOR_JOB,

        // Employees - Full access
        Permission.VIEW_ALL_EMPLOYEES,
        Permission.CREATE_EMPLOYEE,
        Permission.EDIT_EMPLOYEE,
        Permission.DELETE_EMPLOYEE,

        // Inventory - Full access
        Permission.VIEW_INVENTORY,
        Permission.MANAGE_INVENTORY,
        Permission.CHECKOUT_EQUIPMENT,
        Permission.RETURN_EQUIPMENT,

        // Invoices - Full access
        Permission.VIEW_INVOICES,
        Permission.CREATE_INVOICE,
        Permission.EDIT_INVOICE,
        Permission.DELETE_INVOICE,

        // Quotations - Full access
        Permission.VIEW_QUOTATIONS,
        Permission.CREATE_QUOTATION,
        Permission.EDIT_QUOTATION,
        Permission.DELETE_QUOTATION,

        // Wages - Full access
        Permission.VIEW_WAGES,
        Permission.MANAGE_WAGES,
        Permission.APPROVE_WAGES,
        Permission.VIEW_MY_WAGES,

        // Settings - Full access
        Permission.VIEW_SETTINGS,
        Permission.MANAGE_COMPANY_SETTINGS,
        Permission.MANAGE_PAYMENT_SETTINGS,
        Permission.MANAGE_WAGE_POLICIES,
        Permission.MANAGE_INVENTORY_SETTINGS,
        Permission.MANAGE_USER_ROLES,
        Permission.MANAGE_SYSTEM_RULES,

        // Reports - Full access
        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,
    ],

    [UserRole.SUPERVISOR]: [
        // Dashboard
        Permission.VIEW_SUPERVISOR_DASHBOARD,

        // Jobs - Full access
        Permission.VIEW_ALL_JOBS,
        Permission.CREATE_JOB,
        Permission.EDIT_JOB,
        Permission.DELETE_JOB,
        Permission.VIEW_MY_JOBS,

        // Employees - View only
        Permission.VIEW_ALL_EMPLOYEES,

        // Inventory - View only
        Permission.VIEW_INVENTORY,

        // Invoices - Full access
        Permission.VIEW_INVOICES,
        Permission.CREATE_INVOICE,
        Permission.EDIT_INVOICE,
        Permission.DELETE_INVOICE,

        // Quotations - Full access
        Permission.VIEW_QUOTATIONS,
        Permission.CREATE_QUOTATION,
        Permission.EDIT_QUOTATION,
        Permission.DELETE_QUOTATION,

        // Wages - Full access
        Permission.VIEW_WAGES,
        Permission.MANAGE_WAGES,
        Permission.APPROVE_WAGES,
        Permission.VIEW_MY_WAGES,

        // Settings - Limited access
        Permission.VIEW_SETTINGS,
        Permission.MANAGE_PAYMENT_SETTINGS,
        Permission.MANAGE_WAGE_POLICIES,

        // Reports - View only
        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,
    ],

    [UserRole.EMPLOYEE]: [
        // Dashboard
        Permission.VIEW_EMPLOYEE_DASHBOARD,

        // Jobs - View and apply only
        Permission.VIEW_MY_JOBS,
        Permission.APPLY_FOR_JOB,

        // Inventory - Checkout/Return only
        Permission.VIEW_INVENTORY,
        Permission.CHECKOUT_EQUIPMENT,
        Permission.RETURN_EQUIPMENT,

        // Wages - View own wages only
        Permission.VIEW_MY_WAGES,

        // Settings - View only (for language switching)
        Permission.VIEW_SETTINGS,
    ],
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
    return rolePermissions[role]?.includes(permission) || false;
};

// Helper function to check if a role has any of the specified permissions
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(role, permission));
};

// Helper function to check if a role has all of the specified permissions
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(role, permission));
};

// Navigation items with required permissions
export interface NavItem {
    label: string;
    path: string;
    icon: string;
    requiredPermissions: Permission[];
    requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
}

export const navigationItems: NavItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        requiredPermissions: [
            Permission.VIEW_ADMIN_DASHBOARD,
            Permission.VIEW_SUPERVISOR_DASHBOARD,
            Permission.VIEW_EMPLOYEE_DASHBOARD,
        ],
        requireAll: false, // User needs ANY of these permissions
    },
    {
        label: 'Jobs',
        path: '/jobs',
        icon: 'Briefcase',
        requiredPermissions: [Permission.VIEW_ALL_JOBS, Permission.VIEW_MY_JOBS],
        requireAll: false,
    },
    {
        label: 'My Jobs',
        path: '/my-jobs',
        icon: 'Calendar',
        requiredPermissions: [Permission.VIEW_MY_JOBS],
        requireAll: false,
    },
    {
        label: 'Employees',
        path: '/employees',
        icon: 'Users',
        requiredPermissions: [Permission.VIEW_ALL_EMPLOYEES],
        requireAll: false,
    },
    {
        label: 'Inventory',
        path: '/inventory',
        icon: 'Package',
        requiredPermissions: [Permission.VIEW_INVENTORY],
        requireAll: false,
    },
    {
        label: 'Invoices',
        path: '/invoices',
        icon: 'FileText',
        requiredPermissions: [Permission.VIEW_INVOICES],
        requireAll: false,
    },
    {
        label: 'Quotations',
        path: '/quotations',
        icon: 'Receipt',
        requiredPermissions: [Permission.VIEW_QUOTATIONS],
        requireAll: false,
    },
    {
        label: 'Wages',
        path: '/wages',
        icon: 'Wallet',
        requiredPermissions: [Permission.VIEW_WAGES, Permission.VIEW_MY_WAGES],
        requireAll: false,
    },
    {
        label: 'Reports',
        path: '/reports',
        icon: 'BarChart',
        requiredPermissions: [Permission.VIEW_REPORTS],
        requireAll: false,
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: 'Settings',
        requiredPermissions: [Permission.VIEW_SETTINGS],
        requireAll: false,
    },
];

// Settings sections with required permissions
export interface SettingsSection {
    id: string;
    title: string;
    description: string;
    icon: string;
    colorClass: string;
    requiredPermissions: Permission[];
}

export const settingsSections: SettingsSection[] = [
    {
        id: 'company',
        title: 'Company Settings',
        description: 'Manage company information, branding, and contact details',
        icon: 'Building2',
        colorClass: 'bg-blue-500',
        requiredPermissions: [Permission.MANAGE_COMPANY_SETTINGS],
    },
    {
        id: 'payment',
        title: 'Payment Settings',
        description: 'Configure payment methods, bank accounts, and payment gateways',
        icon: 'CreditCard',
        colorClass: 'bg-emerald-500',
        requiredPermissions: [Permission.MANAGE_PAYMENT_SETTINGS],
    },
    {
        id: 'wage-policies',
        title: 'Wage Policy Settings',
        description: 'Configure piece rates, daily wages, and fixed job rates for employees',
        icon: 'Wallet',
        colorClass: 'bg-purple-500',
        requiredPermissions: [Permission.MANAGE_WAGE_POLICIES],
    },
    {
        id: 'inventory',
        title: 'Inventory Configuration',
        description: 'Manage item categories, asset tags, and warehouse details',
        icon: 'Package',
        colorClass: 'bg-amber-500',
        requiredPermissions: [Permission.MANAGE_INVENTORY_SETTINGS],
    },
    {
        id: 'users',
        title: 'Role & User Management',
        description: 'Manage user roles, permissions, and access controls',
        icon: 'Users',
        colorClass: 'bg-red-500',
        requiredPermissions: [Permission.MANAGE_USER_ROLES],
    },
    {
        id: 'system',
        title: 'System Rules Configuration',
        description: 'Configure business rules, automations, and system behaviors',
        icon: 'Shield',
        colorClass: 'bg-indigo-500',
        requiredPermissions: [Permission.MANAGE_SYSTEM_RULES],
    },
];
