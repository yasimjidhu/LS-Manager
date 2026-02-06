import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ClipboardCheck, Users, Package, AlertCircle, CheckCircle2,
    Clock, Calendar, MapPin, Phone, ChevronRight,
    Activity, Briefcase, UserCheck
} from 'lucide-react';

interface AssignedJob {
    id: string;
    title: string;
    client: string;
    location: string;
    date: string;
    time: string;
    status: 'upcoming' | 'ongoing' | 'completed';
    assignedCrew: number;
    equipmentCount: number;
    checklistProgress: number;
}

interface CrewMember {
    id: string;
    name: string;
    role: string;
    phone: string;
    status: 'available' | 'on-job' | 'off-duty';
    currentJob?: string;
}

interface PendingApproval {
    id: string;
    type: 'attendance' | 'work-log' | 'equipment-return';
    employeeName: string;
    jobTitle: string;
    timestamp: string;
    details: string;
}

const SupervisorDashboard = () => {
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing'>('all');

    // Mock data - replace with actual API calls
    const { data: assignedJobs = [] } = useQuery({
        queryKey: ['supervisor-jobs'],
        queryFn: async () => {
            return [
                {
                    id: '1',
                    title: 'Corporate Annual Day',
                    client: 'Tech Solutions Pvt Ltd',
                    location: 'Leela Palace, Bangalore',
                    date: '2026-02-05',
                    time: '18:00',
                    status: 'upcoming',
                    assignedCrew: 8,
                    equipmentCount: 45,
                    checklistProgress: 60
                },
                {
                    id: '2',
                    title: 'Wedding Reception',
                    client: 'Kumar Family',
                    location: 'Taj West End',
                    date: '2026-02-02',
                    time: '19:00',
                    status: 'ongoing',
                    assignedCrew: 12,
                    equipmentCount: 67,
                    checklistProgress: 85
                },
                {
                    id: '3',
                    title: 'Product Launch Event',
                    client: 'StartupXYZ',
                    location: 'Sheraton Grand',
                    date: '2026-02-08',
                    time: '16:00',
                    status: 'upcoming',
                    assignedCrew: 6,
                    equipmentCount: 32,
                    checklistProgress: 40
                }
            ] as AssignedJob[];
        }
    });

    const { data: crewMembers = [] } = useQuery({
        queryKey: ['crew-members'],
        queryFn: async () => {
            return [
                {
                    id: '1',
                    name: 'Ramesh Kumar',
                    role: 'Lead Technician',
                    phone: '+91 98765 43210',
                    status: 'on-job',
                    currentJob: 'Wedding Reception'
                },
                {
                    id: '2',
                    name: 'Suresh Patel',
                    role: 'Sound Engineer',
                    phone: '+91 87654 32109',
                    status: 'available'
                },
                {
                    id: '3',
                    name: 'Vijay Singh',
                    role: 'Lighting Tech',
                    phone: '+91 76543 21098',
                    status: 'on-job',
                    currentJob: 'Wedding Reception'
                },
                {
                    id: '4',
                    name: 'Anil Sharma',
                    role: 'Helper',
                    phone: '+91 65432 10987',
                    status: 'available'
                }
            ] as CrewMember[];
        }
    });

    const { data: pendingApprovals = [] } = useQuery({
        queryKey: ['pending-approvals'],
        queryFn: async () => {
            return [
                {
                    id: '1',
                    type: 'work-log',
                    employeeName: 'Ramesh Kumar',
                    jobTitle: 'Wedding Reception',
                    timestamp: '2 hours ago',
                    details: 'Piece count: 45 speakers installed'
                },
                {
                    id: '2',
                    type: 'attendance',
                    employeeName: 'Vijay Singh',
                    jobTitle: 'Wedding Reception',
                    timestamp: '3 hours ago',
                    details: 'Check-in at 18:30, Check-out pending'
                },
                {
                    id: '3',
                    type: 'equipment-return',
                    employeeName: 'Suresh Patel',
                    jobTitle: 'Corporate Annual Day',
                    timestamp: '5 hours ago',
                    details: '12 items returned, verification needed'
                }
            ] as PendingApproval[];
        }
    });

    const filteredJobs = assignedJobs.filter(job =>
        filterStatus === 'all' || job.status === filterStatus
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
            case 'ongoing': return 'bg-green-600/20 text-green-400 border-green-600/30';
            case 'completed': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
            default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
        }
    };

    const getCrewStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-600/20 text-green-400 border-green-600/30';
            case 'on-job': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
            case 'off-duty': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
            default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
        }
    };

    const getApprovalIcon = (type: string) => {
        switch (type) {
            case 'attendance': return <UserCheck className="w-5 h-5" />;
            case 'work-log': return <ClipboardCheck className="w-5 h-5" />;
            case 'equipment-return': return <Package className="w-5 h-5" />;
            default: return <Activity className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl border border-orange-600/30">
                        <Briefcase className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Supervisor Dashboard</h1>
                        <p className="text-gray-400 text-sm">Manage your assigned jobs and crew</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Active Jobs</span>
                        <Briefcase className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {assignedJobs.filter(j => j.status === 'ongoing').length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Currently ongoing</div>
                </div>

                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Upcoming Jobs</span>
                        <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {assignedJobs.filter(j => j.status === 'upcoming').length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">This week</div>
                </div>

                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Available Crew</span>
                        <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {crewMembers.filter(c => c.status === 'available').length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Ready to assign</div>
                </div>

                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Pending Approvals</span>
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{pendingApprovals.length}</div>
                    <div className="text-xs text-yellow-400 mt-1">Needs attention</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Assigned Jobs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Assigned Jobs */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">My Assigned Jobs</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filterStatus === 'all'
                                        ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('upcoming')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filterStatus === 'upcoming'
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => setFilterStatus('ongoing')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filterStatus === 'ongoing'
                                        ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Ongoing
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="bg-[#0B0E14] border border-[#1F2937] rounded-lg p-4 hover:border-orange-600/50 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(job.status)}`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm">{job.client}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(job.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{job.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Users className="w-4 h-4" />
                                            <span>{job.assignedCrew} crew members</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-[#1F2937]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-400">Checklist Progress</span>
                                            <span className="text-xs font-semibold text-white">{job.checklistProgress}%</span>
                                        </div>
                                        <div className="w-full bg-[#1F2937] rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full transition-all"
                                                style={{ width: `${job.checklistProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Approvals */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Pending Approvals</h2>
                            <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded-full text-sm">
                                {pendingApprovals.length} pending
                            </span>
                        </div>

                        <div className="space-y-3">
                            {pendingApprovals.map((approval) => (
                                <div
                                    key={approval.id}
                                    className="bg-[#0B0E14] border border-[#1F2937] rounded-lg p-4 hover:border-yellow-600/50 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-600/20 rounded-lg border border-yellow-600/30">
                                            {getApprovalIcon(approval.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-white font-medium">{approval.employeeName}</h4>
                                                <span className="text-xs text-gray-400">{approval.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-1">{approval.jobTitle}</p>
                                            <p className="text-sm text-gray-300">{approval.details}</p>
                                            <div className="flex gap-2 mt-3">
                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-sm hover:bg-green-600/30 transition-all">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button className="px-3 py-1.5 bg-[#1F2937] text-gray-400 rounded-lg text-sm hover:bg-[#2A3441] transition-all">
                                                    Review
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Crew Status */}
                <div className="space-y-6">
                    {/* Crew Members */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-6">Crew Status</h2>
                        <div className="space-y-3">
                            {crewMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-[#0B0E14] border border-[#1F2937] rounded-lg p-3 hover:border-orange-600/50 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600/20 to-red-600/20 flex items-center justify-center border border-orange-600/30 flex-shrink-0">
                                            <span className="text-orange-400 font-bold text-sm">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-white font-medium text-sm truncate">{member.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs border ${getCrewStatusColor(member.status)}`}>
                                                    {member.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-1">{member.role}</p>
                                            {member.currentJob && (
                                                <p className="text-xs text-orange-400">On: {member.currentJob}</p>
                                            )}
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Phone className="w-3 h-3" />
                                                <span>{member.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-between p-3 bg-[#0B0E14] border border-[#1F2937] rounded-lg text-left hover:border-orange-600/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <ClipboardCheck className="w-5 h-5 text-orange-400" />
                                    <span className="text-white group-hover:text-orange-400 transition-colors">View Checklists</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-[#0B0E14] border border-[#1F2937] rounded-lg text-left hover:border-orange-600/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-orange-400" />
                                    <span className="text-white group-hover:text-orange-400 transition-colors">Manage Crew</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-[#0B0E14] border border-[#1F2937] rounded-lg text-left hover:border-orange-600/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-orange-400" />
                                    <span className="text-white group-hover:text-orange-400 transition-colors">Equipment Status</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-[#0B0E14] border border-[#1F2937] rounded-lg text-left hover:border-orange-600/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-orange-400" />
                                    <span className="text-white group-hover:text-orange-400 transition-colors">Daily Reports</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupervisorDashboard;
