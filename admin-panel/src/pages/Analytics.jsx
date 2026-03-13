import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from '../api/axios';
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    ArrowUpCircle,
    FileText,
    Loader2,
    RefreshCw,
    Activity,
    ShieldCheck,
    Wallet,
    DollarSign,
    Target
} from 'lucide-react';

// Components (To be created)
import PlatformHealthCards from '../components/admin/PlatformHealthCards';
import FinancialFlowSummary from '../components/admin/FinancialFlowSummary';
import GrowthCharts from '../components/admin/GrowthCharts';
import JoiningsTable from '../components/admin/JoiningsTable';
import PlatformEarningsLedger from '../components/admin/PlatformEarningsLedger';
import WithdrawalFundSourcing from '../components/admin/WithdrawalFundSourcing';
import UserEarningStatement from '../components/admin/UserEarningStatement';

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('health');
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/admin/analytics/platform-health');
            if (res.data?.success) {
                setHealthData(res.data.data);
            } else {
                setError('Failed to fetch platform health data');
            }
        } catch (err) {
            console.error('Analytics error:', err);
            setError('An error occurred while fetching analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const tabs = [
        { id: 'health', label: 'Platform Health', icon: ShieldCheck },
        { id: 'growth', label: 'Growth & Charts', icon: TrendingUp },
        { id: 'joinings', label: 'Recent Joinings', icon: Users },
        { id: 'withdrawals', label: 'Fund Sourcing', icon: Wallet },
        { id: 'statements', label: 'User Statements', icon: FileText },
    ];

    if (loading && !healthData) {
        return (
            <Layout title="Analytics & Finance">
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 size={48} className="text-primary animate-spin" />
                    <p className="text-black/40 font-bold animate-pulse">Aggregating real-time financial data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Analytics & Finance">
            <div className="space-y-8 pb-12">
                {/* Hero Summary Cards (Always Visible in Health tab or as header) */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <Target size={28} className="text-primary" />
                            Financial Intelligence
                        </h2>
                        <p className="text-black/60 text-sm font-medium">Platform-wide capital mapping and performance tracking.</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-black/5 border border-black/10 rounded-xl hover:bg-black/10 transition-all text-black/60 hover:text-black"
                        title="Refresh All Data"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Sticky Tab Navigation */}
                <div className="sticky top-0 z-40 bg-gray-50/80 backdrop-blur-xl border-b border-black/5 py-4 -mx-6 px-6">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between">
                        <p className="text-red-400 text-sm font-bold">{error}</p>
                        <button onClick={fetchData} className="text-red-400 hover:underline text-xs font-black uppercase">Try Again</button>
                    </div>
                )}

                {/* Tab Content */}
                <div className="space-y-10">
                    {activeTab === 'health' && (
                        <div className="space-y-10 animate-fade-in">
                            <PlatformHealthCards data={healthData} />
                            <FinancialFlowSummary data={healthData} />
                            <PlatformEarningsLedger />
                        </div>
                    )}

                    {activeTab === 'growth' && (
                        <div className="animate-fade-in">
                            <GrowthCharts />
                        </div>
                    )}

                    {activeTab === 'joinings' && (
                        <div className="animate-fade-in">
                            <JoiningsTable />
                        </div>
                    )}

                    {activeTab === 'withdrawals' && (
                        <div className="animate-fade-in">
                            <WithdrawalFundSourcing />
                        </div>
                    )}

                    {activeTab === 'statements' && (
                        <div className="animate-fade-in">
                            <UserEarningStatement />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
