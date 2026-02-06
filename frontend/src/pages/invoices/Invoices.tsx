import { useState } from 'react';
import { Search, Plus, Download, Eye, ChevronDown, CheckCircle2, Clock, PieChart, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { invoiceApi } from '../../services/invoice.service';

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string, icon: any, colorClass: string }) => (
    <div className="bg-[#1A1F28] border border-[#2A3441] rounded-xl p-5 flex flex-col gap-3 min-h-[140px] hover:border-gray-500 transition-all">
        <div className={`p-2.5 rounded-lg w-fit ${colorClass} bg-opacity-20`}>
            <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
    </div>
);

const Invoices = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Queries
    const { data: invoicesData, isLoading } = useQuery({
        queryKey: ['invoices', page],
        queryFn: () => invoiceApi.getAll({ page, limit: 20 })
    });

    const invoices = invoicesData?.data || [];
    const meta = invoicesData?.meta;

    // Mock stats for now or real if backend has it
    const safeInvoices = Array.isArray(invoices) ? invoices : [];

    // Calculate stats
    const totalInvoiced = safeInvoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount || 0), 0);
    const totalPaid = safeInvoices.filter((i: any) => i.status === 'PAID').reduce((sum: number, inv: any) => sum + Number(inv.totalAmount || 0), 0);
    const pendingAmount = totalInvoiced - totalPaid;
    const draftCount = safeInvoices.filter((i: any) => i.status === 'DRAFT').length;

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

    const filteredInvoices = safeInvoices.filter((inv: any) =>
        inv.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        inv.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
        inv.id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Invoice & Billing</h1>
                    <p className="text-gray-400">Manage invoices and track payments</p>
                </div>
                <Link
                    to="/invoices/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> Generate Invoice
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Invoiced" value={`₹${totalInvoiced.toLocaleString()}`} icon={DollarSign} colorClass="bg-blue-500" />
                <StatCard title="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={CheckCircle2} colorClass="bg-emerald-500" />
                <StatCard title="Pending" value={`₹${pendingAmount.toLocaleString()}`} icon={Clock} colorClass="bg-amber-500" />
                <StatCard title="Drafts" value={draftCount.toString()} icon={PieChart} colorClass="bg-purple-500" />
            </div>

            {/* Filters & Search */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search invoices by client, job or ID..."
                        className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-12 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="px-4 py-2.5 bg-[#0B0E14] border border-[#1F2937] rounded-lg text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2 min-w-[120px] justify-between">
                    All Status <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0B0E14] text-xs uppercase font-medium text-gray-500 border-b border-[#1F2937]">
                            <tr>
                                <th className="px-6 py-4">Invoice ID</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading invoices...</td>
                                </tr>
                            )}
                            {!isLoading && filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No invoices found.</td>
                                </tr>
                            )}
                            {filteredInvoices.map((inv: any) => (
                                <tr key={inv.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                    <td className="px-6 py-4 text-white font-semibold flex items-center gap-2">
                                        <span className="font-mono text-xs text-gray-500">
                                            #{inv.itemOrder || inv.id.slice(0, 6)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{inv.clientName}</td>
                                    <td className="px-6 py-4 text-gray-300">{inv.job?.title || 'N/A'}</td>
                                    <td className="px-6 py-4">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 text-right text-white font-semibold">₹{Number(inv.totalAmount).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusStyles(inv.status)}`}>
                                            {inv.status?.replace('_', ' ') || 'DRAFT'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
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
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#1F2937] pt-6">
                    <div className="text-sm text-gray-400">
                        Showing <span className="text-white font-medium">{(meta.page - 1) * meta.limit + 1}</span> to <span className="text-white font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-white font-medium">{meta.total}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-[#151A21] border border-[#1F2937] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1 px-4 text-sm font-medium text-gray-300 bg-[#151A21] border border-[#1F2937] rounded-lg">
                            Page {page} of {meta.totalPages}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="p-2 rounded-lg bg-[#151A21] border border-[#1F2937] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
