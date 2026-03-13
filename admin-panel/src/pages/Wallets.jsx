import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import SendModal from '../components/SendModal';
import {
    Search,
    RefreshCw,
    Wallet,
    Send,
    ShieldCheck,
    Database,
    TrendingUp,
    ArrowUpRight,
    Search as SearchIcon
} from 'lucide-react';
import { debounce } from 'lodash';

const Wallets = () => {
    const [wallets, setWallets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState({});
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    // Send Modal State
    const [sendModal, setSendModal] = useState({ isOpen: false, user: null });

    const fetchWallets = async (page = 1, searchTerm = search) => {
        try {
            setLoading(true);
            const res = await axios.get('/admin/wallets', {
                params: { page, limit: 15, search: searchTerm }
            });
            if (res.data.success) {
                setWallets(res.data.data.wallets);
                setPagination(res.data.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching wallets:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await axios.get('/admin/wallets/summary');
            if (res.data.success) {
                setSummary(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching summary:', err);
        }
    };

    const debouncedFetch = useCallback(
        debounce((term) => fetchWallets(1, term), 500),
        []
    );

    useEffect(() => {
        fetchWallets();
        fetchSummary();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedFetch(e.target.value);
    };

    const handleSync = async (user) => {
        try {
            setSyncing(prev => ({ ...prev, [user.id]: true }));
            const res = await axios.post(`/admin/wallets/${user.id}/sync-balance`);

            if (res.data.success) {
                if (res.data.data.synced) {
                    // FIX: Immediate state update without full reload
                    setWallets(prev => prev.map(w => {
                        if (w.id === user.id) {
                            return {
                                ...w,
                                balance_usdt: res.data.data.new_db_balance || 0,
                                total_earned: parseFloat(w.total_earned || 0) + (res.data.data.amount_added || 0)
                            };
                        }
                        return w;
                    }));
                    alert(`Successfully synced! Added ${res.data.data.amount_added} USDT to DB balance.`);
                } else {
                    alert(res.data.data.message || 'Already in sync.');
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Sync failed');
        } finally {
            setSyncing(prev => ({ ...prev, [user.id]: false }));
        }
    };

    const columns = [
        {
            header: 'Participant Identity',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 font-black text-sm border border-gray-100 shadow-sm shrink-0">
                        {row?.full_name?.substring(0, 1)}
                    </div>
                    <div className="flex flex-col min-w-[200px]">
                        <span className="font-bold text-gray-900 leading-tight truncate">{row.full_name}</span>
                        <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-widest mt-0.5 truncate">{row.tron_address || 'NOT INITIALIZED'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'DB Balance',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 tracking-tighter text-sm">${parseFloat(row.balance_usdt || 0).toFixed(2)}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">USDT</span>
                </div>
            )
        },
        {
            header: 'On-Chain Assets',
            render: (row) => {
                const diff = (row.on_chain_balance || 0) - parseFloat(row.balance_usdt || 0);
                const needsSync = diff > 0.01;
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className={`font-black tracking-tighter text-sm ${needsSync ? 'text-amber-600' : 'text-gray-900'}`}>
                                ${parseFloat(row.on_chain_balance || 0).toFixed(2)}
                            </span>
                            {needsSync && (
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Discrepancy Detected"></div>
                            )}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">USDT</span>
                    </div>
                );
            }
        },
        {
            header: 'Vault Stats',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase w-10">Earned</span>
                        <span className="text-[10px] font-black text-emerald-600 tracking-tight">${parseFloat(row.total_earned || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase w-10">Out</span>
                        <span className="text-[10px] font-black text-rose-500 tracking-tight">${parseFloat(row.total_withdrawn || 0).toFixed(2)}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Active Tier',
            render: (row) => (
                <Badge variant={row.plan_name ? 'purple' : 'gray'}>{row.plan_name || 'ORPHAN'}</Badge>
            )
        },
        {
            header: 'Commands',
            className: 'text-right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleSync(row)}
                        disabled={syncing[row.id]}
                        className={`p-2 rounded-xl transition-all shadow-sm shadow-black/5 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${syncing[row.id] ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            }`}
                        title="Sync On-Chain Balance"
                    >
                        {syncing[row.id] ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        <span className="hidden lg:inline">Sync</span>
                    </button>
                    <button
                        onClick={() => setSendModal({ isOpen: true, user: row })}
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all shadow-sm shadow-black/5 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                        title="Direct Extraction"
                    >
                        <Send size={16} />
                        <span className="hidden lg:inline">Send</span>
                    </button>
                </div>
            )
        }
    ];

    return (
        <Layout title="Liquidity Terminal">
            <div className="space-y-8">
                {/* Summary View */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-indigo-950 p-6 rounded-3xl text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300/80 mb-2">Total System Liquidity</p>
                            <h3 className="text-3xl font-black tracking-tighter">${parseFloat(summary?.total_db_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                                <TrendingUp size={14} /> Global Ledger
                            </div>
                        </div>
                        <Wallet className="absolute -right-4 -bottom-4 text-indigo-900/40 group-hover:scale-110 transition-transform duration-500" size={120} strokeWidth={1} />
                    </div>

                    <div className="card border-l-4 border-l-emerald-500">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Network Harvest</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">${parseFloat(summary?.total_earned_platform || 0).toLocaleString()}</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-2">Aggregated earnings across all nodes</p>
                    </div>

                    <div className="card border-l-4 border-l-rose-500">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Extractions</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">${parseFloat(summary?.total_withdrawn_platform || 0).toLocaleString()}</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1">
                            <ArrowUpRight size={12} className="text-rose-500" /> Including {summary?.pending_withdrawals_count || 0} pending signals
                        </p>
                    </div>
                </div>

                {/* Wallets Control Center */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Database className="text-indigo-600" size={24} /> Node Vaults
                            </h2>
                            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest font-black">On-Chain Protocol Management</p>
                        </div>
                        <div className="relative max-w-sm w-full">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type="text"
                                className="input pl-12 h-12 bg-white border-gray-100 shadow-sm"
                                placeholder="Search by identity or wallet..."
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    <div className="card p-0 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={wallets}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={(p) => fetchWallets(p)}
                            emptyTitle="No Vaults Mapped"
                            emptyMessage="The search query returned zero liquidity nodes."
                        />
                    </div>
                </div>
            </div>

            {/* Send Modal */}
            <SendModal
                isOpen={sendModal.isOpen}
                onClose={() => setSendModal({ isOpen: false, user: null })}
                user={sendModal.user}
                onSent={() => {
                    fetchWallets(pagination.page);
                    fetchSummary();
                }}
            />
        </Layout>
    );
};

export default Wallets;
