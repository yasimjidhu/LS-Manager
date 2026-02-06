import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { employeeApi } from '../../services/employee.service';

const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: employee, isLoading } = useQuery({
        queryKey: ['employee', id],
        queryFn: () => employeeApi.getOne(id!)
    });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        skills: [] as string[],
        email: '',
        wageModel: 'FIXED' as 'FIXED' | 'PIECE_RATE' | 'PERCENTAGE',
        baseWage: 0,
        role: 'EMPLOYEE' as 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE',
        isActive: true
    });

    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.firstName,
                lastName: employee.lastName,
                phone: employee.phone || '',
                skills: employee.skills || [],
                email: employee.user?.email || '',
                wageModel: employee.wageModel,
                baseWage: Number(employee.baseWage),
                role: employee.user?.role || 'EMPLOYEE',
                isActive: employee.user?.isActive ?? true
            });
        }
    }, [employee]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => employeeApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employee', id] });
            alert('Employee updated successfully!');
            navigate(`/employees/${id}`);
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update employee';
            alert(`Error: ${errorMessage}`);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-6">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Edit Employee</h1>
                        <p className="text-gray-400 text-sm">Update employee information</p>
                    </div>
                    <button
                        onClick={() => navigate(`/employees/${id}`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancel
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 space-y-6">

                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">First Name *</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name *</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Skills</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                    className="flex-1 bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                    placeholder="Add a skill"
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
                                            type="button"
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

                    {/* System Access */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">System Access</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-300">
                                    Account Active
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Wage Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Wage Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Wage Model</label>
                                <select
                                    value={formData.wageModel}
                                    onChange={(e) => setFormData({ ...formData, wageModel: e.target.value as any })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="FIXED">Fixed Daily Rate</option>
                                    <option value="PIECE_RATE">Piece Rate</option>
                                    <option value="PERCENTAGE">Percentage</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Base Wage (₹)</label>
                                <input
                                    type="number"
                                    value={formData.baseWage}
                                    onChange={(e) => setFormData({ ...formData, baseWage: Number(e.target.value) })}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t border-[#1F2937]">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-lg shadow-blue-900/20 transition-all"
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            {!updateMutation.isPending && <Save className="w-5 h-5" />}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default EditEmployee;
