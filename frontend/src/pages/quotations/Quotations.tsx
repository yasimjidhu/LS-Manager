
import { useState } from 'react';
import { Search, Plus, FileText, CheckCircle2, Send, DollarSign, Eye, PenSquare, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { type Quotation, quotationApi } from '../../services/quotation.service';
import QuotationPreviewModal from './components/QuotationPreviewModal';

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string, icon: any, colorClass: string }) => (
    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all hover:bg-[#1A202C]">
        <div className={`p-3 rounded-lg w-fit mb-4 ${colorClass} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="relative z-10">
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${colorClass} opacity-5 group-hover:opacity-10 transition-opacity`} />
    </div>
);

const Quotations = () => {
    const [search, setSearch] = useState('');
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const { data: quotations } = useQuery({
        queryKey: ['quotations'],
        queryFn: quotationApi.getAll
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Quotation Management</h1>
                    <p className="text-gray-400">Create and manage event quotations</p>
                </div>
                <Link
                    to="/quotations/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> Create Quotation
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Draft" value="1" icon={FileText} colorClass="bg-gray-500" />
                <StatCard title="Sent" value="1" icon={Send} colorClass="bg-blue-500" />
                <StatCard title="Approved" value="1" icon={CheckCircle2} colorClass="bg-emerald-500" />
                <StatCard title="Total Value" value="$69,600" icon={DollarSign} colorClass="bg-purple-500" />
            </div>

            {/* Filters & Search */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search quotations..."
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
                                <th className="px-6 py-4">Quote ID</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Valid Until</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]">
                            {quotations?.map((quote) => (
                                <tr key={quote.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                    <td className="px-6 py-4 text-white font-semibold">{quote.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 text-gray-300">{quote.clientName}</td>
                                    <td className="px-6 py-4 text-gray-300">{quote.event?.name}</td>
                                    <td className="px-6 py-4">{new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    <td className="px-6 py-4">{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
                                    <td className="px-6 py-4 text-white font-semibold">${quote.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusColor(quote.status)}`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedQuotation(quote)}
                                                className="p-2 hover:bg-[#1F2937] rounded-lg text-gray-400 hover:text-white transition-colors"
                                                title="View & Print"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <Link
                                                to={`/quotations/${quote.id}/edit`}
                                                className="p-2 hover:bg-[#1F2937] rounded-lg text-gray-400 hover:text-white transition-colors"
                                                title="Edit"
                                            >
                                                <PenSquare className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quotation Preview Modal */}
            {selectedQuotation && (
                <QuotationPreviewModal
                    quotation={selectedQuotation}
                    onClose={() => setSelectedQuotation(null)}
                />
            )}
        </div>
    );
};

export default Quotations;
