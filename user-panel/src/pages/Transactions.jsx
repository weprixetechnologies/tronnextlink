import React, { useState, useEffect } from 'react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Filter,
    Download,
    Search,
    ExternalLink,
    Loader2,
    FilterX,
    RefreshCw
} from 'lucide-react';
import axios from '../api/axios';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [summary, setSummary] = useState({ in: 0, out: 0 });

    const tabs = [
        { label: 'All', value: '' },
        { label: 'Deposit', value: 'deposit' },
        { label: 'Earnings', value: 'join_income' },
        { label: 'Affiliate', value: 'affiliate' },
        { label: 'Withdrawal', value: 'withdrawal' }
    ];

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/wallet/transactions?type=${filter}`);
            const data = (res.data?.data?.transactions || res.data?.data || []);
            setTransactions(Array.isArray(data) ? data : []);

            // Simple summary logic for the cards
            if (!filter) {
                const txList = Array.isArray(data) ? data : [];
                const isTxNegative = (tx) => {
                    const amount = parseFloat(tx.amount || 0);
                    if (amount < 0) return true;
                    return ['withdrawal', 'admin_debit', 'plan_purchase', 'platform_fee'].includes(tx.type);
                };

                const totalIn = txList
                    .filter(tx => tx && !isTxNegative(tx))
                    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount || 0)), 0);
                const totalOut = txList
                    .filter(tx => tx && isTxNegative(tx))
                    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount || 0)), 0);
                setSummary({ in: totalIn, out: totalOut });
            }
        } catch (err) {
            console.error('Error fetching transactions', err);
            setError('Failed to load transactions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-white/40 text-sm animate-pulse">Loading transaction history...</p>
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
            className="space-y-6 transition-all duration-500 pb-12"
            style={{ animation: 'fadeIn 0.5s ease' }}
        >
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card-dark border border-card-border p-6 rounded-2xl flex items-center justify-between group hover:border-secondary/30 transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Received</p>
                        <h4 className="text-2xl font-black text-secondary">+${(summary?.in || 0).toFixed(2)}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowDownLeft size={24} />
                    </div>
                </div>
                <div className="bg-card-dark border border-card-border p-6 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Paid Out</p>
                        <h4 className="text-2xl font-black text-red-500">-${(summary?.out || 0).toFixed(2)}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowUpRight size={24} />
                    </div>
                </div>
                <div className="bg-card-dark border border-card-border p-6 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Net Balance</p>
                        <h4 className="text-2xl font-black text-primary">${((summary?.in || 0) - (summary?.out || 0)).toFixed(2)}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Filter size={24} />
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                                ${filter === tab.value
                                    ? 'bg-primary text-white glow-purple'
                                    : 'bg-card-dark text-white/40 hover:bg-white/5 border border-card-border'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-card-dark border border-card-border px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="bg-card-dark border border-card-border rounded-3xl overflow-hidden shadow-xl">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-white/5 border-b border-card-border text-[10px] font-black uppercase text-white/40 tracking-widest">
                    <div className="col-span-1">Icon</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-4">Description / Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1 text-right">TX</div>
                </div>

                <div className="divide-y divide-card-border/50">
                    {(transactions || []).length > 0 ? (
                        (transactions || []).map((tx, idx) => (
                            <div key={tx.id || idx} className="md:grid md:grid-cols-12 md:gap-4 md:items-center p-4 md:p-5 hover:bg-white/5 transition-all group">
                                <div className="md:col-span-12 lg:hidden">
                                    <TransactionItem
                                        type={tx.type}
                                        description={tx.description}
                                        amount={tx.amount}
                                        date={tx.created_at ? new Date(tx.created_at).toLocaleString() : '---'}
                                        status={tx.status}
                                    />
                                </div>
                                <div className="hidden lg:contents">
                                    <div className="col-span-1">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${!(tx.amount < 0 || ['withdrawal', 'admin_debit', 'plan_purchase', 'platform_fee'].includes(tx.type)) ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-500'}`}>
                                            {!(tx.amount < 0 || ['withdrawal', 'admin_debit', 'plan_purchase', 'platform_fee'].includes(tx.type)) ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-sm font-bold capitalize">{tx.type?.replace('_', ' ') || 'Other'}</span>
                                    </div>
                                    <div className="col-span-4 flex flex-col">
                                        <span className="text-sm text-white/60 truncate">{tx.description || 'System transaction'}</span>
                                        <span className="text-[10px] text-white/40">{tx.created_at ? new Date(tx.created_at).toLocaleString() : '---'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tx.status === 'completed' || tx.status === 'approved' ? 'bg-secondary/10 text-secondary' : tx.status === 'pending' ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'}`}>
                                            {tx.status || 'Completed'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <span className={`text-base font-black ${!(tx.amount < 0 || ['withdrawal', 'admin_debit', 'plan_purchase', 'platform_fee'].includes(tx.type)) ? 'text-secondary' : 'text-red-500'}`}>
                                            {!(tx.amount < 0 || ['withdrawal', 'admin_debit', 'plan_purchase', 'platform_fee'].includes(tx.type)) ? '+' : '-'}${Math.abs(parseFloat(tx.amount || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-right text-white/40 group-hover:text-primary">
                                        <button className="p-1 hover:bg-primary/10 rounded-lg">
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20">
                            <EmptyState
                                icon={<FilterX size={48} className="text-white/40 mb-4" />}
                                title="No transactions found"
                                description={filter ? `No result for category "${filter}"` : "You haven't made any transactions yet."}
                                actionText={filter ? "Show All Transactions" : "Make a Deposit"}
                                onAction={() => filter ? setFilter('') : window.location.href = '/deposit'}
                            />
                        </div>
                    )}
                </div>
            </div>

            {(transactions || []).length > 10 && (
                <div className="flex justify-center mt-6">
                    <button className="px-8 py-3 bg-card-dark border border-card-border rounded-xl text-sm font-bold text-white/60 hover:text-white transition-all">
                        Load More Transactions
                    </button>
                </div>
            )}
        </div>
    );
};

export default Transactions;
