import React, { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    Wallet,
    AlertCircle,
    Loader2,
    CheckCircle2,
    History,
    Info,
    ExternalLink,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { useToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';

const Withdrawal = () => {
    const { user } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [wallet, setWallet] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        amount: '',
        address: '',
        note: ''
    });

    const isAddressValid = form.address.startsWith('T') && form.address.length === 34;
    const balanceVal = parseFloat(wallet?.balance || 0);
    const amountVal = parseFloat(form.amount || 0);
    const isBalanceEnough = amountVal <= balanceVal;
    const isMinAmount = amountVal >= 5;
    const canRequest = isAddressValid && isBalanceEnough && isMinAmount && !submitting;

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [walletRes, historyRes] = await Promise.allSettled([
                axios.get('/wallet'),
                axios.get('/wallet/transactions?type=withdrawal')
            ]);

            if (walletRes.status === 'fulfilled') {
                setWallet(walletRes.value.data?.data || {});
            }

            if (historyRes.status === 'fulfilled') {
                const data = historyRes.value.data?.data;
                const historyData = data?.transactions || data || [];
                setHistory(Array.isArray(historyData) ? historyData : []);
            }

            if (walletRes.status === 'rejected' && historyRes.status === 'rejected') {
                setError('Failed to load withdrawal data. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching withdrawal data', err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!canRequest) return;

        setSubmitting(true);
        try {
            const res = await axios.post('/wallet/withdraw', {
                amount: parseFloat(form.amount),
                tron_address: form.address,
                note: form.note
            });
            if (res.data?.success) {
                showToast('Withdrawal request submitted! 🚀', 'success');
                setForm({ amount: '', address: '', note: '' });
                fetchData();
            } else {
                showToast(res.data?.message || 'Request failed', 'error');
            }
        } catch (err) {
            setLoading(false);
            showToast(err.response?.data?.message || 'Server error', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const hasPending = (history || []).some(tx => tx?.status === 'pending');

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-white/40 text-sm animate-pulse">Loading withdrawal options...</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* WITHDRAWAL FORM */}
                <div className="space-y-6">
                    <div className="gradient-primary p-6 rounded-3xl text-white glow-purple relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Available Balance</p>
                        <h2 className="text-4xl font-black">${parseFloat(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal">USDT</span></h2>
                        <p className="mt-4 text-[10px] bg-black/20 p-2 rounded-lg inline-block">Withdrawals are processed manually within 24 hours</p>
                    </div>

                    <div className="bg-card-dark border border-card-border rounded-3xl p-6 md:p-8 space-y-6">
                        <h3 className="text-xl font-bold">Request Withdrawal</h3>

                        {hasPending && (
                            <div className="bg-gold/10 border border-gold/20 p-4 rounded-xl flex items-start gap-3">
                                <Info className="text-gold shrink-0" size={20} />
                                <div className="text-xs">
                                    <p className="text-gold font-bold mb-1">Pending Request Exists</p>
                                    <p className="text-gold/80">Please wait for your previous withdrawal to be processed before requesting a new one.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleWithdraw} className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold uppercase text-white/40">Amount (USDT)</label>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, amount: wallet?.balance || '0' })}
                                        className="text-primary text-xs font-bold hover:underline"
                                    >
                                        MAX
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="input-dark w-full"
                                    placeholder="Min $5.00"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                />
                                {form.amount && !isMinAmount && <p className="text-[10px] text-red-500 font-bold">Minimum withdrawal is $5.00</p>}
                                {form.amount && !isBalanceEnough && <p className="text-[10px] text-red-500 font-bold">Insufficient balance</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold uppercase text-white/40">TRON Wallet Address (TRC-20)</label>
                                    {isAddressValid && <span className="text-secondary flex items-center gap-1 text-[10px] font-bold uppercase"><CheckCircle2 size={12} /> Valid</span>}
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-dark w-full font-mono text-sm"
                                    placeholder="Starts with T..."
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                />
                                {form.address && !isAddressValid && <p className="text-[10px] text-red-500 font-bold">Invalid TRC-20 address (must be 34 chars and start with T)</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-white/40 ml-1">Note (Optional)</label>
                                <input
                                    type="text"
                                    className="input-dark w-full"
                                    placeholder="e.g. My Trust Wallet"
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                />
                            </div>

                            <div className="bg-bg-dark/50 border border-card-border p-4 rounded-xl space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">Est. Processing:</span>
                                    <span className="font-bold">1-24 Hours</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">You will receive:</span>
                                    <span className="font-bold text-secondary">${amountVal.toFixed(2)} USDT</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!canRequest || hasPending}
                                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Request Withdrawal'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* WITHDRAWAL HISTORY */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <History size={20} className="text-primary" />
                        Withdrawal History
                    </h3>

                    <div className="space-y-4">
                        {(history || []).length > 0 ? (
                            (history || []).map((tx, idx) => (
                                <div key={tx.id || idx} className="bg-card-dark border border-card-border p-4 rounded-2xl flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.status === 'pending' ? 'bg-gold/10 text-gold' : tx.status === 'approved' ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-500'}`}>
                                        <Wallet size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-sm tracking-tight">${parseFloat(tx.amount || 0).toFixed(2)} USDT</h4>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tx.status === 'pending' ? 'bg-gold/10 text-gold' : tx.status === 'approved' ? 'bg-secondary text-white' : 'bg-red-500 text-white'}`}>
                                                {tx.status || 'Unknown'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/40 mt-1">{tx.created_at ? new Date(tx.created_at).toLocaleString() : '---'}</p>
                                    </div>
                                    <div className="text-right">
                                        {tx.txn_hash ? (
                                            <a
                                                href={`https://tronscan.org/#/transaction/${tx.txn_hash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                                            >
                                                TX <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <div className="text-white/20">
                                                <ChevronRight size={18} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                icon="💸"
                                title="No withdrawals yet"
                                description="Your withdrawal history will appear here once you make your first request."
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Withdrawal;
