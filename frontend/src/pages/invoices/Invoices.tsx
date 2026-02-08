import { useState } from 'react';
import { Search, Plus, Download, Eye, ChevronDown, CheckCircle2, Clock, PieChart, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatCardSkeleton, TableSkeleton, Pagination } from '../../components/ui';

import { invoiceApi } from '../../services/invoice.service';

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string, icon: any, colorClass: string }) => (
    <div className="bg-[#1A1F28] border border-[#2A3441] rounded-xl p-3 flex flex-col gap-2 min-h-[100px] hover:border-gray-500 transition-all">
        <div className={`p-2 rounded-lg w-fit ${colorClass} bg-opacity-20`}>
            <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="flex flex-col gap-0.5">
            <p className="text-gray-400 text-[9px] font-medium uppercase tracking-wide">{title}</p>
            <h3 className="text-xl font-bold text-white">{value}</h3>
        </div>
    </div>
);

const Invoices = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Queries
    const { data: invoicesData, isLoading } = useQuery({
        queryKey: ['invoices', page, search],
        queryFn: () => invoiceApi.getAll({ page, limit: 10, search })
    });

    const invoices = invoicesData?.data || [];
    const meta = invoicesData?.meta || { total: 0, totalPages: 0, page: 1, limit: 10 };

    const { data: stats = { draft: 0, sent: 0, paid: 0, totalValue: 0 } } = useQuery({
        queryKey: ['invoices', 'stats'],
        queryFn: invoiceApi.getStats
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'DRAFT': return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
            case 'APPROVED': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'OVERDUE': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'SENT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'PENDING_APPROVAL': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-gray-500/10 text-gray-400';
        }
    };


    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-20 p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white mb-0.5">Invoice & Billing</h1>
                    <p className="text-gray-400 text-xs">Manage invoices and track payments</p>
                </div>
                <Link
                    to="/invoices/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all text-xs"
                >
                    <Plus className="w-4 h-4" /> Generate Invoice
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Drafts" value={stats.draft.toString()} icon={PieChart} colorClass="bg-purple-500" />
                        <StatCard title="Sent" value={stats.sent.toString()} icon={Clock} colorClass="bg-blue-500" />
                        <StatCard title="Paid Count" value={stats.paid.toString()} icon={CheckCircle2} colorClass="bg-emerald-500" />
                        <StatCard title="Total Collected" value={`₹${stats.totalValue.toLocaleString()}`} icon={DollarSign} colorClass="bg-emerald-500" />
                    </>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search invoices by client, job or ID..."
                        className="w-full h-9 bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-9 pr-4 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <button className="w-full md:w-auto px-4 py-2 bg-[#0B0E14] border border-[#1F2937] rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white flex items-center gap-2 min-w-[140px] justify-between transition-all">
                    <span>All Status</span> <ChevronDown className="w-3 h-3" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl overflow-hidden">
                {isLoading ? (
                    <TableSkeleton rows={10} cols={7} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#0B0E14] text-xs uppercase font-medium text-gray-500 border-b border-[#1F2937]">
                                <tr>
                                    <th className="px-6 py-4">Invoice ID</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="hidden lg:table-cell px-6 py-4">Event</th>
                                    <th className="hidden sm:table-cell px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right sticky right-0 bg-[#0B0E14] shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.5)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1F2937]">
                                {invoices.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No invoices found.</td>
                                    </tr>
                                )}
                                {invoices.map((inv: any) => (
                                    <tr key={inv.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                        <td className="px-6 py-4 text-white font-semibold flex items-center gap-2">
                                            <span className="font-mono text-xs text-gray-500">
                                                #{inv.itemOrder || inv.id.slice(0, 6)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{inv.clientName}</td>
                                        <td className="hidden lg:table-cell px-6 py-4 text-gray-300">{inv.job?.title || 'N/A'}</td>
                                        <td className="hidden sm:table-cell px-6 py-4">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 text-right text-white font-semibold">₹{Number(inv.totalAmount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusStyles(inv.status)}`}>
                                                {inv.status?.replace('_', ' ') || 'DRAFT'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right sticky right-0 bg-[#151A21] shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.5)]">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/invoices/${inv.id}`}>
                                                    <button className="p-2 hover:bg-[#1F2937] rounded-lg text-gray-400 hover:text-white transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button className="p-2 hover:bg-[#1F2937] rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <Download className="w-4 h-4" />
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

            {/* Pagination Controls */}
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
        </div>
    );
};

export default Invoices;
