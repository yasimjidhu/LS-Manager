import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
    BarChart3, DollarSign, Briefcase, Users, TrendingUp,
    Calendar, AlertCircle, CheckCircle, Clock, MapPin
} from 'lucide-react';
import { AnalyticsService } from '../../services/analytics.service';
import { inventoryApi } from '../../services/inventory.service';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { cn } from '../../lib/utils';
import { Skeleton, StatCardSkeleton } from '../../components/ui';
import moment from 'moment';

const Dashboard = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['dashboard-analytics', 'this-month'],
        queryFn: () => AnalyticsService.getDashboardAnalytics('this-month'),
    });

    const { data: conflicts } = useQuery({
        queryKey: ['inventory-conflicts'],
        queryFn: () => inventoryApi.getConflicts(),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-4 md:p-6 lg:p-8">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="mb-6 space-y-2">
                        <Skeleton className="h-8 md:h-10 w-48 md:w-64" />
                        <Skeleton className="h-4 md:h-5 w-64 md:w-80" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6">
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                        <div className="lg:col-span-2 bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-6 h-[350px] lg:h-[400px]">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <Skeleton className="h-full w-full rounded-lg" />
                        </div>
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-6 h-[350px] lg:h-[400px]">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <Skeleton className="h-full w-full rounded-full mx-auto max-w-[200px]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    if (user?.role === 'ADMIN') {
        const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'];

        const pieData = analytics?.jobsByStatus ? [
            { name: 'Pending', value: analytics.jobsByStatus.PENDING },
            { name: 'Planned', value: analytics.jobsByStatus.PLANNED },
            { name: 'Ongoing', value: analytics.jobsByStatus.ONGOING },
            { name: 'Completed', value: analytics.jobsByStatus.COMPLETED },
            { name: 'Cancelled', value: analytics.jobsByStatus.CANCELLED },
        ].filter(d => d.value > 0) : [];

        return (
            <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-4 md:p-6 lg:p-8 pb-20">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
                        <p className="text-gray-400 text-xs md:text-sm">Overview of your business performance</p>
                    </div>

                    {/* Equipment Conflicts Alert */}
                    {user?.role === 'ADMIN' && conflicts && conflicts.length > 0 && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <h3 className="font-bold text-red-500 text-sm">Equipment Overbooking Detected</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {conflicts.map((conflict: { itemId: string; itemName: string; conflicts: { date: string; shortage: number }[] }) => (
                                    <div key={conflict.itemId} className="bg-[#151A21] border border-red-500/20 rounded-lg p-2.5">
                                        <p className="font-semibold text-white text-xs mb-1.5">{conflict.itemName}</p>
                                        <div className="space-y-1">
                                            {conflict.conflicts.map((c: { date: string; shortage: number }, idx: number) => (
                                                <div key={idx} className="flex justify-between text-[10px]">
                                                    <span className="text-gray-400">{moment(c.date).format('DD MMM')}</span>
                                                    <span className="text-red-400 font-medium">Shortage: {c.shortage}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 lg:p-5 shadow-lg shadow-blue-900/20">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-white/60" />
                            </div>
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Revenue</p>
                            <p className="text-base md:text-xl lg:text-2xl font-bold text-white leading-tight">₹{analytics?.summary?.totalRevenue?.toLocaleString() || 0}</p>
                            <p className="text-white/60 text-[9px] md:text-[10px] mt-1">₹{analytics?.summary?.pendingAmount?.toLocaleString() || 0} pending</p>
                        </div>

                        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 lg:p-5 shadow-lg shadow-red-900/20">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white/80 rotate-180" />
                                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-white/60" />
                            </div>
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Expenses</p>
                            <p className="text-base md:text-xl lg:text-2xl font-bold text-white leading-tight">₹{analytics?.summary?.totalExpenses?.toLocaleString() || 0}</p>
                            <p className="text-white/60 text-[9px] md:text-[10px] mt-1 truncate">Incl. job costs</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 lg:p-5 shadow-lg shadow-emerald-900/20">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white/60" />
                            </div>
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Profit</p>
                            <p className="text-base md:text-xl lg:text-2xl font-bold text-white leading-tight">₹{analytics?.summary?.netProfit?.toLocaleString() || 0}</p>
                            <p className="text-white/60 text-[9px] md:text-[10px] mt-1 truncate">Net Earnings</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 lg:p-5 shadow-lg shadow-purple-900/20">
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-white/80 mb-2" />
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Staff</p>
                            <p className="text-base md:text-xl lg:text-2xl font-bold text-white leading-tight">{analytics?.summary?.activeEmployees || 0}</p>
                            <p className="text-white/60 text-[9px] md:text-[10px] mt-1">Active now</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-4 lg:p-5 shadow-lg shadow-amber-900/20 col-span-2 sm:col-span-1">
                            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white/80 mb-2" />
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Jobs</p>
                            <p className="text-base md:text-xl lg:text-2xl font-bold text-white leading-tight">{analytics?.summary?.jobsCompleted || 0}</p>
                            <p className="text-white/60 text-[9px] md:text-[10px] mt-1 truncate">{analytics?.summary?.activeJobs || 0} active</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                        {/* Revenue Trend Chart */}
                        <div className="lg:col-span-2 bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-6 text-xs">
                            <h3 className="text-sm md:text-base font-bold text-white mb-4">Revenue Trend</h3>
                            <div className="h-[260px] lg:h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics?.revenueTrend || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                                        <XAxis dataKey="month" stroke="#4B5563" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#4B5563" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                                fontSize: '10px'
                                            }}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Job Status Distribution */}
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-6">
                            <h3 className="text-sm md:text-base font-bold text-white mb-4">Job Distribution</h3>
                            <div className="h-[260px] lg:h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={65}
                                            fill="#8884d8"
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                                fontSize: '10px'
                                            }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
                        {/* Recent Jobs Table */}
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                            <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-[#1F2937] flex justify-between items-center">
                                <h3 className="text-xs md:text-sm font-bold text-white">Recent Activities</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-black text-gray-500 uppercase">Operation</th>
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-black text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1F2937]">
                                        {analytics?.recentJobs?.map((job: { id: string; title: string; location: string; status: string; date: string }) => (
                                            <tr key={job.id} className="hover:bg-[#1F2937]/30 transition-colors group">
                                                <td className="px-4 py-3 lg:px-6 lg:py-4">
                                                    <p className="font-bold text-gray-200 text-xs md:text-sm group-hover:text-white transition-colors">{job.title}</p>
                                                    <p className="text-[10px] md:text-xs text-gray-500">{job.location}</p>
                                                </td>
                                                <td className="px-4 py-3 lg:px-6 lg:py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider border ${job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        job.status === 'ONGOING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                                        }`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top Employees Table */}
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                            <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-[#1F2937]">
                                <h3 className="text-xs md:text-sm font-semibold text-white">Top Performing Employees</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-semibold text-gray-400 uppercase">Employee</th>
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-semibold text-gray-400 uppercase">Jobs</th>
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-semibold text-gray-400 uppercase">Earnings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1F2937]">
                                        {analytics?.topEmployees?.map((emp: { employeeId: string; firstName: string; lastName: string; role: string; jobs: number; rating: number; totalEarnings?: number }) => (
                                            <tr key={emp.employeeId} className="hover:bg-[#1F2937]/30 transition-colors">
                                                <td className="px-4 py-3 lg:px-6 lg:py-4">
                                                    <p className="font-semibold text-white text-xs md:text-sm">{emp.firstName} {emp.lastName}</p>
                                                    <p className="text-[10px] md:text-xs text-gray-400">{emp.role}</p>
                                                </td>
                                                <td className="px-4 py-3 lg:px-6 lg:py-4">
                                                    <span className="text-blue-400 font-medium text-xs md:text-sm">{emp.jobs}</span>
                                                </td>
                                                <td className="px-4 py-3 lg:px-6 lg:py-4 text-green-400 font-medium text-xs md:text-sm">
                                                    ₹{emp.totalEarnings?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!analytics?.topEmployees || analytics.topEmployees.length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-center text-gray-500 text-xs">No employee data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Supervisor Dashboard
    if (user?.role === 'SUPERVISOR') {
        return (
            <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-4 md:p-6 lg:p-8 pb-20">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-1">Supervisor Dashboard</h1>
                        <p className="text-gray-400 text-xs md:text-sm">Manage your team and jobs</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 lg:p-6 shadow-lg shadow-blue-900/20">
                            <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white/80 mb-2" />
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Total Jobs</p>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">{analytics?.summary?.totalJobs || 0}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 lg:p-6 shadow-lg shadow-green-900/20">
                            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white/80 mb-2" />
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Completed</p>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">{analytics?.summary?.completedJobs || 0}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-4 lg:p-6 shadow-lg shadow-purple-900/20">
                            <Users className="w-5 h-5 md:w-6 md:h-6 text-white/80 mb-2" />
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Team Size</p>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">{analytics?.summary?.teamSize || 0}</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-4 lg:p-6 shadow-lg shadow-amber-900/20">
                            <Clock className="w-5 h-5 md:w-6 md:h-6 text-white/80 mb-2" />
                            <p className="text-white/80 text-[10px] md:text-xs uppercase tracking-wide mb-1">Pending</p>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">{analytics?.summary?.pendingRequests || 0}</p>
                        </div>
                    </div>

                    {/* Recent Jobs */}
                    {analytics?.recentJobs && analytics.recentJobs.length > 0 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-[#1F2937]">
                                <h3 className="text-sm font-semibold text-white">Recent Jobs</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-semibold text-gray-400 uppercase">Job</th>
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-semibold text-gray-400 uppercase">Status</th>
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-semibold text-gray-400 uppercase">Date</th>
                                            <th className="text-left px-4 py-3 lg:px-6 lg:py-4 text-[10px] md:text-xs font-semibold text-gray-400 uppercase">Crew</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1F2937]">
                                        {analytics.recentJobs.slice(0, 5).map((job: { id: string; title: string; location: string; date: string; status: string; requiredWorkers: number; crewCount: number }) => (
                                            <tr key={job.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                                <td className="px-4 py-3 lg:px-6 lg:py-4">
                                                    <p className="font-semibold text-white text-xs md:text-sm">{job.title}</p>
                                                    <p className="text-[10px] md:text-xs text-gray-400">{job.location}</p>
                                                </td>
                                                <td className="px-4 py-3 lg:px-6 lg:py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-bold ${job.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                        job.status === 'ONGOING' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                                        }`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 lg:px-6 lg:py-4 text-gray-300 text-xs md:text-sm">{job.date}</td>
                                                <td className="px-4 py-3 lg:px-6 lg:py-4 text-gray-300 text-xs md:text-sm">{job.crewCount}/{job.requiredWorkers}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Employee Dashboard
    if (user?.role === 'EMPLOYEE') {
        const stats = [
            { label: 'Total Earnings', value: `₹${analytics?.summary?.totalEarnings?.toLocaleString() || 0}`, icon: DollarSign, color: 'bg-emerald-500', trend: 'Lifetime' },
            { label: 'Pending Payment', value: `₹${analytics?.summary?.unpaidBalance?.toLocaleString() || 0}`, icon: Clock, color: 'bg-amber-500', trend: 'To be paid' },
            { label: 'Jobs Completed', value: analytics?.summary?.completedJobs || 0, icon: CheckCircle, color: 'bg-blue-500', trend: 'Total' },
            { label: 'Attendance', value: analytics?.summary?.totalAttendance || 0, icon: Users, color: 'bg-indigo-500', trend: 'Days worked' },
        ];

        const nextJob = analytics?.upcomingSchedule?.[0];

        return (
            <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-4 md:p-6 lg:p-8 pb-20">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-white mb-0.5">Dashboard</h1>
                            <p className="text-gray-400 text-xs">Welcome back, <span className="text-white font-medium">{user.name}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/my-jobs')}
                                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                            >
                                View Schedule
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-4 md:p-5 hover:border-gray-700 transition-all group">
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className={cn("p-2 rounded-xl bg-opacity-10 transition-colors group-hover:bg-opacity-20 flex-shrink-0", stat.color.replace('bg-', 'text-'))}>
                                        <stat.icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color.replace('bg-', 'text-'))} />
                                    </div>
                                    <span className="hidden sm:inline-block text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-[#0B0E14] px-2 py-1 rounded-lg border border-[#1F2937]">{stat.trend}</span>
                                </div>
                                <p className="text-lg md:text-2xl font-black text-white mb-0.5 md:mb-1">{stat.value}</p>
                                <p className="text-[10px] md:text-xs text-gray-400 font-medium truncate">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Next Job Highlight */}
                            {nextJob && (
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-24 md:p-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl md:blur-3xl"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4 md:mb-6">
                                            <div>
                                                <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-white/10 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-2 md:mb-3 border border-white/10">Next Shift</span>
                                                <h2 className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1 truncate">{nextJob.title}</h2>
                                                <p className="text-blue-100 text-[10px] md:text-sm flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-300" /> {nextJob.location}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-2xl md:text-3xl font-black leading-none">{moment(nextJob.date).format('DD')}</div>
                                                <div className="text-[10px] md:text-sm font-bold uppercase text-blue-100 leading-none">{moment(nextJob.date).format('MMM')}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 md:gap-4 pt-4 md:pt-6 border-t border-white/10">
                                            <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium">
                                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-200" />
                                                {nextJob.time || 'TBD'}
                                            </div>
                                            <div className="h-4 w-px bg-white/20"></div>
                                            <span className="text-[10px] md:text-sm font-black text-blue-200 uppercase tracking-wide truncate">{nextJob.status}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Schedule List */}
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-[#1F2937] flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                        Upcoming Schedule
                                    </h3>
                                    <button
                                        onClick={() => navigate('/my-jobs')}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {analytics?.upcomingSchedule?.length > 0 ? (
                                            analytics.upcomingSchedule.map((item: { id: string; date: string; title: string; time?: string; location: string; status: string }) => (
                                                <div key={item.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-[#0B0E14] border border-[#1F2937] hover:border-gray-600 transition-all group">
                                                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#151A21] flex flex-col items-center justify-center border border-[#1F2937] group-hover:border-blue-500/30 transition-colors">
                                                        <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase">{moment(item.date).format('MMM')}</span>
                                                        <span className="text-lg md:text-xl font-black text-white leading-none">{moment(item.date).format('DD')}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{item.title}</h4>
                                                        <div className="flex items-center gap-2 md:gap-3 mt-1 text-[10px] md:text-xs text-gray-500">
                                                            <span className="flex items-center gap-1 truncate"><Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {item.time || 'TBD'}</span>
                                                            <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" /> {item.location}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                                            item.status === 'ONGOING' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                                        )}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed border-[#1F2937] rounded-xl">
                                                <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-500 text-sm font-medium">No upcoming shifts</p>
                                                <button onClick={() => navigate('/jobs')} className="text-xs text-blue-400 mt-2 font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">Apply for Jobs</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Available Opportunities */}
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-[#1F2937]">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-emerald-400" />
                                        Available Opportunities
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {analytics?.availableJobs?.length > 0 ? (
                                            analytics.availableJobs.map((job: { id: string; date: string; title: string; location: string; status: string }) => (
                                                <div key={job.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0B0E14] border border-[#1F2937] hover:border-emerald-500/50 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex flex-col items-center justify-center border border-emerald-500/20">
                                                            <span className="text-[10px] font-bold text-emerald-400 uppercase">{moment(job.date).format('MMM')}</span>
                                                            <span className="text-lg font-black text-white leading-none">{moment(job.date).format('DD')}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{job.title}</h4>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1F2937] text-gray-400 border border-gray-700 font-medium text-[10px] uppercase">{job.status}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate('/jobs')}
                                                        className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-xs font-bold rounded-lg border border-emerald-500/20 hover:border-emerald-600 transition-all uppercase tracking-wide"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500 text-sm">No new jobs available right now.</p>
                                                <button onClick={() => navigate('/jobs')} className="text-xs text-blue-400 mt-2 hover:underline">Check Jobs Board</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Column */}
                        <div className="space-y-6">

                            {/* Quick Actions */}
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6">
                                <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Quick Actions</h4>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/jobs')}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[#1F2937] transition-all border border-transparent hover:border-[#374151] group text-left"
                                    >
                                        <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors border border-blue-500/10">
                                            <Briefcase className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Find Details</p>
                                            <p className="text-[10px] text-gray-500">Apply for new opportunities</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => navigate('/wages')}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[#1F2937] transition-all border border-transparent hover:border-[#374151] group text-left"
                                    >
                                        <div className="p-2.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/10">
                                            <DollarSign className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">My Earnings</p>
                                            <p className="text-[10px] text-gray-500">View payout history</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => navigate('/inventory')}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[#1F2937] transition-all border border-transparent hover:border-[#374151] group text-left"
                                    >
                                        <div className="p-2.5 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors border border-amber-500/10">
                                            <AlertCircle className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Report Issue</p>
                                            <p className="text-[10px] text-gray-500">Log equipment maintenance</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-5 border-b border-[#1F2937]">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Application History</h3>
                                </div>
                                <div className="p-0">
                                    <div className="divide-y divide-[#1F2937]">
                                        {analytics?.recentActivity?.length > 0 ? (
                                            analytics.recentActivity.slice(0, 5).map((activity: { jobTitle: string; appliedAt: string; status: string }, idx: number) => (
                                                <div key={idx} className="p-4 hover:bg-[#1F2937]/30 transition-colors flex items-center justify-between group">
                                                    <div>
                                                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{activity.jobTitle}</p>
                                                        <p className="text-[10px] text-gray-500 mt-1">Applied {moment(activity.appliedAt).fromNow()}</p>
                                                    </div>
                                                    <span className={cn(
                                                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                                                        activity.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                            activity.status === 'REJECTED' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                                "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                    )}>
                                                        {activity.status}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 text-xs">No recent activity</div>
                                        )}
                                    </div>
                                    {analytics?.recentActivity?.length > 5 && (
                                        <button
                                            onClick={() => navigate('/my-jobs')}
                                            className="w-full py-3 text-xs font-bold text-gray-500 hover:text-white hover:bg-[#1F2937] transition-colors border-t border-[#1F2937] uppercase tracking-widest"
                                        >
                                            View All
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-white">Unable to load dashboard</p>
            </div>
        </div>
    );
};

export default Dashboard;
