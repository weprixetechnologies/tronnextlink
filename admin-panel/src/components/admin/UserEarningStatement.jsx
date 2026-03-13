import React, { useState, useEffect } from 'react';
import {
    Search,
    FileText,
    TrendingUp,
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet,
    Loader2,
    Calendar,
    User,
    ChevronRight,
    ArrowRightLeft,
    PieChart as PieIcon,
    Download
} from 'lucide-react';
import axios from '../../api/axios';

const UserEarningStatement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery) return;

        setLoading(true);
        setError(null);
        try {
            // First search for user by email/id
            const searchRes = await axios.get(`/admin/users?search=${searchQuery}`);
            const user = searchRes.data?.data?.[0];

            if (!user) {
                setError('User not found');
                setData(null);
                return;
            }

            const res = await axios.get(`/admin/analytics/user-statement/${user.id}`);
            if (res.data?.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error('Statement fetch error:', err);
            setError('Failed to fetch user statement');
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        if (!data) return;
        const headers = ["Timestamp", "Type", "Description", "Amount", "Current Balance"];
        const rows = data.transactions.map(tx => [
            new Date(tx.created_at).toLocaleString(),
            tx.type,
            tx.description,
            tx.amount,
            tx.balance_after
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `statement_${data.user.full_name}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <FileText size={24} className="text-primary" />
                        Audit-Grade User Earning Statement
                    </h3>
                    <p className="text-black/60 text-xs font-medium">Generate a complete financial ledger and platform-position mapping for any user.</p>
                </div>
                <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Email or User ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 pl-12 pr-6 text-sm placeholder:text-black/40 focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                </form>
            </div>

            {!data && !loading && !error && (
                <div className="bg-white shadow-sm border border-gray-200 border-dashed rounded-[3rem] p-32 flex flex-col items-center justify-center text-center opacity-30">
                    <div className="w-24 h-24 rounded-[2rem] bg-black/5 flex items-center justify-center mb-8">
                        <User size={48} className="text-black/40" />
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-widest mb-2">Initialize Audit</h4>
                    <p className="text-sm font-medium max-w-sm">Search for a user to see their total earnings, withdrawals, and platform fee contribution.</p>
                </div>
            )}

            {loading && (
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={48} className="text-primary animate-spin" />
                    <p className="text-black/60 font-black text-xs uppercase tracking-widest animate-pulse">Scanning ledger archives...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center">
                    <p className="text-red-400 font-bold">{error}</p>
                </div>
            )}

            {data && (
                <div className="space-y-10 animate-fade-in">
                    {/* User Profile Header */}
                    <div className="bg-white shadow-sm border border-gray-200 rounded-[3rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl -mr-48 -mt-48"></div>

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-2xl shadow-primary/20">
                                <span className="text-3xl font-black text-black">{data.user.full_name?.charAt(0)}</span>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-black">{data.user.full_name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs font-bold text-black/60 uppercase tracking-widest">{data.user.email}</span>
                                    <div className="w-1 h-1 rounded-full bg-black/20"></div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${data.user.status === 'active' ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-500'}`}>
                                        {data.user.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-10 relative z-10 pr-6">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Active Plan</p>
                                <p className="text-xl font-black text-primary">{data.plan?.name || 'NO PLAN'}</p>
                            </div>
                            <div className="w-px h-12 bg-black/5"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Current Balance</p>
                                <p className="text-xl font-black text-black">${parseFloat(data.summary.current_balance).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={exportCSV}
                                className="p-4 bg-black/5 border border-black/10 rounded-2xl hover:bg-black/10 transition-all text-black/60 hover:text-black"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-[2rem] space-y-4">
                            <div className="flex items-center justify-between text-teal-400">
                                <TrendingUp size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Gross Yield</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-0.5">Total Cumulative Earned</p>
                                <h5 className="text-2xl font-black">${parseFloat(data.summary.total_earned).toLocaleString()}</h5>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-[2rem] space-y-4">
                            <div className="flex items-center justify-between text-primary">
                                <PieIcon size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Network Contrib</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-0.5">Network Paid Vol</p>
                                <h5 className="text-2xl font-black">${parseFloat(data.network_contribution.referred_users_total_paid).toLocaleString()}</h5>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-[2rem] space-y-4">
                            <div className="flex items-center justify-between text-amber-500">
                                <ArrowDownCircle size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Expenditure</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-0.5">Plan Spend</p>
                                <h5 className="text-2xl font-black">${parseFloat(data.summary.total_plan_spend).toLocaleString()}</h5>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-[2rem] space-y-4 text-left">
                            <div className="flex items-center justify-between text-red-400">
                                <ArrowRightLeft size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Net Flow</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-0.5">Withdrawals Out</p>
                                <h5 className="text-2xl font-black">${parseFloat(data.summary.total_withdrawn).toLocaleString()}</h5>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] overflow-hidden">
                        <div className="px-8 py-6 border-b border-black/5 bg-black/[0.01]">
                            <h4 className="text-sm font-black uppercase tracking-widest">Full Transaction Ledger</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/5 text-[9px] font-black text-black/40 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-4">Timestamp</th>
                                        <th className="px-8 py-4">Type</th>
                                        <th className="px-8 py-4">Description</th>
                                        <th className="px-8 py-4">Amount</th>
                                        <th className="px-8 py-4 text-right">Balance After</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {data.transactions.map((tx, idx) => (
                                        <tr key={idx} className="hover:bg-black/[0.01] transition-colors">
                                            <td className="px-8 py-4 text-xs font-bold text-black/60">{new Date(tx.created_at).toLocaleString()}</td>
                                            <td className="px-8 py-4 uppercase">
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-widest bg-black/5 ${['deposit', 'join_income', 'affiliate_l1', 'affiliate_l2'].includes(tx.type) ? 'text-teal-400' : 'text-primary'
                                                    }`}>
                                                    {tx.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-black/80">{tx.description}</td>
                                            <td className={`px-8 py-4 text-sm font-black ${['deposit', 'join_income', 'affiliate_l1', 'affiliate_l2', 'admin_credit'].includes(tx.type) ? 'text-teal-400' : 'text-primary'
                                                }`}>
                                                {['deposit', 'join_income', 'affiliate_l1', 'affiliate_l2', 'admin_credit'].includes(tx.type) ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                            </td>
                                            <td className="px-8 py-4 text-right text-sm font-black text-black/80">${parseFloat(tx.balance_after).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserEarningStatement;
