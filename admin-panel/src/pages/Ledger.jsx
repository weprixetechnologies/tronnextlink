import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import { Search, FileText, Filter, Calendar, ArrowDownRight, ArrowUpRight, Database } from 'lucide-react';
import { debounce } from 'lodash';

const Ledger = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchLedger = async (page = 1, searchTerm = search, txnType = type) => {
        try {
            setLoading(true);
            const res = await axios.get('/admin/ledger', {
                params: {
                    page,
                    limit: 20,
                    search: searchTerm,
                    type: txnType
                }
            });
            if (res.data.success) {
                setTransactions(res.data.data.transactions);
                setPagination(res.data.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching ledger:', err);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = useCallback(
        debounce((term) => fetchLedger(1, term, type), 500),
        [type]
    );

    useEffect(() => {
        fetchLedger();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedFetch(e.target.value);
    };

    const handleTypeChange = (newType) => {
        setType(newType);
        fetchLedger(1, search, newType);
    };

    const columns = [
        {
            header: 'Timestamp',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{new Date(row.created_at).toLocaleDateString()}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{new Date(row.created_at).toLocaleTimeString()}</span>
                </div>
            )
        },
        {
            header: 'Identities (From → To)',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col max-w-[120px]">
                        <span className="font-bold text-gray-900 truncate">{row.from_name || 'System'}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{row.from_user_id ? 'Node' : 'Protocol'}</span>
                    </div>
                    <ArrowDownRight size={14} className="text-gray-300 shrink-0" />
                    <div className="flex flex-col max-w-[120px]">
                        <span className="font-bold text-gray-900 truncate">{row.to_name || 'System'}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{row.to_user_id ? 'Node' : 'Protocol'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Protocol Type',
            render: (row) => {
                const variants = {
                    join_income: 'indigo',
                    withdrawal: 'rose',
                    deposit: 'emerald',
                    affiliate_l1: 'teal',
                    affiliate_l2: 'cyan',
                    platform_fee: 'purple',
                    plan_activation: 'amber'
                };
                return <Badge variant={variants[row.type] || 'gray'}>{row.type.replace('_', ' ')}</Badge>;
            }
        },
        {
            header: 'Quantum',
            render: (row) => {
                const isDebit = ['withdrawal', 'admin_debit', 'plan_purchase', 'platform_fee'].includes(row.type);
                return (
                    <div className="flex items-center gap-1.5">
                        {isDebit ? <ArrowUpRight size={14} className="text-rose-500" /> : <ArrowDownRight size={14} className="text-emerald-500" />}
                        <span className={`font-black tracking-tighter ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isDebit ? '-' : '+'}${parseFloat(row.amount).toFixed(2)}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Atomic ID',
            render: (row) => <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">{row.id.substring(0, 8)}...</span>
        },
        {
            header: 'Status',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {row.status}
                </div>
            )
        }
    ];

    const txnTypes = [
        { label: 'All Logs', value: '' },
        { label: 'Network Joins', value: 'join_income' },
        { label: 'Extractions', value: 'withdrawal' },
        { label: 'Deposits', value: 'deposit' },
        { label: 'L1 Affiliate', value: 'affiliate_l1' },
        { label: 'L2 Affiliate', value: 'affiliate_l2' },
        { label: 'Platform Fees', value: 'platform_fee' },
    ];

    return (
        <Layout title="Transaction Ledger">
            <div className="space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            className="input pl-12 h-12 bg-white border-gray-100 shadow-sm"
                            placeholder="Search by ID or participant name..."
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-4 xl:pb-0 scrollbar-hide">
                        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                            {txnTypes.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => handleTypeChange(t.value)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${type === t.value
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Database className="text-indigo-600" size={20} />
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Audit Stream</h3>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                            Protocol Integrity Verified
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={transactions}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(p) => fetchLedger(p)}
                        emptyTitle="Clear Ledger"
                        emptyMessage="No transaction packets match the current filter parameters."
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Ledger;
