import React, { useState, useEffect } from 'react';
import {
    Users,
    Copy,
    Check,
    Share2,
    TrendingUp,
    UserPlus,
    ShieldCheck,
    Wallet,
    Send,
    ArrowRight,
    Loader2,
    RefreshCw,
    Activity,
    Info,
    X,
    LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ReferralTree from '../components/ReferralTree';
import { useToast } from '../components/Toast';

const Referral = () => {
    const { user } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [level1, setLevel1] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [showInstructions, setShowInstructions] = useState(!localStorage.getItem('dismissed_tree_instructions'));

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [treeRes, statsRes] = await Promise.allSettled([
                axios.get('/network/tree'),
                axios.get('/network/stats')
            ]);

            if (treeRes.status === 'fulfilled') {
                setLevel1(treeRes.value.data?.data || []);
            }

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value.data?.data || {});
            }

            if (treeRes.status === 'rejected' && statsRes.status === 'rejected') {
                setError('Failed to load referral data. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching referral data', err);
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

    const dismissInstructions = () => {
        setShowInstructions(false);
        localStorage.setItem('dismissed_tree_instructions', 'true');
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-white/40 text-sm animate-pulse">Building your network tree...</p>
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
            <ToastContainer />

            {/* SECTION 1 - STATS BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Level 1', value: stats?.level1Count || 0, icon: UserPlus, color: 'text-primary' },
                    { label: 'Level 2', value: stats?.level2Count || 0, icon: Users, color: 'text-secondary' },
                    { label: 'Level 3', value: stats?.level3Count || 0, icon: LayoutGrid, color: 'text-gold' },
                    { label: 'Network', value: stats?.totalNetworkCount || 0, icon: Activity, color: 'text-primary' },
                    { label: 'Total Earned', value: `$${parseFloat(stats?.totalAffiliateIncome || 0).toFixed(2)}`, icon: Wallet, color: 'text-secondary' }
                ].map((stat, i) => (
                    <div key={i} className="bg-card-dark border border-card-border p-4 rounded-2xl flex flex-col items-center text-center group hover:border-primary/30 transition-all">
                        <div className={`p-2 rounded-xl bg-white/5 mb-2 group-hover:scale-110 transition-transform ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                        <p className="text-xl font-black">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* SECTION 2 - REDESIGNED GROWTH ENGINE & PROFIT TIERS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GROWTH ENGINE (REFERRAL LINK) */}
                <div className="lg:col-span-2 relative h-full">
                    <div className="h-full bg-[#1A1A2E]/80 backdrop-blur-xl border border-card-border rounded-[2.5rem] p-8 overflow-hidden group shadow-2xl hover:border-primary/40 transition-all duration-500">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10 flex flex-col md:flex-row h-full gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                        <h4 className="text-2xl font-black tracking-tight">Growth Engine</h4>
                                    </div>
                                    <p className="text-white/40 text-sm font-medium max-w-sm">Scale your business by sharing your unique portal link with international partners.</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Live Portal Access Link</p>
                                    <div className="relative group/link">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover/link:opacity-40 transition duration-1000"></div>
                                        <div className="relative flex items-center gap-3 bg-bg-dark border border-white/5 p-4 rounded-2xl shadow-inner">
                                            <span className="text-sm font-mono text-white/60 truncate flex-1 select-none">{referralLink}</span>
                                            <button
                                                onClick={copyLink}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:scale-[1.05] active:scale-[0.95] transition-all shadow-lg shadow-primary/20"
                                            >
                                                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedLink ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-px bg-white/5 mx-2 hidden md:block"></div>

                            <div className="flex flex-col justify-center space-y-6">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center md:text-left">One-Tap Broadcast</p>
                                <div className="flex sm:flex-col gap-3">
                                    <button
                                        onClick={shareOnWhatsApp}
                                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 group/wa"
                                    >
                                        <span className="font-black text-xs">WHATSAPP</span>
                                        <Share2 size={16} className="group-hover/wa:rotate-12 transition-transform" />
                                    </button>
                                    <button
                                        onClick={shareOnTelegram}
                                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#0088CC]/10 border border-[#0088CC]/20 rounded-2xl text-[#0088CC] hover:bg-[#0088CC] hover:text-white transition-all duration-300 group/tg"
                                    >
                                        <span className="font-black text-xs">TELEGRAM</span>
                                        <Send size={16} className="group-hover/tg:translate-x-1 group-hover/tg:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PROFIT TIERS (COMMISSION STRUCTURE) */}
                <div className="relative">
                    <div className="h-full bg-[#1A1A2E]/80 backdrop-blur-xl border border-card-border rounded-[2.5rem] p-8 group shadow-2xl hover:border-secondary/40 transition-all duration-500">
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xl font-black tracking-tight">Profit Tiers</h4>
                                <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Level 1 */}
                                <div className="relative group/tier">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Direct Share</span>
                                            <span className="text-xs font-bold text-white">L1 Referrals</span>
                                        </div>
                                        <span className="text-2xl font-black text-primary">75%</span>
                                    </div>
                                </div>

                                {/* Level 2 */}
                                <div className="relative group/tier text-right">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-secondary/30 transition-all duration-300">
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Affiliate Flow</span>
                                            <span className="text-xs font-bold text-white">L2 Network</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-secondary">5%</span>
                                            <span className="text-[8px] font-black opacity-40 uppercase">of L1 Profit</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Level 3 */}
                                <div className="relative group/tier">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-gold/30 transition-all duration-300">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Deep Bonus</span>
                                            <span className="text-xs font-bold text-white">L3 Network</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-gold">2%</span>
                                            <span className="text-[8px] font-black opacity-40 uppercase">of L1 Profit</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Limit Info */}
                            <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Daily Cap Enforcement</span>
                                </div>
                                <span className="text-sm font-black text-gold">$10.00 Limit</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3 - NETWORK TREE */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <TrendingUp size={24} className="text-primary" />
                            Your Network Tree
                        </h3>
                        <p className="text-white/40 text-xs font-medium">Visual map of your referral ecosystem. Click any member to expand.</p>
                    </div>

                    <div className="flex flex-wrap gap-3 p-2 bg-white/5 rounded-xl border border-card-border">
                        {[
                            { label: 'You', color: 'bg-primary' },
                            { label: 'Active', color: 'bg-[#10B981]' },
                            { label: 'No Plan', color: 'bg-[#4B5563]' },
                            { label: 'Blocked', color: 'bg-[#EF4444]' },
                            { label: 'Expanded', color: 'bg-[#00D4AA]' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                <span className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {showInstructions && (
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-start gap-3 relative animate-slide-up">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            <Info size={18} />
                        </div>
                        <div className="flex-1 pr-8">
                            <p className="text-xs font-bold text-primary mb-1">Interactive Tree Activated!</p>
                            <p className="text-[11px] text-primary/80 leading-relaxed font-medium">👆 Tap any person with referrals to see who they invited. You can expand multiple branches simultaneously. Tree grows downward naturally.</p>
                        </div>
                        <button onClick={dismissInstructions} className="absolute top-4 right-4 text-primary/40 hover:text-primary transition-all">
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="bg-[#1A1A2E]/50 border border-card-border rounded-[2.5rem] overflow-hidden">
                    <div style={{ overflowX: 'auto', overflowY: 'visible', WebkitOverflowScrolling: 'touch', paddingBottom: '32px' }}>
                        <div style={{ minWidth: 'max-content', margin: '0 auto' }}>
                            <ReferralTree
                                currentUser={{
                                    ...user,
                                    slots_total: stats?.activePlan?.slots_total || 0,
                                    slots_used: stats?.activePlan?.slots_used || 0,
                                    slots_remaining: (stats?.activePlan?.slots_total - stats?.activePlan?.slots_used) || 0
                                }}
                                level1={level1}
                                referralLink={referralLink}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 4 - DIRECT REFERRALS LIST */}
            <div className="bg-card-dark border border-card-border rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black flex items-center gap-2">
                        <Users size={22} className="text-primary" />
                        Direct Referrals
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{level1.length}</span>
                    </h3>
                </div>

                {level1.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {level1.map((ref, idx) => (
                            <div key={idx} className="bg-bg-dark border border-card-border p-4 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] border border-card-border flex items-center justify-center font-black text-primary transition-all group-hover:bg-primary group-hover:text-white">
                                    {ref.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-sm truncate">{ref.full_name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${ref.plan_name ? 'bg-secondary/10 text-secondary' : 'bg-white/5 text-white/40'}`}>
                                            {ref.plan_name || 'No Plan'}
                                        </span>
                                        <span className="text-[10px] text-white/20 font-bold tracking-tighter">
                                            {ref.direct_referrals_count} refs
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <ArrowRight size={16} className="text-white/20 group-hover:text-primary transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="👥"
                        title="Your network is empty"
                        description="Share your invitation link to start building your direct team and earning commissions."
                        actionText="Copy Link & Start"
                        onAction={copyLink}
                    />
                )}
            </div>
        </div>
    );
};

export default Referral;
