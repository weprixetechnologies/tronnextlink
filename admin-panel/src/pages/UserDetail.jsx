import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Calendar, Shield,
    CreditCard, TrendingUp, Download, PieChart,
    Edit2, Save, X, Lock, CheckCircle, AlertCircle,
    Copy, ExternalLink, ChevronDown, ChevronUp,
    Plus, Minus, History, Users as UsersIcon, Wallet
} from 'lucide-react';
import axios from '../api/axios';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';

// ─── Sub-components defined OUTSIDE main component ───────────────────────────

const StatCard = ({ icon, title, value, color, unit = '$', editable, onEdit }) => {
    const colors = {
        indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
        rose: 'bg-rose-50 border-rose-100 text-rose-700',
        cyan: 'bg-cyan-50 border-cyan-100 text-cyan-700'
    };
    const style = colors[color] || colors.indigo;

    return (
        <div className={`p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md h-full relative group ${style}`}>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</p>
                    <div className="flex items-baseline gap-0.5">
                        {unit && <span className="text-sm font-bold opacity-80">{unit}</span>}
                        <h4 className="text-2xl font-black tabular-nums tracking-tighter">
                            {typeof value === 'number' ? parseFloat(value).toFixed(2) : value}
                        </h4>
                    </div>
                </div>
                {editable && (
                    <button
                        onClick={onEdit}
                        className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

const NetworkStat = ({ label, value, icon }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            {icon} {label}
        </p>
        <p className="text-lg font-black text-gray-900 tracking-tighter tabular-nums">{value}</p>
    </div>
);

const TransactionTab = ({ data }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-400" /> Recent Activity
            </h4>
        </div>
        {!data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-12 text-gray-400 gap-4">
                <div className="p-8 bg-gray-50 rounded-full">
                    <History className="w-12 h-12 opacity-20" />
                </div>
                <p className="font-bold">No transactions recorded for this user.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-4 text-left">Date</th>
                            <th className="px-4 py-4 text-left">Type</th>
                            <th className="px-4 py-4 text-right">Amount</th>
                            <th className="px-4 py-4 text-right">Reference</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {data.map(txn => (
                            <tr key={txn.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-700">
                                            {new Date(txn.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold">
                                            {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                        {txn.type.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right font-black">
                                    <span className={
                                        ['deposit', 'admin_credit', 'join_income', 'affiliate_l1', 'affiliate_l2'].includes(txn.type)
                                            ? 'text-emerald-600'
                                            : 'text-rose-600'
                                    }>
                                        {['deposit', 'admin_credit', 'join_income', 'affiliate_l1', 'affiliate_l2'].includes(txn.type) ? '+' : '-'}
                                        ${parseFloat(txn.amount).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <p className="text-xs font-bold text-gray-500 truncate max-w-[200px]">
                                        {txn.description}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const NetworkTab = ({ data }) => {
    if (!data) return (
        <div className="flex items-center justify-center pt-12 text-gray-400">
            <p className="font-bold">No network data available.</p>
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <NetworkStat label="Level 1" value={data.stats?.total_level1 ?? 0} icon={<UsersIcon className="w-4 h-4" />} />
                <NetworkStat label="Level 2" value={data.stats?.total_level2 ?? 0} icon={<Shield className="w-4 h-4" />} />
                <NetworkStat label="Active" value={`${data.stats?.active_level1 ?? 0}/${data.stats?.active_level2 ?? 0}`} icon={<CheckCircle className="w-4 h-4" />} />
                <NetworkStat label="Net Earned" value={`$${parseFloat(data.stats?.total_earned_from_network ?? 0).toFixed(2)}`} icon={<TrendingUp className="w-4 h-4" />} />
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-indigo-900 bg-indigo-50 px-4 py-2 rounded-lg inline-block">
                    Direct Referrals (Level 1)
                </h4>
                {!data.level1 || data.level1.length === 0 ? (
                    <p className="text-gray-400 text-sm italic py-4">No direct referrals yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">Partner</th>
                                    <th className="px-4 py-3 text-left">Plan</th>
                                    <th className="px-4 py-3 text-right">Referrals</th>
                                    <th className="px-4 py-3 text-right">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.level1.map(u => (
                                    <tr key={u.id} className="group hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <Link
                                                    to={`/users/${u.id}`}
                                                    className="font-black text-gray-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                                                >
                                                    {u.full_name}
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                </Link>
                                                <span className="text-[10px] text-gray-400 font-bold tracking-tight">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase">
                                                {u.plan_name || 'Free'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-gray-600">
                                            {u.direct_referrals_count ?? 0}
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-400 font-bold">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {data.level2 && data.level2.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-purple-900 bg-purple-50 px-4 py-2 rounded-lg inline-block">
                        Indirect Referrals (Level 2)
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">Partner</th>
                                    <th className="px-4 py-3 text-left">Referred By</th>
                                    <th className="px-4 py-3 text-left">Plan</th>
                                    <th className="px-4 py-3 text-right">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.level2.map(u => (
                                    <tr key={u.id} className="group hover:bg-purple-50/30 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <Link
                                                    to={`/users/${u.id}`}
                                                    className="font-black text-gray-900 hover:text-purple-600 transition-colors inline-flex items-center gap-1"
                                                >
                                                    {u.full_name}
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                </Link>
                                                <span className="text-[10px] text-gray-400 font-bold">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500 font-bold">
                                            {u.referred_by_name}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-purple-600 uppercase">
                                                {u.plan_name || 'Free'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-400 font-bold">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const WithdrawalsTab = ({ data }) => (
    <div className="space-y-6">
        <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
            Withdrawal History
        </h4>
        {!data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-12 text-gray-400">
                <p className="font-bold">No withdrawals requested.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">To Address</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Hash</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map(w => (
                            <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4 text-gray-600 font-bold">
                                    {new Date(w.requested_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 font-black text-gray-900">
                                    ${parseFloat(w.amount).toFixed(2)}
                                </td>
                                <td className="px-4 py-4">
                                    <span className="font-mono text-xs text-gray-500">
                                        {w.to_tron_address
                                            ? `${w.to_tron_address.slice(0, 6)}...${w.to_tron_address.slice(-4)}`
                                            : '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${w.status === 'approved'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : w.status === 'rejected'
                                                ? 'bg-rose-100 text-rose-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {w.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    {w.txn_hash ? (
                                        <a
                                            href={`https://tronscan.org/#/transaction/${w.txn_hash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 text-xs font-bold"
                                        >
                                            View <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [plans, setPlans] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [network, setNetwork] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [activeTab, setActiveTab] = useState('transactions');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [adjustForm, setAdjustForm] = useState({ type: 'credit', amount: '', reason: '' });
    const [planForm, setPlanForm] = useState({ plan_id: '', charge_user: true, note: '' });
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, type: '', title: '', message: '' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUser = useCallback(async () => {
        try {
            const res = await axios.get(`/admin/users/${userId}`);
            const userData = res.data.data.user;
            setUser(userData);
            setEditForm({
                full_name: userData.full_name,
                email: userData.email,
                status: userData.status,
                role: userData.role,
                new_password: ''
            });
        } catch (err) {
            showToast('Failed to fetch user', 'error');
        }
    }, [userId]);

    const fetchPlans = useCallback(async () => {
        try {
            const res = await axios.get('/plans');
            setPlans(res.data.data || []);
        } catch (err) {
            console.error('Error fetching plans');
        }
    }, []);

    const fetchTabData = useCallback(async () => {
        try {
            if (activeTab === 'transactions') {
                const res = await axios.get(`/admin/users/${userId}/transactions`);
                setTransactions(res.data.data?.transactions || []);
            } else if (activeTab === 'network') {
                const res = await axios.get(`/admin/users/${userId}/network`);
                setNetwork(res.data.data || null);
            } else if (activeTab === 'withdrawals') {
                const res = await axios.get(`/admin/users/${userId}/withdrawals`);
                setWithdrawals(res.data.data?.withdrawals || []);
            }
        } catch (err) {
            console.error('Error fetching tab data:', err);
        }
    }, [activeTab, userId]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchUser(), fetchPlans()]);
            setLoading(false);
        };
        init();
    }, [fetchUser, fetchPlans]);

    useEffect(() => {
        if (user) fetchTabData();
    }, [activeTab, user, fetchTabData]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...editForm };
            if (!payload.new_password) delete payload.new_password;
            await axios.put(`/admin/users/${userId}`, payload);
            showToast('Profile updated successfully');
            setIsEditing(false);
            fetchUser();
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAdjustBalance = async () => {
        setSaving(true);
        try {
            await axios.post(`/admin/users/${userId}/adjust-balance`, adjustForm);
            showToast(`Balance ${adjustForm.type}ed successfully`);
            setAdjustForm({ type: 'credit', amount: '', reason: '' });
            await fetchUser();
        } catch (err) {
            showToast(err.response?.data?.message || 'Adjustment failed', 'error');
        } finally {
            setSaving(false);
            setConfirmModal({ show: false, type: '', title: '', message: '' });
        }
    };

    const handleChangePlan = async () => {
        setSaving(true);
        try {
            await axios.post(`/admin/users/${userId}/change-plan`, {
                ...planForm,
                action: 'admin_change'
            });
            showToast('Plan changed successfully');
            setPlanForm({ plan_id: '', charge_user: true, note: '' });
            await fetchUser();
        } catch (err) {
            showToast(err.response?.data?.message || 'Plan change failed', 'error');
        } finally {
            setSaving(false);
            setConfirmModal({ show: false, type: '', title: '', message: '' });
        }
    };

    const handleBlockUnblock = async () => {
        setSaving(true);
        try {
            const action = user.status === 'active' ? 'block' : 'unblock';
            await axios.patch(`/admin/users/${userId}/${action}`);
            showToast(`User ${action}ed successfully`);
            await fetchUser();
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        } finally {
            setSaving(false);
            setConfirmModal({ show: false, type: '', title: '', message: '' });
        }
    };

    const handleConfirm = () => {
        if (confirmModal.type === 'adjust') handleAdjustBalance();
        else if (confirmModal.type === 'plan') handleChangePlan();
        else if (confirmModal.type === 'block') handleBlockUnblock();
    };

    const copyToClipboard = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        showToast(`${label} copied!`);
    };

    if (loading) {
        return (
            <Layout title="User Detail">
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout title="User Detail">
                <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                    <p className="font-bold">User not found.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={`User Detail — ${user.full_name}`}>
            <div className="space-y-6">

                {/* Top Bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <button
                        onClick={() => navigate('/users')}
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-semibold transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Users
                    </button>
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isEditing
                                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
                                }`}
                        >
                            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                        <button
                            onClick={() => setConfirmModal({
                                show: true,
                                type: 'block',
                                title: user.status === 'active' ? 'Block User' : 'Unblock User',
                                message: user.status === 'active'
                                    ? 'Are you sure you want to block this user? They will lose access.'
                                    : 'Restore access for this user?'
                            })}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${user.status === 'active'
                                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                        >
                            {user.status === 'active' ? 'Block User' : 'Unblock User'}
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 flex flex-col lg:flex-row gap-12">
                        {/* Left: Info */}
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black shadow-inner ${user.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                    {user.full_name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight text-gray-900">{user.full_name}</h2>
                                    <p className="text-gray-500 font-medium flex items-center gap-1.5">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </p>
                                    <div className="flex items-center gap-3 pt-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {user.status}
                                        </span>
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pt-6 border-t border-gray-50">
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-tight">Referral Code</p>
                                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
                                        <span className="font-mono font-bold text-gray-700">{user.referral_code}</span>
                                        <button
                                            onClick={() => copyToClipboard(user.referral_code, 'Referral code')}
                                            className="ml-auto text-indigo-500 hover:scale-110 transition-transform"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-tight">TRON Address (USDT-TRC20)</p>
                                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
                                        <span className="font-mono font-bold text-gray-700 text-xs truncate max-w-[150px]">
                                            {user.tron_address || 'Not Generated'}
                                        </span>
                                        {user.tron_address && (
                                            <button
                                                onClick={() => copyToClipboard(user.tron_address, 'Address')}
                                                className="ml-auto text-indigo-500 hover:scale-110 transition-transform"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-tight">Joined Date</p>
                                    <div className="flex items-center gap-3 p-1">
                                        <Calendar className="w-5 h-5 text-indigo-500" />
                                        <span className="font-bold text-gray-700">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-tight">Upline</p>
                                    <div className="flex items-center gap-3 p-1">
                                        <User className="w-5 h-5 text-indigo-500" />
                                        <span className="font-bold text-gray-700">
                                            {user.referred_by_name || 'Root Admin'}
                                        </span>
                                        {user.referred_by_email && (
                                            <span className="text-xs text-gray-400 font-medium">
                                                ({user.referred_by_email})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Edit Form */}
                        {isEditing && (
                            <div className="flex-1 bg-indigo-50/50 rounded-3xl p-6 lg:p-8">
                                <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
                                    <Edit2 className="w-5 h-5" /> Quick Editor
                                </h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-indigo-900/60 uppercase ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editForm.full_name || ''}
                                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                className="w-full bg-white border-2 border-indigo-100 text-gray-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-indigo-900/60 uppercase ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={editForm.email || ''}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full bg-white border-2 border-indigo-100 text-gray-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-indigo-900/60 uppercase ml-1">User Status</label>
                                            <select
                                                value={editForm.status || 'active'}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                className="w-full bg-white border-2 border-indigo-100 text-gray-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                            >
                                                <option value="active">Active</option>
                                                <option value="blocked">Blocked</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-indigo-900/60 uppercase ml-1">Security Role</label>
                                            <select
                                                value={editForm.role || 'user'}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                className="w-full bg-white border-2 border-indigo-100 text-gray-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">System Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-indigo-900/60 uppercase ml-1">
                                            Reset Password (Optional)
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep same password"
                                            value={editForm.new_password || ''}
                                            onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })}
                                            className="w-full bg-white border-2 border-indigo-100 text-gray-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:font-normal placeholder:text-gray-300"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {saving
                                            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <Save className="w-5 h-5" />
                                        }
                                        Save All Changes
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<Wallet className="w-5 h-5" />}
                        title="DB Wallet Balance"
                        value={parseFloat(user.balance_usdt || 0)}
                        color="indigo"
                        editable
                        onEdit={() => { }}
                    />
                    <StatCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        title="Total Earned"
                        value={parseFloat(user.total_earned || 0)}
                        color="emerald"
                    />
                    <StatCard
                        icon={<Download className="w-5 h-5" />}
                        title="Total Withdrawn"
                        value={parseFloat(user.total_withdrawn || 0)}
                        color="rose"
                    />
                    <StatCard
                        icon={<UsersIcon className="w-5 h-5" />}
                        title="Total Referrals"
                        value={`${user.total_direct_referrals ?? 0} / ${user.total_level2_referrals ?? 0}`}
                        color="cyan"
                        unit=""
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Tabs Section */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Tab Switcher */}
                        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
                            {['transactions', 'network', 'withdrawals'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                            : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                            {activeTab === 'transactions' && <TransactionTab data={transactions} />}
                            {activeTab === 'network' && <NetworkTab data={network} />}
                            {activeTab === 'withdrawals' && <WithdrawalsTab data={withdrawals} />}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-8">

                        {/* Ledger Entry */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-500" /> Ledger Entry
                            </h3>
                            <div className="flex p-1 bg-gray-50 rounded-xl mb-6">
                                <button
                                    onClick={() => setAdjustForm({ ...adjustForm, type: 'credit' })}
                                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${adjustForm.type === 'credit'
                                            ? 'bg-emerald-500 text-white shadow-md'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    + Credit
                                </button>
                                <button
                                    onClick={() => setAdjustForm({ ...adjustForm, type: 'debit' })}
                                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${adjustForm.type === 'debit'
                                            ? 'bg-rose-500 text-white shadow-md'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    − Debit
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Amount (USDT)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={adjustForm.amount}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 font-bold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Internal Note / Reason</label>
                                    <textarea
                                        placeholder="Why is this adjustment being made?"
                                        value={adjustForm.reason}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 font-bold transition-all h-24 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={() => setConfirmModal({
                                        show: true,
                                        type: 'adjust',
                                        title: `Confirm ${adjustForm.type === 'credit' ? 'Credit' : 'Debit'}`,
                                        message: `This will ${adjustForm.type === 'credit' ? 'add' : 'deduct'} $${adjustForm.amount || 0} ${adjustForm.type === 'credit' ? 'to' : 'from'} the user's wallet. Are you sure?`
                                    })}
                                    disabled={!adjustForm.amount || !adjustForm.reason || parseFloat(adjustForm.amount) <= 0}
                                    className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${adjustForm.type === 'credit'
                                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'
                                            : 'bg-rose-500 hover:bg-rose-600 shadow-rose-100'
                                        }`}
                                >
                                    Process {adjustForm.type === 'credit' ? 'Credit' : 'Debit'}
                                </button>
                            </div>
                        </div>

                        {/* Plan Management */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-indigo-500" /> Plan Management
                            </h3>

                            <div className="mb-6 p-6 bg-indigo-50 rounded-2xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-indigo-900/40 uppercase tracking-tighter">Current Plan</span>
                                    <span className="text-sm font-black text-indigo-700">
                                        {user.plan_name || 'No Active Plan'}
                                    </span>
                                </div>
                                <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 transition-all"
                                        style={{
                                            width: `${user.slots_total
                                                ? ((user.slots_used || 0) / user.slots_total) * 100
                                                : 0}%`
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase">Slots Usage</span>
                                    <span className="text-xs font-black text-indigo-700">
                                        {user.slots_used || 0} / {user.slots_total || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <select
                                    value={planForm.plan_id}
                                    onChange={(e) => setPlanForm({ ...planForm, plan_id: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 font-bold transition-all"
                                >
                                    <option value="">Select New Plan...</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — ${parseFloat(p.price_usdt).toFixed(2)}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <input
                                        type="checkbox"
                                        id="charge"
                                        checked={planForm.charge_user}
                                        onChange={(e) => setPlanForm({ ...planForm, charge_user: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-0 cursor-pointer"
                                    />
                                    <label htmlFor="charge" className="text-sm font-bold text-gray-700 cursor-pointer">
                                        Charge user wallet for this plan
                                    </label>
                                </div>

                                <textarea
                                    placeholder="Admin Note (optional)"
                                    value={planForm.note}
                                    onChange={(e) => setPlanForm({ ...planForm, note: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 font-bold transition-all h-20 resize-none"
                                />

                                <button
                                    onClick={() => {
                                        const selectedPlan = plans.find(p => p.id === planForm.plan_id);
                                        setConfirmModal({
                                            show: true,
                                            type: 'plan',
                                            title: 'Confirm Plan Change',
                                            message: selectedPlan
                                                ? `Switch user to "${selectedPlan.name}" ($${selectedPlan.price_usdt}). ${planForm.charge_user ? 'Wallet will be charged.' : 'Free upgrade by admin.'}`
                                                : 'Confirm plan change?'
                                        });
                                    }}
                                    disabled={!planForm.plan_id || saving}
                                    className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply New Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.show}
                onClose={() => setConfirmModal({ show: false, type: '', title: '', message: '' })}
                onConfirm={handleConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                loading={saving}
                type={
                    confirmModal.type === 'block' && user.status === 'active' ? 'danger'
                        : confirmModal.type === 'adjust' && adjustForm.type === 'debit' ? 'warning'
                            : 'info'
                }
            />

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'error'
                        ? 'bg-rose-50 border-rose-100 text-rose-600'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    }`}>
                    {toast.type === 'error'
                        ? <AlertCircle className="w-5 h-5" />
                        : <CheckCircle className="w-5 h-5" />
                    }
                    <span className="font-black text-sm">{toast.message}</span>
                </div>
            )}
        </Layout>
    );
};

export default UserDetail;