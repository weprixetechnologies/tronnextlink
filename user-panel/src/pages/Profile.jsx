import React, { useState } from 'react';
import {
    User,
    Mail,
    Lock,
    Calendar,
    Copy,
    Check,
    Shield,
    CreditCard,
    Edit2,
    Save,
    LogOut,
    ChevronRight,
    TrendingUp,
    Users,
    Network
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Profile = () => {
    const { user, updateProfile, changePassword, logout } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const [form, setForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
    });

    const [pwdForm, setPwdForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateProfile(form.full_name);
            if (res.success) {
                showToast('Profile updated successfully!');
                setIsEditing(false);
            } else {
                showToast(res.message || 'Update failed', 'error');
            }
        } catch (err) {
            showToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwdForm.new_password !== pwdForm.confirm_password) {
            return showToast("New passwords don't match", 'error');
        }
        setLoading(true);
        try {
            const res = await changePassword(pwdForm.current_password, pwdForm.new_password);
            if (res.success) {
                showToast('Password changed successfully!');
                setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
            } else {
                showToast(res.message || 'Password change failed', 'error');
            }
        } catch (err) {
            showToast('Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        if (!user?.referral_code) return;
        navigator.clipboard.writeText(user.referral_code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div
            className="max-w-4xl mx-auto space-y-8 transition-all duration-500 pb-12"
            style={{ animation: 'fadeIn 0.5s ease' }}
        >
            <ToastContainer />

            {/* HEADER CARD */}
            <div className="bg-card-dark border border-card-border rounded-3xl p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-32 h-32 rounded-full gradient-purple p-1 glow-purple shrink-0">
                        <div className="w-full h-full rounded-full bg-card-dark flex items-center justify-center text-4xl font-black">
                            {(user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h2 className="text-3xl font-black truncate">{user?.full_name || 'Anonymous User'}</h2>
                            <span className="bg-secondary/10 text-secondary text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-secondary/20">Active</span>
                        </div>
                        <p className="text-white/40 flex items-center justify-center md:justify-start gap-2 mb-4">
                            <Mail size={16} /> {user?.email || 'No email provided'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <div className="bg-bg-dark border border-card-border pl-4 pr-1 py-1 rounded-xl flex items-center gap-2 group">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Code:</span>
                                <span className="text-sm font-black text-primary">{user?.referral_code || '---'}</span>
                                <button onClick={copyCode} disabled={!user?.referral_code} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                                    {isCopied ? <Check size={16} className="text-secondary" /> : <Copy size={16} className="text-white/40" />}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                <Calendar size={14} /> Joined {user?.member_since || 'March 2026'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PERSONAL INFO */}
                <div className="space-y-6">
                    <div className="bg-card-dark border border-card-border rounded-3xl p-6 md:p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <User size={20} className="text-primary" /> Personal Information
                            </h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-white/40 hover:text-white transition-all"
                            >
                                {isEditing ? <span className="text-xs font-bold uppercase">Cancel</span> : <Edit2 size={18} />}
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-white/40 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className={`input-dark w-full ${!isEditing ? 'opacity-60 cursor-not-allowed bg-transparent' : 'bg-bg-dark'}`}
                                    value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-white/40 ml-1 flex items-center gap-2">
                                    Email Address <Shield size={10} className="text-primary" />
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    className="input-dark w-full opacity-60 cursor-not-allowed bg-transparent"
                                    value={form.email}
                                />
                            </div>
                            {isEditing && (
                                <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                                </button>
                            )}
                        </form>
                    </div>

                    {/* MY TRON WALLET */}
                    <div className="bg-card-dark border border-card-border rounded-3xl p-6 md:p-8 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <CreditCard size={20} className="text-secondary" /> My TRON Wallet
                        </h3>
                        <div className="bg-bg-dark border border-card-border p-5 rounded-2xl space-y-4">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Your Deposit Address</p>
                            <div className="p-3 bg-white rounded-xl w-32 h-32 mx-auto flex items-center justify-center">
                                <Shield size={64} className="text-card-dark opacity-10" />
                            </div>
                            <p className="font-mono text-center text-xs break-all text-primary font-bold px-2">
                                {user?.tron_address || '---'}
                            </p>
                            <button
                                onClick={() => {
                                    if (!user?.tron_address) return;
                                    navigator.clipboard.writeText(user.tron_address);
                                    showToast('Address copied!');
                                }}
                                disabled={!user?.tron_address}
                                className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                            >
                                Copy Address
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-white/40 italic font-medium">This is your unique deposit address. Use it to fund your account.</p>
                    </div>
                </div>

                {/* SECURITY & MORE */}
                <div className="space-y-6">
                    <div className="bg-card-dark border border-card-border rounded-3xl p-6 md:p-8 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Lock size={20} className="text-red-500" /> Security
                        </h3>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-white/40 ml-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-dark w-full bg-bg-dark"
                                    placeholder="••••••••"
                                    value={pwdForm.current_password}
                                    onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-white/40 ml-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-dark w-full bg-bg-dark"
                                    placeholder="••••••••"
                                    value={pwdForm.new_password}
                                    onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-white/40 ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-dark w-full bg-bg-dark"
                                    placeholder="••••••••"
                                    value={pwdForm.confirm_password}
                                    onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm">
                                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-card-dark border border-card-border rounded-3xl p-6 md:p-8 space-y-6">
                        <h3 className="text-lg font-bold">Account Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-white/10 transition-all rounded-2xl group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Shield size={20} />
                                    </div>
                                    <span className="text-sm font-bold">Privacy Policy</span>
                                </div>
                                <ChevronRight className="text-white/40 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/5 hover:border-red-500/20 transition-all rounded-2xl group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
                                        <LogOut size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-red-500">Logout Account</span>
                                </div>
                                <ChevronRight className="text-red-500/50 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
