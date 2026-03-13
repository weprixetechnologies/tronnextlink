import React, { useState, useEffect } from 'react';
import {
    Wallet,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Loader2,
    Database,
    Zap,
    ExternalLink,
    Search,
    ChevronRight,
    Copy,
    Check
} from 'lucide-react';
import axios from '../../api/axios';

const WithdrawalFundSourcing = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [txnHash, setTxnHash] = useState('');
    const [processing, setProcessing] = useState(false);
    const [copied, setCopied] = useState(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/analytics/withdrawals/pending');
            if (res.data?.success) {
                setWithdrawals(res.data.data);
            }
        } catch (err) {
            console.error('Pending withdrawals fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleComplete = async () => {
        if (!txnHash) return alert('Please enter Transaction Hash');
        setProcessing(true);
        try {
            const res = await axios.patch(`/admin/analytics/withdrawals/${selectedWithdrawal.id}/complete`, {
                txn_hash: txnHash
            });
            if (res.data?.success) {
                alert('Withdrawal marked as completed!');
                setSelectedWithdrawal(null);
                setTxnHash('');
                fetchPending();
            }
        } catch (err) {
            alert('Failed to complete withdrawal');
        } finally {
            setProcessing(false);
        }
    };

    const handleSource = async () => {
        setProcessing(true);
        try {
            const res = await axios.post(`/admin/analytics/withdrawals/${selectedWithdrawal.id}/source-funds`, {
                sources: ["Platform Liquidity Pool A", "Internal Buffer"],
                total_sourced: selectedWithdrawal.amount
            });
            if (res.data?.success) {
                alert('Funds marked as sourced from internal pools.');
                fetchPending();
                setSelectedWithdrawal(null);
            }
        } catch (err) {
            alert('Failed to source funds');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <Wallet size={24} className="text-primary" />
                        Withdrawal Fund Sourcing
                    </h3>
                    <p className="text-black/60 text-xs font-medium">Manage on-chain fund distribution for pending user withdrawals.</p>
                </div>
                <div className="flex items-center gap-4 bg-black/5 p-4 rounded-[2rem] border border-black/5">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Platform Liquidity</p>
                        <p className="text-lg font-black text-black">$12,450.00 <span className="text-xs text-teal-400 font-bold">READY</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                        <ShieldCheck size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LIST SECTION */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-black/5 bg-black/[0.02] flex items-center justify-between">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-black/60">Queue: {withdrawals.length} Pending</h4>
                        <div className="flex items-center gap-2">
                            <Search size={14} className="text-black/40" />
                            <input type="text" placeholder="Search Wallet..." className="bg-transparent border-none text-[10px] focus:ring-0 text-black placeholder:text-black/10 p-0" />
                        </div>
                    </div>

                    <div className="divide-y divide-black/5 overflow-y-auto max-h-[600px] flex-1">
                        {loading ? (
                            <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
                        ) : withdrawals.length === 0 ? (
                            <div className="p-20 text-center text-black/40 font-black uppercase text-xs tracking-widest italic">Stable - No Pending Requests</div>
                        ) : (
                            withdrawals.map((w) => (
                                <div
                                    key={w.id}
                                    onClick={() => setSelectedWithdrawal(w)}
                                    className={`p-6 cursor-pointer group transition-all relative ${selectedWithdrawal?.id === w.id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-black/[0.02] border-l-4 border-transparent'}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center font-black text-black/60 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                {w.user_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-black">{w.user_name}</p>
                                                <p className="text-[10px] text-black/40">{new Date(w.requested_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-black">${parseFloat(w.amount).toFixed(2)}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] ${w.status === 'sourced' ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {w.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-black/40 truncate">
                                        <Wallet size={12} />
                                        {w.to_tron_address}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* DETAILS & ACTION SECTION */}
                <div className="space-y-8">
                    {selectedWithdrawal ? (
                        <div className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] p-8 space-y-8 animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32"></div>

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">Execution Panel</h4>
                                    <button onClick={() => setSelectedWithdrawal(null)} className="text-[10px] font-black text-black/40 uppercase hover:text-black">Close</button>
                                </div>

                                {/* User Details Card */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/5 border border-black/5 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-1">Target Account</p>
                                        <p className="text-xs font-bold text-black mb-2">{selectedWithdrawal.user_name}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-mono text-black/60 truncate mr-2">{selectedWithdrawal.to_tron_address}</p>
                                            <button onClick={() => handleCopy(selectedWithdrawal.to_tron_address, 'tgt')} className="text-black/40 hover:text-black">
                                                {copied === 'tgt' ? <Check size={12} className="text-teal-400" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-black/5 border border-black/5 p-4 rounded-2xl flex flex-col justify-center">
                                        <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-1">On-Chain Balance</p>
                                        <p className="text-xl font-black text-black">${parseFloat(selectedWithdrawal.user_onchain_balance || 0).toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Fund Sourcing Logic */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-black/60">Fund Sourcing Map</h5>
                                        <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1">
                                            <Zap size={10} /> Auto-suggest available
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl border border-dashed border-black/10 group hover:border-primary/50 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Database size={18} className="text-black/40 group-hover:text-primary" />
                                                <div>
                                                    <p className="text-xs font-black">Main Liquidity Pool (A)</p>
                                                    <p className="text-[9px] text-black/40">TRON-NETWORK-VAULT-012</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-black text-primary">${selectedWithdrawal.amount}</p>
                                        </div>
                                        <button
                                            onClick={handleSource}
                                            disabled={processing || selectedWithdrawal.status === 'sourced'}
                                            className="w-full py-3 bg-black/5 border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/10 transition-all disabled:opacity-50"
                                        >
                                            {selectedWithdrawal.status === 'sourced' ? <><CheckCircle2 size={16} className="text-teal-400" /> Funds Sourced</> : 'Confirm Internal Sourcing'}
                                        </button>
                                    </div>
                                </div>

                                {/* Transaction Hash Submission */}
                                <div className="space-y-4 pt-4 border-t border-black/5">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-black/60">Finalize Completion</h5>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Paste TRC-20 Transaction Hash (TxID)"
                                                value={txnHash}
                                                onChange={(e) => setTxnHash(e.target.value)}
                                                className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-6 text-sm placeholder:text-black/10 text-black font-mono focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleComplete}
                                            disabled={processing || !txnHash}
                                            className="w-full py-5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:grayscale disabled:opacity-50"
                                        >
                                            {processing ? <Loader2 className="animate-spin" size={18} /> : 'Finalize & Record Withdrawal'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow-sm border border-gray-200 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-20 h-20 rounded-[2rem] bg-black/5 border border-black/10 flex items-center justify-center mb-6">
                                <ChevronRight size={40} className="text-black/40" />
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-widest mb-2">Select a task</h4>
                            <p className="text-xs font-medium max-w-xs text-black/60">Select a pending withdrawal from the queue to manage fund sourcing and final execution.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WithdrawalFundSourcing;
