import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DollarSign, Users, Calendar, Filter, Download,
    TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCw, Eye,
    ChevronDown, ChevronRight, LayoutList, LayoutGrid, HardHat, Briefcase
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { employeeApi, type Employee } from '../../services/employee.service';
import moment from 'moment';
import { cn } from '../../lib/utils';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useAlert } from '../../components/ui/AlertProvider';
import { StatCardSkeleton, TableSkeleton, Skeleton, Pagination } from '../../components/ui';

type ViewMode = 'flat' | 'grouped';

const Wages = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role === 'ADMIN';

    const [dateFilter, setDateFilter] = useState('this-month');
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grouped');
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();
    const { error: alertError } = useAlert();

    const [isExporting, setIsExporting] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: employeesResult } = useQuery({
        queryKey: ['employees'],
        queryFn: () => employeeApi.getAll(),
        enabled: isAdmin
    });

    const employees = employeesResult?.data || [];

    // Fetch Wages List
    const { data: wagesData = { data: [], meta: { total: 0, totalPages: 0 } }, isLoading: isLoadingWages } = useQuery({
        queryKey: ['wages', dateFilter, employeeFilter, statusFilter, user?.id, page],
        queryFn: async () => {
            const params: any = { page, limit };
            if (dateFilter === 'this-month') {
                params.month = moment().format('YYYY-MM');
            } else if (dateFilter === 'last-month') {
                params.month = moment().subtract(1, 'months').format('YYYY-MM');
            }
            if (employeeFilter && isAdmin) params.employeeId = employeeFilter;
            if (statusFilter === 'paid') params.status = 'PAID';
            if (statusFilter === 'pending') params.status = 'UNPAID';

            const res = await api.get('/wages', { params });
            return res.data;
        }
    });

    const wages = wagesData.data;
    const meta = wagesData.meta;

    // Fetch Wages Stats
    const { data: wageStats = { totalPaid: 0, totalPending: 0, thisMonth: 0 } } = useQuery({
        queryKey: ['wages-stats', user?.id],
        queryFn: async () => {
            const res = await api.get('/wages/stats');
            return res.data;
        }
    });

    // Mark as Paid Mutation (Admin only)
    const markAsPaidMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.put(`/wages/${id}/pay`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wages'] });
            queryClient.invalidateQueries({ queryKey: ['wages-stats'] });
        }
    });

    // Recalculate Wages Mutation
    const recalculateMutation = useMutation({
        mutationFn: async () => {
            await api.post('/wages/recalculate');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wages'] });
            queryClient.invalidateQueries({ queryKey: ['wages-stats'] });
        }
    });

    // Update Wage Status Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await api.patch(`/wages/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wages'] });
        }
    });

    // State for Wage Detail Modal
    const [selectedWage, setSelectedWage] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Update Wage Mutation
    const updateWageMutation = useMutation({
        mutationFn: async (data: { id: string; amount?: number; description?: string }) => {
            await api.patch(`/wages/${data.id}`, {
                amount: data.amount,
                description: data.description
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wages'] });
            setShowDetailModal(false);
        }
    });

    const handleViewDetails = (wage: any) => {
        setSelectedWage(wage);
        setEditAmount(wage.amount);
        setEditDescription(wage.description || '');
        setShowDetailModal(true);
    };

    const handleSaveWageUpdate = () => {
        if (!selectedWage) return;
        updateWageMutation.mutate({
            id: selectedWage.id,
            amount: parseFloat(editAmount),
            description: editDescription
        });
    };

    const handleExport = async () => {
        if (!isAdmin) return;
        setIsExporting(true);
        const params: any = {};
        if (dateFilter === 'this-month') {
            params.month = moment().format('YYYY-MM');
        } else if (dateFilter === 'last-month') {
            params.month = moment().subtract(1, 'months').format('YYYY-MM');
        }
        if (employeeFilter) params.employeeId = employeeFilter;
        if (statusFilter === 'paid') params.status = 'PAID';
        if (statusFilter === 'pending') params.status = 'UNPAID';

        try {
            const response = await api.get('/wages/export', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `wages_export_${moment().format('YYYY-MM-DD')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alertError("Export Failed", "Failed to export wages. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    // Group wages by job
    const groupedWages = wages.reduce((acc: any, wage: any) => {
        const jobId = wage.job?.id || 'no-job';
        const jobTitle = wage.job?.title || 'No Job Assigned';

        if (!acc[jobId]) {
            acc[jobId] = {
                jobId,
                jobTitle,
                job: wage.job,
                wages: [],
                totalAmount: 0,
                employeeCount: 0
            };
        }

        acc[jobId].wages.push(wage);
        acc[jobId].totalAmount += Number(wage.amount);

        return acc;
    }, {});

    const groupedWagesArray = Object.values(groupedWages).map((group: any) => ({
        ...group,
        employeeCount: group.wages.length
    }));

    const toggleJobExpansion = (jobId: string) => {
        const newExpanded = new Set(expandedJobs);
        if (newExpanded.has(jobId)) {
            newExpanded.delete(jobId);
        } else {
            newExpanded.add(jobId);
        }
        setExpandedJobs(newExpanded);
    };

    const handleDateFilterChange = (val: string) => {
        setDateFilter(val);
        setPage(1);
    };

    const handleEmployeeFilterChange = (val: string) => {
        setEmployeeFilter(val);
        setPage(1);
    };

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        setPage(1);
    };

    // Calculate chart data from wages
    const wageData = wages.reduce((acc: any[], wage: any) => {
        const week = `Week ${moment(wage.createdAt).week() - moment(wage.createdAt).startOf('month').week() + 1}`;
        const existing = acc.find(d => d.week === week);
        if (existing) {
            existing.amount += Number(wage.amount);
        } else {
            acc.push({ week, amount: Number(wage.amount) });
        }
        return acc;
    }, []).sort((a: any, b: any) => a.week.localeCompare(b.week));

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-4 pb-20">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-white mb-0.5 flex items-center gap-2">
                            {isAdmin ? (
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                            ) : (
                                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                            )}
                            {isAdmin ? 'Wages & Payments' : 'My Earnings'}
                        </h1>
                        <p className="text-gray-400 text-xs">
                            {isAdmin ? 'Manage settlements' : 'Track earnings'}
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => recalculateMutation.mutate()}
                                disabled={recalculateMutation.isPending}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-[#151A21] border border-[#1F2937] text-gray-300 hover:bg-[#1F2937] rounded-lg transition-colors text-xs"
                            >
                                <RefreshCw className={cn("w-3.5 h-3.5", recalculateMutation.isPending && "animate-spin")} />
                                Recalculate
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 text-xs"
                            >
                                <Download className={cn("w-3.5 h-3.5", isExporting && "animate-pulse")} />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {isLoadingWages ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-3 shadow-lg shadow-emerald-950/20 group hover:scale-[1.02] transition-transform overflow-hidden">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="p-1 bg-white/10 rounded-lg">
                                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <TrendingUp className="w-3 h-3 text-white/40" />
                                </div>
                                <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-0.5 truncate">{isAdmin ? 'Total Paid' : 'Total Withdrawn'}</p>
                                <p className="text-lg font-black text-white font-mono truncate">₹{Number(wageStats.totalPaid || 0).toLocaleString()}</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl p-3 shadow-lg shadow-amber-950/20 group hover:scale-[1.02] transition-transform overflow-hidden">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="p-1 bg-white/10 rounded-lg">
                                        <Clock className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <AlertCircle className="w-3 h-3 text-white/40" />
                                </div>
                                <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-0.5 truncate">{isAdmin ? 'Pending' : 'Pending Balance'}</p>
                                <p className="text-lg font-black text-white font-mono truncate">₹{Number(wageStats.totalPending || 0).toLocaleString()}</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-3 shadow-lg shadow-blue-950/20 group hover:scale-[1.02] transition-transform overflow-hidden">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="p-1 bg-white/10 rounded-lg">
                                        <Calendar className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>
                                <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-0.5 truncate">M-O-M Earning</p>
                                <p className="text-lg font-black text-white font-mono truncate">₹{Number(wageStats.thisMonth || 0).toLocaleString()}</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-3 shadow-lg shadow-purple-950/20 group hover:scale-[1.02] transition-transform overflow-hidden">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="p-1 bg-white/10 rounded-lg">
                                        {isAdmin ? <Users className="w-3.5 h-3.5 text-white" /> : <HardHat className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                </div>
                                <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-0.5 truncate">{isAdmin ? 'Avg / Employee' : 'Avg / Job'}</p>
                                <p className="text-lg font-black text-white font-mono truncate">
                                    ₹{wages.length > 0 ? Math.round((wageStats.thisMonth || 0) / (isAdmin ? new Set(wages.map((w: any) => w.employeeId)).size : wages.length)).toLocaleString() : 0}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Chart (Enhanced) */}
                {wageData.length > 0 && (
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 mb-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                {isAdmin ? 'Wage Trends' : 'Income Trend'}
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={wageData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                                <XAxis dataKey="week" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#0B0E14',
                                        border: '1px solid #1F2937',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="amount" fill="url(#colorAmount)" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Filters & View Toggle */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-3 mb-4 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="flex flex-1 flex-wrap gap-3 w-full">
                            <div className="relative min-w-[140px]">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                                <select
                                    value={dateFilter}
                                    onChange={(e) => handleDateFilterChange(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">All Time Records</option>
                                    <option value="this-month">This Month</option>
                                    <option value="last-month">Last Month</option>
                                </select>
                            </div>

                            {isAdmin && (
                                <div className="relative min-w-[180px]">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                                    <select
                                        value={employeeFilter}
                                        onChange={(e) => handleEmployeeFilterChange(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">All Employees</option>
                                        {employees.map((emp: Employee) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.firstName} {emp.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="relative min-w-[140px]">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="paid">Finalized / Paid</option>
                                    <option value="pending">Pending Settlement</option>
                                </select>
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex bg-[#0B0E14] p-1 rounded-lg border border-[#1F2937] w-full md:w-auto">
                            <button
                                onClick={() => setViewMode('grouped')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                    viewMode === 'grouped'
                                        ? "bg-[#1F2937] text-white shadow-lg"
                                        : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Grouped
                            </button>
                            <button
                                onClick={() => setViewMode('flat')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                    viewMode === 'flat'
                                        ? "bg-[#1F2937] text-white shadow-lg"
                                        : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                <LayoutList className="w-3.5 h-3.5" />
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grouped View by Job */}
                {viewMode === 'grouped' ? (
                    <div className="space-y-4">
                        {isLoadingWages ? (
                            <>
                                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                                    <Skeleton className="h-12 w-full mb-4" />
                                    <TableSkeleton rows={3} cols={6} />
                                </div>
                                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                                    <Skeleton className="h-12 w-full mb-4" />
                                    <TableSkeleton rows={3} cols={6} />
                                </div>
                            </>
                        ) : groupedWagesArray.length === 0 ? (
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-8 text-center text-gray-500">
                                No wages found
                            </div>
                        ) : (
                            groupedWagesArray.map((group: any) => {
                                const isExpanded = expandedJobs.has(group.jobId);

                                return (
                                    <div key={group.jobId} className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                                        {/* Job Header */}
                                        <button
                                            onClick={() => toggleJobExpansion(group.jobId)}
                                            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#1F2937]/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                                                )}
                                                <div className="text-left min-w-0">
                                                    <h3 className="text-base sm:text-lg font-semibold text-white truncate">{group.jobTitle}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-400">
                                                        {group.employeeCount} {group.employeeCount === 1 ? 'employee' : 'employees'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-base sm:text-lg font-bold text-green-400">₹{group.totalAmount.toLocaleString()}</p>
                                                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Total wages</p>
                                            </div>
                                        </button>

                                        {/* Employee Wages List */}
                                        {isExpanded && (
                                            <div className="border-t border-[#1F2937] overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                                            {isAdmin && <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Employee</th>}
                                                            <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                                                            <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                                                            <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                                            <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                                            <th className="text-right px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#1F2937]">
                                                        {group.wages.map((wage: any) => (
                                                            <tr key={wage.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                                                {isAdmin && (
                                                                    <td className="px-4 py-2">
                                                                        <p className="font-semibold text-white">{wage.employee?.firstName} {wage.employee?.lastName}</p>
                                                                    </td>
                                                                )}
                                                                <td className="px-4 py-2">
                                                                    <p className="text-xs text-gray-400">{wage.description}</p>
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <p className="font-mono font-semibold text-green-400">₹{Number(wage.amount).toLocaleString()}</p>
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <p className="text-xs text-gray-300">{new Date(wage.createdAt).toLocaleDateString()}</p>
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {wage.isPaid ? (
                                                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-semibold">
                                                                            Settled
                                                                        </span>
                                                                    ) : (
                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${wage.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                            wage.status === 'PENDING_APPROVAL' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                                            }`}>
                                                                            {wage.status ? wage.status.replace('_', ' ') : 'DRAFT'}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleViewDetails(wage)}
                                                                            className="p-1 hover:bg-gray-500/10 text-gray-400 rounded transition-colors"
                                                                            title="View Details"
                                                                        >
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        {isAdmin && !wage.isPaid && (
                                                                            <>
                                                                                {(!wage.status || wage.status === 'DRAFT') && (
                                                                                    <button
                                                                                        onClick={() => updateStatusMutation.mutate({ id: wage.id, status: 'PENDING_APPROVAL' })}
                                                                                        className="px-2 py-1 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-md text-[10px] font-semibold transition-colors"
                                                                                    >
                                                                                        Review
                                                                                    </button>
                                                                                )}
                                                                                {wage.status === 'PENDING_APPROVAL' && (
                                                                                    <button
                                                                                        onClick={() => updateStatusMutation.mutate({ id: wage.id, status: 'APPROVED' })}
                                                                                        className="px-2 py-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-md text-[10px] font-semibold transition-colors"
                                                                                    >
                                                                                        Approve
                                                                                    </button>
                                                                                )}
                                                                                {wage.status === 'APPROVED' && (
                                                                                    <button
                                                                                        onClick={() => markAsPaidMutation.mutate(wage.id)}
                                                                                        disabled={markAsPaidMutation.isPending}
                                                                                        className="px-2 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 rounded-md text-[10px] font-semibold transition-colors disabled:opacity-50"
                                                                                    >
                                                                                        Paid
                                                                                    </button>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    /* Flat View - Original Table */
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                        {isAdmin && <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Employee</th>}
                                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Description & Job</th>
                                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1F2937]">
                                    {isLoadingWages ? (
                                        <tr>
                                            <td colSpan={isAdmin ? 6 : 5} className="p-0">
                                                <TableSkeleton rows={10} cols={isAdmin ? 6 : 5} />
                                            </td>
                                        </tr>
                                    ) : wages.length === 0 ? (
                                        <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-gray-500">No records found matching your filters</td></tr>
                                    ) : (
                                        wages.map((wage: any) => (
                                            <tr key={wage.id} className="hover:bg-[#1F2937]/30 transition-colors group">
                                                {isAdmin && (
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="font-semibold text-white">{wage.employee?.firstName} {wage.employee?.lastName}</p>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 align-top">
                                                    <p className="text-xs text-gray-200 mb-0.5 font-medium">{wage.description}</p>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                                        <Briefcase className="w-2.5 h-2.5" />
                                                        {wage.job?.title}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <p className="font-mono font-bold text-emerald-400">₹{Number(wage.amount).toLocaleString()}</p>
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <p className="text-xs text-gray-400">{new Date(wage.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    {wage.isPaid ? (
                                                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                            Settled
                                                        </span>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${wage.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            wage.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                            }`}>
                                                            {wage.status ? wage.status.replace('_', ' ') : 'DRAFT'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right align-top">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(wage)}
                                                            className="p-1 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        {isAdmin && !wage.isPaid && (
                                                            <>
                                                                {(!wage.status || wage.status === 'DRAFT') && (
                                                                    <button
                                                                        onClick={() => updateStatusMutation.mutate({ id: wage.id, status: 'PENDING_APPROVAL' })}
                                                                        className="px-2 py-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 rounded-md text-[10px] font-bold transition-all"
                                                                    >
                                                                        Review
                                                                    </button>
                                                                )}
                                                                {wage.status === 'PENDING_APPROVAL' && (
                                                                    <button
                                                                        onClick={() => updateStatusMutation.mutate({ id: wage.id, status: 'APPROVED' })}
                                                                        className="px-2 py-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-md text-[10px] font-bold transition-all"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                )}
                                                                {wage.status === 'APPROVED' && (
                                                                    <button
                                                                        onClick={() => markAsPaidMutation.mutate(wage.id)}
                                                                        disabled={markAsPaidMutation.isPending}
                                                                        className="px-2 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md text-[10px] font-bold transition-all disabled:opacity-50"
                                                                    >
                                                                        Mark Paid
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={meta.totalPages}
                        onPageChange={(p) => {
                            setPage(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                </div>

                {/* Wage Detail Modal */}
                {showDetailModal && selectedWage && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Wage Details</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-1">Employee</label>
                                        <p className="text-white">{selectedWage.employee?.firstName} {selectedWage.employee?.lastName}</p>
                                    </div>

                                    {isAdmin ? (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-400 mb-1">Total Amount</label>
                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-400 mb-1">Earned Amount</label>
                                            <p className="text-xl font-mono font-bold text-emerald-400">₹{Number(selectedWage.amount).toLocaleString()}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status & Timeline</label>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", selectedWage.isPaid ? "bg-emerald-500" : "bg-amber-500")} />
                                                <span className="text-sm text-gray-300 font-medium">{selectedWage.isPaid ? 'Settled' : selectedWage.status?.replace('_', ' ') || 'DRAFT'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-400">{new Date(selectedWage.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Calculation Breakdown */}
                                    {selectedWage.breakdown && (
                                        <div className="mt-6 pt-6 border-t border-[#1F2937]">
                                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Earning Formula & Breakdown
                                            </h3>
                                            <div className="bg-[#0B0E14] border border-[#1F2937] rounded-xl overflow-hidden shadow-inner">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-[#1F2937]/50 text-gray-500 border-b border-[#1F2937]">
                                                            <th className="text-left px-4 py-2.5 font-bold uppercase text-[10px]">Component</th>
                                                            <th className="text-right px-4 py-2.5 font-bold uppercase text-[10px]">Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#1F2937]">
                                                        {(() => {
                                                            try {
                                                                const breakdown = JSON.parse(selectedWage.breakdown);
                                                                return Array.isArray(breakdown) ? breakdown.map((item: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                                        <td className="px-4 py-2.5 text-gray-400 text-xs">{item.reason}</td>
                                                                        <td className={cn(
                                                                            "px-4 py-2.5 text-right font-mono text-xs font-bold",
                                                                            item.amount < 0 ? "text-red-400" : "text-emerald-400"
                                                                        )}>
                                                                            {item.amount < 0 ? '-' : '+'}₹{Math.abs(item.amount).toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                )) : null;
                                                            } catch (e) {
                                                                return <tr><td colSpan={2} className="px-4 py-2.5 text-gray-500 font-medium text-center italic">No breakdown available</td></tr>;
                                                            }
                                                        })()}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-[#1F2937]/20 font-bold border-t border-[#1F2937]">
                                                            <td className="px-4 py-2 text-white text-[10px]">Total Net Earning</td>
                                                            <td className="px-4 py-2 text-right text-emerald-400 font-mono text-xs">₹{Number(selectedWage.amount).toLocaleString()}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                            <p className="text-[10px] text-gray-600 mt-3 italic px-1 flex items-start gap-1.5 leading-relaxed">
                                                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                                <span>Final settlement amount is calculated using historical piece rates and labor distribution rules at the time of job validation.</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-8">
                                    {isAdmin && (
                                        <button
                                            onClick={handleSaveWageUpdate}
                                            disabled={updateWageMutation.isPending}
                                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-950/20 disabled:opacity-50"
                                        >
                                            {updateWageMutation.isPending ? 'Syncing...' : 'Update Earning Info'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className={cn(
                                            "px-4 py-2.5 bg-[#0B0E14] border border-[#1F2937] text-gray-300 hover:bg-[#1F2937] hover:text-white rounded-lg font-bold text-sm transition-all",
                                            isAdmin ? "flex-1" : "w-full"
                                        )}
                                    >
                                        {isAdmin ? 'Dismiss' : 'Close Dashboard'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wages;
