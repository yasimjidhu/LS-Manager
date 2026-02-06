import { useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store';
import {
    LayoutGrid,
    Box,
    ClipboardList,
    CalendarDays,
    Briefcase,
    DollarSign,
    Settings,
    FileText,
    Coins,
    Users,
    LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

const sidebarItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: Box, label: 'Inventory', href: '/inventory', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: ClipboardList, label: 'Equipment Checkout', href: '/checkout', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: CalendarDays, label: 'Schedule', href: '/jobs', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: Briefcase, label: 'Jobs', href: '/my-jobs', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: Users, label: 'Employees', href: '/employees', roles: ['ADMIN', 'SUPERVISOR'] },
    { icon: FileText, label: 'Quotations', href: '/quotations', roles: ['ADMIN', 'SUPERVISOR'] },
    { icon: DollarSign, label: 'Invoices', href: '/invoices', roles: ['ADMIN', 'SUPERVISOR'] },
    { icon: Coins, label: 'Wages', href: '/wages', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
];

const Sidebar = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const filteredItems = sidebarItems.filter(item =>
        user?.role && item.roles.includes(user.role)
    );

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/auth/login');
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-20 bg-[#111315] border-r border-[#1F2937] flex flex-col items-center py-6">
            {/* Logo */}
            <div className="mb-10">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                    LS
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 w-full space-y-4 px-3 overflow-y-auto no-scrollbar">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                "w-full h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-transparent text-blue-500"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-[#1A1D21]"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active Indicator Line */}
                                <div className={cn("hidden", isActive && "block absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full")} />

                                <item.icon className="w-6 h-6" strokeWidth={2} />

                                {/* Tooltip */}
                                <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-800 pointer-events-none z-50">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto space-y-4 px-3 w-full flex flex-col items-center pt-4 border-t border-[#1F2937]">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        cn(
                            "w-full h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative",
                            isActive
                                ? "bg-transparent text-blue-500"
                                : "text-gray-500 hover:text-gray-300 hover:bg-[#1A1D21]"
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div className={cn("hidden", isActive && "block absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full")} />
                            <Settings className="w-6 h-6" strokeWidth={2} />
                            <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-800 pointer-events-none z-50">
                                Settings
                            </span>
                        </>
                    )}
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="w-full h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative text-gray-500 hover:text-red-400 hover:bg-[#1A1D21]"
                >
                    <LogOut className="w-6 h-6" strokeWidth={2} />
                    <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-800 pointer-events-none z-50">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
