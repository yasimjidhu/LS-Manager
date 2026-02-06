import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

interface ConfirmProviderProps {
    children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolver(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolver) {
            resolver(true);
        }
        setIsOpen(false);
        setOptions(null);
        setResolver(null);
    }, [resolver]);

    const handleCancel = useCallback(() => {
        if (resolver) {
            resolver(false);
        }
        setIsOpen(false);
        setOptions(null);
        setResolver(null);
    }, [resolver]);

    const getTypeStyles = (type: string = 'warning') => {
        switch (type) {
            case 'danger':
                return {
                    iconBg: 'bg-red-500/10',
                    iconColor: 'text-red-400',
                    buttonBg: 'bg-red-600 hover:bg-red-500',
                };
            case 'warning':
                return {
                    iconBg: 'bg-amber-500/10',
                    iconColor: 'text-amber-400',
                    buttonBg: 'bg-amber-600 hover:bg-amber-500',
                };
            case 'info':
                return {
                    iconBg: 'bg-blue-500/10',
                    iconColor: 'text-blue-400',
                    buttonBg: 'bg-blue-600 hover:bg-blue-500',
                };
            default:
                return {
                    iconBg: 'bg-amber-500/10',
                    iconColor: 'text-amber-400',
                    buttonBg: 'bg-amber-600 hover:bg-amber-500',
                };
        }
    };

    if (!isOpen || !options) return <ConfirmContext.Provider value={{ confirm }}>{children}</ConfirmContext.Provider>;

    const styles = getTypeStyles(options.type);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div
                    className="bg-[#151A21] border border-[#1F2937] rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[#1F2937]">
                        <div className="flex items-start gap-4">
                            <div className={`${styles.iconBg} rounded-xl p-3 flex-shrink-0`}>
                                <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {options.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {options.message}
                                </p>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 flex-shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 flex items-center justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-5 py-2.5 bg-[#0B0E14] border border-[#1F2937] text-gray-300 hover:bg-[#1F2937] rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                        >
                            {options.cancelText || 'Cancel'}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`px-5 py-2.5 ${styles.buttonBg} text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg`}
                        >
                            {options.confirmText || 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        </ConfirmContext.Provider>
    );
};
