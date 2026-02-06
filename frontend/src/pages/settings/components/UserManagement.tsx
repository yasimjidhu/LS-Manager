import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { usersApi } from '../../../services/settings.service';

interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
    isActive: boolean;
    employee?: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

const UserManagement = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: users, isLoading, isError, error } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll
    });

    console.log('UserManagement users:', users);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            usersApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => {
            alert('Failed to update user.');
        }
    });

    const filteredUsers = users?.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.employee?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.employee?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleRoleChange = (userId: string, newRole: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE') => {
        if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            updateMutation.mutate({ id: userId, data: { role: newRole } });
        }
    };

    const handleStatusToggle = (userId: string, currentStatus: boolean) => {
        if (confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
            updateMutation.mutate({ id: userId, data: { isActive: !currentStatus } });
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400">Loading users...</div>;
    }

    if (isError) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-400 font-medium">Failed to load users</p>
                <p className="text-gray-500 text-sm mt-1">{(error as any)?.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h3 className="text-xl font-bold text-white">Role & User Management</h3>
                    <p className="text-gray-400 text-sm">Manage user access and permissions</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-[#151A21] border border-[#1F2937] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500 w-full md:w-64"
                    />
                </div>
            </div>

            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#1F2937] bg-[#1A1F26]">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">User</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                    No users found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-[#1A1F26]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm">
                                                {(user.employee?.firstName?.[0] || (user.email && user.email[0]) || '?').toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">
                                                    {user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : 'System User'}
                                                </div>
                                                <div className="text-xs text-gray-500">{user.email || 'No Email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                            className="bg-[#0B0E14] border border-[#1F2937] rounded text-xs text-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="ADMIN">Admin</option>
                                            <option value="SUPERVISOR">Supervisor</option>
                                            <option value="EMPLOYEE">Employee</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${user.isActive
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleStatusToggle(user.id, user.isActive)}
                                            disabled={updateMutation.isPending}
                                            className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${user.isActive
                                                ? 'text-red-400 hover:bg-red-500/10 border border-red-500/30'
                                                : 'text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30'
                                                }`}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
