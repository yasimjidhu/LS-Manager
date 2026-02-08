import { useState } from 'react';
import { QrCode, User, CheckCircle2, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { JobsService } from '../../services/jobs.service';
import { employeeApi } from '../../services/employee.service';
import { Skeleton } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { QRScannerModal } from '../../components/inventory/QRScannerModal';

const steps = [
    { id: 1, label: 'Select Job', icon: Calendar },
    { id: 2, label: 'Assign Employee', icon: User },
    { id: 3, label: 'Scan Equipment', icon: QrCode },
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
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Queries
    const { data: jobsData, isLoading: jobsLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => JobsService.getAll({ limit: 1000 })
    });

    const { data: employeesData } = useQuery({
        queryKey: ['employees'],
        queryFn: () => employeeApi.getAll({ limit: 1000 })
    });

    const employees = employeesData?.data || [];

    const handleCheckoutSuccess = (item: any) => {
        setScannedItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 0) + item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    const safeJobs = jobsData?.data || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-4">
            <div>
                <h1 className="text-xl font-bold text-white mb-0.5">Equipment Checkout</h1>
                <p className="text-gray-400 text-xs">Streamlined workflow for assigning equipment to jobs</p>
            </div>

            {/* Stepper */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 mb-4">
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
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                            <h2 className="text-lg font-bold text-white mb-6">Select Job</h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {jobsLoading ? (
                                    <>
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                    </>
                                ) : safeJobs.length === 0 ? (
                                    <div className="text-gray-500">No scheduled jobs found.</div>
                                ) : null}
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

                    {/* Step 2: Assign Employee */}
                    {currentStep === 2 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                            <h2 className="text-sm font-bold text-white mb-4">Assign Employee</h2>
                            <p className="text-gray-400 text-xs mb-4">Who is collecting this equipment?</p>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-8">
                                {employees?.map((emp: any) => (
                                    <div
                                        key={emp.id}
                                        onClick={() => setAssignedEmployee(emp)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all",
                                            assignedEmployee?.id === emp.id
                                                ? "bg-emerald-600/10 border-emerald-600/50"
                                                : "bg-[#0B0E14] border-[#1F2937] hover:border-gray-600"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#151A21] flex items-center justify-center text-gray-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className={cn("font-medium", assignedEmployee?.id === emp.id ? "text-emerald-400" : "text-white")}>
                                                {emp.firstName} {emp.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{emp.role || 'Employee'}</p>
                                        </div>
                                        {assignedEmployee?.id === emp.id && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                                    </div>
                                ))}
                                {(!employees || employees.length === 0) && (
                                    <p className="text-gray-500 italic">No employees found. You can skip this step.</p>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setCurrentStep(1)} className="text-gray-400 hover:text-white font-medium">Back</button>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setAssignedEmployee(null); setCurrentStep(3); }}
                                        className="text-gray-500 hover:text-white font-medium"
                                    >
                                        Skip Selection
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
                                    >
                                        Next: Scan Items
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Scan Equipment */}
                    {currentStep === 3 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 min-h-[350px] flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                                <QrCode className="w-8 h-8 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Scan Gear for this Job</h2>
                            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                                Every scan will automatically associate the equipment with the selected job and update inventory status in real-time.
                            </p>

                            <button
                                onClick={() => setIsScannerOpen(true)}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 group"
                            >
                                <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                START SCANNING
                            </button>

                            <QRScannerModal
                                isOpen={isScannerOpen}
                                onClose={() => setIsScannerOpen(false)}
                                defaultJobId={selectedJob?.id}
                                assignedToId={assignedEmployee?.id}
                                onCheckoutSuccess={handleCheckoutSuccess}
                                onScan={() => { }}
                            />

                            <div className="mt-12 flex justify-between w-full">
                                <button onClick={() => setCurrentStep(2)} className="text-gray-400 hover:text-white font-medium">Back</button>
                                <button
                                    onClick={() => setCurrentStep(4)}
                                    disabled={scannedItems.length === 0}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                                >
                                    Review & Finish
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirm */}
                    {currentStep === 4 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Checkout Session Complete</h2>
                            <p className="text-gray-400 mb-6 text-sm">
                                <span className="text-emerald-400 font-bold">{scannedItems.length} items</span> have been successfully associated with
                                <span className="text-white font-bold"> {selectedJob?.title}</span>.
                            </p>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className="px-6 py-2.5 bg-[#0B0E14] hover:bg-[#1F2937] text-white border border-[#1F2937] font-semibold rounded-xl transition-colors text-sm"
                                >
                                    Back to Inventory
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-sm"
                                >
                                    New Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 h-full sticky top-6">
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
                                            style={{ width: `${Math.min(scannedItems.length * 5, 100)}%` }}
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
