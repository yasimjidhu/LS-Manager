import { useState, useEffect } from 'react';
import { Save, Upload, QrCode, X, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../services/settings.service';

const PaymentSettings = () => {
    const queryClient = useQueryClient();

    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        branch: ''
    });

    const [upiDetails, setUpiDetails] = useState({
        upiId: '',
        qrCodeUrl: null as string | null
    });

    const { data: paymentProfile } = useQuery({
        queryKey: ['paymentProfile'],
        queryFn: settingsApi.getPaymentProfile
    });

    useEffect(() => {
        if (paymentProfile) {
            setBankDetails({
                bankName: paymentProfile.bankName || '',
                accountName: paymentProfile.accountName || '',
                accountNumber: paymentProfile.accountNumber || '',
                ifscCode: paymentProfile.ifscCode || '',
                branch: paymentProfile.branch || ''
            });
            setUpiDetails({
                upiId: paymentProfile.upiId || '',
                qrCodeUrl: paymentProfile.gpayQrUrl || null
            });
        }
    }, [paymentProfile]);

    const updateMutation = useMutation({
        mutationFn: settingsApi.updatePaymentProfile,
        onSuccess: () => {
            alert('Payment settings saved!');
            queryClient.invalidateQueries({ queryKey: ['paymentProfile'] });
        },
        onError: () => {
            alert('Failed to save payment settings.');
        }
    });

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBankDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleUpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpiDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUpiDetails(prev => ({ ...prev, qrCodeUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeQRCode = () => {
        setUpiDetails(prev => ({ ...prev, qrCodeUrl: null }));
    };

    const handleSave = () => {
        updateMutation.mutate({
            ...bankDetails,
            upiId: upiDetails.upiId,
            gpayQrUrl: upiDetails.qrCodeUrl || undefined,
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-xl font-bold text-white">Payment Settings</h3>
                    <p className="text-gray-400 text-sm">Configure payment methods for invoices</p>
                </div>
            </div>

            {/* UPI & QR Code Section */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <QrCode className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-semibold text-white">UPI Payment & QR Code</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            UPI ID
                        </label>
                        <input
                            type="text"
                            name="upiId"
                            value={upiDetails.upiId}
                            onChange={handleUpiChange}
                            placeholder="yourname@paytm"
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be displayed on invoices</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Payment QR Code
                        </label>
                        {upiDetails.qrCodeUrl ? (
                            <div className="relative">
                                <img
                                    src={upiDetails.qrCodeUrl}
                                    alt="Payment QR Code"
                                    className="w-40 h-40 object-cover border-2 border-[#1F2937] rounded-lg"
                                />
                                <button
                                    onClick={removeQRCode}
                                    className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-gray-500 mt-2">QR code uploaded successfully</p>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-[#1F2937] rounded-lg cursor-pointer hover:border-purple-600/50 transition-all group">
                                <Upload className="w-8 h-8 text-gray-600 group-hover:text-purple-400 mb-2" />
                                <span className="text-xs text-gray-500 group-hover:text-purple-400">Upload QR Code</span>
                                <span className="text-xs text-gray-600 mt-1">PNG, JPG (Max 2MB)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleQRUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Upload GPay/PhonePe/Paytm QR code</p>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                    <p className="text-sm text-blue-400">
                        💡 <strong>Tip:</strong> The QR code will be displayed on all invoices for easy payment collection
                    </p>
                </div>
            </div>

            {/* Bank Account Details Section */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <h4 className="text-base font-semibold text-white mb-6">Bank Account Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Bank Name
                        </label>
                        <input
                            type="text"
                            name="bankName"
                            value={bankDetails.bankName}
                            onChange={handleBankChange}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Account Name
                        </label>
                        <input
                            type="text"
                            name="accountName"
                            value={bankDetails.accountName}
                            onChange={handleBankChange}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Account Number
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={bankDetails.accountNumber}
                            onChange={handleBankChange}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            IFSC Code
                        </label>
                        <input
                            type="text"
                            name="ifscCode"
                            value={bankDetails.ifscCode}
                            onChange={handleBankChange}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Branch
                        </label>
                        <input
                            type="text"
                            name="branch"
                            value={bankDetails.branch}
                            onChange={handleBankChange}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20 font-semibold disabled:opacity-50"
                >
                    {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Payment Settings
                </button>
            </div>
        </div>
    );
};

export default PaymentSettings;
