import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users, Plus, Search, Filter, Eye, Edit, Ban,
    CheckCircle, XCircle, DollarSign, Briefcase
} from 'lucide-react';
import { employeeApi } from '../../services/employee.service';
import type { Employee } from '../../services/employee.service';
import { useAlert } from '../../components/ui/AlertProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import { StatCardSkeleton, TableSkeleton } from '../../components/ui';

const Employees = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { success, error: alertError } = useAlert();
    const { confirm } = useConfirm();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const { data: employees, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: employeeApi.getAll
    });

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

    // Filters
    const filteredEmployees = employees?.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            emp.phone?.includes(searchTerm);
        const matchesRole = roleFilter === 'ALL' || emp.user?.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && emp.user?.isActive) ||
            (statusFilter === 'BLOCKED' && !emp.user?.isActive);
        return matchesSearch && matchesRole && matchesStatus;
    }) || [];

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
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-6">
            <div className="w-full">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-400" />
                            Employees
                        </h1>
                        <p className="text-gray-400 text-sm">Manage your team members and their access</p>
                    </div>
                    <button
                        onClick={() => navigate('/employees/create')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-4 h-4" /> Add Employee
                    </button>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {isLoading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Employees</p>
                                        <p className="text-2xl font-bold text-white">{employees?.length || 0}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-400 opacity-50" />
                                </div>
                            </div>
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Active</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            {employees?.filter(e => e.user?.isActive).length || 0}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
                                </div>
                            </div>
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Supervisors</p>
                                        <p className="text-2xl font-bold text-blue-400">
                                            {employees?.filter(e => e.user?.role === 'SUPERVISOR').length || 0}
                                        </p>
                                    </div>
                                    <Briefcase className="w-8 h-8 text-blue-400 opacity-50" />
                                </div>
                            </div>
                            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Blocked</p>
                                        <p className="text-2xl font-bold text-red-400">
                                            {employees?.filter(e => !e.user?.isActive).length || 0}
                                        </p>
                                    </div>
                                    <XCircle className="w-8 h-8 text-red-400 opacity-50" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Filters & Search ── */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
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
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="BLOCKED">Blocked</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                    {isLoading ? (
                        <TableSkeleton rows={8} cols={7} />
                    ) : filteredEmployees.length === 0 ? (
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
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Wage Type</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Wage</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1F2937]">
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {employee.firstName[0]}{employee.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{employee.firstName} {employee.lastName}</p>
                                                        <p className="text-xs text-gray-500">{employee.user?.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(employee.user?.role)}`}>
                                                    {employee.user?.role || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-300">{employee.phone || '—'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getWageBadge(employee.wageModel)}`}>
                                                    {employee.wageModel.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-gray-300">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    <span className="font-mono font-semibold">{Number(employee.baseWage).toFixed(2)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {employee.user?.isActive ? (
                                                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
                                                        <XCircle className="w-3.5 h-3.5" /> Blocked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
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

            </div>
        </div>
    );
};

export default Employees;
