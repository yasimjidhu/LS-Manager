import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
    BarChart3, Download, Calendar, TrendingUp,
    DollarSign, Users, Briefcase, FileText, AlertCircle
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AnalyticsService } from '../../services/analytics.service';

const Reports = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [dateRange, setDateRange] = useState('this-month');

    const { data: analytics, isLoading, error } = useQuery({
        queryKey: ['analytics', dateRange],
        queryFn: () => AnalyticsService.getDashboardAnalytics(dateRange),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="text-white animate-pulse">Loading analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-white">Failed to load analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-blue-400" />
                            Reports & Analytics
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {user?.role === 'ADMIN' ? 'Comprehensive business insights and metrics' :
                                user?.role === 'SUPERVISOR' ? 'Team performance and job management' :
                                    'Your work history and performance'}
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-blue-900/20">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="this-week">This Week</option>
                                <option value="this-month">This Month</option>
                                <option value="last-month">Last Month</option>
                                <option value="this-quarter">This Quarter</option>
                                <option value="this-year">This Year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Format</label>
                            <select className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors">
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                                <option value="csv">CSV</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Admin View */}
                {user?.role === 'ADMIN' && analytics && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <DollarSign className="w-8 h-8 text-white/80" />
                                    <TrendingUp className="w-5 h-5 text-white/60" />
                                </div>
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-white">₹{analytics.summary?.totalRevenue?.toLocaleString() || 0}</p>
                                <p className="text-white/60 text-xs mt-2">₹{analytics.summary?.pendingAmount?.toLocaleString() || 0} pending</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <Briefcase className="w-8 h-8 text-white/80" />
                                </div>
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Jobs Completed</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.jobsCompleted || 0}</p>
                                <p className="text-white/60 text-xs mt-2">{analytics.summary?.activeJobs || 0} active jobs</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <Users className="w-8 h-8 text-white/80" />
                                </div>
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Active Employees</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.activeEmployees || 0}</p>
                                <p className="text-white/60 text-xs mt-2">This period</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <FileText className="w-8 h-8 text-white/80" />
                                </div>
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Invoices Sent</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.totalInvoices || 0}</p>
                                <p className="text-white/60 text-xs mt-2">₹{analytics.summary?.totalPaid?.toLocaleString() || 0} paid</p>
                            </div>
                        </div>

                        {/* Revenue Trend */}
                        {analytics.revenueTrend && analytics.revenueTrend.length > 0 && (
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Revenue, Expenses & Profit Trend</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={analytics.revenueTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                                        <XAxis dataKey="month" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Top Employees */}
                        {analytics.topEmployees && analytics.topEmployees.length > 0 && (
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-[#1F2937]">
                                    <h3 className="text-lg font-semibold text-white">Top Performing Employees</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Employee</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Total Jobs</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Completed</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Earnings</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1F2937]">
                                            {analytics.topEmployees.map((emp: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-[#1F2937]/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-white">{emp.firstName} {emp.lastName}</p>
                                                        <p className="text-xs text-gray-400">{emp.role}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-gray-300">{emp.jobs}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-green-400">{emp.completedJobs}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-blue-400 font-medium font-mono">₹{emp.totalEarnings?.toLocaleString()}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Supervisor View */}
                {user?.role === 'SUPERVISOR' && analytics && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5">
                                <Briefcase className="w-8 h-8 text-white/80 mb-3" />
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Total Jobs</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.totalJobs || 0}</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5">
                                <Briefcase className="w-8 h-8 text-white/80 mb-3" />
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Completed</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.completedJobs || 0}</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5">
                                <Users className="w-8 h-8 text-white/80 mb-3" />
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Team Size</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.teamSize || 0}</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-5">
                                <AlertCircle className="w-8 h-8 text-white/80 mb-3" />
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Pending Requests</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.pendingRequests || 0}</p>
                            </div>
                        </div>

                        {/* Recent Jobs */}
                        {analytics.recentJobs && analytics.recentJobs.length > 0 && (
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-[#1F2937]">
                                    <h3 className="text-lg font-semibold text-white">Recent Jobs</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Job</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Crew</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1F2937]">
                                            {analytics.recentJobs.map((job: any) => (
                                                <tr key={job.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-white">{job.title}</p>
                                                        <p className="text-xs text-gray-400">{job.location}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                            job.status === 'ONGOING' ? 'bg-amber-500/10 text-amber-500' :
                                                                'bg-blue-500/10 text-blue-500'
                                                            }`}>
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">{job.date}</td>
                                                    <td className="px-6 py-4 text-gray-300">{job.crewCount}/{job.requiredWorkers}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Employee View */}
                {user?.role === 'EMPLOYEE' && analytics && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5">
                                <Briefcase className="w-8 h-8 text-white/80 mb-3" />
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Total Applications</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.totalApplications || 0}</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5">
                                <Briefcase className="w-8 h-8 text-white/80 mb-3" />
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Completed Jobs</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.completedJobs || 0}</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5">
                                <Calendar className="w-8 h-8 text-white/80 mb-3" />
                                <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Upcoming Jobs</p>
                                <p className="text-2xl font-bold text-white">{analytics.summary?.upcomingJobs || 0}</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        {analytics.recentActivity && analytics.recentActivity.length > 0 && (
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-[#1F2937]">
                                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Job</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Application Status</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Job Status</th>
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1F2937]">
                                            {analytics.recentActivity.map((activity: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-[#1F2937]/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-white">{activity.jobTitle}</p>
                                                        <p className="text-xs text-gray-400">{activity.location}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${activity.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                                                            activity.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                                                                'bg-amber-500/10 text-amber-500'
                                                            }`}>
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-300">{activity.jobStatus}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">{activity.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default Reports;
