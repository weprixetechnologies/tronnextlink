import React from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Layers,
    Wallet,
    CreditCard,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

const FinancialFlowSummary = ({ data }) => {
    if (!data) return null;

    const sections = [
        {
            title: 'Money In (Capital Inflow)',
            icon: ArrowUpRight,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10',
            items: [
                { label: 'Total Deposits (Verified)', value: `$${parseFloat(data.total_deposits).toLocaleString()}` },
                { label: 'Platform Fees Collected', value: `$${parseFloat(data.total_platform_earnings).toLocaleString()}` },
                { label: 'Avg Deposit Value', value: `$${data.total_deposit_count ? (data.total_deposits / data.total_deposit_count).toFixed(2) : '0.00'}`, sub: `Across ${data.total_deposit_count || 0} deposits` }
            ]
        },
        {
            title: 'Money Distributed (Internal)',
            icon: Layers,
            color: 'text-primary',
            bg: 'bg-primary/10',
            items: [
                { label: 'Join Income Paid (75%)', value: `$${parseFloat(data.total_join_income_paid).toLocaleString()}` },
                { label: 'Affiliate Payouts (L1/L2)', value: `$${parseFloat(data.total_affiliate_paid).toLocaleString()}` },
                { label: 'Admin Credits Issued', value: `$${parseFloat(data.total_admin_credits).toLocaleString()}` }
            ]
        },
        {
            title: 'Money Out (Capital Outflow)',
            icon: ArrowDownRight,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            items: [
                { label: 'Withdrawals Approved', value: `$${parseFloat(data.total_withdrawals).toLocaleString()}` },
                { label: 'Pending Withdrawals', value: `$${parseFloat(data.pending_withdrawals_amount).toLocaleString()}`, sub: `${data.pending_withdrawals_count} requests` },
                { label: 'Avg Withdrawal Value', value: `$${data.approved_withdrawals_count ? (data.total_withdrawals / data.approved_withdrawals_count).toFixed(2) : '0.00'}`, sub: `Across ${data.approved_withdrawals_count || 0} withdrawals` }
            ]
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {sections.map((section, idx) => (
                <div key={idx} className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] overflow-hidden group hover:border-black/10 transition-all duration-300">
                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center`}>
                                    <section.icon size={24} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-black/90">{section.title}</h4>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex items-end justify-between group/item">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest group-hover/item:text-black/60 transition-colors">{item.label}</p>
                                        <p className="text-xl font-black">{item.value}</p>
                                    </div>
                                    {item.sub && (
                                        <span className="text-[9px] font-bold text-black/40 uppercase tracking-tighter mb-1.5">{item.sub}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black/5 p-4 flex items-center justify-center gap-2 border-t border-black/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/20"></div>
                        <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest">Live Flow Mapping Active</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FinancialFlowSummary;
