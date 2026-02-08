
import { useState } from 'react';
import { Search, Plus, FileText, CheckCircle2, Send, IndianRupee, Eye, PenSquare, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { type Quotation, quotationApi } from '../../services/quotation.service';
import { StatCardSkeleton, TableSkeleton, Pagination } from '../../components/ui';
import QuotationPreviewModal from './components/QuotationPreviewModal';

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string, icon: any, colorClass: string }) => (
    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-3 flex flex-col justify-between min-h-[100px] relative overflow-hidden group transition-all hover:bg-[#1A202C]">
        <div className={`p-2 rounded-lg w-fit mb-2 ${colorClass} bg-opacity-20`}>
            <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="relative z-10">
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-xl font-black text-white mt-0.5">{value}</h3>
        </div>
        <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full ${colorClass} opacity-5 group-hover:opacity-10 transition-opacity`} />
    </div>
);

const Quotations = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

    const { data: quotationsData = { data: [], meta: { total: 0, totalPages: 0 } }, isLoading } = useQuery({
        queryKey: ['quotations', page, search],
        queryFn: () => quotationApi.getAll({ page, limit, search })
    });

    const quotations = quotationsData.data;
    const meta = quotationsData.meta;

    const { data: stats = { draft: 0, sent: 0, accepted: 0, totalValue: 0 } } = useQuery({
        queryKey: ['quotations', 'stats'],
        queryFn: quotationApi.getStats
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'SENT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400';
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-20 p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white mb-0.5">Quotation Management</h1>
                    <p className="text-gray-400 text-xs">Create and manage event quotations</p>
                </div>
                <Link
                    to="/quotations/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all text-xs"
                >
                    <Plus className="w-4 h-4" /> Create Quotation
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
                        <StatCard title="Draft" value={stats.draft.toString()} icon={FileText} colorClass="bg-gray-500" />
                        <StatCard title="Sent" value={stats.sent.toString()} icon={Send} colorClass="bg-blue-500" />
                        <StatCard title="Approved" value={stats.accepted.toString()} icon={CheckCircle2} colorClass="bg-emerald-500" />
                        <StatCard title="Value" value={`₹${stats.totalValue.toLocaleString()}`} icon={IndianRupee} colorClass="bg-purple-500" />
                    </>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search quotations..."
                        className="w-full h-9 bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-9 pr-4 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <button className="w-full sm:w-auto px-3 py-2 bg-[#0B0E14] border border-[#1F2937] rounded-lg text-xs font-medium text-gray-300 hover:text-white flex items-center gap-2 justify-between">
                    All Status <ChevronDown className="w-3 h-3" />
                </button>
            </div>

            {/* Table / Mobile Cards */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    {isLoading ? (
                        <TableSkeleton rows={8} cols={8} />
                    ) : (
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#0B0E14] text-[10px] uppercase font-bold text-gray-500 border-b border-[#1F2937]">
                                <tr>
                                    <th className="px-6 py-4">Quote ID</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="hidden lg:table-cell px-6 py-4">Event</th>
                                    <th className="hidden sm:table-cell px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right sticky right-0 bg-[#0B0E14]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1F2937]">
                                {quotations?.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                        <td className="px-6 py-4 text-white font-mono text-xs">{quote.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-gray-300 font-medium">{quote.clientName}</td>
                                        <td className="hidden lg:table-cell px-6 py-4 text-gray-300">{quote.event?.name || quote.eventName}</td>
                                        <td className="hidden sm:table-cell px-6 py-4 text-xs font-mono">{new Date(quote.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-white font-black font-mono">₹{quote.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right sticky right-0 bg-[#151A21]">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedQuotation(quote)}
                                                    className="p-2 hover:bg-[#1F2937] rounded-lg text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    to={`/quotations/${quote.id}/edit`}
                                                    className="p-2 hover:bg-[#1F2937] rounded-lg text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <PenSquare className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!quotations || quotations.length === 0) && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">No quotations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-[#1F2937]">
                    {isLoading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#0B0E14] rounded-xl animate-pulse" />)}
                        </div>
                    ) : (
                        quotations?.map((quote) => (
                            <div key={quote.id} className="p-4 bg-[#151A21] active:bg-[#1F2937]/50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">#{quote.id.slice(0, 8)}</p>
                                        <h3 className="text-sm font-black text-white leading-tight uppercase tracking-tight">{quote.clientName}</h3>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{quote.event?.name || quote.eventName}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                                        {quote.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">Grand Total</p>
                                        <p className="text-base font-black text-blue-400 font-mono">₹{quote.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedQuotation(quote)}
                                            className="p-2.5 bg-[#0B0E14] border border-[#1F2937] rounded-lg text-gray-400 active:text-white"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <Link
                                            to={`/quotations/${quote.id}/edit`}
                                            className="p-2.5 bg-[#0B0E14] border border-[#1F2937] rounded-lg text-gray-400 active:text-white"
                                        >
                                            <PenSquare className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {(!quotations || quotations.length === 0) && !isLoading && (
                        <div className="px-6 py-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                            No records found
                        </div>
                    )}
                </div>
            </div>

            {/* Quotation Preview Modal */}
            {selectedQuotation && (
                <QuotationPreviewModal
                    quotation={selectedQuotation}
                    onClose={() => setSelectedQuotation(null)}
                />
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
        </div>
    );
};

export default Quotations;
