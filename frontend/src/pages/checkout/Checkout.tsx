import { useState, useRef, useEffect } from 'react';
import { QrCode, User, CheckCircle2, ChevronRight, Calendar, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { JobsService } from '../../services/jobs.service';
import { checkoutApi } from '../../services/checkout.service';
import { inventoryApi } from '../../services/inventory.service';
import { employeesApi } from '../../services/employees.service';
import { useNavigate } from 'react-router-dom';

const steps = [
    { id: 1, label: 'Select Job', icon: Calendar },
    { id: 2, label: 'Scan Equipment', icon: QrCode },
    { id: 3, label: 'Assign Employee', icon: User },
    { id: 4, label: 'Confirm', icon: CheckCircle2 },
];

const Checkout = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    // Data State
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [scannedItems, setScannedItems] = useState<any[]>([]);
    const [assignedEmployee, setAssignedEmployee] = useState<any>(null);

    // Scan State
    const [scanInput, setScanInput] = useState('');
    const [scanError, setScanError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const scanInputRef = useRef<HTMLInputElement>(null);

    // Queries
    const { data: jobsData, isLoading: jobsLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => JobsService.getAll({ limit: 1000 })
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: employeesApi.getAll
    });

    // Mutations
    const checkoutMutation = useMutation({
        mutationFn: checkoutApi.checkout,
        onSuccess: () => {
            // alert('Checkout completed successfully!');
            navigate('/inventory'); // Redirect to inventory or history
        },
        onError: (error: any) => {
            console.error(error);
            alert(error.response?.data?.message || 'Checkout failed');
        }
    });

    // Handlers
    const handleScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!scanInput.trim()) return;

        setScanError('');
        setIsScanning(true);

        try {
            // Search by Exact ID or QR Code first
            // Note: getAll performs fuzzy search usually, but we want exact match for scanning
            // Ideally backend has getByQr endpoint. Using getAll for now.
            const response = await inventoryApi.getAll({ search: scanInput, limit: 50 });
            const results = response.data || [];

            // Heuristic sort: exact match first
            const match = results.find((i: any) => i.qrCode === scanInput || i.id === scanInput) || results[0];

            if (match) {
                const available = match.quantity - (match.checkedOutQuantity || 0);

                if (available <= 0) {
                    setScanError(`Item "${match.name}" is already fully checked out (0/${match.quantity} available)`);
                } else if (match.status === 'MAINTENANCE' || match.status === 'DAMAGED' || match.status === 'RETIRED') {
                    setScanError(`Item "${match.name}" is unavailable due to status: ${match.status.replace('_', ' ')}`);
                } else if (scannedItems.find(i => i.id === match.id)) {
                    setScanError(`Item "${match.name}" is already in list`);
                } else {
                    setScannedItems(prev => [{ ...match, quantity: 1, maxAvailable: available }, ...prev]);
                    setScanInput('');
                }
            } else {
                setScanError('Item not found');
            }
        } catch (err) {
            setScanError('Error searching for item');
        } finally {
            setIsScanning(false);
            scanInputRef.current?.focus();
        }
    };

    const handleRemoveItem = (id: string) => {
        setScannedItems(prev => prev.filter(i => i.id !== id));
    };

    const handleConfirm = () => {
        checkoutMutation.mutate({
            jobId: selectedJob.id as string,
            items: scannedItems.map(i => ({
                itemId: i.id,
                quantity: i.quantity || 1
            })),
            assignedToId: assignedEmployee?.id
        });
    };

    // Auto-focus input on Step 2
    useEffect(() => {
        if (currentStep === 2) {
            setTimeout(() => scanInputRef.current?.focus(), 100);
        }
    }, [currentStep]);

    const safeJobs = jobsData?.data || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Equipment Checkout</h1>
                <p className="text-gray-400">Streamlined workflow for assigning equipment to jobs</p>
            </div>

            {/* Stepper */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-8 mb-8">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#1F2937] -z-0"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 -z-0 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step) => {
                        const isActive = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4",
                                        isActive ? "bg-blue-600 border-[#151A21] text-white" : "bg-[#0B0E14] border-[#1F2937] text-gray-500",
                                        isCurrent && "ring-4 ring-blue-600/20"
                                    )}
                                >
                                    <step.icon className="w-5 h-5" />
                                </div>
                                <span className={cn("text-xs font-medium transition-colors duration-300", isActive ? "text-gray-200" : "text-gray-500")}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Step 1: Select Job */}
                    {currentStep === 1 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-6">Select Job</h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {jobsLoading && <div className="text-gray-500">Loading jobs...</div>}
                                {safeJobs.length === 0 && !jobsLoading && <div className="text-gray-500">No scheduled jobs found.</div>}
                                {safeJobs.map((job: any) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer flex items-center justify-between group transition-all",
                                            selectedJob?.id === job.id
                                                ? "bg-blue-600/10 border-blue-600/50"
                                                : "bg-[#0B0E14] border-[#1F2937] hover:border-gray-600"
                                        )}
                                    >
                                        <div>
                                            <h3 className={cn("font-semibold mb-1", selectedJob?.id === job.id ? "text-blue-400" : "text-white")}>{job.title}</h3>
                                            <p className="text-sm text-gray-500">{job.date} • {job.location}</p>
                                        </div>
                                        <ChevronRight className={cn("w-5 h-5 transition-transform", selectedJob?.id === job.id ? "text-blue-500 translate-x-1" : "text-gray-600")} />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!selectedJob}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Scan Equipment */}
                    {currentStep === 2 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 min-h-[400px] flex flex-col">
                            <h2 className="text-lg font-bold text-white mb-6">Scan Equipment</h2>

                            <form onSubmit={handleScan} className="flex gap-3 w-full mb-6">
                                <div className="flex-1 relative">
                                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        ref={scanInputRef}
                                        type="text"
                                        value={scanInput}
                                        onChange={e => setScanInput(e.target.value)}
                                        placeholder="Scan barcode or enter Asset ID..."
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" disabled={isScanning} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                                    {isScanning ? 'Searching...' : 'Add'}
                                </button>
                            </form>

                            {scanError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {scanError}
                                </div>
                            )}

                            {/* Step 2: Scan Equipment */}
                            <div className="flex-1 space-y-2 max-h-[300px] overflow-y-auto">
                                {scannedItems.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">
                                        <QrCode className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No items added yet</p>
                                    </div>
                                )}
                                {scannedItems.map((item) => (
                                    <div key={item.id} className="p-3 bg-[#0B0E14] border border-[#1F2937] rounded-xl flex justify-between items-center animate-in slide-in-from-top-2">
                                        <div>
                                            <p className="text-white font-medium">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.qrCode}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 bg-[#151A21] rounded-lg px-2 py-1">
                                                <button
                                                    onClick={() => {
                                                        const newQty = (item.quantity || 1) - 1;
                                                        if (newQty < 1) handleRemoveItem(item.id);
                                                        else {
                                                            setScannedItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
                                                        }
                                                    }}
                                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white bg-[#0B0E14] rounded"
                                                >
                                                    -
                                                </button>
                                                <span className="text-white font-mono w-8 text-center">{item.quantity || 1}</span>
                                                <button
                                                    onClick={() => {
                                                        const currentQty = item.quantity || 1;
                                                        if (currentQty < item.maxAvailable) {
                                                            setScannedItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: currentQty + 1 } : i));
                                                        }
                                                    }}
                                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white bg-[#0B0E14] rounded"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button onClick={() => handleRemoveItem(item.id)} className="p-2 hover:bg-[#1F2937] text-red-500 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button onClick={() => setCurrentStep(1)} className="text-gray-400 hover:text-white font-medium">Back</button>
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    disabled={scannedItems.length === 0}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Assign Employee */}
                    {currentStep === 3 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-6">Assign Employee</h2>
                            <p className="text-gray-400 mb-6">Who is collecting this equipment?</p>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-8">
                                {employees?.map((emp: any) => (
                                    <div
                                        key={emp.id}
                                        onClick={() => setAssignedEmployee(emp)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all",
                                            assignedEmployee?.id === emp.id
                                                ? "bg-blue-600/10 border-blue-600/50"
                                                : "bg-[#0B0E14] border-[#1F2937] hover:border-gray-600"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#151A21] flex items-center justify-center text-gray-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className={cn("font-medium", assignedEmployee?.id === emp.id ? "text-blue-400" : "text-white")}>
                                                {emp.firstName} {emp.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{emp.role || 'Employee'}</p>
                                        </div>
                                        {assignedEmployee?.id === emp.id && <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto" />}
                                    </div>
                                ))}
                                {(!employees || employees.length === 0) && (
                                    <p className="text-gray-500 italic">No employees found. You can skip this step.</p>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setCurrentStep(2)} className="text-gray-400 hover:text-white font-medium">Back</button>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setAssignedEmployee(null); setCurrentStep(4); }}
                                        className="text-gray-500 hover:text-white font-medium"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(4)}
                                        disabled={!assignedEmployee}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                                    >
                                        Next Step
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirm */}
                    {currentStep === 4 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Ready to Checkout?</h2>
                            <p className="text-gray-400 mb-8">
                                You are about to check out <span className="text-white font-bold">{scannedItems.length} items</span> for
                                <span className="text-white font-bold"> {selectedJob?.title}</span>.
                            </p>

                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="px-6 py-3 bg-[#0B0E14] hover:bg-[#1F2937] text-white border border-[#1F2937] font-semibold rounded-xl transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={checkoutMutation.isPending}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {checkoutMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Confirm Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 h-full sticky top-6">
                        <h2 className="text-lg font-bold text-white mb-4">Checkout Summary</h2>
                        {!selectedJob ? (
                            <div className="text-gray-500 text-sm text-center py-10">
                                Select a job to start
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="pb-4 border-b border-[#1F2937]">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Selected Job</p>
                                    <p className="text-white font-medium">{selectedJob.title}</p>
                                    <p className="text-sm text-gray-500">{selectedJob.date}</p>
                                </div>

                                {assignedEmployee && (
                                    <div className="pb-4 border-b border-[#1F2937]">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Assigned To</p>
                                        <p className="text-white font-medium">{assignedEmployee.firstName} {assignedEmployee.lastName}</p>
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between text-sm mb-3">
                                        <span className="text-gray-400">Scanned Items</span>
                                        <span className="text-white font-bold">{scannedItems.length}</span>
                                    </div>
                                    <div className="w-full bg-[#0B0E14] h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(scannedItems.length * 5, 100)}%` }} // Arbitrary progress
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {scannedItems.slice(0, 5).map(item => (
                                        <div key={item.id} className="text-xs text-gray-400 flex justify-between">
                                            <span>{item.name}</span>
                                            <span className="text-gray-600 font-mono">{item.qrCode?.slice(0, 8)}...</span>
                                        </div>
                                    ))}
                                    {scannedItems.length > 5 && (
                                        <div className="text-xs text-center text-gray-500 pt-2">
                                            + {scannedItems.length - 5} more items
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
