import { useState } from 'react';
import { Save, FileText, Receipt, Percent, DollarSign } from 'lucide-react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { settingsApi } from '../../../services/settings.service';

const InvoiceSettings = () => {
    // Mock State for now
    const [invoiceSettings, setInvoiceSettings] = useState({
        prefix: 'INV-',
        nextNumber: 1001,
        defaultTaxRate: 18,
        currencySymbol: '$',
        footerText: 'Thank you for your business!',
        termsAndConditions: 'Payment is due within 15 days.'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInvoiceSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-xl font-bold text-white">Invoice Settings</h3>
                    <p className="text-gray-400 text-sm">Customize your invoice preferences</p>
                </div>
                {/* Save button will be at bottom as per other forms, but kept consistent in flow */}
            </div>

            {/* General Info */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <h4 className="text-base font-semibold text-white mb-6">General Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Invoice Prefix</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                name="prefix"
                                value={invoiceSettings.prefix}
                                onChange={handleChange}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Next Invoice Number</label>
                        <div className="relative">
                            <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="number"
                                name="nextNumber"
                                value={invoiceSettings.nextNumber}
                                onChange={handleChange}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax & Currency */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <h4 className="text-base font-semibold text-white mb-6">Tax & Fees</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Default Tax Rate (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="number"
                                name="defaultTaxRate"
                                value={invoiceSettings.defaultTaxRate}
                                onChange={handleChange}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Currency Symbol</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                name="currencySymbol"
                                value={invoiceSettings.currencySymbol}
                                onChange={handleChange}
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Policies */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <h4 className="text-base font-semibold text-white mb-6">Terms & Footer</h4>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Invoice Footer Text</label>
                        <textarea
                            name="footerText"
                            rows={2}
                            value={invoiceSettings.footerText}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Terms & Conditions</label>
                        <textarea
                            name="termsAndConditions"
                            rows={3}
                            value={invoiceSettings.termsAndConditions}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-start">
                    <button
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Save className="w-4 h-4" /> Save Invoice Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSettings;
