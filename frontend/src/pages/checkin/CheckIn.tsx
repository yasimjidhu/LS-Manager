import { useState } from 'react';
import { QrCode, CheckCircle2, ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { JobsService } from '../../services/jobs.service';
import { Skeleton } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { QRScannerModal } from '../../components/inventory/QRScannerModal';

const steps = [
    { id: 1, label: 'Select Job', icon: Calendar },
    { id: 2, label: 'Scan Returns', icon: QrCode },
    { id: 3, label: 'Confirm', icon: CheckCircle2 },
];

const CheckIn = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    // Data State
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [scannedItems, setScannedItems] = useState<any[]>([]);

    // Scan State
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Queries
    const { data: jobsData, isLoading: jobsLoading } = useQuery({
        queryKey: ['active-jobs'], // Fetch active jobs + completed
        queryFn: () => JobsService.getAll({ limit: 100 })
    });

    const handleCheckInSuccess = (item: any) => {
        setScannedItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 0) + item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    // Filter jobs that are ONGOING, COMPLETED, or CONFIRMED
    const safeJobs = jobsData?.data?.filter((j: any) => ['ONGOING', 'COMPLETED', 'CONFIRMED'].includes(j.status)) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/inventory')}
                    className="p-2 hover:bg-[#1F2937] rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Equipment Check-in</h1>
                    <p className="text-gray-400">Return equipment and update inventory status</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-8 mb-8">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#1F2937] -z-0"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 -z-0 transition-all duration-500"
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
                                        isActive ? "bg-indigo-600 border-[#151A21] text-white" : "bg-[#0B0E14] border-[#1F2937] text-gray-500",
                                        isCurrent && "ring-4 ring-indigo-600/20"
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
                            <h2 className="text-lg font-bold text-white mb-6">Select Job to Return From</h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {jobsLoading ? (
                                    <>
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                    </>
                                ) : safeJobs.length === 0 ? (
                                    <div className="text-gray-500">No active or completed jobs found.</div>
                                ) : null}
                                {safeJobs.map((job: any) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer flex items-center justify-between group transition-all",
                                            selectedJob?.id === job.id
                                                ? "bg-indigo-600/10 border-indigo-600/50"
                                                : "bg-[#0B0E14] border-[#1F2937] hover:border-gray-600"
                                        )}
                                    >
                                        <div>
                                            <h3 className={cn("font-semibold mb-1", selectedJob?.id === job.id ? "text-indigo-400" : "text-white")}>{job.title}</h3>
                                            <p className="text-sm text-gray-500">{job.date} • {job.location}</p>
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded border uppercase mt-2 inline-block font-bold",
                                                job.status === 'COMPLETED' ? "border-green-500/20 text-green-500 bg-green-500/10" : "border-blue-500/20 text-blue-500 bg-blue-500/10"
                                            )}>{job.status}</span>
                                        </div>
                                        <ChevronRight className={cn("w-5 h-5 transition-transform", selectedJob?.id === job.id ? "text-indigo-500 translate-x-1" : "text-gray-600")} />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!selectedJob}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Scan Equipment */}
                    {currentStep === 2 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-10 min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
                                <QrCode className="w-12 h-12 text-indigo-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Scan Items to Return</h2>
                            <p className="text-gray-400 mb-10 max-w-md mx-auto">
                                Scan the QR code of any items returning from <span className="text-white font-bold">{selectedJob?.title}</span>.
                            </p>

                            <button
                                onClick={() => setIsScannerOpen(true)}
                                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-indigo-600/20 transition-all flex items-center gap-4 group"
                            >
                                <QrCode className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                START SCANNING
                            </button>

                            <QRScannerModal
                                isOpen={isScannerOpen}
                                onClose={() => setIsScannerOpen(false)}
                                defaultJobId={selectedJob?.id}
                                onCheckInSuccess={handleCheckInSuccess}
                                onScan={() => { }}
                                initialMode="checkin"
                            />

                            <div className="mt-12 flex justify-between w-full">
                                <button onClick={() => setCurrentStep(1)} className="text-gray-400 hover:text-white font-medium">Back</button>
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    disabled={scannedItems.length === 0}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                                >
                                    Finish Check-in
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {currentStep === 3 && (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-10 text-center">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Check-in Complete</h2>
                            <p className="text-gray-400 mb-10 text-lg">
                                <span className="text-emerald-400 font-bold">{scannedItems.length} items</span> have been marked as returned from
                                <span className="text-white font-bold"> {selectedJob?.title}</span>.
                            </p>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className="px-8 py-3 bg-[#0B0E14] hover:bg-[#1F2937] text-white border border-[#1F2937] font-semibold rounded-xl transition-colors"
                                >
                                    Back to Inventory
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
                                >
                                    Check In More
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 h-full sticky top-6">
                        <h2 className="text-lg font-bold text-white mb-4">Check-in Summary</h2>
                        {!selectedJob ? (
                            <div className="text-gray-500 text-sm text-center py-10">
                                Select a job to start
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="pb-4 border-b border-[#1F2937]">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Returning From</p>
                                    <p className="text-white font-medium">{selectedJob.title}</p>
                                    <p className="text-sm text-gray-500">{selectedJob.date}</p>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-3">
                                        <span className="text-gray-400">Returned Items</span>
                                        <span className="text-white font-bold">{scannedItems.length}</span>
                                    </div>
                                    <div className="w-full bg-[#0B0E14] h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
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

export default CheckIn;
