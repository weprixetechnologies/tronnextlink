import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Ticket, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import axios from '../api/axios';

const Signup = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { signup } = useAuth();
    const { showToast, ToastContainer } = useToast();

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        referral_code: searchParams.get('ref') || '',
    });

    const [referrerName, setReferrerName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isReferralLocked, setIsReferralLocked] = useState(!!searchParams.get('ref'));

    useEffect(() => {
        const fetchReferrer = async () => {
            if (formData.referral_code.length >= 6) {
                try {
                    const res = await axios.get(`/auth/referrer/${formData.referral_code}`);
                    if (res.data.success) {
                        setReferrerName(res.data.data.name);
                    } else {
                        setReferrerName('');
                    }
                } catch (err) {
                    setReferrerName('');
                }
            } else {
                setReferrerName('');
            }
        };
        fetchReferrer();
    }, [formData.referral_code]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return showToast("Passwords don't match", "error");
        }
        if (!formData.referral_code) {
            return showToast("Referral code is required", "error");
        }

        setLoading(true);
        try {
            const { confirmPassword, ...signupData } = formData;
            const res = await signup(signupData);
            if (res.success) {
                showToast('Account created successfully! Redirecting...');
                setTimeout(() => navigate('/'), 2000);
            } else {
                showToast(res.message || 'Signup failed', 'error');
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
            <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center glow-purple mb-4">
                    <span className="text-3xl font-black">M</span>
                </div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-white/40 text-sm mt-1">Join and start earning today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {referrerName && (
                    <div
                        className="bg-secondary/10 border border-secondary/20 p-3 rounded-xl flex items-center gap-2 transition-all duration-300"
                        style={{ animation: 'slideUp 0.3s ease' }}
                    >
                        <CheckCircle2 className="text-secondary" size={18} />
                        <p className="text-xs font-medium text-secondary">Referred by <span className="font-bold">{referrerName}</span></p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            required
                            className="input-dark w-full pl-12 py-2.5 text-sm"
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="email"
                            required
                            className="input-dark w-full pl-12 py-2.5 text-sm"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="input-dark w-full pl-10 py-2.5 text-sm"
                                placeholder="••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Confirm</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="input-dark w-full pl-10 py-2.5 text-sm"
                                placeholder="••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Referral Code (Required)</label>
                    <div className="relative">
                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            required
                            disabled={isReferralLocked}
                            className={`input-dark w-full pl-12 py-2.5 text-sm uppercase ${isReferralLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="ENTER CODE"
                            value={formData.referral_code}
                            onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Sign In →
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
