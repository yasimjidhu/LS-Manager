import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Printer, ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { invoiceApi } from '../../services/invoice.service';
import { settingsApi } from '../../services/settings.service';

const InvoicePreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const componentRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => invoiceApi.update(id!, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (err) => {
            console.error(err);
            alert('Failed to update status');
        }
    });

    const { data: companyProfile } = useQuery({
        queryKey: ['companyProfile'],
        queryFn: settingsApi.getCompanyProfile
    });

    const { data: invoiceRaw, isLoading } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoiceApi.getOne(id!)
    });

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Receipt-${invoiceRaw?.itemOrder || id}`,
    });

    if (isLoading || !invoiceRaw || !companyProfile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600 text-sm">Loading receipt details...</div>
            </div>
        );
    }

    // ─── Derived Data ─────────────────────────────────────────────────────────
    const co = {
        name: companyProfile.companyName || '',
        logo: companyProfile.logoUrl,
        phone: companyProfile.phone || '',
        email: companyProfile.email || '',
        address: [companyProfile.address, companyProfile.city, companyProfile.state]
            .filter(Boolean).join(', '),
        gst: companyProfile.gstNumber || '',
    };

    const client = {
        name: invoiceRaw.clientName || invoiceRaw.job?.client || 'Valued Client',
        phone: invoiceRaw.clientPhone || invoiceRaw.job?.clientPhone || '',
        email: invoiceRaw.clientEmail || '',
        event: invoiceRaw.job?.eventType || 'Service',
        location: invoiceRaw.job?.location || '',
    };

    const items = (invoiceRaw.items || []).map((i: any) => ({
        desc: i.description || '',
        qty: i.quantity,
        rate: Number(i.unitPrice || i.rate || 0),
        amt: Number(i.totalPrice || i.amount || 0),
    }));

    const fmtDate = (d: string) =>
        new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const INR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    const subtotal = Number(invoiceRaw.subtotal || 0);
    const total = Number(invoiceRaw.totalAmount || 0);
    const receiptNo = invoiceRaw.itemOrder || 'DRAFT';
    const receiptDate = fmtDate(invoiceRaw.createdAt);
    const status = (invoiceRaw.status || 'DRAFT').replace('_', ' ');

    // ─── Render ──────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Top Action Bar ── */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between print:hidden shadow-sm">
                <button 
                    onClick={() => navigate('/invoices')} 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Receipts
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Printer className="w-4 h-4" /> Print Receipt
                </button>
            </div>

            {/* ── Receipt Sheet ── */}
            <div className="py-8 px-4">
                <div
                    ref={componentRef}
                    className="bg-white mx-auto shadow-lg relative overflow-hidden border border-gray-200"
                    style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                >
                    {/* ── Receipt Content ── */}
                    <div className="p-12">

                        {/* ── Header (Compact) ── */}
                        <div className="flex justify-between items-start mb-8">
                            {/* Company Info */}
                            <div className="w-2/5">
                                {co.logo ? (
                                    <div className="mb-3">
                                        <img 
                                            src={co.logo} 
                                            alt="Company Logo" 
                                            className="h-12 w-auto object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">{co.name[0]}</span>
                                        </div>
                                        <h1 className="text-xl font-bold text-gray-900">{co.name}</h1>
                                    </div>
                                )}
                                
                                <div className="space-y-1 text-xs text-gray-600">
                                    {co.address && <div className="flex items-start">
                                        <span className="w-16 text-gray-500">Address:</span>
                                        <span>{co.address}</span>
                                    </div>}
                                    {co.phone && <div className="flex items-center">
                                        <span className="w-16 text-gray-500">Phone:</span>
                                        <span>{co.phone}</span>
                                    </div>}
                                    {co.email && <div className="flex items-center">
                                        <span className="w-16 text-gray-500">Email:</span>
                                        <span>{co.email}</span>
                                    </div>}
                                    {co.gst && <div className="flex items-center">
                                        <span className="w-16 text-gray-500">GST:</span>
                                        <span>{co.gst}</span>
                                    </div>}
                                </div>
                            </div>

                            {/* Receipt Title & Details */}
                            <div className="text-right w-2/5">
                                <h1 className="text-3xl font-bold text-blue-700 mb-3">RECEIPT</h1>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">Receipt No:</span>
                                        <span className="text-gray-900 font-semibold">{receiptNo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">Date:</span>
                                        <span className="text-gray-900">{receiptDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-300 my-6"></div>

                        {/* ── Customer Details ── */}
                        <div className="mb-8">
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">CUSTOMER DETAILS</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Full Name</div>
                                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Phone Number</div>
                                        <div className="text-sm text-gray-900">{client.phone || 'Not provided'}</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Event Type</div>
                                        <div className="text-sm font-medium text-gray-900">{client.event}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Event Location</div>
                                        <div className="text-sm text-gray-900">{client.location || 'Not specified'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-300 my-6"></div>

                        {/* ── Items Table ── */}
                        <div className="mb-8">
                            <div className="overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                                                Description
                                            </th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                                                Qty
                                            </th>
                                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                                                Unit Price
                                            </th>
                                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                                                    No items listed
                                                </td>
                                            </tr>
                                        ) : (
                                            items.map((item, i) => (
                                                <tr key={i} className={i < items.length - 1 ? 'border-b border-gray-100' : ''}>
                                                    <td className="py-3 px-4 text-sm text-gray-900">
                                                        {item.desc}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 text-center">
                                                        {item.qty}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 text-right">
                                                        {item.rate > 0 ? INR(item.rate) : '—'}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                                                        {item.amt > 0 ? INR(item.amt) : '—'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Totals ── */}
                        <div className="flex justify-end">
                            <div className="w-80">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Subtotal</span>
                                        <span className="text-sm font-medium text-gray-900">{INR(subtotal)}</span>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                            <span className="text-2xl font-bold text-blue-700">{INR(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Thank You Message ── */}
                        <div className="mt-12 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900 mb-2">
                                    Thank you for your business!
                                </div>
                                <div className="text-sm text-gray-600 max-w-2xl mx-auto">
                                    We appreciate your trust in our services and look forward to serving you again.
                                </div>
                            </div>
                        </div>

                        {/* ── Terms & Conditions ── */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">TERMS & CONDITIONS</h3>
                            <div className="text-xs text-gray-600 space-y-2">
                                <p>1. This is a computer generated receipt and does not require a physical signature.</p>
                                <p>2. All payments are final and non-refundable unless specified in writing.</p>
                                <p>3. Please retain this receipt for your records.</p>
                                <p>4. For any queries, please contact {co.email} or call {co.phone}.</p>
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <div>
                                    <div className="font-medium">Issued by {co.name}</div>
                                    <div className="mt-1">{co.phone} • {co.email}</div>
                                </div>
                                <div className="text-right">
                                    <div>Thank you for choosing us</div>
                                    <div className="mt-1">www.example.com</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Status Action Bar ── */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-50 print:hidden shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">Receipt Status:</div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium 
                        ${status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                        ${status === 'PENDING APPROVAL' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : ''}`}
                    >
                        {status}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {(!invoiceRaw.status || invoiceRaw.status === 'DRAFT') && (
                        <button 
                            onClick={() => updateStatusMutation.mutate('PENDING_APPROVAL')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Send className="w-4 h-4" /> Submit for Approval
                        </button>
                    )}
                    {invoiceRaw.status === 'PENDING_APPROVAL' && (
                        <>
                            <button 
                                onClick={() => updateStatusMutation.mutate('DRAFT')}
                                className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                            >
                                Reject
                            </button>
                            <button 
                                onClick={() => updateStatusMutation.mutate('APPROVED')}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Approve & Finalize
                            </button>
                        </>
                    )}
                    {invoiceRaw.status === 'APPROVED' && (
                        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                            ✓ Receipt Approved & Ready
                        </div>
                    )}
                </div>
            </div>

            {/* ── Print Styles ── */}
            <style>{`
                @media print {
                    body { 
                        background: #fff !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page { 
                        size: A4; 
                        margin: 15mm; 
                    }
                    .min-h-screen { 
                        background: #fff !important; 
                    }
                    .shadow-lg { 
                        box-shadow: none !important; 
                    }
                    .border { 
                        border-color: #e5e7eb !important; 
                    }
                    .print\\:hidden { 
                        display: none !important; 
                    }
                    .bg-white { 
                        background-color: #fff !important; 
                    }
                    .bg-gray-50 { 
                        background-color: transparent !important; 
                    }
                    .text-blue-700 {
                        color: #1d4ed8 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoicePreview;