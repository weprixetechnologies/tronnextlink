import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import {
    Users,
    UserPlus,
    DollarSign,
    Clock,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Zap
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payoutLoading, setPayoutLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/admin/dashboard');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const triggerPayouts = async () => {
        if (!window.confirm('Execute daily affiliate payout protocol? This will distribute earnings across the network.')) return;
        try {
            setPayoutLoading(true);
            const res = await axios.post('/admin/trigger-payouts');
            alert(res.data.message);
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Protocol execution failed');
        } finally {
            setPayoutLoading(false);
        }
    };

    // Dummy chart data (would normally be in stats API)
    const chartData = [
        { name: 'Mon', joins: 12, earnings: 450 },
        { name: 'Tue', joins: 19, earnings: 820 },
        { name: 'Wed', joins: 15, earnings: 600 },
        { name: 'Thu', joins: 22, earnings: 950 },
        { name: 'Fri', joins: 30, earnings: 1200 },
        { name: 'Sat', joins: 24, earnings: 1100 },
        { name: 'Sun', joins: 18, earnings: 750 },
    ];

    const columns = [
        {
            header: 'Timestamp',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{row?.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{row?.created_at ? new Date(row.created_at).toLocaleTimeString() : ''}</span>
                </div>
            )
        },
        {
            header: 'Identity',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                        {(row?.from_name || row?.to_name || 'S').substring(0, 1)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{row?.from_name || row?.to_name || 'System'}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Protocol User</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Protocol Type',
            render: (row) => {
                const variants = {
                    join_income: 'emerald',
                    withdrawal: 'rose',
                    deposit: 'indigo',
                    affiliate_l1: 'teal',
                    affiliate_l2: 'cyan',
                    platform_fee: 'purple'
                };
                return <Badge variant={variants[row?.type] || 'gray'}>{row?.type?.replace('_', ' ') || 'UNKNOWN'}</Badge>;
            }
        },
        {
            header: 'Quantum (USDT)',
            render: (row) => (
                <span className={`font-black text-sm tracking-tighter ${row.type === 'withdrawal' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {row.type === 'withdrawal' ? '-' : '+'}${parseFloat(row.amount || 0).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    {row?.status || 'completed'}
                </div>
            )
        }
    ];

    return (
        <Layout title="Command Dashboard">
            <div className="space-y-8">
                {/* Header with Action */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">System Overview</h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">Real-time monitoring of network protocols and liquidity.</p>
                    </div>
                    <button
                        onClick={triggerPayouts}
                        disabled={payoutLoading}
                        className="btn btn-primary h-12 px-6 shadow-xl shadow-indigo-100 group"
                    >
                        {payoutLoading ? <Zap size={18} className="animate-spin" /> : <Zap size={18} className="group-hover:fill-current transition-all" />}
                        <span>{payoutLoading ? 'Executing...' : 'Trigger Daily Payouts'}</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Active Nodes"
                        value={stats?.totalUsers || '0'}
                        icon={<Users size={24} />}
                        color="indigo"
                        trend={+12.5}
                        delay={0}
                    />
                    <StatsCard
                        title="Today's Protocols"
                        value={stats?.todayJoins || '0'}
                        icon={<UserPlus size={24} />}
                        color="emerald"
                        trend={+24.1}
                        delay={100}
                    />
                    <StatsCard
                        title="Platform Revenue"
                        value={`$${parseFloat(stats?.platformEarningsToday || 0).toFixed(2)}`}
                        icon={<DollarSign size={24} />}
                        color="amber"
                        trend={+8.3}
                        delay={200}
                    />
                    <StatsCard
                        title="Pending Signals"
                        value={stats?.pendingWithdrawalsCount || '0'}
                        icon={<Clock size={24} />}
                        color="rose"
                        trend={-4.2}
                        delay={300}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-tight">Growth Velocity</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Daily Node Joins (Last 7 Days)</p>
                            </div>
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F9FAFB' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="joins" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-tight">Liquidity Flow</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Daily Revenue (Last 7 Days)</p>
                            </div>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorEarnings)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">Recent Activity Stream</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Live Feed of Network Protocols</p>
                        </div>
                        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                            Live Monitoring
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={stats?.recentTransactions || []}
                        loading={loading}
                        pagination={null}
                        emptyTitle="Clear Signal"
                        emptyMessage="No recent activity detected on the network."
                    />
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
