import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
    id: string;
    type: AlertType;
    title: string;
    message?: string;
    duration?: number;
}

interface AlertContextType {
    showAlert: (type: AlertType, title: string, message?: string, duration?: number) => void;
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

interface AlertProviderProps {
    children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const removeAlert = useCallback((id: string) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, []);

    const showAlert = useCallback(
        (type: AlertType, title: string, message?: string, duration: number = 5000) => {
            const id = Math.random().toString(36).substring(2, 9);
            const newAlert: Alert = { id, type, title, message, duration };

            setAlerts((prev) => [...prev, newAlert]);

            if (duration > 0) {
                setTimeout(() => {
                    removeAlert(id);
                }, duration);
            }
        },
        [removeAlert]
    );

    const success = useCallback(
        (title: string, message?: string, duration?: number) => {
            showAlert('success', title, message, duration);
        },
        [showAlert]
    );

    const error = useCallback(
        (title: string, message?: string, duration?: number) => {
            showAlert('error', title, message, duration);
        },
        [showAlert]
    );

    const warning = useCallback(
        (title: string, message?: string, duration?: number) => {
            showAlert('warning', title, message, duration);
        },
        [showAlert]
    );

    const info = useCallback(
        (title: string, message?: string, duration?: number) => {
            showAlert('info', title, message, duration);
        },
        [showAlert]
    );

    const getAlertStyles = (type: AlertType) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    text: 'text-green-400',
                    icon: CheckCircle,
                };
            case 'error':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    text: 'text-red-400',
                    icon: XCircle,
                };
            case 'warning':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    text: 'text-amber-400',
                    icon: AlertCircle,
                };
            case 'info':
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    text: 'text-blue-400',
                    icon: Info,
                };
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert, success, error, warning, info }}>
            {children}

            {/* Alert Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none">
                {alerts.map((alert) => {
                    const styles = getAlertStyles(alert.type);
                    const Icon = styles.icon;

                    return (
                        <div
                            key={alert.id}
                            className={`${styles.bg} ${styles.border} border backdrop-blur-xl rounded-xl p-4 shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-300`}
                            style={{
                                animation: 'slideInRight 0.3s ease-out',
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`${styles.bg} rounded-lg p-2`}>
                                    <Icon className={`w-5 h-5 ${styles.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-semibold ${styles.text} mb-1`}>
                                        {alert.title}
                                    </h4>
                                    {alert.message && (
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {alert.message}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeAlert(alert.id)}
                                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Progress bar */}
                            {alert.duration && alert.duration > 0 && (
                                <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${styles.text.replace('text-', 'bg-')} rounded-full`}
                                        style={{
                                            animation: `shrink ${alert.duration}ms linear`,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Animations */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes shrink {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
            `}</style>
        </AlertContext.Provider>
    );
};
