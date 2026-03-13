import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Wallet as WalletIcon,
    ArrowUpRight,
    ArrowDownLeft,
    QrCode,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Copy,
    ChevronLeft,
    ChevronRight,
    Search,
    History,
    Activity
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Wallet = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [withdrawData, setWithdrawData] = useState({ amount: '', address: '' });
    const [message, setMessage] = useState('');

    const fetchData = async (page = 1) => {
        setRefreshing(true);
        try {
            const [walletRes, txnsRes] = await Promise.all([
                axios.get('/wallet'),
                axios.get(`/wallet/transactions?page=${page}&limit=10`)
            ]);
            setWallet(walletRes.data.data);
            setTransactions(txnsRes.data.data.transactions);
            setPagination(txnsRes.data.data.pagination);
        } catch (err) {
            console.error('Error fetching wallet data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(pagination.page), 60000);
        return () => clearInterval(interval);
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post('/wallet/withdraw', {
                amount: withdrawData.amount,
                to_tron_address: withdrawData.address
            });
            setMessage({ type: 'success', text: res.data.message });
            setWithdrawData({ amount: '', address: '' });
            fetchData(1);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Withdrawal failed' });
        }
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(user?.tron_address);
        alert('Deposit address copied!');
    };

    if (loading && !wallet) return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
            <WalletIcon className="text-indigo-600 animate-bounce mb-4" size={48} />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Opening Secure Vault...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Treasury Department</p>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Financial Hub</h1>
                </div>
                <button
                    onClick={() => fetchData(pagination.page)}
                    disabled={refreshing}
                    className="flex items-center px-6 py-3 bg-white border rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-600 hover:text-indigo-600 hover:shadow-md transition-all disabled:opacity-50"
                >
                    <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Sync Ledger
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="card bg-gray-900 text-white border-none shadow-2xl relative overflow-hidden p-8">
                        <div className="relative z-10">
                            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">Available Liquidity</p>
                            <p className="text-5xl font-black mb-8 tracking-tighter">${parseFloat(wallet?.balance_usdt || 0).toFixed(2)}</p>

                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Yield</p>
                                    <p className="text-xl font-black text-green-400 tracking-tighter">${parseFloat(wallet?.total_earned || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Outflow</p>
                                    <p className="text-xl font-black text-rose-400 tracking-tighter">${parseFloat(wallet?.total_withdrawn || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <Activity size={200} className="absolute -right-10 -bottom-10 text-white/[0.03] rotate-12" />
                    </div>

                    <div className="card bg-white border-none shadow-xl p-8">
                        <h3 className="font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center">
                            <QrCode size={20} className="mr-2 text-indigo-600" />
                            Inbound Terminal
                        </h3>
                        <div className="bg-gray-50 p-6 rounded-2xl flex flex-col items-center border-2 border-dashed border-gray-200">
                            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100">
                                <QRCodeSVG value={user?.tron_address} size={160} />
                            </div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Internal Receipt Address</p>
                            <div className="flex items-center bg-white px-4 py-3 rounded-xl border w-full mb-6 group">
                                <span className="text-[10px] font-mono font-bold text-gray-600 truncate flex-1 mr-2">{user?.tron_address}</span>
                                <button onClick={copyAddress} className="text-indigo-600 hover:scale-110 transition-transform"><Copy size={16} /></button>
                            </div>
                            <div className="flex items-start bg-amber-50 p-3 rounded-xl border border-amber-100">
                                <AlertTriangle size={14} className="text-amber-600 mr-2 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-amber-700 font-black uppercase tracking-widest leading-relaxed">
                                    STRICT: SEND ONLY USDT (TRC-20). PROTOCOL LOCKS ASSETS SENT VIA WRONG NETWORK.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="card shadow-xl border-none p-8 bg-white">
                        <h3 className="font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center">
                            <ArrowUpRight size={20} className="mr-2 text-rose-600" />
                            Withdrawal protocol
                        </h3>
                        {message && (
                            <div className={`p-4 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={16} className="mr-2" /> : <AlertTriangle size={16} className="mr-2" />}
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleWithdraw} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Amount (USDT)</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-gray-900 shadow-inner"
                                        placeholder="Min 5.00"
                                        step="0.01"
                                        value={withdrawData.amount}
                                        onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Destination TRC-20 Address</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-gray-900 shadow-inner"
                                        placeholder="T..."
                                        value={withdrawData.address}
                                        onChange={(e) => setWithdrawData({ ...withdrawData, address: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-200">
                                Initiate Transfer Protocol
                            </button>
                        </form>
                    </div>

                    <div className="card shadow-2xl border-none p-8 bg-white overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-gray-900 uppercase tracking-tighter flex items-center">
                                <History size={20} className="mr-2 text-indigo-600" />
                                Audit Ledger
                            </h3>
                            <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600">Export CSV</button>
                        </div>
                        <div className="overflow-x-auto -mx-8">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 text-white">
                                    <tr className="text-[9px] font-black uppercase tracking-[0.2em]">
                                        <th className="px-8 py-4">Event Type</th>
                                        <th className="px-8 py-4">Volume</th>
                                        <th className="px-8 py-4">Timestamp</th>
                                        <th className="px-8 py-4 text-right">Reference</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.length > 0 ? (
                                        transactions.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-8 py-4">
                                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest block w-fit ${txn.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {txn.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className={`font-black text-sm tracking-tighter ${txn.amount > 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                                        {txn.amount > 0 ? '+' : ''}{parseFloat(txn.amount).toFixed(2)} USDT
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{new Date(txn.created_at).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(txn.created_at).toLocaleTimeString()}</p>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <span className="text-[9px] font-mono font-bold text-gray-300">#{txn.id.substring(0, 8)}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-bold italic uppercase tracking-widest text-xs">The ledger is silent. No transactions detected.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {pagination.pages > 1 && (
                            <div className="flex justify-between items-center mt-8 pt-8 border-t">
                                <button
                                    onClick={() => fetchData(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-xs font-black text-gray-900 uppercase">Sector {pagination.page} / {pagination.pages}</span>
                                <button
                                    onClick={() => fetchData(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.pages}
                                    className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
