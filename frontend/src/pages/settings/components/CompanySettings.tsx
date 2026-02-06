import { useState, useEffect, useRef } from 'react';
import { Upload, Save, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../services/settings.service';

const CompanySettings = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        phone: '',
        email: '',
        website: '',
        logoUrl: ''
    });

    const { data: profile } = useQuery({
        queryKey: ['companyProfile'],
        queryFn: settingsApi.getCompanyProfile
    });

    useEffect(() => {
        if (profile) {
            // Only update fields that exist in state to avoid keeping old fields
            setFormData(prev => ({
                ...prev,
                companyName: profile.companyName || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                postalCode: profile.postalCode || '',
                country: profile.country || 'United States',
                phone: profile.phone || '',
                email: profile.email || '',
                website: profile.website || '',
                logoUrl: profile.logoUrl || ''
            }));
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: settingsApi.updateCompanyProfile,
        onSuccess: () => {
            alert('Company settings saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
        },
        onError: () => {
            alert('Failed to save settings.');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large. Max 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-xl font-bold text-white">Company Settings</h3>
                    <p className="text-gray-400 text-sm">Manage company information and branding</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Information */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                        <h4 className="text-base font-semibold text-white mb-6">Company Information</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            {/* RegNumber and TaxId Removed */}

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">State / Province</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Country</label>
                                    <div className="relative">
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all appearance-none"
                                        >
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>United Kingdom</option>
                                            <option>Australia</option>
                                            <option>India</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                        <h4 className="text-base font-semibold text-white mb-6">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Website</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column - Logo */}
                <div className="lg:col-span-1">
                    <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 h-full flex flex-col">
                        <h4 className="text-base font-semibold text-white mb-6">Company Logo</h4>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0E14] border-2 border-dashed border-[#1F2937] rounded-xl group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden"
                            title="Upload new logo"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleLogoUpload}
                                accept="image/*"
                                className="hidden"
                            />

                            {formData.logoUrl ? (
                                <img src={formData.logoUrl} alt="Company Logo" className="object-contain w-full h-full max-h-[150px]" />
                            ) : (
                                <>
                                    <div className="w-24 h-24 mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <span className="text-2xl font-bold text-white">LS</span>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium group-hover:text-blue-400 transition-colors">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-600 mt-2">SVG, PNG, JPG or GIF (max. 2MB)</p>
                                </>
                            )}
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-2.5 bg-[#1F2937] hover:bg-[#2C3440] text-gray-200 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Upload className="w-4 h-4" /> Upload Logo
                            </button>

                            {formData.logoUrl && (
                                <button
                                    onClick={() => setFormData(p => ({ ...p, logoUrl: '' }))}
                                    className="w-full mt-2 py-1.5 text-red-500 text-xs hover:text-red-400 transition-colors"
                                >
                                    Remove Logo
                                </button>
                            )}

                            <p className="text-xs text-center text-gray-600 mt-3">Recommended size: 512x512px</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanySettings;
