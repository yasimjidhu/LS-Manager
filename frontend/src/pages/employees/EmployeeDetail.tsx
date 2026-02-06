import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, User, Briefcase, Calendar, DollarSign,
    Mail, Phone, Shield, CheckCircle, XCircle, Edit
} from 'lucide-react';
import { employeeApi } from '../../services/employee.service';

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    const { data: employee, isLoading } = useQuery({
        queryKey: ['employee', id],
        queryFn: () => employeeApi.getOne(id!)
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="text-white">Loading employee details...</div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="text-white">Employee not found</div>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'jobs', label: 'Job History', icon: Briefcase },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'wages', label: 'Wage History', icon: DollarSign }
    ];

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/employees')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Employees
                    </button>
                    <button
                        onClick={() => navigate(`/employees/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
                    >
                        <Edit className="w-4 h-4" /> Edit Employee
                    </button>
                </div>

                {/* Employee Header Card */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                            {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-white">{employee.firstName} {employee.lastName}</h1>
                                {employee.user?.isActive ? (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
                                        <CheckCircle className="w-3.5 h-3.5" /> Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-semibold">
                                        <XCircle className="w-3.5 h-3.5" /> Blocked
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{employee.user?.email || 'No email'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm">{employee.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-sm font-semibold text-blue-400">{employee.user?.role || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl overflow-hidden">
                    <div className="flex border-b border-[#1F2937]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${activeTab === tab.id
                                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Personal Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Full Name</p>
                                                <p className="text-white font-medium">{employee.firstName} {employee.lastName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="text-white">{employee.phone || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-white">{employee.user?.email || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Employment Details</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Role</p>
                                                <p className="text-blue-400 font-semibold">{employee.user?.role || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Wage Model</p>
                                                <p className="text-white">{employee.wageModel.replace('_', ' ')}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Base Wage</p>
                                                <p className="text-green-400 font-semibold">₹{Number(employee.baseWage).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {employee.skills && employee.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {employee.skills.map((skill: string) => (
                                                <span key={skill} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Jobs Tab */}
                        {activeTab === 'jobs' && (
                            <div>
                                {(() => {
                                    const jobHistory = [
                                        ...(employee.assignments || []).map((a: any) => ({
                                            id: a.id,
                                            title: a.event?.name || 'Event Assignment',
                                            role: a.role || 'Staff',
                                            date: a.createdAt,
                                            type: 'Event'
                                        })),
                                        ...(employee.jobRequests || []).map((req: any) => ({
                                            id: req.id,
                                            title: req.job?.title || 'Job Assignment',
                                            role: 'Assigned Worker',
                                            date: req.createdAt,
                                            type: 'Job'
                                        }))
                                    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                    return jobHistory.length > 0 ? (
                                        <div className="space-y-3">
                                            {jobHistory.map((item: any) => (
                                                <div key={item.id} className="bg-[#0B0E14] border border-[#1F2937] rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold text-white">{item.title}</p>
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-[#1F2937] text-gray-400 rounded border border-[#374151]">
                                                                    {item.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-400">{item.role}</p>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(item.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            No job assignments yet
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Attendance Tab */}
                        {activeTab === 'attendance' && (
                            <div>
                                {employee.attendance && employee.attendance.length > 0 ? (
                                    <div className="space-y-3">
                                        {employee.attendance.map((record: any) => (
                                            <div key={record.id} className="bg-[#0B0E14] border border-[#1F2937] rounded-lg p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium">{new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    <p className="text-sm text-gray-400">Status: {record.status}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'PRESENT' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    record.status === 'ABSENT' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        No attendance records yet
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wages Tab */}
                        {activeTab === 'wages' && (
                            <div>
                                {employee.wages && employee.wages.length > 0 ? (
                                    <div className="space-y-3">
                                        {employee.wages.map((wage: any) => (
                                            <div key={wage.id} className="bg-[#0B0E14] border border-[#1F2937] rounded-lg p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium">₹{Number(wage.amount).toFixed(2)}</p>
                                                    <p className="text-sm text-gray-400">{new Date(wage.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className="text-xs text-gray-500">{wage.type || 'Payment'}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        No wage records yet
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeDetail;
