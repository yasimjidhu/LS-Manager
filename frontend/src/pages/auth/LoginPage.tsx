import { useState, type FormEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store';

const LoginPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the return url from location state or default to home
    const from = location.state?.from?.pathname || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
        return () => {
            dispatch(clearError());
        }
    }, [isAuthenticated, navigate, from, dispatch]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        dispatch(login({ email, password }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] text-white p-4">
            <div className="w-full max-w-md bg-[#1F2937] bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                <div className="p-8">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-400">Sign in to access your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`
                                w-full py-4 px-6 rounded-lg text-white font-medium
                                bg-gradient-to-r from-blue-600 to-purple-600
                                hover:from-blue-700 hover:to-purple-700
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                transform transition-all duration-200
                                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                            `}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-gray-400 text-sm">
                        Don't have an account?{' '}
                        <Link to="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
