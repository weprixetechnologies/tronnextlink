import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    ArrowRight,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Search,
    Download
} from 'lucide-react';
import axios from '../../api/axios';

const JoiningsTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchJoinings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/admin/analytics/joinings?page=${page}&limit=15`);
            if (res.data?.success) {
                setData(res.data.data.data);
                setTotalPages(res.data.data.pages);
                setTotal(res.data.data.total);
            }
        } catch (err) {
            console.error('Joinings fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJoinings();
    }, [page]);

    const exportToCSV = () => {
        const headers = ["Date", "User", "Email", "Plan", "Price", "Upline", "Upline Got (75%)", "Platform Got (25%)"];
        const rows = data.map(item => [
            new Date(item.date).toLocaleString(),
            item.user_name,
            item.user_email,
            item.plan_name,
            item.plan_price,
            item.upline_name || 'Direct',
            item.upline_received,
            item.platform_received
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `joinings_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <Users size={24} className="text-primary" />
                        Network Expansion Ledger
                    </h3>
                    <p className="text-black/60 text-xs font-medium">Tracking the last {total} plan purchases and upline distributions.</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black/5 border border-black/10 rounded-2xl hover:bg-black/10 transition-all text-black/80 hover:text-black font-black text-[10px] uppercase tracking-widest"
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/5 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
                                <th className="px-6 py-5">Timestamp</th>
                                <th className="px-6 py-5">New Member</th>
                                <th className="px-6 py-5">Selected Plan</th>
                                <th className="px-6 py-5">Upline Distribution</th>
                                <th className="px-6 py-5">Platform Fee</th>
                                <th className="px-6 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <Loader2 size={32} className="text-primary animate-spin mx-auto mb-4" />
                                        <p className="text-black/40 font-black text-xs uppercase tracking-widest">Loading Ledger Data...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <p className="text-black/40 font-black text-xs uppercase tracking-widest">No Joinings Recorded Yet</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-black/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-black/80">{new Date(item.date).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-black/40">{new Date(item.date).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                                                    {item.user_name?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-black">{item.user_name}</span>
                                                    <span className="text-[10px] text-black/50 truncate max-w-[150px]">{item.user_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-primary">{item.plan_name}</span>
                                                <span className="text-[10px] font-bold text-black/60">${parseFloat(item.plan_price).toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.has_valid_upline ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-black text-teal-400">${parseFloat(item.upline_received).toFixed(2)}</span>
                                                        <ArrowRight size={10} className="text-black/40" />
                                                        <span className="text-[10px] font-bold text-black/80">{item.upline_name}</span>
                                                    </div>
                                                    <p className="text-[9px] text-black/40 uppercase tracking-tighter">75% Distribution</p>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-black/40 uppercase">Direct/No Upline</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-amber-400">${parseFloat(item.platform_received).toFixed(2)}</span>
                                                <p className="text-[9px] text-black/40 uppercase tracking-tighter">25% System Fee</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 rounded-full text-[9px] font-black uppercase tracking-widest">Completed</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-8 py-5 bg-black/5 border-t border-black/5">
                    <p className="text-[10px] font-black text-black/50 uppercase tracking-widest">
                        Showing page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-black/5 border border-black/5 rounded-xl text-black/60 hover:text-black disabled:opacity-20 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-black/5 border border-black/5 rounded-xl text-black/60 hover:text-black disabled:opacity-20 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoiningsTable;
