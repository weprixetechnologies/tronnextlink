import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Package, CheckCircle2, AlertCircle, Zap, Shield, Target, TrendingUp } from 'lucide-react';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            const [plansRes, statsRes] = await Promise.all([
                axios.get('/plans'),
                axios.get('/network/stats')
            ]);
            setPlans(plansRes.data.data);
            setActivePlan(statsRes.data.data.activePlan);
        } catch (err) {
            console.error('Error fetching plans:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePurchase = async (planId) => {
        if (!window.confirm('Are you sure you want to purchase this core protocol?')) return;

        setBuying(true);
        setMessage('');
        try {
            const res = await axios.post('/plans/purchase', { planId });
            setMessage({ type: 'success', text: res.data.message });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Purchase failed' });
        } finally {
            setBuying(false);
        }
    };

    if (loading && plans.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
            <Zap className="text-primary animate-pulse mb-4" size={48} />
            <p className="text-sm font-black text-white/40 uppercase tracking-widest animate-pulse">Syncing Plan Directories...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Growth Protocols</p>
                    <h1 className="text-4xl font-black text-white uppercase" style={{ letterSpacing: '-0.05em' }}>Subscription Nodes</h1>
                </div>
                {activePlan && (
                    <div className="bg-card-dark text-white px-5 py-3 rounded-2xl shadow-xl flex items-center border border-white/10">
                        <div className="mr-4">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Active Protocol</p>
                            <p className="text-sm font-black tracking-tight">{activePlan.name}</p>
                        </div>
                        <div className="pl-4 border-l border-white/10">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Slots Depth</p>
                            <p className="text-sm font-black tracking-tight">{activePlan.slots_total - activePlan.slots_used} / {activePlan.slots_total}</p>
                        </div>
                    </div>
                )}
            </header>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center shadow-lg transform scale-[1.01] transition-all ${message.type === 'success' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="mr-3" size={20} /> : <AlertCircle className="mr-3" size={20} />}
                    <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map((plan) => {
                    const isCurrent = activePlan?.plan_id === plan.id;

                    return (
                        <div key={plan.id} className={`flex flex-col p-8 bg-card-dark border-2 transition-all relative overflow-hidden group rounded-3xl ${isCurrent ? 'border-primary ring-4 ring-primary/10' : 'border-card-border hover:border-primary/40'}`}>
                            {isCurrent && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                                    Current
                                </div>
                            )}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isCurrent ? 'bg-primary text-white glow-purple' : 'bg-white/5 text-primary'}`}>
                                <Package size={28} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-1 uppercase" style={{ letterSpacing: '-0.05em' }}>{plan.name}</h3>
                            <p className="text-4xl font-black text-white mb-8" style={{ letterSpacing: '-0.05em' }}>
                                <span className="text-lg font-black mr-1 uppercase text-white/40">$</span>
                                {parseFloat(plan.price_usdt).toFixed(0)}
                            </p>

                            <div className="space-y-4 mb-10 flex-1">
                                <div className="flex items-center text-[10px] font-black text-white/60 uppercase tracking-widest">
                                    <Target size={14} className="text-primary mr-2" />
                                    {plan.slots} Recruitment Units
                                </div>
                                <div className="flex items-center text-[10px] font-black text-white/60 uppercase tracking-widest">
                                    <Shield size={14} className="text-primary mr-2" />
                                    Tier 1-2 Commissions
                                </div>
                                <p className="text-[10px] text-white/40 font-bold leading-relaxed">{plan.description}</p>
                            </div>

                            <button
                                onClick={() => handlePurchase(plan.id)}
                                disabled={buying || (isCurrent && activePlan.slots_total - activePlan.slots_used > 0)}
                                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isCurrent && activePlan.slots_total - activePlan.slots_used > 0
                                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                    : 'bg-white/10 text-white hover:bg-primary hover:glow-purple'
                                    }`}
                            >
                                {buying ? 'PROCESSING...' : isCurrent ? (activePlan.slots_total - activePlan.slots_used > 0 ? 'ACTIVE' : 'RENEW NODE') : 'PURCHASE NODE'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <div className="bg-card-dark border border-card-border p-8 flex border-l-4 border-l-primary rounded-3xl shadow-sm">
                    <div className="shrink-0 mr-6">
                        <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center glow-purple">
                            <Target size={24} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black text-white uppercase mb-2" style={{ letterSpacing: '-0.05em' }}>Protocol Architecture</h4>
                        <p className="text-xs text-white/40 font-medium leading-relaxed">
                            Each plan activates a set number of recruitment slots. Every direct onboarding consumes one unit. When units are depleted, the protocol must be renewed to maintain join-income flow.
                        </p>
                    </div>
                </div>

                <div className="bg-card-dark border border-card-border p-8 flex border-l-4 border-l-gold rounded-3xl shadow-sm">
                    <div className="shrink-0 mr-6">
                        <div className="w-12 h-12 bg-gold text-white rounded-xl flex items-center justify-center glow-teal">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black text-white uppercase mb-2" style={{ letterSpacing: '-0.05em' }}>Yield Distribution</h4>
                        <p className="text-xs text-white/40 font-medium leading-relaxed">
                            Onboarding events trigger a 75% yield to the direct upline. Daily affiliate caps (L1: 5%, L2: 2%) are determined by the active protocol tier and network density.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Plans;
