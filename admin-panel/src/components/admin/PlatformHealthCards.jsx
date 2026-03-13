import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Activity,
    ShieldAlert,
    Zap,
    Info
} from 'lucide-react';

const PlatformHealthCards = ({ data }) => {
    if (!data) return null;

    const cards = [
        {
            label: 'Net Platform Profit',
            value: `$${parseFloat(data.net_profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subline: `Deposits: $${parseFloat(data.total_deposits).toLocaleString()} | Withdrawals: $${parseFloat(data.total_withdrawals).toLocaleString()}`,
            color: data.net_profit >= 0 ? 'text-emerald-600' : 'text-red-600',
            bg: data.net_profit >= 0 ? 'from-emerald-500/10' : 'from-red-600/10',
            icon: Zap,
            tooltip: "Profit = Total verified deposits minus total approved withdrawals."
        },
        {
            label: 'Platform Gross Earnings',
            value: `$${parseFloat(data.total_platform_earnings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subline: 'All-time platform fee collection',
            color: 'text-indigo-600',
            bg: 'from-indigo-600/10',
            icon: TrendingUp,
            tooltip: "Total sum of all platform fees collected from plan purchases."
        },
        {
            label: 'Total User DB Liability',
            value: `$${parseFloat(data.total_db_balances).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subline: 'Virtual balance owed to users',
            color: 'text-amber-600',
            bg: 'from-amber-600/10',
            icon: ShieldAlert,
            tooltip: "The sum of all virtual balances currently held by users in the database."
        },
        {
            label: 'On-Chain Liquidity',
            value: `$${parseFloat(data.total_onchain_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subline: data.onchain_last_synced ? `Last synced: ${new Date(data.onchain_last_synced).toLocaleTimeString()}` : 'Syncing...',
            color: 'text-blue-600',
            bg: 'from-blue-600/10',
            icon: Wallet,
            tooltip: "Total USDT physical balance in the platform's master wallet on the Tron network."
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className={`bg-white shadow-sm border border-gray-200 p-6 rounded-[2rem] relative overflow-hidden group hover:border-black/20 transition-all duration-300`}
                >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.bg} to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2.5 rounded-2xl bg-black/5 border border-black/5 text-black/40">
                                <card.icon size={20} />
                            </div>
                            <div className="group/info relative">
                                <Info size={14} className="text-black/20 hover:text-black/40 cursor-help" />
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-50 border border-black/10 p-3 rounded-xl text-[10px] text-black/80 font-medium invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all z-50 shadow-2xl backdrop-blur-xl">
                                    {card.tooltip}
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                            <h3 className={`text-2xl font-black ${card.color}`}>{card.value}</h3>
                        </div>

                        <p className="text-[11px] font-bold text-black/60 truncate">{card.subline}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlatformHealthCards;
