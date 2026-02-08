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
    LogOut,
    Wrench,
    ClipboardCheck,
    X
} from 'lucide-react';
import { cn } from '../../lib/utils';

const sidebarItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: Box, label: 'Inventory', href: '/inventory', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: ClipboardList, label: 'Equipment Checkout', href: '/checkout', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: ClipboardCheck, label: 'Equipment Check-in', href: '/checkin', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: CalendarDays, label: 'Schedule', href: '/jobs', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: Briefcase, label: 'Jobs', href: '/my-jobs', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
    { icon: Users, label: 'Employees', href: '/employees', roles: ['ADMIN', 'SUPERVISOR'] },
    { icon: Wrench, label: 'Maintenance', href: '/maintenance', roles: ['ADMIN', 'SUPERVISOR'] },
    { icon: FileText, label: 'Quotations', href: '/quotations', roles: ['ADMIN', 'SUPERVISOR'] },
    { icon: DollarSign, label: 'Invoices', href: '/invoices', roles: ['ADMIN', 'SUPERVISOR'] },
    { icon: Coins, label: 'Wages', href: '/wages', roles: ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] },
];

interface SidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
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
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 z-50 h-screen w-16 bg-[#111315] border-r border-[#1F2937] flex flex-col items-center py-4 transition-transform duration-300 lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Close button for mobile */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Logo */}
                <div className="mb-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                        LS
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 w-full space-y-2 px-3 overflow-y-auto no-scrollbar">
                    {filteredItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 group relative",
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

                                    <item.icon className="w-5 h-5" strokeWidth={2} />

                                    {/* Tooltip (Desktop only) */}
                                    <span className="hidden lg:block absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-800 pointer-events-none z-50">
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto space-y-2 px-3 w-full flex flex-col items-center pt-4 border-t border-[#1F2937]">
                    <NavLink
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            cn(
                                "w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-transparent text-blue-500"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-[#1A1D21]"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn("hidden", isActive && "block absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full")} />
                                <Settings className="w-5 h-5" strokeWidth={2} />
                                <span className="hidden lg:block absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-800 pointer-events-none z-50">
                                    Settings
                                </span>
                            </>
                        )}
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        className="w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 group relative text-gray-500 hover:text-red-400 hover:bg-[#1A1D21]"
                    >
                        <LogOut className="w-5 h-5" strokeWidth={2} />
                        <span className="hidden lg:block absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-800 pointer-events-none z-50">
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
