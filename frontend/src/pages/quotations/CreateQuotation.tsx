
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Plus, Save, Send, Trash2, ChevronDown, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quotationApi } from '../../services/quotation.service';
import { inventoryApi } from '../../services/inventory.service';
import { cn } from '../../lib/utils'; // Keep assuming this path is correct

const CreateQuotation = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEditMode = !!id;

    const { data: inventoryData } = useQuery({
        queryKey: ['inventory'],
        queryFn: () => inventoryApi.getAll({ limit: 1000 })
    });

    const inventory = inventoryData?.data || [];

    // Form State matching the image
    const [clientInfo, setClientInfo] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: ''
    });

    const [eventDetails, setEventDetails] = useState({
        name: '',
        date: '',
        location: '',
        description: ''
    });

    const [items, setItems] = useState([
        { id: 1, itemId: '', description: '', quantity: 1, rate: 0, amount: 0, available: 0 }
    ]);

    const [validUntil, setValidUntil] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('Net 30');

    // Fetch existing data if in edit mode
    const { data: existingQuotation } = useQuery({
        queryKey: ['quotation', id],
        queryFn: () => quotationApi.getOne(id!),
        enabled: isEditMode
    });

    useEffect(() => {
        if (existingQuotation) {
            setClientInfo({
                name: existingQuotation.clientName || '',
                contactPerson: '',
                email: existingQuotation.clientEmail || '',
                phone: existingQuotation.clientPhone || ''
            });

            setEventDetails({
                name: existingQuotation.event?.name || existingQuotation.eventName || '',
                date: existingQuotation.event?.startDate ? new Date(existingQuotation.event.startDate).toISOString().split('T')[0] : '',
                location: existingQuotation.event?.location || existingQuotation.eventLocation || '',
                description: existingQuotation.event?.description || ''
            });

            if (existingQuotation.items?.length) {
                setItems(existingQuotation.items.map((item: any) => ({
                    id: item.id || Date.now() + Math.random(),
                    itemId: item.itemId || '',
                    description: item.item?.name || item.description || '',
                    quantity: Number(item.quantity) || 0,
                    rate: Number(item.unitPrice) || 0,
                    amount: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
                    available: item.item?.quantity || 0
                })));
            }

            if (existingQuotation.validUntil) {
                setValidUntil(new Date(existingQuotation.validUntil).toISOString().split('T')[0]);
            }
        }
    }, [existingQuotation]);

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), itemId: '', description: '', quantity: 1, rate: 0, amount: 0, available: 0 }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                let updated = { ...item, [field]: value };

                // If selecting an item from inventory
                if (field === 'itemId' && inventory) {
                    const invItem = inventory.find(i => i.id === value);
                    if (invItem) {
                        updated.description = invItem.name;
                        updated.rate = Number(invItem.price);
                        updated.available = invItem.quantity;
                    }
                }

                if (field === 'quantity' || field === 'rate' || field === 'itemId') {
                    updated.amount = updated.quantity * updated.rate;
                }
                return updated;
            }
            return item;
        }));
    };

    const createMutation = useMutation({
        mutationFn: quotationApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotations'] });
            navigate('/quotations');
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || 'Failed to create quotation');
        }
    });

    const handleCreate = () => {
        if (!clientInfo.name || !eventDetails.name || !eventDetails.date) {
            alert('Please fill in required fields (Client Name, Event Name, Event Date)');
            return;
        }

        const payload = {
            clientName: clientInfo.name,
            clientEmail: clientInfo.email,
            clientPhone: clientInfo.phone,
            eventName: eventDetails.name,
            eventDate: eventDetails.date,
            eventLocation: eventDetails.location,
            eventDescription: eventDetails.description,
            items: items.map(item => ({
                itemId: item.itemId || undefined,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.rate
            })),
            paymertTerms: paymentTerms,
            validUntil: validUntil || undefined,
            taxRate: 10 // Hardcoded from example
        };

        createMutation.mutate(payload as any);
    };

    const subtotal = calculateTotal();
    const tax = subtotal * 0.10; // 10% tax example from image
    const total = subtotal + tax;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link to="/quotations" className="p-2 -ml-2 hover:bg-[#151A21] rounded-lg text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Quotation' : 'Create Quotation'}</h1>
                    </div>
                    <p className="text-gray-400 pl-9">{isEditMode ? 'Modify existing quotation details' : 'Prepare a new quotation for client'}</p>
                </div>
                <Link to="/quotations" className="bg-[#151A21] border border-[#1F2937] hover:bg-[#1F2937] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Back to List
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client Information */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Client Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Client Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter client name"
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                    value={clientInfo.name}
                                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Contact Person</label>
                                <input
                                    type="text"
                                    placeholder="Enter contact name"
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                    value={clientInfo.contactPerson}
                                    onChange={(e) => setClientInfo({ ...clientInfo, contactPerson: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    placeholder="client@email.com"
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                    value={clientInfo.email}
                                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
                                <input
                                    type="text"
                                    placeholder="+1 234 567 8900"
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                    value={clientInfo.phone}
                                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Event Details</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Event Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter event name"
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                    value={eventDetails.name}
                                    onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Event Date *</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="date"
                                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none [color-scheme:dark]"
                                            value={eventDetails.date}
                                            onChange={(e) => setEventDetails({ ...eventDetails, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Event Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Event venue"
                                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                            value={eventDetails.location}
                                            onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Event description"
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none resize-none"
                                    value={eventDetails.description}
                                    onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items & Services */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-white">Items & Services</h2>
                            <button onClick={addItem} className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-3 items-start animate-in slide-in-from-left-4 duration-300">
                                    <div className="col-span-12 md:col-span-5">
                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Item Details</label>
                                        <select
                                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none appearance-none"
                                            value={item.itemId}
                                            onChange={(e) => updateItem(item.id, 'itemId', e.target.value)}
                                        >
                                            <option value="">-- Generic Service / Custom Item --</option>
                                            {inventory?.map(inv => (
                                                <option key={inv.id} value={inv.id}>{inv.name} (Stock: {inv.quantity})</option>
                                            ))}
                                        </select>
                                        {!item.itemId && (
                                            <input
                                                type="text"
                                                placeholder="Custom description"
                                                className="w-full mt-2 bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-gray-200 text-xs focus:border-blue-500 outline-none"
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                            />
                                        )}
                                        {item.itemId && item.quantity > item.available && (
                                            <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Exceeds current stock ({item.available})
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Qty</label>
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Rate</label>
                                        <input
                                            type="number"
                                            placeholder="Rate"
                                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                            value={item.rate}
                                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-3 flex items-end justify-between gap-2">
                                        <div className="w-full">
                                            <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Amount</label>
                                            <div className="bg-[#0B0E14] border border-[#1F2937] rounded-lg px-3 py-2.5 text-gray-400 text-sm w-full text-right font-mono">
                                                ${item.amount.toFixed(2)}
                                            </div>
                                        </div>
                                        {items.length > 1 && (
                                            <button onClick={() => removeItem(item.id)} className="mb-2.5 p-2 text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 sticky top-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Summary</h2>

                        <div className="space-y-3 mb-6 border-b border-[#1F2937] pb-6">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Tax (10%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-base font-semibold text-white">Total</span>
                            <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Valid Until</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="date"
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none [color-scheme:dark]"
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Payment Terms</label>
                                <div className="relative">
                                    <select
                                        value={paymentTerms}
                                        onChange={(e) => setPaymentTerms(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none appearance-none"
                                    >
                                        <option>Net 30</option>
                                        <option>Net 15</option>
                                        <option>Due on Receipt</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            {createMutation.isPending ? 'Sending...' : 'Send to Client'}
                        </button>
                        <button
                            onClick={handleCreate} // Reuse create for now
                            disabled={createMutation.isPending}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] hover:bg-[#1F2937] text-gray-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" /> Save as Draft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuotation;
