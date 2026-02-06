import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, User, Lock, DollarSign, CheckCircle } from 'lucide-react';
import { employeeApi } from '../../services/employee.service';
import { useAlert } from '../../components/ui';

const CreateEmployee = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const alert = useAlert();
    const [step, setStep] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        skills: [] as string[],
        email: '',
        password: '',
        role: 'EMPLOYEE' as 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE',
        wageModel: 'FIXED' as 'FIXED' | 'PIECE_RATE' | 'PERCENTAGE',
        baseWage: 0
    });

    const [skillInput, setSkillInput] = useState('');

    const createMutation = useMutation({
        mutationFn: employeeApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert.success('Employee Created!', 'The employee has been added successfully.');
            navigate('/employees');
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create employee';
            alert.error('Creation Failed', errorMessage);
        }
    });

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    const handleSubmit = () => {
        createMutation.mutate(formData);
    };

    const canProceed = () => {
        if (step === 1) return formData.firstName && formData.lastName && formData.phone;
        if (step === 2) return formData.email && formData.password;
        if (step === 3) {
            if (formData.wageModel === 'PIECE_RATE') return true;
            return formData.baseWage > 0;
        }
        return false;
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-6">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Add New Employee</h1>
                        <p className="text-gray-400 text-sm">Create employee profile and system access</p>
                    </div>
                    <button
                        onClick={() => navigate('/employees')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancel
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8">
                    {[
                        { num: 1, label: 'Basic Info', icon: User },
                        { num: 2, label: 'System Access', icon: Lock },
                        { num: 3, label: 'Wage Settings', icon: DollarSign }
                    ].map((s, idx) => (
                        <div key={s.num} className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= s.num ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-[#151A21] text-gray-500 border border-[#1F2937]'}`}>
                                <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-[#0B0E14] font-bold text-xs">
                                    {s.num}
                                </div>
                                <s.icon className="w-4 h-4" />
                                <span className="text-sm font-semibold">{s.label}</span>
                            </div>
                            {idx < 2 && <div className="w-8 h-[1px] bg-gray-800" />}
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">First Name *</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Last Name *</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Skills</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                        className="flex-1 bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                        placeholder="e.g., Sound Engineering"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: System Access */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white mb-4">System Access</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                    placeholder="john.doe@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.role === 'ADMIN' && 'Full system access'}
                                    {formData.role === 'SUPERVISOR' && 'Can manage jobs and employees'}
                                    {formData.role === 'EMPLOYEE' && 'Basic access to assigned jobs'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Wage Settings */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Wage Settings</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Wage Model *</label>
                                <select
                                    value={formData.wageModel}
                                    onChange={(e) => setFormData({ ...formData, wageModel: e.target.value as any, baseWage: 0 })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="FIXED">Fixed Daily Rate</option>
                                    <option value="PIECE_RATE">Piece Rate</option>
                                    <option value="PERCENTAGE">Percentage</option>
                                </select>
                            </div>

                            {formData.wageModel !== 'PIECE_RATE' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        {formData.wageModel === 'FIXED' ? 'Fixed Daily Wage (₹) *' : 'Percentage Share (%) *'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.baseWage}
                                        onChange={(e) => setFormData({ ...formData, baseWage: Number(e.target.value) })}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                        placeholder={formData.wageModel === 'FIXED' ? "800" : "10"}
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.wageModel === 'FIXED' && 'Daily rate in rupees'}
                                        {formData.wageModel === 'PERCENTAGE' && 'Percentage of job value'}
                                    </p>
                                </div>
                            )}

                            {formData.wageModel === 'PIECE_RATE' && (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Piece Rate Selected</span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Wages will be calculated based on the global item rates and shared among workers for each job. No base wage is required.
                                    </p>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="bg-[#0B0E14] border border-[#1F2937] rounded-lg p-4 mt-6">
                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="text-white font-medium">{formData.firstName} {formData.lastName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="text-white">{formData.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Role:</span>
                                        <span className="text-blue-400 font-medium">{formData.role}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Wage:</span>
                                        <span className="text-green-400 font-medium">₹{formData.baseWage} ({formData.wageModel.replace('_', ' ')})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#1F2937]">
                        <button
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-6 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!canProceed() || createMutation.isPending}
                                className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-lg shadow-green-900/20 transition-all"
                            >
                                {createMutation.isPending ? 'Creating...' : 'Create Employee'}
                                {!createMutation.isPending && <CheckCircle className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CreateEmployee;
