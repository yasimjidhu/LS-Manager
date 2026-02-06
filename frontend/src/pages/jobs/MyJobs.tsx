import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Box, CheckCircle2, Clock, AlertCircle, Users, UserPlus, Check, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { JobsService } from '../../services/jobs.service';
import { JobRequestsService } from '../../services/job-requests.service';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useState } from 'react';
import api from '../../services/api';
import { useAlert, useConfirm } from '../../components/ui';
import JobDiscussionHub from './components/JobDiscussionHub';

const StatCard = ({
    title,
    value,
    icon: Icon,
    color
}: {
    title: string;
    value: string;
    icon: any;
    color: string;
}) => {
    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-gray-400 mb-0.5">{title}</p>
                <h3 className="text-xl font-bold text-white">{value}</h3>
            </div>
            <div className={cn("p-2 rounded-lg bg-opacity-10", color.replace('text-', 'bg-'))}>
                <Icon className={cn("w-5 h-5", color)} />
            </div>
        </div>
    );
};

// Helper to count approved crew
const getCrewProgress = (job: any) => {
    const approvedCount = job.requests?.filter((r: any) => r.status === 'APPROVED').length || 0;
    const required = job.requiredWorkers || 1; // Default to 1 to avoid /0
    const isFull = approvedCount >= required;
    const percentage = Math.min((approvedCount / required) * 100, 100);
    return { approvedCount, required, isFull, percentage };
};

