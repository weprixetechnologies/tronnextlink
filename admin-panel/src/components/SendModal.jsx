import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from '../api/axios';
import LoadingSpinner from './LoadingSpinner';
import { Send, Wallet, Activity, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';

const SendModal = ({ isOpen, onClose, user, onSent }) => {
    const [formData, setFormData] = useState({ to_address: '', amount: '', note: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [balances, setBalances] = useState({ onChain: 0, db: 0, trx: 0 });
    const [status, setStatus] = useState({ type: '', message: '', hash: '' });

    useEffect(() => {
        if (isOpen && user) {
            fetchBalances();
            setFormData({ to_address: '', amount: '', note: '' });
            setStatus({ type: '', message: '', hash: '' });
        }
    }, [isOpen, user]);

    const fetchBalances = async () => {
        try {
            setFetching(true);
            const res = await axios.get(`/admin/wallets/${user.id}/onchain-balance`);
            if (res.data.success) {
                setBalances({
                    onChain: res.data.data.on_chain_balance_usdt || 0,
                    db: res.data.data.db_balance_usdt || 0,
                    trx: 0 // Will be handled by backend, but could fetch here if needed
                });
            }
        } catch (err) {
            console.error('Error fetching balances:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!formData.to_address.startsWith('T') || formData.to_address.length !== 34) {
            return setStatus({ type: 'error', message: 'Invalid TRON address format' });
        }
        if (parseFloat(formData.amount) > balances.onChain) {
            return setStatus({ type: 'error', message: 'Amount exceeds on-chain USDT balance' });
        }

        try {
            setLoading(true);
            setStatus({ type: 'info', message: 'Broadcasting transaction to blockchain...' });

            const res = await axios.post(`/admin/wallets/${user.id}/send`, formData);

            if (res.data.success) {
                setStatus({
                    type: 'success',
                    message: res.data.message || 'Transaction successful!',
                    hash: res.data.data.txn_hash
                });

                // Refresh data after success
                if (onSent) onSent();

                // Auto-close after 3s
                setTimeout(() => {
                    onClose();
                }, 4000);
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Transaction failed. Check TRX (Gas) or try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={loading ? undefined : onClose}
            title={`Direct Distribution Terminal`}
            maxWidth="max-w-md"
        >
            <div className="space-y-6">
                {/* Protocol Header */}
                <div className="bg-indigo-950 p-6 rounded-2xl text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-1">Source Node</p>
                        <h4 className="text-xl font-black truncate">{user?.full_name}</h4>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-bold uppercase text-indigo-400 mb-0.5">DB Ledger</p>
                                <p className="text-lg font-black tracking-tighter">${parseFloat(balances.db || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase text-indigo-400 mb-0.5">On-Chain</p>
                                <p className="text-lg font-black tracking-tighter text-emerald-400">${parseFloat(balances.onChain || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -right-4 -bottom-4 text-indigo-900/40">
                        <Wallet size={120} strokeWidth={1} />
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Destination Protocol (TRON Address)</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="input pl-10 bg-gray-50 border-gray-100"
                                placeholder="Enter T-Address..."
                                value={formData.to_address}
                                onChange={e => setFormData({ ...formData, to_address: e.target.value })}
                                required
                                disabled={loading || status.type === 'success'}
                            />
                            <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">USDT Quantum (Amount)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.000001"
                                className="input pl-10 bg-gray-50 border-gray-100"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                                disabled={loading || status.type === 'success'}
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">$</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, amount: balances.onChain })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-white px-2 py-1 rounded-md shadow-sm border border-indigo-50"
                                disabled={loading || status.type === 'success'}
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Admin Note (Optional)</label>
                        <textarea
                            className="input min-h-[80px] bg-gray-50 border-gray-100 py-3 scrollbar-hide active:scrollbar-default"
                            placeholder="Reason for manual withdrawal..."
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            disabled={loading || status.type === 'success'}
                        ></textarea>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 animate-fade-in ${status.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                            <div className="shrink-0 mt-0.5">
                                {status.type === 'error' ? <AlertCircle size={18} /> :
                                    status.type === 'success' ? <Send size={18} /> :
                                        <LoadingSpinner size={18} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold leading-relaxed">{status.message}</p>
                                {status.hash && (
                                    <a
                                        href={`https://shasta.tronscan.org/#/transaction/${status.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        View on Tronscan <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {!status.hash && (
                        <button
                            type="submit"
                            className="btn btn-primary w-full py-3 h-14 relative overflow-hidden group shadow-xl shadow-indigo-200"
                            disabled={loading || !formData.to_address || !formData.amount}
                        >
                            {loading ? (
                                <LoadingSpinner color="text-white" />
                            ) : (
                                <>
                                    <span className="relative z-10 flex items-center gap-2 font-black uppercase tracking-widest text-sm">
                                        Execute Transfer <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </>
                            )}
                        </button>
                    )}
                </form>
            </div>
        </Modal>
    );
};

export default SendModal;
