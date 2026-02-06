import { useState } from 'react';
import { Building2, CreditCard, Wallet, Shield, ChevronRight, Settings as SettingsIcon, Users, Server, Package } from 'lucide-react';
import CompanySettings from './components/CompanySettings';
import PaymentSettings from './components/PaymentSettings';
import WageSettings from './components/WageSettings';
import WagePolicies from './components/WagePolicies';
import InventorySettings from './components/InventorySettings';
import SystemRules from './components/SystemRules';
import UserManagement from './components/UserManagement';
import { cn } from '../../lib/utils';
import { usePermissions } from '../../hooks/usePermissions';
import { settingsSections } from '../../config/permissions';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: { title: string, value: string, subtext: string, icon: any, colorClass: string }) => (
    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 relative overflow-hidden group hover:border-[#374151] transition-all">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div>
            <h4 className="text-gray-400 text-sm font-medium mb-1">{title}</h4>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <p className="text-xs text-gray-500">{subtext}</p>
        </div>
    </div>
);

const SettingCard = ({ title, description, icon: Icon, onClick, colorClass }: { title: string, description: string, icon: any, onClick: () => void, colorClass: string }) => (
    <button onClick={onClick} className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 text-left group hover:border-blue-500/50 hover:bg-[#1A1F26] transition-all relative overflow-hidden">
        <div className={`p-3 rounded-lg w-fit mb-4 ${colorClass} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </div>
    </button>
);

const SystemInfoRow = ({ label, value, status }: { label: string, value?: string, status?: string }) => (
    <div className="flex justify-between items-center py-3 border-b border-[#1F2937] last:border-0">
        <span className="text-sm text-gray-400">{label}</span>
        <div className="flex items-center gap-3">
            {status && (
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    status === 'Connected' ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-400"
                )}>
                    {status}
                </span>
            )}
            {value && <span className="text-sm text-white font-medium">{value}</span>}
        </div>
    </div>
);

// Icon mapping
const iconMap: Record<string, any> = {
    Building2,
    CreditCard,
    Wallet,
    Package,
    Users,
    Shield,
};

const Settings = () => {
    const [activeView, setActiveView] = useState<string | null>(null);
    const { hasAnyPermission } = usePermissions();

    // Filter settings sections based on user permissions
    const allowedSections = settingsSections.filter(section =>
        hasAnyPermission(section.requiredPermissions)
    );

    const renderActiveView = () => {
        const BackButton = () => (
            <button
                onClick={() => setActiveView(null)}
                className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Settings
            </button>
        );

        switch (activeView) {
            case 'company': return <><BackButton /><CompanySettings /></>;
            case 'payment': return <><BackButton /><PaymentSettings /></>;
            case 'wage': return <><BackButton /><WageSettings /></>;
            case 'wage-policies': return <><BackButton /><WagePolicies /></>;
            case 'inventory': return <><BackButton /><InventorySettings /></>;
            case 'users': return <><BackButton /><UserManagement /></>;
            case 'system': return <><BackButton /><SystemRules /></>;
            default: return null;
        }
    };

    if (activeView) {
        return (
            <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
                {renderActiveView()}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage system configuration and preferences</p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Active Users"
                    value="42"
                    subtext="Across 5 roles"
                    icon={Users}
                    colorClass="bg-blue-500"
                />
                <StatCard
                    title="System Version"
                    value="v2.4.1"
                    subtext="Last updated: Jan 15"
                    icon={Server}
                    colorClass="bg-emerald-500"
                />
                <StatCard
                    title="Configuration"
                    value="87%"
                    subtext="Setup completed"
                    icon={SettingsIcon}
                    colorClass="bg-purple-500"
                />
            </div>

            {/* Settings Grid - Only show allowed sections */}
            {allowedSections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {allowedSections.map((section) => {
                        const Icon = iconMap[section.icon] || Shield;
                        return (
                            <SettingCard
                                key={section.id}
                                title={section.title}
                                description={section.description}
                                icon={Icon}
                                colorClass={section.colorClass}
                                onClick={() => setActiveView(section.id)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-12 text-center">
                    <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Settings Available</h3>
                    <p className="text-gray-400">You don't have permission to access any settings sections.</p>
                </div>
            )}

            {/* System Info Footer */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div>
                        <SystemInfoRow label="Database Status" status="Connected" />
                        <SystemInfoRow label="Last Backup" value="Jan 30, 2026 02:00 AM" />
                    </div>
                    <div>
                        <SystemInfoRow label="Storage Used" value="2.4 GB / 50 GB" />
                        <SystemInfoRow label="License Type" value="Enterprise" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
