import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Plus, Trash2, FileText, CheckCircle } from 'lucide-react';
import { JobsService } from '../../services/jobs.service';
import { invoiceApi } from '../../services/invoice.service';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
    const [dueDate, setDueDate] = useState<string>('');

    // Fetch Jobs
    const { data: jobsData, isLoading: jobsLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => JobsService.getAll({ limit: 1000 })
    });

    const jobs = jobsData?.data || [];

    // Fetch Selected Job Details
    const { data: selectedJob } = useQuery({
        queryKey: ['job', selectedJobId],
        queryFn: () => JobsService.getOne(selectedJobId),
        enabled: !!selectedJobId
    });

    // Auto-populate items when Job is selected
    useEffect(() => {
        if (selectedJob && selectedJob.checkouts) {
            const aggregatedItems: Record<string, any> = {};

            selectedJob.checkouts.forEach((checkout: any) => {
                const itemId = checkout.itemId;
                const quantity = checkout.quantity || 1;

                if (aggregatedItems[itemId]) {
                    aggregatedItems[itemId].quantity += quantity;
                } else {
                    aggregatedItems[itemId] = {
                        itemId: checkout.item.id,
                        description: checkout.item.name,
                        quantity: quantity,
                        unitPrice: Number(checkout.item.price || 0)
                    };
                }
            });

            setInvoiceItems(Object.values(aggregatedItems));

            // Set default due date (e.g. 7 days from now)
            const d = new Date();
            d.setDate(d.getDate() + 7);
            setDueDate(d.toISOString().split('T')[0]);
        }
    }, [selectedJob]);

    const createMutation = useMutation({
        mutationFn: invoiceApi.create,
        onSuccess: () => {
            alert('Invoice created successfully!');
            navigate('/invoices');
        },
        onError: (err: any) => {
            console.error('Error creating invoice:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create invoice.';
            alert(`Error: ${errorMessage}`);
        }
    });

    const handleAddItem = () => {
        setInvoiceItems([...invoiceItems, { description: 'New Item', quantity: 1, unitPrice: 0 }]);
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...invoiceItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setInvoiceItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subtotal = invoiceItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
        return { subtotal, total: subtotal };
    };

    const { subtotal, total } = calculateTotals();

    const handleSave = () => {
        createMutation.mutate({
            jobId: selectedJobId,
            clientName: selectedJob?.client, // Provide fallback
            dueDate: dueDate,
            items: invoiceItems.map(i => ({
                itemId: i.itemId,
                description: i.description,
                quantity: Number(i.quantity),
                unitPrice: Number(i.unitPrice),
                totalPrice: Number(i.quantity) * Number(i.unitPrice)
            })),
            status: 'DRAFT'
        });
    };

    if (jobsLoading) return <div className="text-white p-8">Loading jobs...</div>;

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-6">
            <div className="w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create New Invoice</h1>
                        <p className="text-gray-400 text-sm">Follow the steps to generate an invoice for a completed job</p>
                    </div>
                    <button
                        onClick={() => navigate('/invoices')}
                        className="text-gray-400 hover:text-white flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancel
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 1 ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-[#151A21] text-gray-500'}`}>
                        <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-[#0B0E14] font-bold text-xs">1</div>
                        <span>Select Job</span>
                    </div>
                    <div className="w-8 h-[1px] bg-gray-800" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 2 ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-[#151A21] text-gray-500'}`}>
                        <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-[#0B0E14] font-bold text-xs">2</div>
                        <span>Billing Items</span>
                    </div>
                    <div className="w-8 h-[1px] bg-gray-800" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 3 ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-[#151A21] text-gray-500'}`}>
                        <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-[#0B0E14] font-bold text-xs">3</div>
                        <span>Preview & Save</span>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 min-h-[400px]">

                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Select a Completed Job</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {jobs?.map((job: any) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJobId(job.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedJobId === job.id ? 'bg-blue-600/10 border-blue-600 ring-1 ring-blue-600' : 'bg-[#0B0E14] border-[#1F2937] hover:border-gray-600'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-white">{job.title}</h4>
                                            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">{job.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{job.client}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className={`w-2 h-2 rounded-full ${job.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-500'}`} />
                                            {job.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-8">
                                <button
                                    disabled={!selectedJobId}
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    Next Step <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Edit Billing Items</h3>

                            {/* Items Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-gray-400 border-b border-[#1F2937]">
                                        <tr>
                                            <th className="py-3 px-4">Description</th>
                                            <th className="py-3 px-4 w-32">Qty</th>
                                            <th className="py-3 px-4 w-40">Rate</th>
                                            <th className="py-3 px-4 w-40">Amount</th>
                                            <th className="py-3 px-4 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1F2937]">
                                        {invoiceItems.map((item, index) => (
                                            <tr key={index} className="group hover:bg-[#1F2937]/50">
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                                                        className="w-full bg-transparent border border-transparent hover:border-[#374151] focus:border-blue-500 rounded px-2 py-1 outline-none transition-colors"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                                                        className="w-full bg-transparent border border-transparent hover:border-[#374151] focus:border-blue-500 rounded px-2 py-1 outline-none transition-colors"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1 text-gray-500">₹</span>
                                                        <input
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                                                            className="w-full bg-transparent pl-6 border border-transparent hover:border-[#374151] focus:border-blue-500 rounded px-2 py-1 outline-none transition-colors"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-2 text-right font-mono text-gray-300">
                                                    ₹{(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-4"
                            >
                                <Plus className="w-4 h-4" /> Add Custom Item
                            </button>

                            <div className="flex justify-between items-center pt-6 border-t border-[#1F2937]">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 px-6 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="text-right mr-4">
                                        <p className="text-gray-400 text-xs uppercase">Total Amount</p>
                                        <p className="text-2xl font-bold text-white">₹{subtotal.toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                    >
                                        Review <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Ready to Create Invoice</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    You are about to create a draft invoice for <strong>{selectedJob?.title}</strong> with a total of <strong>₹{total.toLocaleString()}</strong>.
                                </p>
                            </div>

                            <div className="max-w-md mx-auto">
                                <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 outline-none focus:border-blue-500 mb-6"
                                />

                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-6">
                                    <p className="text-sm text-yellow-500">
                                        This invoice will be saved as <strong>DRAFT</strong>. An admin must approve it before it can be sent to the client.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-[#1F2937]">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 px-6 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Edit
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={createMutation.isPending}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Saving...' : 'Create Draft Invoice'}
                                    {!createMutation.isPending && <CheckCircle className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CreateInvoice;
