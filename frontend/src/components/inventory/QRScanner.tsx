
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, CheckCircle2 } from 'lucide-react';

interface QRScannerProps {
    onScanSuccess: (decodedText: string, decodedResult: any) => void;
    onScanFailure?: (error: any) => void;
}

const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerId = useRef(`qr-scanner-${Math.random().toString(36).substr(2, 9)}`);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    const startScanner = async () => {
        if (!scannerRef.current) return;

        setError(null);
        setIsInitializing(true);

        try {
            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText, decodedResult) => {
                    // Logic: Prevent duplicate scans in rapid succession (Cooldown)
                    if (!isPaused) {
                        handleScan(decodedText, decodedResult);
                    }
                },
                (_errorMessage) => {
                    // Ignore frame errors
                }
            );
            setIsInitializing(false);
        } catch (err: any) {
            console.error("Failed to start scanner:", err);
            setError(err?.message || "Could not access camera. Please check permissions.");
            setIsInitializing(false);
        }
    };

    const handleScan = (text: string, result: any) => {
        setIsPaused(true);
        onScanSuccess(text, result);

        // Resume scanning after 2 seconds (Cooldown for continuous scanning)
        setTimeout(() => {
            setIsPaused(false);
        }, 2000);
    };

    useEffect(() => {
        const scanner = new Html5Qrcode(scannerId.current);
        scannerRef.current = scanner;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            startScanner();
        }, 500);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Stopping scanner failed", err));
            }
        };
    }, []);

    return (
        <div className="w-full relative bg-[#0B0E14] rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[300px]">
            <div id={scannerId.current} className="w-full h-full"></div>

            {isInitializing && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white text-sm font-medium">Initializing Camera...</p>
                </div>
            )}

            {isPaused && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/20 backdrop-blur-[2px] z-10 animate-in fade-in duration-300">
                    <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/50">
                        <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-white font-bold bg-black/50 px-4 py-1 rounded-full text-sm">Item Scanned!</p>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0B0E14] z-20">
                    <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                    <p className="text-white font-bold mb-2">Camera Access Required</p>
                    <p className="text-gray-400 text-xs mb-6 max-w-[200px]">{error}</p>
                    <button
                        onClick={startScanner}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all"
                    >
                        <Camera className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            )}

            {!error && !isInitializing && (
                <div className="absolute inset-0 border-[30px] border-black/10 pointer-events-none z-0">
                    <div className="w-full h-full border-2 border-dashed border-white/10 rounded-lg"></div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
