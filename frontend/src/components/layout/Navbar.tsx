import { Search, Bell, ScanLine, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsService } from '../../services/notifications.service';
import { cn } from '../../lib/utils';
import moment from 'moment';

const Navbar = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: NotificationsService.getAll,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const markAsReadMutation = useMutation({
        mutationFn: NotificationsService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: NotificationsService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'ERROR': return <X className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav className="fixed top-0 left-20 right-0 z-30 h-20 bg-[#0B0E14] flex items-center justify-between px-8">
            {/* Search Bar */}
            <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search equipment, jobs..."
                    className="w-full h-12 bg-[#151A21] border border-[#1F2937] rounded-xl pl-12 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Quick Scan Button */}
                <button className="hidden md:flex h-10 px-5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20">
                    <ScanLine className="w-4 h-4" />
                    Quick Scan
                </button>

                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative p-2 text-gray-400 hover:text-white transition-colors outline-none"
                    >
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0B0E14] animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-4 w-96 bg-[#151A21] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="p-4 border-b border-[#1F2937] flex justify-between items-center bg-[#111315]">
                                <h3 className="font-bold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAllAsReadMutation.mutate()}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification: any) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                                            className={cn(
                                                "p-4 border-b border-[#1F2937] flex gap-3 hover:bg-[#1A1D21] transition-colors cursor-pointer last:border-0",
                                                !notification.isRead ? "bg-blue-500/5" : ""
                                            )}
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={cn("text-sm font-semibold", !notification.isRead ? "text-white" : "text-gray-400")}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                                        {moment(notification.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="flex items-center gap-3 pl-6 border-l border-[#1F2937]">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-semibold text-white">{user?.name || 'User'}</div>
                        <div className="text-xs text-green-500 font-medium text-right flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {user?.role || 'GUEST'}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-[#1F2937]">
                        {user?.name ? getInitials(user.name) : 'U'}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
