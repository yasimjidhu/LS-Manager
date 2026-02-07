import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 text-gray-200">
                    <div className="max-w-md w-full bg-[#151A21] border border-[#1F2937] rounded-3xl p-8 shadow-2xl text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1>
                        <p className="text-gray-400 mb-8 text-sm">
                            Something went wrong while rendering this page. We've logged the error and our team is looking into it.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-8 p-4 bg-black/40 rounded-xl border border-red-900/30 text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-400 whitespace-pre-wrap">
                                    {this.state.error.stack || this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-950/20"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Refresh Page
                            </button>

                            <a
                                href="/dashboard"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1F2937] hover:bg-[#2A3441] text-white font-bold rounded-xl transition-all border border-[#374151]"
                            >
                                <Home className="w-4 h-4" />
                                Return to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
