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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl bg-[#151A21] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-[#1F2937] bg-[#0B0E14] shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">Quotation Preview</h2>
                        <span className={`px - 2 py - 0.5 rounded textxs font - medium ${quotation.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' :
                            quotation.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                'bg-blue-500/20 text-blue-400'
                            } `}>
                            {quotation.status}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePrint()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                        >
                            <Printer size={16} /> Print / Download PDF
                        </button>
                        <div className="w-px h-8 bg-[#1F2937] mx-2"></div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Preview Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-900/50 flex justify-center custom-scrollbar">
                    {/* A4 Page Wrapper - Exact Dimensions for Print Consistency */}
                    <div className="scale-[0.8] md:scale-100 origin-top">
                        <div
                            ref={componentRef}
                            className="bg-white text-black font-serif w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] shadow-2xl relative box-border mx-auto print:shadow-none print:m-0 print:w-full print:h-auto"
                            style={{ pageBreakAfter: 'always' }}
                        >
                            {/* Document Header */}
                            <div className="flex justify-between items-start mb-12 border-b-2 border-gray-900 pb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        {profile?.logoUrl ? (
                                            <img src={profile.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-900 rounded flex items-center justify-center text-white font-bold text-2xl">
                                                {profile?.companyName?.[0] || 'L'}S
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">
                                                {profile?.companyName || 'LS MANAGER'}
                                            </h1>
                                            {profile?.website && <p className="text-xs text-gray-500 font-sans mt-1">{profile.website}</p>}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm font-sans max-w-[250px] leading-relaxed">
                                        {profile?.address || 'Professional Event Planning & Management Services'}<br />
                                        {[profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(', ')}<br />
                                        {profile?.country || 'United States'}
                                    </p>
                                    <div className="mt-2 text-xs text-gray-400 font-sans">
                                        {profile?.email && <p>Email: {profile.email}</p>}
                                        {profile?.phone && <p>Phone: {profile.phone}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-4xl font-bold text-gray-200 mb-2 tracking-widest">QUOTATION</h2>
                                    <table className="text-sm font-sans ml-auto">
                                        <tbody>
                                            <tr>
                                                <td className="text-gray-500 py-1 pr-4">Quotation #</td>
                                                <td className="font-bold text-gray-900">{quotation.id?.slice(0, 8).toUpperCase()}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-gray-500 py-1 pr-4">Date</td>
                                                <td className="font-bold text-gray-900">{formatDate(quotation.createdAt)}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-gray-500 py-1 pr-4">Valid Until</td>
                                                <td className="font-bold text-gray-900">{formatDate(quotation.validUntil)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Client & Event Details Grid */}
                            <div className="grid grid-cols-2 gap-12 mb-12 font-sans">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Bill To</h3>
                                    <p className="font-bold text-gray-900 text-lg mb-1">{quotation.clientName}</p>
                                    <div className="text-gray-600 text-sm space-y-1">
                                        {quotation.clientEmail && <p>{quotation.clientEmail}</p>}
                                        {quotation.clientPhone && <p>{quotation.clientPhone}</p>}
                                        <p className="mt-2 text-gray-400 italic">Client ID: {quotation.clientId || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Event Details</h3>
                                    <p className="font-bold text-gray-900 text-lg mb-1">{quotation.event?.name || 'Event Title'}</p>
                                    <div className="text-gray-600 text-sm space-y-1">
                                        <p><span className="font-semibold w-16 inline-block">Date:</span> {quotation.event?.date ? formatDate(quotation.event.date) : formatDate(quotation.eventDate)}</p>
                                        <p><span className="font-semibold w-16 inline-block">Venue:</span> {quotation.event?.location || quotation.eventLocation || 'TBD'}</p>
                                        <p className="mt-2 italic">{quotation.event?.description || quotation.eventDescription}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-8">
                                <table className="w-full border-collapse font-sans text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                                            <th className="py-3 px-4 text-left font-bold rounded-l-lg">Description</th>
                                            <th className="py-3 px-4 text-center font-bold">Qty</th>
                                            <th className="py-3 px-4 text-right font-bold w-32">Unit Price</th>
                                            <th className="py-3 px-4 text-right font-bold rounded-r-lg w-32">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {quotation.items?.map((item: any, i: number) => (
                                            <tr key={i} className="group break-inside-avoid">
                                                <td className="py-4 px-4 text-gray-900 font-medium">
                                                    {item.item?.name || item.description || `Item #${i + 1}`}
                                                    {item.item?.description &&
                                                        item.item?.description !== item.item?.name &&
                                                        item.item?.description !== 'Created via Quotation' && (
                                                            <div className="text-xs text-gray-400 font-normal mt-0.5">{item.item.description}</div>
                                                        )}
                                                </td>
                                                <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                                                <td className="py-4 px-4 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                                                <td className="py-4 px-4 text-right font-bold text-gray-900">
                                                    {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Empty rows filler if needed, or just normal view */}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Summary */}
                            <div className="flex justify-end font-sans mb-16 break-inside-avoid">
                                <div className="w-80 bg-gray-50 rounded-lg p-6 space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(quotation.subtotal || quotation.totalAmount / 1.1)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax {quotation.taxRate ? `(${quotation.taxRate} %)` : ''}</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(quotation.taxAmount || 0)}</span>
                                    </div>
                                    {quotation.discount > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Discount</span>
                                            <span className="font-medium">-{formatCurrency(quotation.discount)}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-gray-200 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                                        <span className="font-bold text-blue-600 text-xl">{formatCurrency(quotation.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Footer */}
                            <div className="mt-auto break-inside-avoid">
                                <div className="border-t-2 border-gray-100 pt-8 flex gap-8">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Terms & Conditions</h4>
                                        <ul className="text-xs text-gray-500 list-disc list-outside ml-4 space-y-1.5 font-sans leading-relaxed">
                                            <li>Payment is required within {quotation.paymentTerms || '30'} days of invoice date.</li>
                                            <li>Please make checks payable to <strong>LS Manager Inc.</strong></li>
                                            <li>This quotation is subject to our standard service agreement.</li>
                                        </ul>
                                    </div>
                                    <div className="w-64 text-center">
                                        <div className="h-16 border-b border-gray-300 mb-2"></div>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Authorized Signature</p>
                                    </div>
                                </div>
                                <div className="mt-12 text-center text-xs text-gray-400 font-sans">
                                    <p>Thank you for your business!</p>
                                    <p className="mt-1">lsmanager.com • +1 (555) 123-4567 • support@lsmanager.com</p>
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
