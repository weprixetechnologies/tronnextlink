import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/auth/login', { ...formData, role: 'admin' });
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data.data.user));
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-900/40 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px]"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/40 rounded-full translate-x-1/2 translate-y-1/2 blur-[120px]"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-hidden transform transition-all hover:scale-[1.01]">
                    <div className="p-10 pt-12">
                        {/* Logo/Icon */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-4 rotate-3">
                                <ShieldCheck size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Admin Terminal</h1>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Secure Protocol Access</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-fade-in">
                                <AlertCircle size={18} className="shrink-0" />
                                <p className="text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Protocol</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        className="w-full h-14 bg-gray-50 border-gray-100 px-12 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pass-Hash Sequence</label>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        className="w-full h-14 bg-gray-50 border-gray-100 px-12 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner color="text-white" /> : (
                                    <>
                                        Authorize Access <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-10 py-6 text-center border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            Authorized Personnel Only <span className="mx-2 opacity-50">|</span> © 2026 Node Protocol v4.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
