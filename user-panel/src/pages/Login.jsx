import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast, ToastContainer } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(email, password);
            if (res.success) {
                showToast('Login successful! Welcome back.');
                setTimeout(() => navigate('/'), 1500);
            } else {
                showToast(res.message || 'Login failed', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Server error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card-dark/40 backdrop-blur-xl border border-card-border p-8 rounded-2xl shadow-2xl">
            <ToastContainer />
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center glow-purple mb-4">
                    <span className="text-3xl font-black">M</span>
                </div>
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="email"
                            required
                            className="input-dark w-full pl-12"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            className="input-dark w-full pl-12 pr-12"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 text-center" style={{ animation: 'fadeIn 0.5s ease' }}>
                <p className="text-white/60 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary font-bold hover:underline">
                        Sign Up →
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
