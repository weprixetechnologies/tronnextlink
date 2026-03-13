import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const StatsCard = ({ title, value, icon, trend, trendValue, color = 'purple' }) => {
    const colorMap = {
        purple: 'text-primary-purple bg-primary-purple/10',
        teal: 'text-secondary-teal bg-secondary-teal/10',
        gold: 'text-gold-amber bg-gold-amber/10',
        green: 'text-success-green bg-success-green/10',
        red: 'text-danger-red bg-danger-red/10',
    };

    return (
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:border-primary-purple/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-success-green bg-success-green/10' : 'text-danger-red bg-danger-red/10'}`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            </div>
        </div>
    );
};

export default StatsCard;