const JobCard = ({ job, onStatusUpdate, onViewDetails, onRequestJoin, user }: { job: any; onStatusUpdate: (id: string, status: string) => void; onViewDetails: (job: any) => void; onRequestJoin: (id: string) => void; user?: any }) => {
    // Robust date formatting helper
    const formatDate = (dateString: string) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };



    // Crew Progress
    const { approvedCount, required, isFull, percentage } = getCrewProgress(job);

    // Find if current user has a request
    const myRequest = job.requests?.find((r: any) =>
        (user?.employee?.id && r.employeeId === user.employee.id) ||
        (r.employee?.userId === user?.id)
    );

    // Fallback if startDate is missing but date exists (backward compatibility)
    const displayStartDate = job.startDate || job.date;

    return (
        <div className={cn(
            "bg-[#151A21] border rounded-xl p-5 transition-all group flex flex-col h-full relative overflow-hidden",
            myRequest ? "border-cyan-500/30 bg-cyan-950/5" : "border-[#1F2937] hover:border-gray-600"
        )}>
            {/* Status Indicators in Top Right */}
            <div className="absolute top-0 right-0 flex flex-col items-end">
                {job.status === 'COMPLETED' && (
                    <div className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider mb-0.5">
                        COMPLETED
                    </div>
                )}

                {myRequest && !((job.status === 'COMPLETED' && myRequest.status === 'APPROVED')) && (
                    <div className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider",
                        myRequest.status === 'APPROVED' ? "bg-cyan-600 text-white" : // If joined but not completed (or if completed logic handles it)
                            myRequest.status === 'REJECTED' ? "bg-red-600 text-white" :
                                "bg-cyan-600 text-white"
                    )}>
                        {myRequest.status === 'APPROVED' ? 'JOINED' :
                            myRequest.status === 'REJECTED' ? 'REJECTED' : 'APPLIED'}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-12">
                    <h3 className="text-base font-bold text-white truncate">{job.title}</h3>
                    <p className="text-xs text-gray-400 truncate">{job.client}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0B0E14] rounded-md border border-[#1F2937]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(displayStartDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0B0E14] rounded-md border border-[#1F2937]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[100px]">{job.location}</span>
                </div>
            </div>



            {/* Crew Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1.5">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Crew Capacity</span>
                    <span className={cn(isFull ? "text-red-400" : "text-emerald-400")}>
                        {approvedCount} / {required}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-[#0B0E14] rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500", isFull ? "bg-red-500" : "bg-emerald-500")}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {job.description && (
                <p className="text-gray-500 text-xs mb-4 line-clamp-2 flex-grow">
                    {job.description}
                </p>
            )}

            <div className="pt-4 mt-auto border-t border-[#1F2937] flex gap-2">
                {user?.role !== 'EMPLOYEE' && (job.status === 'PLANNED' || job.status === 'PENDING') && (
                    <button
                        onClick={() => onStatusUpdate(job.id, 'ONGOING')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Start
                    </button>
                )}

                {user?.role !== 'EMPLOYEE' && job.status === 'ONGOING' && (
                    <button
                        onClick={() => onStatusUpdate(job.id, 'COMPLETED')}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        Mark Complete
                    </button>
                )}

                {user?.role === 'EMPLOYEE' && (job.status === 'PLANNED' || job.status === 'PENDING') && (
                    <>
                        {!myRequest ? (
                            <button
                                onClick={() => onRequestJoin(job.id)}
                                disabled={isFull}
                                className={cn(
                                    "flex-1 py-2 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2",
                                    isFull
                                        ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                                        : "bg-cyan-600 hover:bg-cyan-500"
                                )}
                            >
                                {isFull ? (
                                    <>Full <XCircle className="w-3.5 h-3.5" /></>
                                ) : (
                                    <><UserPlus className="w-3.5 h-3.5" /> Request</>
                                )}
                            </button>
                        ) : (
                            myRequest.status === 'REJECTED' ? (
                                <div className="flex-1 flex flex-col gap-1">
                                    <button disabled className="w-full py-2 bg-red-900/50 text-red-500 text-xs font-bold rounded-lg cursor-not-allowed border border-red-900 flex items-center justify-center">
                                        Rejected
                                    </button>
                                    {myRequest.rejectionReason && (
                                        <p className="text-[10px] text-red-400 text-center px-1 leading-tight line-clamp-2" title={myRequest.rejectionReason}>
                                            "{myRequest.rejectionReason}"
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <button
                                    disabled
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded-lg cursor-not-allowed border flex items-center justify-center gap-2",
                                        myRequest.status === 'APPROVED' ? "bg-emerald-900/50 text-emerald-500 border-emerald-900" :
                                            "bg-gray-700 text-gray-400 border-gray-600"
                                    )}
                                >
                                    {myRequest.status === 'APPROVED' && <Check className="w-3.5 h-3.5" />}
                                    {myRequest.status === 'APPROVED' ? 'Joined' : 'Requested'}
                                </button>
                            )
                        )}
                    </>
                )}

                <button
                    onClick={() => onViewDetails(job)}
                    className="px-3 py-2 bg-[#0B0E14] hover:bg-[#1F2937] border border-[#1F2937] text-gray-400 text-xs font-medium rounded-lg transition-colors"
                >
                    Details
                </button>
            </div>
        </div>
    );
}

const MyJobs = () => {
    const queryClient = useQueryClient();
    const { user } = useSelector((state: RootState) => state.auth);
    const alert = useAlert();
    const { confirm } = useConfirm();
    const [selectedJob, setSelectedJob] = useState<any>(null);

    // Employee specific View Mode
    const [viewMode, setViewMode] = useState<'BROWSE' | 'APPLICATIONS' | 'SCHEDULE'>('BROWSE');

    // Filters
    const [dateFilter, setDateFilter] = useState<string>('');

    const { data: jobsData, isLoading, error } = useQuery({
        queryKey: ['my-jobs'],
        queryFn: () => JobsService.getAll({ limit: 1000 })
    });

    // Extract jobs safely from paginated response
    const jobs = jobsData?.data || [];

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            JobsService.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
            alert.success('Status Updated', 'Job status has been updated successfully.');
        },
        onError: (err: any) => {
            alert.error('Update Failed', err?.response?.data?.message || 'Failed to update job status');
        }
    });

    const requestJoinMutation = useMutation({
        mutationFn: (jobId: string) => api.post(`/job-requests/${jobId}`, {}),
        onSuccess: () => {
            alert.success('Request Sent!', 'Your request has been sent to the supervisor for approval.');
            queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
        },
        onError: (err: any) => {
            alert.error('Request Failed', err?.response?.data?.message || 'Failed to send request. You may have already requested this job.');
        }
    });

    const handleStatusUpdate = async (id: string, status: string) => {
        const confirmed = await confirm({
            title: 'Update Job Status',
            message: `Are you sure you want to change the job status to ${status}?`,
            confirmText: 'Update',
            cancelText: 'Cancel',
            type: 'info'
        });

        if (confirmed) {
            updateStatusMutation.mutate({ id, status });
        }
    };

    const handleRequestJoin = async (id: string) => {
        const confirmed = await confirm({
            title: 'Request to Join Team',
            message: 'Would you like to request to join this job team? Supervisor approval is required.',
            confirmText: 'Send Request',
            cancelText: 'Cancel',
            type: 'info'
        });

        if (confirmed) {
            requestJoinMutation.mutate(id);
        }
    };

    // Filter Logic
    const filteredJobs = jobs?.filter((job: any) => {
        // 1. Basic Filters
        let matchesDate = true;
        if (dateFilter) {
            const jobDate = job.startDate || job.date;
            matchesDate = jobDate === dateFilter;
        }
        if (!matchesDate) return false;

        // 2. View Mode Filters (Only for Employees)
        if (user?.role === 'EMPLOYEE') {
            const currentUser = user as any;
            const myRequest = job.requests?.find((r: any) =>
                (currentUser?.employee?.id && r.employeeId === currentUser.employee.id) ||
                (r.employee?.userId === user?.id)
            );

            if (viewMode === 'BROWSE') {
                // Show jobs I haven't joined/requested AND that are available
                // Actually, maybe show all valid upcoming jobs?
                // User said "understand which are available".
                // Let's hide ones I'm already part of to avoid clutter, or show them?
                // Let's show jobs NOT in my schedule/applications to keep "Browse" purely for "New"
                return !myRequest && (job.status === 'PLANNED' || job.status === 'PENDING');
            }
            if (viewMode === 'APPLICATIONS') {
                return myRequest && (myRequest.status === 'PENDING' || myRequest.status === 'REJECTED');
            }
            if (viewMode === 'SCHEDULE') {
                return myRequest && myRequest.status === 'APPROVED';
            }
        }

        return true;
    }) || [];

    // Calculate stats (General stats, maybe less relevant for Employee specific views but good to keep)
    const stats = {
        planned: jobs?.filter((j: any) => j.status === 'PLANNED').length || 0,
        ongoing: jobs?.filter((j: any) => j.status === 'ONGOING').length || 0,
        completed: jobs?.filter((j: any) => j.status === 'COMPLETED').length || 0,
        total: jobs?.length || 0
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="text-white animate-pulse">Loading jobs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-white">Failed to load jobs</p>
                </div>
            </div>
        );
    }

    const headerText = user?.role === 'ADMIN' ? 'All Scheduled Jobs' :
        user?.role === 'SUPERVISOR' ? 'Team Jobs Overview' :
            'Job Opportunities';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{headerText}</h1>
                    <p className="text-gray-400 text-sm">
                        {user?.role === 'EMPLOYEE' ? 'Find and manage your work schedule' : 'Manage company events'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="date"
                            className="bg-[#151A21] border border-[#1F2937] text-gray-300 text-sm rounded-lg block w-full pl-3 pr-10 py-2.5 outline-none focus:border-cyan-500 transition-colors"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        {dateFilter && (
                            <button onClick={() => setDateFilter('')} className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-3 h-3" /></button>
                        )}
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Employee View Mode Tabs */}
            {user?.role === 'EMPLOYEE' && (
                <div className="flex p-1 bg-[#151A21] border border-[#1F2937] rounded-xl w-full max-w-md">
                    <button
                        onClick={() => setViewMode('BROWSE')}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                            viewMode === 'BROWSE' ? "bg-cyan-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Browse Openings
                    </button>
                    <button
                        onClick={() => setViewMode('APPLICATIONS')}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                            viewMode === 'APPLICATIONS' ? "bg-cyan-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        My Applications
                    </button>
                    <button
                        onClick={() => setViewMode('SCHEDULE')}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                            viewMode === 'SCHEDULE' ? "bg-cyan-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        My Schedule
                    </button>
                </div>
            )}

            {/* Quick Stats Row - Hide for Employee if in specific modes? Or keep for overview */}
            {user?.role !== 'EMPLOYEE' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Assigned" value={stats.total.toString()} icon={Box} color="text-gray-400" />
                    <StatCard title="Pending Start" value={stats.planned.toString()} icon={Clock} color="text-blue-500" />
                    <StatCard title="In Progress" value={stats.ongoing.toString()} icon={MapPin} color="text-amber-500" />
                    <StatCard title="Completed" value={stats.completed.toString()} icon={CheckCircle2} color="text-emerald-500" />
                </div>
            )}

            {/* Content Grid */}
            <div className="mt-4">
                {filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredJobs.map((job: any) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onStatusUpdate={handleStatusUpdate}
                                onViewDetails={setSelectedJob}
                                onRequestJoin={handleRequestJoin}
                                user={user}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-12 text-center h-[400px] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-[#1F2937] rounded-full flex items-center justify-center mb-4">
                            <Box className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-white font-medium mb-1">
                            {viewMode === 'BROWSE' ? 'No Jobs Available' :
                                viewMode === 'APPLICATIONS' ? 'No Pending Applications' :
                                    viewMode === 'SCHEDULE' ? 'Make sure your approved' : 'No jobs found'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {viewMode === 'BROWSE' ? 'Check back later for new opportunities.' : 'Status updates will appear here.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    );
};
const JobDetailsModal = ({ job, onClose }: { job: any; onClose: () => void }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const queryClient = useQueryClient();
    const alert = useAlert();
    const { confirm } = useConfirm();
    const [activeTab, setActiveTab] = useState<'details' | 'requests' | 'discussion'>('details');

    const { data: requests = [] } = useQuery({
        queryKey: ['job-requests', job?.id],
        queryFn: () => JobRequestsService.getAll(job?.id),
        enabled: !!job && (user?.role === 'ADMIN' || user?.role === 'SUPERVISOR')
    });

    const approveMutation = useMutation({
        mutationFn: JobRequestsService.approve,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-requests', job?.id] });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => JobRequestsService.reject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-requests', job?.id] });
        }
    });

    const handleReject = async (id: string) => {
        const confirmed = await confirm({
            title: 'Reject Request',
            message: 'Are you sure you want to reject this request? This action cannot be undone.',
            confirmText: 'Reject',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (confirmed) {
            // For now, using a simple reason. In a real app, you'd want a custom modal with textarea
            const reason = 'Request rejected by supervisor';
            rejectMutation.mutate({ id, reason });
            alert.info('Request Rejected', 'The employee will be notified.');
        }
    };

    if (!job) return null;

    const showRequestsTab = (user?.role === 'ADMIN' || user?.role === 'SUPERVISOR');
    const pendingRequests = requests.filter((r: any) => r.status === 'PENDING');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                <div className="p-6 pb-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-[#1F2937] rounded-lg transition-colors text-gray-400 z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="mb-4 pr-8">
                        <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
                        <p className="text-gray-400">{job.client}</p>
                    </div>

                    {showRequestsTab && (
                        <div className="flex gap-4 border-b border-[#1F2937]">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'details' ? "text-cyan-500" : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                Details
                                {activeTab === 'details' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-t-full"></span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative flex items-center gap-2",
                                    activeTab === 'requests' ? "text-cyan-500" : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                Requests
                                {pendingRequests.length > 0 && (
                                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">
                                        {pendingRequests.length}
                                    </span>
                                )}
                                {activeTab === 'requests' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-t-full"></span>}
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setActiveTab('discussion')}
                        className={cn(
                            "pb-3 text-sm font-medium transition-colors relative flex items-center gap-2",
                            activeTab === 'discussion' ? "text-cyan-500" : "text-gray-400 hover:text-gray-300"
                        )}
                    >
                        Discussion
                        {activeTab === 'discussion' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-t-full"></span>}
                    </button>
                </div>

                <div className={cn(
                    "p-6 flex-1 flex flex-col min-h-0",
                    activeTab !== 'discussion' ? "overflow-y-auto" : "overflow-hidden"
                )}>
                    {activeTab === 'details' ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-[#0B0E14] rounded-xl border border-[#1F2937]">
                                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Timeframe</p>
                                    <p className="text-white text-sm font-medium">
                                        {(() => {
                                            const start = new Date(job.startDate || job.date);
                                            const end = job.endDate ? new Date(job.endDate) : null;
                                            const isValidStart = !isNaN(start.getTime());
                                            const isValidEnd = end && !isNaN(end.getTime());

                                            if (!isValidStart) return 'Date TBD';

                                            const startStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

                                            if (isValidEnd && end && end.getTime() !== start.getTime()) {
                                                const endStr = end.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                                                return `${startStr} - ${endStr}`;
                                            }

                                            return startStr;
                                        })()}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-0.5">
                                        Duration: {job.duration ? job.duration : '1 day'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-[#0B0E14] rounded-xl border border-[#1F2937]">
                                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</p>
                                    <p className="text-white text-sm">{job.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-[#0B0E14] rounded-xl border border-[#1F2937]">
                                <Users className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Team</p>
                                    <p className="text-white text-sm">{job.requiredWorkers || 5} Crew Members Required</p>
                                </div>
                            </div>

                            {job.description && (
                                <div className="flex items-start gap-4 p-4 bg-[#0B0E14] rounded-xl border border-[#1F2937]">
                                    <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                                        <p className="text-gray-300 text-sm leading-relaxed">{job.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'requests' ? (
                        <div className="space-y-3">
                            {requests.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p>No requests found for this job.</p>
                                </div>
                            ) : (
                                requests.map((req: any) => (
                                    <div key={req.id} className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                {req.employee?.firstName?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium text-sm">
                                                    {req.employee?.firstName} {req.employee?.lastName}
                                                </h4>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            {req.status === 'PENDING' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => approveMutation.mutate(req.id)}
                                                        className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded hover:bg-emerald-500/30 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={cn(
                                                    "text-xs px-2 py-1 rounded font-medium",
                                                    req.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {req.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            <JobDiscussionHub jobId={job.id} />
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0 mt-auto flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#1F2937] hover:bg-[#374151] text-white rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


export default MyJobs;
