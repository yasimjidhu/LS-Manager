import { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../../services/settings.service';

const QuotationPreviewModal = ({ quotation, onClose }: { quotation: any, onClose: () => void }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const { data: profile } = useQuery({
        queryKey: ['companyProfile'],
        queryFn: settingsApi.getCompanyProfile,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Quotation - ${quotation?.id?.slice(0, 8) || 'Draft'} `,
    });

    if (!quotation) return null;

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl bg-[#151A21] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-3 md:p-4 border-b border-[#1F2937] bg-[#0B0E14] shrink-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        <h2 className="text-sm md:text-lg font-bold text-white uppercase tracking-tight">Proposal Preview</h2>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${quotation.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                            quotation.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                            {quotation.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <button
                            onClick={() => handlePrint()}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-[10px] md:text-sm font-bold uppercase tracking-wider"
                        >
                            <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden xs:inline">Print / PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors border border-transparent active:border-[#1F2937]"
                        >
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Preview Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-900/80 flex justify-center custom-scrollbar">
                    {/* A4 Page Wrapper - Exact Dimensions for Print Consistency */}
                    <div className="min-w-fit md:min-w-0 flex justify-center">
                        <div
                            ref={componentRef}
                            className="bg-white text-black font-sans w-[210mm] min-h-[297mm] p-[10mm] md:p-[20mm] shadow-2xl relative box-border mx-auto print:shadow-none print:m-0 print:w-full print:h-auto origin-top transition-transform duration-300"
                            style={{
                                pageBreakAfter: 'always',
                                transform: window.innerWidth < 768 ? `scale(${(window.innerWidth - 32) / 794})` : 'none',
                                transformOrigin: 'top center'
                            }}
                        >
                            {/* Document Header */}
                            <div className="flex justify-between items-start mb-8 md:mb-12 border-b-2 border-gray-900 pb-6 md:pb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        {profile?.logoUrl ? (
                                            <img src={profile.logoUrl} alt="Logo" className="h-10 md:h-16 w-auto object-contain" />
                                        ) : (
                                            <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-900 rounded flex items-center justify-center text-white font-bold text-xl md:text-2xl uppercase">
                                                {profile?.companyName?.[0] || 'L'}S
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                                                {profile?.companyName || 'LS MANAGER'}
                                            </h1>
                                            {profile?.website && <p className="text-[10px] md:text-xs text-gray-400 font-sans mt-0.5">{profile.website}</p>}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-[10px] md:text-sm font-medium max-w-[250px] leading-relaxed">
                                        {profile?.address || 'Professional Event Planning & Management Services'}<br />
                                        {[profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(', ')}<br />
                                        {profile?.country || 'India'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl md:text-4xl font-black text-gray-100 mb-2 tracking-tighter">PROPOSAL</h2>
                                    <div className="space-y-1">
                                        <p className="text-[10px] md:text-sm"><span className="text-gray-400 font-bold uppercase mr-2 text-[8px] md:text-[11px]">Quote ID:</span> <span className="font-bold font-mono">#{quotation.id?.slice(0, 8).toUpperCase()}</span></p>
                                        <p className="text-[10px] md:text-sm"><span className="text-gray-400 font-bold uppercase mr-2 text-[8px] md:text-[11px]">Date:</span> <span className="font-bold">{formatDate(quotation.createdAt)}</span></p>
                                        <p className="text-[10px] md:text-sm"><span className="text-gray-400 font-bold uppercase mr-2 text-[8px] md:text-[11px]">Valid Until:</span> <span className="font-bold">{formatDate(quotation.validUntil)}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Client & Event Details Grid */}
                            <div className="grid grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-12 font-sans">
                                <div>
                                    <h3 className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b-2 border-gray-900 pb-0.5 inline-block">Client Recipient</h3>
                                    <p className="font-black text-gray-900 text-base md:text-lg mb-0.5 uppercase tracking-tight">{quotation.clientName}</p>
                                    <div className="text-gray-500 text-[10px] md:text-sm font-medium space-y-0.5">
                                        {quotation.clientEmail && <p>{quotation.clientEmail}</p>}
                                        {quotation.clientPhone && <p>{quotation.clientPhone}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b-2 border-gray-900 pb-0.5 inline-block">Project / Event</h3>
                                    <p className="font-black text-gray-900 text-base md:text-lg mb-0.5 uppercase tracking-tight">{quotation.event?.name || quotation.eventName || 'Event Title'}</p>
                                    <div className="text-gray-500 text-[10px] md:text-sm font-medium space-y-0.5">
                                        <p className="flex items-center gap-2"><span className="font-bold text-gray-900 uppercase text-[8px] md:text-[11px] w-12 shrink-0">Venue:</span> {quotation.event?.location || quotation.eventLocation || 'TBD'}</p>
                                        <p className="flex items-center gap-2"><span className="font-bold text-gray-900 uppercase text-[8px] md:text-[11px] w-12 shrink-0">Date:</span> {quotation.event?.date ? formatDate(quotation.event.date) : formatDate(quotation.eventDate)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-8">
                                <table className="w-full border-collapse font-sans text-[10px] md:text-sm">
                                    <thead>
                                        <tr className="bg-gray-900 text-white uppercase text-[8px] md:text-[11px] tracking-widest">
                                            <th className="py-2 md:py-3 px-4 text-left font-black">Description</th>
                                            <th className="py-2 md:py-3 px-4 text-center font-black w-20">Qty</th>
                                            <th className="py-2 md:py-3 px-4 text-right font-black w-24 md:w-32">Unit Rate</th>
                                            <th className="py-2 md:py-3 px-4 text-right font-black w-24 md:w-32">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-gray-900">
                                        {quotation.items?.map((item: any, i: number) => (
                                            <tr key={i} className="group break-inside-avoid">
                                                <td className="py-3 md:py-4 px-4 text-gray-900 font-bold uppercase tracking-tighter">
                                                    {item.item?.name || item.description || `Item #${i + 1}`}
                                                    {item.item?.description &&
                                                        item.item?.description !== item.item?.name &&
                                                        item.item?.description !== 'Created via Quotation' && (
                                                            <div className="text-[8px] md:text-[10px] text-gray-400 font-medium normal-case tracking-normal mt-0.5">{item.item.description}</div>
                                                        )}
                                                </td>
                                                <td className="py-3 md:py-4 px-4 text-center text-gray-600 font-mono font-bold">{item.quantity}</td>
                                                <td className="py-3 md:py-4 px-4 text-right text-gray-600 font-mono">{formatCurrency(item.unitPrice)}</td>
                                                <td className="py-3 md:py-4 px-4 text-right font-black text-gray-900 font-mono">
                                                    {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Summary */}
                            <div className="flex justify-end font-sans mb-12 md:mb-16 break-inside-avoid">
                                <div className="w-64 md:w-80 border-t-4 border-gray-900 pt-4 space-y-2 md:space-y-3">
                                    <div className="flex justify-between text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900 font-mono">{formatCurrency(quotation.subtotal || quotation.totalAmount / 1.1)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-wider">
                                        <span>Tax (10%)</span>
                                        <span className="text-gray-900 font-mono">{formatCurrency(quotation.taxAmount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 md:pt-3 border-t-2 border-gray-100">
                                        <span className="font-black text-gray-900 text-xs md:text-base uppercase tracking-widest">Grand Total</span>
                                        <span className="font-black text-blue-600 text-lg md:text-2xl font-mono">{formatCurrency(quotation.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Footer */}
                            <div className="mt-auto break-inside-avoid">
                                <div className="border-t-4 border-gray-900 pt-6 md:pt-8 flex flex-col md:flex-row gap-6 md:gap-8">
                                    <div className="flex-1">
                                        <h4 className="font-black text-gray-900 text-[10px] md:text-xs uppercase tracking-widest mb-2 md:mb-3">Terms & Conditions</h4>
                                        <ul className="text-[8px] md:text-xs text-gray-500 list-disc list-outside ml-3 md:ml-4 space-y-1.5 font-medium leading-relaxed">
                                            <li>Payment is required within {quotation.paymentTerms || '30'} days of invoice date.</li>
                                            <li>Please make checks payable to <strong>{profile?.companyName || 'LS Manager Inc.'}</strong></li>
                                            <li>This proposal is subject to availability and our standard service agreement.</li>
                                        </ul>
                                    </div>
                                    <div className="w-full md:w-64 text-center">
                                        <div className="h-12 md:h-16 border-b-2 border-gray-900 mb-2"></div>
                                        <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-black">Authorized Signature</p>
                                    </div>
                                </div>
                                <div className="mt-8 md:mt-12 text-center text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <p>Thank you for choosing {profile?.companyName || 'LS Manager'}</p>
                                    <p className="mt-1 normal-case font-medium">{profile?.website || 'lsmanager.com'} • {profile?.phone || '+91 (555) 123-4567'} • {profile?.email || 'support@lsmanager.com'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotationPreviewModal;
