import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Calendar,
    Users,
    ArrowDownCircle,
    ArrowUpCircle,
    Activity,
    Loader2,
    RefreshCw
} from 'lucide-react';
import axios from '../../api/axios';

const COLORS = ['#6C63FF', '#00D4AA', '#F59E0B', '#EF4444', '#10B981', '#3B82F6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1A1A2E] border border-black/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
            <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-2">{label}</p>
            <div className="space-y-1.5">
                {payload.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-[11px] font-bold text-black/80">{entry.name}</span>
                        </div>
                        <span className="text-xs font-black text-black">
                            {entry.name === 'New Users' ? entry.value : `$${parseFloat(entry.value).toLocaleString()}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GrowthCharts = () => {
    const [range, setRange] = useState('30d');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchGrowthData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/admin/analytics/growth?range=${range}`);
            if (res.data?.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error('Growth data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrowthData();
    }, [range]);

    if (loading && !data) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 size={32} className="text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <Activity size={24} className="text-primary" />
                        Network & Revenue Growth
                    </h3>
                    <p className="text-black/60 text-xs font-medium">Daily visualization of user onboarding and capital distribution.</p>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-black/5 border border-black/5 rounded-2xl">
                    {['7d', '30d', '90d', 'all'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === r ? 'bg-primary text-white shadow-lg' : 'text-black/60 hover:text-black'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* COMBINED GROWTH CHART */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] p-8">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.daily}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 10, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />
                            <Area
                                name="New Users"
                                type="monotone"
                                dataKey="new_users"
                                stroke="#6C63FF"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                            />
                            <Area
                                name="Deposits"
                                type="monotone"
                                dataKey="deposits"
                                stroke="#00D4AA"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorDeposits)"
                            />
                            <Area
                                name="Withdrawals"
                                type="monotone"
                                dataKey="withdrawals"
                                stroke="#EF4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="none"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* LOWER GRID: PIE + MINI BAR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PLAN DISTRIBUTION PIE */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] p-8 space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-black/60">Active Plan Distribution</h4>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-[250px] w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.plan_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="user_count"
                                        nameKey="plan_name"
                                    >
                                        {data?.plan_distribution?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            {data?.plan_distribution?.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-black/5 rounded-2xl border border-black/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-xs font-black text-black/80 tracking-tight">{item.plan_name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-black">{item.user_count} Users</p>
                                        <p className="text-[9px] font-bold text-black/40 uppercase">${parseFloat(item.total_revenue).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PLATFORM FEES ACCUMULATION */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] p-8 space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-black/60">Platform Revenue Trend</h4>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.daily}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    hide={range === 'all'}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    name="Platform Fees"
                                    dataKey="platform_fees"
                                    fill="#F59E0B"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthCharts;
