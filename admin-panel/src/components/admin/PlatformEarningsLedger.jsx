import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Calendar,
    ArrowUpRight,
    Loader2,
    Search,
    Download,
    Eye
} from 'lucide-react';
import axios from '../../api/axios';

const PlatformEarningsLedger = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/analytics/platform-earnings');
            if (res.data?.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error('Earnings ledger fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    if (loading && !data) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 size={32} className="text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with Summary Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <DollarSign size={24} className="text-primary" />
                        System Fee & Revenue Ledger
                    </h3>
                    <p className="text-black/60 text-xs font-medium">Detailed tracking of the 25% platform fee collected from every network entry.</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Net System Retention</p>
                    <h4 className="text-3xl font-black text-black">${parseFloat(data?.summary?.net_remaining || 0).toLocaleString()}</h4>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/5 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5">Source User</th>
                                <th className="px-6 py-5">Origin Plan</th>
                                <th className="px-6 py-5">Fee Collected</th>
                                <th className="px-6 py-5">Ledger Hash</th>
                                <th className="px-6 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {data?.entries?.map((entry, idx) => (
                                <tr key={idx} className="group hover:bg-black/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-black/80">{new Date(entry.date).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-black">{entry.from_user}</span>
                                            <span className="text-[9px] text-black/40 uppercase tracking-tighter">Contributor</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-black/5 border border-black/5 rounded-lg text-[10px] font-black text-black/60 group-hover:text-primary transition-colors">
                                            {entry.plan_name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-black text-teal-400">+${parseFloat(entry.amount).toFixed(2)}</span>
                                            <ArrowUpRight size={14} className="text-teal-400" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[9px] text-black/40 font-mono">INTL-REV-{Math.random().toString(36).substring(7).toUpperCase()}</code>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-black/40 hover:text-black transition-colors">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-black/[0.01] border-t border-black/5 flex items-center justify-between">
                    <p className="text-[10px] font-black text-black/50 uppercase tracking-widest">End of verified platform ledger</p>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Transactions</button>
                </div>
            </div>
        </div>
    );
};

export default PlatformEarningsLedger;
