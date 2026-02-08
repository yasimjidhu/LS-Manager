import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Wrench,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Search,
    Check
} from 'lucide-react';
import { maintenanceApi } from '../../services/maintenance.service';
import moment from 'moment';
import { cn } from '../../lib/utils';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import { useAlert } from '../../components/ui/AlertProvider';
import { ListSkeleton, Pagination } from '../../components/ui';

const Maintenance = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');
    const [page, setPage] = useState(1);
    const limit = 10;
    const queryClient = useQueryClient();
    const { confirm } = useConfirm();
    const { success, error: alertError } = useAlert();

    const { data: logsData = { data: [], meta: { total: 0, totalPages: 0 } }, isLoading } = useQuery({
        queryKey: ['maintenance-logs', page, searchQuery, statusFilter],
        queryFn: () => maintenanceApi.getAll({ page, limit, search: searchQuery, status: statusFilter })
    });

    const logs = logsData.data;
    const meta = logsData.meta;

    const resolveMutation = useMutation({
        mutationFn: maintenanceApi.resolve,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            success("Success", "Equipment marked as Available");
        },
        onError: () => {
            alertError("Error", "Failed to resolve maintenance");
        }
    });

    const handleResolve = async (id: string, itemName: string) => {
        const isConfirmed = await confirm({
            title: 'Resolve Maintenance',
            message: `Is ${itemName} repaired and ready for use? This will set its status to AVAILABLE.`,
            confirmText: 'Yes, Resolve',
            type: 'warning'
        });

        if (isConfirmed) {
            resolveMutation.mutate(id);
        }
    };

    const handleStatusChange = (status: 'ALL' | 'ACTIVE' | 'RESOLVED') => {
        setStatusFilter(status);
        setPage(1);
    };

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-4 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-amber-500" />
                            Maintenance Management
                        </h1>
                        <p className="text-gray-400 text-xs mt-0.5">
                            Track repairs, damage reports, and equipment health logs
                        </p>
                    </div>

                    <div className="flex bg-[#151A21] p-1 rounded-xl border border-[#1F2937]">
                        <button
                            onClick={() => handleStatusChange('ACTIVE')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                statusFilter === 'ACTIVE'
                                    ? "bg-[#1F2937] text-white shadow-lg"
                                    : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            Active Repairs
                        </button>
                        <button
                            onClick={() => handleStatusChange('RESOLVED')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                statusFilter === 'RESOLVED'
                                    ? "bg-[#1F2937] text-white shadow-lg"
                                    : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            History
                        </button>
                        <button
                            onClick={() => handleStatusChange('ALL')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                statusFilter === 'ALL'
                                    ? "bg-[#1F2937] text-white shadow-lg"
                                    : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            All Logs
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by equipment name or ID..."
                            className="w-full bg-[#151A21] border border-[#1F2937] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-amber-500/50 outline-none transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Logs List */}
                <div className="grid gap-4">
                    {isLoading ? (
                        <ListSkeleton />
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-[#151A21] border border-[#1F2937] rounded-xl">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mb-3" />
                            <p className="text-gray-500 text-sm">No {statusFilter.toLowerCase()} maintenance logs found</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className="group bg-[#151A21] border border-[#1F2937] hover:border-amber-500/30 rounded-xl p-4 transition-all shadow-sm"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            log.resolvedAt ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {log.resolvedAt ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-sm font-bold text-white">{log.item?.name}</h3>
                                                <span className="text-[9px] font-mono bg-[#0B0E14] text-gray-500 px-1.5 py-0.5 rounded border border-[#1F2937]">
                                                    {log.item?.qrCode}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl line-clamp-1 group-hover:line-clamp-none transition-all">
                                                {log.description}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Reported {moment(log.createdAt).fromNow()}
                                                </span>
                                                <span className="flex items-center gap-1 capitalize">
                                                    <Wrench className="w-3 h-3" />
                                                    Status: {log.status?.toLowerCase()}
                                                </span>
                                                {Number(log.cost) > 0 && (
                                                    <span className="text-amber-400/80 font-bold">
                                                        Cost: ₹{Number(log.cost).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                        {!log.resolvedAt ? (
                                            <button
                                                onClick={() => handleResolve(log.id, log.item?.name || 'Item')}
                                                className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-amber-950/20"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Resolve & Make Available
                                            </button>
                                        ) : (
                                            <div className="text-right">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    Resolved {moment(log.resolvedAt).format('MMM DD')}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-[9px] text-gray-600 font-medium">
                                            REPORTED BY {log.reportedBy?.employee ? `${log.reportedBy.employee.firstName} ${log.reportedBy.employee.lastName}` : log.reportedBy?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 flex justify-center pb-10">
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

export default Maintenance;
