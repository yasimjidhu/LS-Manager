import { useState, useEffect } from 'react';
import { Save, Loader2, Clock, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../services/settings.service';
import { useAlert } from '../../../components/ui';
import { useTranslation } from '../../../i18n';
import LanguageSwitcher from '../../../components/settings/LanguageSwitcher';

const SystemRules = () => {
    const queryClient = useQueryClient();
    const alert = useAlert();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        workingDayStart: '09:00',
        workingDayEnd: '18:00',
        overtimeEnabled: true,
        overtimeThreshold: 8,
        attendanceGracePeriod: 15
    });

    const { data: settings, isLoading } = useQuery({
        queryKey: ['systemSettings'],
        queryFn: settingsApi.getSystemSettings
    });

    useEffect(() => {
        if (settings) {
            setFormData(prev => ({
                ...prev,
                currency: settings.currency || 'INR',
                timezone: settings.timezone || 'Asia/Kolkata',
                dateFormat: settings.dateFormat || 'DD/MM/YYYY',
                workingDayStart: settings.workingDayStart || '09:00',
                workingDayEnd: settings.workingDayEnd || '18:00',
                overtimeEnabled: settings.overtimeEnabled ?? true,
                overtimeThreshold: settings.overtimeThreshold || 8,
                attendanceGracePeriod: settings.attendanceGracePeriod || 15
            }));
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: settingsApi.updateSystemSettings,
        onSuccess: () => {
            alert.success(
                t('alerts.operationSuccessful'),
                'System rules saved successfully!'
            );
            queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
        },
        onError: () => {
            alert.error(
                t('alerts.operationFailed'),
                'Failed to save system rules.'
            );
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const type = target.type;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (target as HTMLInputElement).checked :
                type === 'number' ? Number(value) : value
        }));
    };

    const handleSave = () => {
        updateMutation.mutate(formData as any);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-xl font-bold text-white">{t('settings.systemSettings')}</h3>
                    <p className="text-gray-400 text-sm">{t('settings.configureSystem')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('common.save')}
                </button>
            </div>

            {/* Language Switcher - First Section */}
            <LanguageSwitcher />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Working Hours */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Clock className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h4 className="text-base font-semibold text-white">Working Hours</h4>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Start Time</label>
                                <input
                                    type="time"
                                    name="workingDayStart"
                                    value={formData.workingDayStart}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">End Time</label>
                                <input
                                    type="time"
                                    name="workingDayEnd"
                                    value={formData.workingDayEnd}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#1F2937]">
                            <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Attendance Rules</label>

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-300">Grace Period (Minutes)</span>
                                <input
                                    type="number"
                                    name="attendanceGracePeriod"
                                    value={formData.attendanceGracePeriod}
                                    onChange={handleChange}
                                    className="w-24 bg-[#0B0E14] border border-[#1F2937] rounded-lg px-3 py-1.5 text-gray-200 text-sm text-right focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Employees checking in after start time + grace period will be marked "Late".
                            </p>
                        </div>
                    </div>
                </div>

                {/* Overtime Rules */}
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                        </div>
                        <h4 className="text-base font-semibold text-white">Overtime Rules</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-200">Enable Overtime Tracking</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="overtimeEnabled"
                                    checked={formData.overtimeEnabled}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {formData.overtimeEnabled && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Overtime Threshold (Hours)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        name="overtimeThreshold"
                                        value={formData.overtimeThreshold}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                    />
                                    <span className="text-sm text-gray-500">hours / day</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Work hours exceeding this threshold will be flagged as overtime.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SystemRules;
