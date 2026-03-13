import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import { Package, TrendingUp, Users, DollarSign, Plus } from 'lucide-react';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/plans');
            if (res.data.success) {
                setPlans(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching plans:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const columns = [
        {
            header: 'Plan Tier',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <Package size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 tracking-tight leading-none uppercase">{row.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">Protocol Level {row.id}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Investment Quantum',
            render: (row) => (
                <span className="font-black text-gray-900 tracking-tighter text-lg">${parseFloat(row.price_usdt).toFixed(0)}</span>
            )
        },
        {
            header: 'Slot Configuration',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{row.slots_total} Total Slots</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">${parseFloat(row.slot_value).toFixed(2)} per slot</span>
                </div>
            )
        },
        {
            header: 'Network Multiplier',
            render: (row) => (
                <Badge variant="emerald">{(row.daily_yield * 100).toFixed(1)}% Daily</Badge>
            )
        },
        {
            header: 'Distribution Logic',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase w-4">L1</span>
                        <Badge variant="indigo">{row.affiliate_l1_percent}%</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase w-4">L2</span>
                        <Badge variant="cyan">{row.affiliate_l2_percent}%</Badge>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <Badge variant="emerald">Active</Badge>
            )
        }
    ];

    return (
        <Layout title="Monetization Protocols">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Investment Tiers</h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">Configure and monitor investment artifacts available across the network.</p>
                    </div>
                    <button className="btn btn-primary h-12 px-6 shadow-xl shadow-indigo-100 opacity-50 cursor-not-allowed">
                        <Plus size={18} />
                        <span>Deploy New Tier</span>
                    </button>
                </div>

                <div className="card">
                    <DataTable
                        columns={columns}
                        data={plans}
                        loading={loading}
                        pagination={null}
                        emptyTitle="No Tiers Found"
                        emptyMessage="Initialize investment artifacts to begin network monetization."
                    />
                </div>

                {/* Legend / Quick Help */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-50">
                        <div className="flex items-center gap-3 mb-3 text-indigo-600">
                            <TrendingUp size={20} />
                            <h4 className="font-black text-sm uppercase tracking-widest">Yield Curve</h4>
                        </div>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed">Daily yields are calculated based on the investment quantum and distributed automatically every 24 hours.</p>
                    </div>
                    <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-50">
                        <div className="flex items-center gap-3 mb-3 text-emerald-600">
                            <Share2 size={20} className="w-5 h-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Network Flow</h4>
                        </div>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed">Referral distributions (L1 & L2) are deducted from the investment protocol and funneled to upline nodes instantly.</p>
                    </div>
                    <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-50">
                        <div className="flex items-center gap-3 mb-3 text-amber-600">
                            <Shield size={20} className="w-5 h-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Liquidity Guard</h4>
                        </div>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed">All plan calculations are anchored to the USDT/TRON stable protocol for maximum volatility protection.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Reused icons not imported above
const Share2 = ({ size, className }) => <Users size={size} className={className} />;
const Shield = ({ size, className }) => <Package size={size} className={className} />;

export default Plans;
