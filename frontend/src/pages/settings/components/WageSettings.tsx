import { useState } from 'react';
import { Save } from 'lucide-react';

const WageSettings = () => {
    // Mock State for roles and rates as per image
    const [rates, setRates] = useState([
        { id: 1, role: 'Technician', rate: 25 },
        { id: 2, role: 'Sound Engineer', rate: 25 },
        { id: 3, role: 'Lighting Tech', rate: 25 },
        { id: 4, role: 'Supervisor', rate: 25 },
        { id: 5, role: 'Manager', rate: 25 },
    ]);

    const [overtime, setOvertime] = useState({
        threshold: 8,
        multiplier: 1.5
    });

    const handleRateChange = (id: number, value: string) => {
        setRates(rates.map(r => r.id === id ? { ...r, rate: parseFloat(value) || 0 } : r));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-xl font-bold text-white">Wage Policy Settings</h3>
                    <p className="text-gray-400 text-sm">Configure wage rates and payment policies</p>
                </div>
                <button
                    className="bg-[#151A21] hover:bg-[#1F2937] text-gray-300 border border-[#1F2937] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Back to Settings
                </button>
            </div>

            {/* Base Wage Rates Section */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <h4 className="text-base font-semibold text-white mb-6">Base Wage Rates by Role</h4>
                <div className="space-y-4">
                    {rates.map((role) => (
                        <div key={role.id} className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium text-gray-200">{role.role}</span>
                            <div className="flex items-center gap-3">
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        value={role.rate}
                                        onChange={(e) => handleRateChange(role.id, e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-6 pr-4 py-2 text-gray-200 text-sm text-right focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <span className="text-sm text-gray-500 w-10">/hour</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overtime Policy Section */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <h4 className="text-base font-semibold text-white mb-6">Overtime Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Overtime After (hours)</label>
                        <input
                            type="number"
                            value={overtime.threshold}
                            onChange={(e) => setOvertime({ ...overtime, threshold: parseFloat(e.target.value) })}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Overtime Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={overtime.multiplier}
                            onChange={(e) => setOvertime({ ...overtime, multiplier: parseFloat(e.target.value) })}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <button
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Save className="w-4 h-4" /> Save Wage Policy
                </button>
            </div>
        </div>
    );
};

export default WageSettings;
