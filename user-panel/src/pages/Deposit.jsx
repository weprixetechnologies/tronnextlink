import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    Copy,
    Check,
    AlertTriangle,
    RefreshCw,
    Wallet,
    ShieldCheck,
    ArrowRight,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { useToast } from '../components/Toast';
import PlanCard from '../components/PlanCard';

const Deposit = () => {
    const { user, refreshUser } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [wallet, setWallet] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [lastChecked, setLastChecked] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(null);

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        if (!isRefresh) setError(null);

        try {
            const [walletRes, plansRes] = await Promise.allSettled([
                axios.get('/wallet'),
                axios.get('/plans')
            ]);

            if (walletRes.status === 'fulfilled') {
                setWallet(walletRes.value.data?.data || {});
            }

            if (plansRes.status === 'fulfilled') {
                setPlans(plansRes.value.data?.data || []);
            }

            if (walletRes.status === 'rejected' && plansRes.status === 'rejected' && !isRefresh) {
                setError('Failed to load deposit data. Please try again.');
            }

            setLastChecked(0);
        } catch (err) {
            console.error('Error fetching deposit data', err);
            if (!isRefresh) setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => {
            setLastChecked(prev => {
                if (prev >= 29) {
                    fetchData(true);
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const copyAddress = () => {
        if (!user?.tron_address) return;
        navigator.clipboard.writeText(user.tron_address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast('Address copied to clipboard!');
    };

    const handleBuyPlan = async (plan) => {
        setShowConfirm(plan);
    };

    const confirmPurchase = async () => {
        if (!showConfirm) return;
        setPurchaseLoading(true);
        try {
            const res = await axios.post('/plans/purchase', { plan_id: showConfirm.id });
            if (res.data?.success) {
                showToast('Plan activated successfully! 🎉', 'success');
                setShowConfirm(null);
                fetchData(true);
                refreshUser();
            } else {
                showToast(res.data?.message || 'Purchase failed', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Server error', 'error');
        } finally {
            setPurchaseLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-white/40 text-sm animate-pulse">Loading deposit options...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-6 text-center">
                <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20">
                    <p className="text-red-400 font-bold mb-4">{error}</p>
                    <button
                        onClick={() => fetchData()}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SECTION A — DEPOSIT USDT */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Deposit USDT (TRC-20)</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                            Refreshes in {30 - lastChecked}s
                        </div>
                    </div>

                    <div className="bg-card-dark border border-card-border rounded-3xl p-8 relative overflow-hidden glow-purple">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-white rounded-2xl shadow-xl mb-6">
                                <QRCodeSVG
                                    value={user?.tron_address || ''}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <div className="w-full space-y-4">
                                <div className="bg-bg-dark border border-card-border p-4 rounded-2xl">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 text-center">Your USDT TRC-20 Address</p>
                                    <p className="text-center font-mono text-sm break-all text-primary font-bold">
                                        {user?.tron_address || '---'}
                                    </p>
                                </div>

                                <button
                                    onClick={copyAddress}
                                    disabled={!user?.tron_address}
                                    className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                    {copied ? 'Copied! ✓' : 'Copy Wallet Address'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
                        <h4 className="flex items-center gap-2 text-amber-500 font-bold mb-3 text-sm">
                            <AlertTriangle size={18} /> Important Information
                        </h4>
                        <ul className="space-y-2 text-xs text-amber-500/80 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                                Send ONLY USDT to this address using the TRON (TRC-20) network.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                                Do NOT send TRX or any other tokens. They will be lost forever.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                                Minimum deposit amount is 10 USDT.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-card-dark/50 border border-card-border p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase">Current Balance</p>
                                <p className="font-black text-xl">${parseFloat(wallet?.balance_usdt || 0).toFixed(2)} <span className="text-xs font-normal">USDT</span></p>
                            </div>
                        </div>
                        <button onClick={() => fetchData(true)} className="p-2 text-white/40 hover:text-white transition-all">
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* SECTION B — BUY A PLAN */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Activate a Plan</h3>
                        <span className="text-xs font-bold text-white/40">Available: ${parseFloat(wallet?.balance_usdt || 0).toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                        {(plans || []).map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                balance={parseFloat(wallet?.balance_usdt || 0)}
                                activePlanId={user?.active_plan_id}
                                onBuy={handleBuyPlan}
                                loading={purchaseLoading && showConfirm?.id === plan.id}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-card-dark border border-card-border p-8 rounded-3xl max-w-sm w-full shadow-2xl" style={{ animation: 'slideUp 0.3s ease' }}>
                        <h3 className="text-xl font-bold mb-2">Confirm Purchase</h3>
                        <p className="text-white/60 text-sm mb-6">You are about to activate the <span className="text-white font-bold">{showConfirm.name}</span>.</p>

                        <div className="bg-bg-dark rounded-2xl p-4 space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/40">Plan Price</span>
                                <span className="font-bold text-gold">${parseFloat(showConfirm.price_usdt || 0).toFixed(2)} USDT</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/40">Current Balance</span>
                                <span className="font-bold">${parseFloat(wallet?.balance_usdt || 0).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-card-border pt-3 flex justify-between text-sm font-bold">
                                <span>Balance After</span>
                                <span className="text-secondary">${(parseFloat(wallet?.balance_usdt || 0) - parseFloat(showConfirm.price_usdt || 0)).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(null)}
                                disabled={purchaseLoading}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPurchase}
                                disabled={purchaseLoading}
                                className="flex-1 py-3 btn-primary flex items-center justify-center gap-2"
                            >
                                {purchaseLoading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deposit;
