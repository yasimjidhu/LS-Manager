import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users, Plus, Search, Filter, Eye, Edit, Ban,
    CheckCircle, XCircle, DollarSign, Briefcase, AlertCircle
} from 'lucide-react';
import { employeeApi } from '../../services/employee.service';
import type { Employee } from '../../services/employee.service';
import { useAlert } from '../../components/ui/AlertProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import { StatCardSkeleton, TableSkeleton, Pagination } from '../../components/ui';

const Employees = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { success, error: alertError } = useAlert();
    const { confirm } = useConfirm();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: employeesData = { data: [], meta: { total: 0, totalPages: 0 } }, isLoading, isError, error } = useQuery({
        queryKey: ['employees', page, searchTerm, roleFilter, statusFilter],
        queryFn: () => employeeApi.getAll({
            page,
            limit,
            search: searchTerm,
            role: roleFilter,
            status: statusFilter
        })
    });

    const employees = employeesData.data;
    const meta = employeesData.meta;

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['employees', 'stats'],
        queryFn: employeeApi.getStats
    });

    const stats = statsData || { total: 0, active: 0, supervisors: 0, blocked: 0 };

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            employeeApi.update(id, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            success('Status Updated', 'Employee status has been changed successfully');
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message || 'Failed to update status';
            alertError('Error', errorMessage);
        }
    });

    const handleToggleStatus = async (employee: Employee) => {
        const newStatus = !employee.user?.isActive;
        const action = newStatus ? 'Unblock' : 'Block';

        const confirmed = await confirm({
            title: `${action} Employee`,
            message: `Are you sure you want to ${action.toLowerCase()} ${employee.firstName} ${employee.lastName}?`,
            confirmText: action,
            type: newStatus ? 'info' : 'danger'
        });

        if (confirmed) {
            toggleStatusMutation.mutate({ id: employee.id, isActive: newStatus });
        }
    };

    // Event handlers for resets
    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        setPage(1);
    };

    const handleRoleFilterChange = (val: string) => {
        setRoleFilter(val);
        setPage(1);
    };

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        setPage(1);
    };

    // Role badge styling
    const getRoleBadge = (role?: string) => {
        const styles = {
            ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            SUPERVISOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            EMPLOYEE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
        return styles[role as keyof typeof styles] || styles.EMPLOYEE;
    };

    // Wage type badge
    const getWageBadge = (wageModel: string) => {
        const styles = {
            FIXED: 'bg-green-500/10 text-green-400 border-green-500/20',
            PIECE_RATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            PERCENTAGE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        };
        return styles[wageModel as keyof typeof styles] || styles.FIXED;
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-4 md:p-6 lg:p-8 pb-20">
            <div className="w-full max-w-screen-2xl mx-auto">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 flex items-center gap-2 md:gap-3">
                            <Users className="w-5 h-5 md:w-7 md:h-7 text-blue-400" />
                            Employees
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm">Manage your team members and their access</p>
                    </div>
                    <button
                        onClick={() => navigate('/employees/create')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 text-sm md:text-base"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" /> Add Employee
                    </button>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {statsLoading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5 hover:border-gray-700 transition-all group">
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="p-2 md:p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                        <Users className="w-5 h-5 md:w-7 md:h-7" />
                                    </div>
                                    <span className="hidden sm:inline-block text-[10px] md:text-xs font-bold text-gray-500 uppercase">Total</span>
                                </div>
                                <p className="text-lg md:text-2xl lg:text-3xl font-black text-white">{stats.total}</p>
                                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">Staff Count</p>
                            </div>

                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5 hover:border-gray-700 transition-all group">
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="p-2 md:p-3 rounded-xl bg-green-500/10 text-green-400">
                                        <CheckCircle className="w-5 h-5 md:w-7 md:h-7" />
                                    </div>
                                    <span className="hidden sm:inline-block text-[10px] md:text-xs font-bold text-gray-500 uppercase">Live</span>
                                </div>
                                <p className="text-lg md:text-2xl lg:text-3xl font-black text-white">{stats.active}</p>
                                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">Active Status</p>
                            </div>

                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5 hover:border-gray-700 transition-all group">
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="p-2 md:p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                        <Briefcase className="w-5 h-5 md:w-7 md:h-7" />
                                    </div>
                                    <span className="hidden sm:inline-block text-[10px] md:text-xs font-bold text-gray-500 uppercase">Lead</span>
                                </div>
                                <p className="text-lg md:text-2xl lg:text-3xl font-black text-white">{stats.supervisors}</p>
                                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">Supervisors</p>
                            </div>

                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5 hover:border-gray-700 transition-all group">
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="p-2 md:p-3 rounded-xl bg-red-500/10 text-red-400">
                                        <Ban className="w-5 h-5 md:w-7 md:h-7" />
                                    </div>
                                    <span className="hidden sm:inline-block text-[10px] md:text-xs font-bold text-gray-500 uppercase">Locked</span>
                                </div>
                                <p className="text-lg md:text-2xl lg:text-3xl font-black text-white">{stats.blocked}</p>
                                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">Blocked Accounts</p>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Filters & Search ── */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-3 mb-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] rounded-xl pl-11 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
                            {/* Role Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => handleRoleFilterChange(e.target.value)}
                                    className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] rounded-xl pl-10 pr-4 text-xs font-bold text-gray-400 uppercase focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="EMPLOYEE">Employee</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] rounded-xl pl-10 pr-4 text-xs font-bold text-gray-400 uppercase focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="BLOCKED">Blocked</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                    {isLoading ? (
                        <TableSkeleton rows={8} cols={7} />
                    ) : isError ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <p className="text-white">Failed to load employees</p>
                            <p className="text-gray-500 text-sm mt-1">{(error as any)?.response?.data?.message || 'Check your connection and try again'}</p>
                            <button
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
                                className="mt-4 px-4 py-2 bg-[#1F2937] hover:bg-[#374151] rounded-lg text-sm text-white transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">No employees found</p>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or add a new employee</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#0B0E14] border-b border-[#1F2937]">
                                        <th className="text-left px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                                        <th className="text-left px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                        <th className="hidden lg:table-cell text-left px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                                        <th className="hidden xl:table-cell text-left px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Wage Type</th>
                                        <th className="hidden xl:table-cell text-left px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Base Wage</th>
                                        <th className="text-left px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider sticky right-0 bg-[#0B0E14] shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.5)]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1F2937]">
                                    {employees.map((employee: any) => (
                                        <tr key={employee.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                            <td className="px-4 py-3 md:px-6 md:py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm md:text-base">
                                                        {employee.firstName[0]}{employee.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm md:text-base">{employee.firstName} {employee.lastName}</p>
                                                        <p className="text-xs md:text-sm text-gray-500">{employee.user?.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 md:px-6 md:py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs md:text-sm font-semibold border ${getRoleBadge(employee.user?.role)}`}>
                                                    {employee.user?.role || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-3 md:px-6 md:py-4">
                                                <p className="text-sm md:text-base text-gray-300">{employee.phone || '—'}</p>
                                            </td>
                                            <td className="hidden xl:table-cell px-4 py-3 md:px-6 md:py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs md:text-sm font-semibold border ${getWageBadge(employee.wageModel)}`}>
                                                    {employee.wageModel.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="hidden xl:table-cell px-4 py-3 md:px-6 md:py-4">
                                                <div className="flex items-center gap-1 text-gray-300">
                                                    <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    <span className="font-mono font-bold text-sm md:text-base">{Number(employee.baseWage).toFixed(2)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 md:px-6 md:py-4">
                                                {employee.user?.isActive ? (
                                                    <span className="flex items-center gap-1.5 text-green-400 text-xs md:text-sm font-semibold">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-red-400 text-xs md:text-sm font-semibold">
                                                        <XCircle className="w-3.5 h-3.5" /> Blocked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 md:px-6 md:py-4 sticky right-0 bg-[#151A21] shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.5)] group-hover:bg-[#1C232B] transition-colors">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/employees/${employee.id}`)}
                                                        className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/employees/${employee.id}/edit`)}
                                                        className="p-1.5 hover:bg-amber-500/10 text-amber-400 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(employee)}
                                                        className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                                                        title={employee.user?.isActive ? 'Block' : 'Unblock'}
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={meta.totalPages}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default Employees;
