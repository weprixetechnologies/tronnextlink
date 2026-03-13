import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    TrendingUp,
    ShieldCheck,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    PieChart,
    ArrowRight,
    RefreshCw,
    Activity,
    Copy,
    Check,
    Share2,
    Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const Dashboard = () => {
    const { user } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [stats, setStats] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, walletRes] = await Promise.allSettled([
                axios.get('/network/stats'),
                axios.get('/wallet')
            ]);

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value.data?.data || {});
            }

            if (walletRes.status === 'fulfilled') {
                setWallet(walletRes.value.data?.data || {});
            }

            if (statsRes.status === 'rejected' && walletRes.status === 'rejected') {
                setError('Failed to load dashboard data. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching dashboard data', err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const referralLink = `${window.location.origin}/signup?ref=${user?.referral_code || ''}`;

    const copyLink = () => {
        if (!user?.referral_code) return;
        navigator.clipboard.writeText(referralLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        showToast('Link copied to clipboard!');
    };

    const shareOnWhatsApp = () => {
        if (!user?.referral_code) return;
        window.open(`https://wa.me/?text=Join me on CryptoMLM and start earning USDT! ${referralLink}`, '_blank');
    };

    const shareOnTelegram = () => {
        if (!user?.referral_code) return;
        window.open(`https://t.me/share/url?url=${referralLink}&text=Join me on CryptoMLM and start earning USDT!`, '_blank');
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-white/40 text-sm animate-pulse">Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-6 text-center">
                <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20">
                    <p className="text-red-400 font-bold mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl mx-auto hover:bg-primary/90 transition-all font-bold"
                    >
                        <RefreshCw size={18} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="space-y-8 transition-all duration-500 pb-12"
            style={{ animation: 'fadeIn 0.5s ease' }}
        >
            {/* WELCOME HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h2>
                    <p className="text-white/40 text-sm font-medium">Here's what's happening with your account today.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="w-fit flex items-center gap-2 px-4 py-2 bg-white/5 border border-card-border rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                >
                    <RefreshCw size={14} /> Refresh Data
                </button>
            </div>

            {/* SECTION 1 - 3 MAIN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Balance */}
                <div className="gradient-primary p-6 rounded-[2rem] text-white glow-purple relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-white/20 transition-all"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Wallet size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Balance</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black">${parseFloat(wallet?.balance_usdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            <p className="text-xs font-bold opacity-60">Available for withdrawal</p>
                        </div>
                    </div>
                </div>

                {/* Total Earnings */}
                <div className="bg-card-dark border border-card-border p-6 rounded-[2rem] relative overflow-hidden group hover:border-secondary/30 transition-all">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Earnings</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-secondary">${parseFloat(wallet?.total_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary">
                                <ArrowUpRight size={12} />
                                <span>Accumulated Profit</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Withdrawals */}
                <div className="bg-card-dark border border-card-border p-6 rounded-[2rem] relative overflow-hidden group hover:border-gold/30 transition-all">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ArrowRight size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Withdrawn</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-gold">${parseFloat(wallet?.total_withdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gold">
                                <ArrowDownLeft size={12} />
                                <span>Successfully Paid</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2 - ACTIVE PLAN & NETWORK PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Plan Card */}
                <div className="bg-card-dark border border-card-border rounded-3xl p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-lg flex items-center gap-2">
                            <Activity size={20} className="text-primary" />
                            Active Yield Plan
                        </h3>
                        {stats?.activePlan && (
                            <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full border border-secondary/20">ACTIVE</span>
                        )}
                    </div>

                    {stats?.activePlan ? (
                        <div className="flex-1 space-y-6">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h4 className="text-3xl font-black text-white">{stats.activePlan.name}</h4>
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Plan Package</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary">${parseFloat(stats.activePlan.price_usdt).toFixed(0)}</p>
                                    <p className="text-[10px] text-white/40 font-bold">Investment</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-white/40 uppercase tracking-widest">Revenue Progress</span>
                                    <span className="text-secondary">{stats.activePlan.slots_used} / {stats.activePlan.slots_total} Units</span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <div
                                        className="h-full gradient-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(108,99,255,0.5)]"
                                        style={{ width: `${(stats.activePlan.slots_used / stats.activePlan.slots_total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-card-border">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Daily Cap</p>
                                    <p className="text-sm font-bold text-white">$10.00 USDT</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Cap Remaining</p>
                                    <p className="text-sm font-bold text-gold">${stats.affiliateStats?.cap_remaining.toFixed(2)} USDT</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                                <PieChart size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold">No Active Plan</h4>
                                <p className="text-xs text-white/40 max-w-[200px] mt-1">Activate a plan to start earning daily network rewards.</p>
                            </div>
                            <a href="/deposit" className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20">GET STARTED</a>
                        </div>
                    )}
                </div>

                {/* Network Overview Card */}
                <div className="bg-[#1A1A2E] border border-card-border rounded-3xl p-8">
                    <h3 className="font-black text-lg mb-8 flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Network Insights
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-primary/10 rounded-2xl text-primary glow-purple">
                                <UserPlus size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="text-3xl font-black">{stats?.level1Count || 0}</p>
                                    <p className="text-xs font-black text-primary uppercase">DIRECT</p>
                                </div>
                                <p className="text-xs text-white/40 font-medium">Partners invited by you</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                                <Users size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="text-3xl font-black">{stats?.level2Count || 0}</p>
                                    <p className="text-xs font-black text-secondary uppercase">LEVEL 2</p>
                                </div>
                                <p className="text-xs text-white/40 font-medium">Invited by your direct partners</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-card-border">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Network Earnings</p>
                                    <p className="text-xl font-black text-white">${parseFloat(stats?.totalAffiliateIncome || 0).toFixed(2)}</p>
                                </div>
                                <a href="/referral" className="flex items-center gap-2 text-primary text-xs font-black group">
                                    VIEW TREE
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* EARNING STRUCTURE BANNER */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="font-black">Safe & Instant Payouts</h4>
                        <p className="text-xs text-white/40 font-medium">Commissions are credited to your wallet immediately upon referral purchase.</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 px-6 py-2 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-0.5">L1 Commission</p>
                        <p className="text-lg font-black text-primary">75%</p>
                    </div>
                    <div className="w-px h-8 bg-card-border"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-0.5">L2 Commission</p>
                        <p className="text-lg font-black text-secondary">5% <span className="text-[8px] opacity-40">OF L1</span></p>
                    </div>
                    <div className="w-px h-8 bg-card-border"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-0.5">L3 Commission</p>
                        <p className="text-lg font-black text-gold">2% <span className="text-[8px] opacity-40">OF L1</span></p>
                    </div>
                </div>
            </div>

            {/* REFER AND EARN SECTION */}
            <div className="bg-[#1A1A2E] border border-card-border rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700"></div>
                <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Users size={12} /> Referral Program
                        </div>
                        <h3 className="text-3xl font-black leading-tight">Scale Your Income by <br />Inviting Your <span className="text-primary">Network</span></h3>
                        <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md">
                            Earn massive commissions on every direct purchase and build a multi-level passive income stream. Your network is your net worth.
                        </p>

                        <div className="space-y-3 pt-4">
                            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Your Private Invitation Link</p>
                            <div className="flex items-center gap-3 bg-bg-dark border border-card-border p-2 pl-4 rounded-2xl group/link">
                                <span className="text-xs font-mono text-white/40 truncate flex-1">{referralLink}</span>
                                <button
                                    onClick={copyLink}
                                    className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                >
                                    {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <p className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="text-primary" /> Refer Using
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <button onClick={shareOnWhatsApp} className="flex flex-col items-center gap-2 p-4 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl hover:bg-[#25D366] hover:text-white transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center group-hover:bg-white/20">
                                        <Share2 size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase">WhatsApp</span>
                                </button>

                                <button onClick={copyLink} className="flex flex-col items-center gap-2 p-4 bg-[#E4405F]/10 border border-[#E4405F]/20 rounded-2xl hover:bg-[#E4405F] hover:text-white transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-[#E4405F]/20 flex items-center justify-center group-hover:bg-white/20">
                                        <Activity size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase">Instagram</span>
                                </button>

                                <button onClick={shareOnTelegram} className="flex flex-col items-center gap-2 p-4 bg-[#0088CC]/10 border border-[#0088CC]/20 rounded-2xl hover:bg-[#0088CC] hover:text-white transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-[#0088CC]/20 flex items-center justify-center group-hover:bg-white/20">
                                        <Send size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase">Telegram</span>
                                </button>

                                <button onClick={copyLink} className="flex flex-col items-center gap-2 p-4 bg-[#1877F2]/10 border border-[#1877F2]/20 rounded-2xl hover:bg-[#1877F2] hover:text-white transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-[#1877F2]/20 flex items-center justify-center group-hover:bg-white/20">
                                        <Users size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase">Facebook</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/3 grid grid-cols-1 gap-4 w-full">
                        {[
                            { label: 'Level 1', value: '75%', desc: 'Direct Sale Commission', color: 'border-primary' },
                            { label: 'Level 2', value: '5%', desc: 'Commission of L1 (3.75% Total)', color: 'border-secondary' },
                            { label: 'Level 3', value: '2%', desc: 'Commission of L1 (1.50% Total)', color: 'border-gold' }
                        ].map((item, i) => (
                            <div key={i} className={`p-5 bg-white/5 rounded-2xl border-l-4 ${item.color} group hover:bg-white/10 transition-all`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-lg font-black text-white group-hover:text-primary transition-colors">{item.value}</span>
                                </div>
                                <p className="text-[11px] font-medium text-white/60">{item.desc}</p>
                            </div>
                        ))}

                        <div className="mt-2 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest text-center">Referral ID: {user?.referral_code || '---'}</p>
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default Dashboard;
