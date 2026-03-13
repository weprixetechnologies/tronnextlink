import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon, color = 'indigo', trend, delay = 0 }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
        cyan: 'bg-cyan-50 text-cyan-600',
    };

    return (
        <div
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${colors[color] || colors.indigo} transition-transform duration-300 group-hover:scale-110 shadow-sm shadow-black/5`}>
                    {icon}
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest leading-none mb-2">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
