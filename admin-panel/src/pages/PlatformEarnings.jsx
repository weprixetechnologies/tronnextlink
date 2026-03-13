import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    ArrowUpCircle,
    Activity,
    Database,
    PieChart as PieChartIcon
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Pie,
    PieChart as RechartsPieChart
} from 'recharts';

const PlatformEarnings = () => {
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/admin/platform-earnings');
            if (res.data.success) {
                setEarnings(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching earnings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const pieData = earnings?.type_breakdown?.map(item => ({
        name: item.type.replace('_', ' ').toUpperCase(),
        value: parseFloat(item.total || 0)
    })) || [];

    return (
        <Layout title="Financial Intelligence">
            <div className="space-y-8">
                {/* Revenue Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-indigo-950 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-3">Net Asset Accumulation</p>
                            <h2 className="text-4xl font-black tracking-tighter">${parseFloat(earnings?.total_all_time || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            <div className="mt-6 flex items-center gap-2">
                                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                                    +18.4% Velocity
                                </div>
                            </div>
                        </div>
                        <Database className="absolute -right-6 -bottom-6 text-indigo-900/30" size={160} strokeWidth={1} />
                    </div>

                    <div className="card flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Activity size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Sun Cycle (Today)</p>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">${parseFloat(earnings?.today || 0).toFixed(2)}</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2">Active liquidity flow detections</p>
                    </div>

                    <div className="card flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <Calendar size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lunar Cycle (This Month)</p>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">${parseFloat(earnings?.this_month || 0).toFixed(2)}</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2">Projection: Exceeds previous cycle</p>
                    </div>
                </div>

                {/* Analysis Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Time Series Analytics */}
                    <div className="card lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Spectral Growth Map</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Revenue Stream Velocity (Last 30 Days)</p>
                            </div>
                            <div className="p-2 bg-gray-50 text-gray-400 rounded-xl">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={earnings?.daily_breakdown || []}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 700 }}
                                        dy={10}
                                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#4F46E5"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorEarnings)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Categorical Breakdown */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Source Logic</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Profit Distribution Channels</p>
                            </div>
                            <div className="p-2 bg-gray-50 text-gray-400 rounded-xl">
                                <PieChartIcon size={20} />
                            </div>
                        </div>
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                            {/* Center Label Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol</span>
                                <span className="text-lg font-black text-gray-900 leading-none">SPLIT</span>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {pieData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">${item.value.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Intel Matrix */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
                    <div className="shrink-0 w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 rotate-12 shadow-inner">
                        <DollarSign size={40} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">Reserve Protocol Logic</h4>
                        <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-2xl">
                            All earnings are automatically calculated based on the 10% network growth tax and direct participation entry fees.
                            These assets flow into the primary platform vault identified as <span className="font-mono bg-gray-50 text-indigo-500 px-2 py-0.5 rounded border border-gray-100">{earnings?.platform_wallet_address || 'MASTER_VAULT'}</span> and are utilized for network incentives and liquidity reserves.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PlatformEarnings;
