
import { useState, useEffect } from 'react';
import { X, Search, CheckCircle, PackageCheck, AlertTriangle, ListChecks, Plus, Minus, History } from 'lucide-react';
import QRScanner from './QRScanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobsService } from '../../services/jobs.service';
import { inventoryApi } from '../../services/inventory.service';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    defaultJobId?: string;
    assignedToId?: string;
    onCheckoutSuccess?: (item: any) => void;
    onCheckInSuccess?: (item: any) => void;
    initialMode?: 'search' | 'checkout' | 'checkin';
}

interface ScannedItem {
    id: string;
    name: string;
    code: string;
    quantity: number;
    timestamp: Date;
    status: 'success' | 'error';
    message?: string;
}

export const QRScannerModal = ({ isOpen, onClose, onScan, defaultJobId, assignedToId, onCheckoutSuccess, onCheckInSuccess, initialMode }: QRScannerModalProps) => {
    const [mode, setMode] = useState<'search' | 'checkout' | 'checkin'>(initialMode || (defaultJobId ? 'checkout' : 'search'));
    const [selectedJobId, setSelectedJobId] = useState(defaultJobId || '');
    const [continuousScan, setContinuousScan] = useState(true);
    const [sessionScans, setSessionScans] = useState<ScannedItem[]>([]);

    // Update state if defaultJobId changes
    useEffect(() => {
        if (defaultJobId && isOpen) {
            setSelectedJobId(defaultJobId);
            setMode(initialMode || 'checkout');
        } else if (isOpen && initialMode) {
            setMode(initialMode);
        }
    }, [defaultJobId, isOpen, initialMode]);

    // For bulk items qty picker
    const [pendingItem, setPendingItem] = useState<any | null>(null);
    const [bulkQuantity, setBulkQuantity] = useState(1);

    const queryClient = useQueryClient();

    const { data: jobsResponse } = useQuery({
        queryKey: ['active-jobs'],
        queryFn: () => JobsService.getAll({ limit: 100 }),
        enabled: isOpen && (mode === 'checkout' || mode === 'checkin'),
    });

    const validStatuses = mode === 'checkin' ? ['ONGOING', 'COMPLETED', 'PLANNED'] : ['CONFIRMED', 'ONGOING', 'PLANNED'];
    const activeJobs = jobsResponse?.data?.filter((j: any) => validStatuses.includes(j.status)) || [];

    const checkoutMutation = useMutation({
        mutationFn: inventoryApi.checkout,
        onSuccess: (_, variables) => {
            speak(`Success. ${variables.quantity} units.`);
            toast.success('Check-out successful');
            queryClient.invalidateQueries({ queryKey: ['inventory'] });

            // Notify parent
            if (onCheckoutSuccess) {
                onCheckoutSuccess({
                    id: variables.itemId,
                    name: pendingItem?.name || "Equipment",
                    qrCode: pendingItem?.qrCode || "",
                    quantity: variables.quantity
                });
            }

            // Add to session list
            const newItem: ScannedItem = {
                id: variables.itemId,
                name: pendingItem?.name || "Equipment",
                code: pendingItem?.qrCode || "",
                quantity: variables.quantity,
                timestamp: new Date(),
                status: 'success'
            };
            setSessionScans(prev => [newItem, ...prev]);

            // Clear pending
            setPendingItem(null);
            setBulkQuantity(1);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || 'Checkout failed';
            speak(`Error. ${msg}`);
            toast.error(msg);

            setSessionScans(prev => [{
                id: pendingItem?.id || 'error',
                name: pendingItem?.name || "Error",
                code: pendingItem?.qrCode || "",
                quantity: bulkQuantity,
                timestamp: new Date(),
                status: 'error',
                message: msg
            }, ...prev]);

            setPendingItem(null);
            setBulkQuantity(1);
        }
    });

    const checkInMutation = useMutation({
        mutationFn: inventoryApi.checkIn,
        onSuccess: (_, variables) => {
            speak(`Returned. ${variables.quantity} units.`);
            toast.success('Check-in successful');
            queryClient.invalidateQueries({ queryKey: ['inventory'] });

            if (onCheckInSuccess) {
                onCheckInSuccess({
                    id: variables.itemId,
                    name: pendingItem?.name || "Equipment",
                    qrCode: pendingItem?.qrCode || "",
                    quantity: variables.quantity
                });
            }

            const newItem: ScannedItem = {
                id: variables.itemId,
                name: pendingItem?.name || "Equipment",
                code: pendingItem?.qrCode || "",
                quantity: variables.quantity,
                timestamp: new Date(),
                status: 'success',
                message: 'Returned'
            };
            setSessionScans(prev => [newItem, ...prev]);

            setPendingItem(null);
            setBulkQuantity(1);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || 'Check-in failed';
            speak(`Error. ${msg}`);
            toast.error(msg);

            setSessionScans(prev => [{
                id: pendingItem?.id || 'error',
                name: pendingItem?.name || "Error",
                code: pendingItem?.qrCode || "",
                quantity: bulkQuantity,
                timestamp: new Date(),
                status: 'error',
                message: msg
            }, ...prev]);

            setPendingItem(null);
            setBulkQuantity(1);
        }
    });

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleScan = async (code: string) => {
        if (mode === 'search') {
            try {
                const items = await inventoryApi.getAll({ search: code, limit: 1 });
                const item = items.data.find(i => i.qrCode === code || i.id === code) || items.data[0];
                if (item) {
                    speak(`Found ${item.name}`);
                }
            } catch (err) { }
            onScan(code);
            onClose();
        } else if (mode === 'checkout' || mode === 'checkin') {
            // Checkout/Checkin Mode
            if (!selectedJobId) {
                speak("Please select a job first.");
                toast.error("Please select a job first");
                return;
            }

            try {
                // 1. Find item by code
                const items = await inventoryApi.getAll({ search: code, limit: 1 });
                const item = items.data.find(i => i.qrCode === code || i.id === code) || items.data[0];

                if (!item) {
                    speak("Item not found");
                    return;
                }

                // Business Logic: If item total quantity is 1, it's a unique serialized item (Speaker, Mixer)
                // If quantity > 1, it's a bulk/cable item, ask for quantity
                if (item.quantity === 1) {
                    if (mode === 'checkout') {
                        checkoutMutation.mutate({
                            itemId: item.id,
                            jobId: selectedJobId,
                            quantity: 1,
                            assignedToId
                        });
                    } else {
                        checkInMutation.mutate({
                            itemId: item.id,
                            jobId: selectedJobId,
                            quantity: 1,
                            assignedToId
                        });
                    }
                } else {
                    // Open Quantity Picker (Set pendingItem triggers UI)
                    // Logic continues in UI 'Confirm' button
                    // Bulk Item Flow
                    setPendingItem(item);
                    setBulkQuantity(1);
                    speak(`${item.name}. How many?`);
                }
            } catch (err: any) {
                console.error(err);
                speak("Scan error");
            }
        }
    };

    const confirmBulkCheckout = () => {
        if (!pendingItem || !selectedJobId) return;

        if (mode === 'checkout') {
            checkoutMutation.mutate({
                jobId: selectedJobId,
                itemId: pendingItem.id,
                quantity: bulkQuantity,
                assignedToId: assignedToId
            });
        } else {
            checkInMutation.mutate({
                jobId: selectedJobId,
                itemId: pendingItem.id,
                quantity: bulkQuantity,
                assignedToId: assignedToId
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-[#151A21] border border-[#1F2937] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">

                {/* Left Side: Scanner & Controls */}
                <div className="flex-1 p-6 border-r border-[#1F2937] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-500" />
                            Equipment Scanner
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white bg-[#1F2937] p-1.5 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex p-1 bg-[#0B0E14] rounded-xl mb-6 border border-[#1F2937]">
                        <button
                            onClick={() => setMode('search')}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                mode === 'search' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Search className="w-4 h-4" />
                            Search Mode
                        </button>
                        <button
                            onClick={() => setMode('checkout')}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                mode === 'checkout' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <PackageCheck className="w-4 h-4" />
                            Checkout Mode
                        </button>
                    </div>

                    {mode === 'checkout' && !pendingItem && (
                        <div className="mb-6 space-y-3">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Assign to Job</label>
                            <select
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="w-full h-12 bg-[#0B0E14] border border-[#1F2937] rounded-xl px-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                            >
                                <option value="">Select an active job...</option>
                                {activeJobs.map((job: any) => (
                                    <option key={job.id} value={job.id}>
                                        {job.title} - {job.client}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Pending Item Overlay (Bulk Qty Picker) */}
                    {pendingItem ? (
                        <div className="bg-[#0B0E14] rounded-2xl p-8 mb-6 border border-emerald-500/30 flex flex-col items-center animate-in zoom-in duration-200">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                <PackageCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{pendingItem.name}</h3>
                            <p className="text-gray-500 text-sm mb-6">Bulk item detected. Enter quantity.</p>

                            <div className="flex items-center gap-6 mb-8">
                                <button
                                    onClick={() => setBulkQuantity(q => Math.max(1, q - 1))}
                                    className="w-12 h-12 rounded-xl bg-[#1F2937] hover:bg-[#374151] flex items-center justify-center transition-colors"
                                >
                                    <Minus className="w-6 h-6 text-white" />
                                </button>
                                <span className="text-4xl font-bold text-white min-w-[60px] text-center">{bulkQuantity}</span>
                                <button
                                    onClick={() => setBulkQuantity(q => q + 1)}
                                    className="w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setPendingItem(null)}
                                    className="flex-1 py-3 text-gray-400 font-bold hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBulkCheckout}
                                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                                >
                                    Confirm Checkout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className="overflow-hidden rounded-2xl border-2 border-[#1F2937] bg-black aspect-square max-h-[400px]">
                                <QRScanner onScanSuccess={handleScan} />
                            </div>
                            {/* Scanning Guide Overlay */}
                            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none rounded-2xl">
                                <div className="w-full h-full border-2 border-dashed border-white/30 rounded-lg"></div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={continuousScan}
                                onChange={(e) => setContinuousScan(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-600/30"
                            />
                            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Continuous Scanning</span>
                        </label>
                    </div>
                </div>

                {/* Right Side: Session Activity Log */}
                <div className="w-full md:w-72 bg-[#0B0E14] flex flex-col">
                    <div className="p-6 border-b border-[#1F2937] flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-bold text-white">Session Scans</h3>
                        <span className="ml-auto bg-gray-800 text-[10px] text-gray-400 px-2 py-0.5 rounded-full">{sessionScans.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                        {sessionScans.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
                                <History className="w-8 h-8 mb-2" />
                                <p className="text-xs">No activity yet</p>
                            </div>
                        ) : (
                            sessionScans.map((scan, idx) => (
                                <div key={idx} className={cn(
                                    "p-3 rounded-xl border animate-in slide-in-from-right-10",
                                    scan.status === 'success' ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
                                )}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xs font-bold text-white truncate max-w-[140px]">{scan.name}</h4>
                                        <span className="text-[10px] text-gray-500">{scan.quantity}x</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-mono mb-1">{scan.code}</p>
                                    <div className="flex items-center gap-1">
                                        {scan.status === 'success' ? (
                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                            <AlertTriangle className="w-3 h-3 text-red-500" />
                                        )}
                                        <span className={cn("text-[10px]", scan.status === 'success' ? "text-emerald-500" : "text-red-500")}>
                                            {scan.status === 'success' ? 'Completed' : scan.message}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-[#1F2937]">
                        <button
                            disabled={sessionScans.length === 0}
                            onClick={() => {
                                speak("Checkout session finalized.");
                                onClose();
                                setSessionScans([]);
                            }}
                            className="w-full py-4 mb-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 animate-pulse"
                        >
                            <CheckCircle className="w-4 h-4" />
                            FINALIZE SESSION
                        </button>
                        <button
                            disabled={sessionScans.length === 0}
                            onClick={() => setSessionScans([])}
                            className="w-full py-2 text-[10px] font-bold text-gray-600 hover:text-gray-400 underline underline-offset-4 transition-colors"
                        >
                            CLEAR SESSION LOG
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
