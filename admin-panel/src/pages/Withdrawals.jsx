import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    Clock,
    CheckCircle,
    XCircle,
    ExternalLink,
    ArrowRight,
    ShieldCheck,
    ShieldAlert,
    AlertCircle,
    Hash,
    Copy,
    ListFilter
} from 'lucide-react';

const Withdrawals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    // Action Modals
    const [approveModal, setApproveModal] = useState({ isOpen: false, item: null, txn_hash: '' });
    const [rejectModal, setRejectModal] = useState({ isOpen: false, item: null, note: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchWithdrawals = async (page = 1, currentStatus = status) => {
        try {
            setLoading(true);
            const res = await axios.get('/admin/withdrawals', {
                params: { page, limit: 15, status: currentStatus }
            });
            if (res.data.success) {
                setRequests(res.data.data.requests);
                setPagination(res.data.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching withdrawals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        fetchWithdrawals(1, newStatus);
    };

    const handleApprove = async () => {
        if (!approveModal.txn_hash) return alert('Transaction hash is mandatory for approval protocol.');
        try {
            setActionLoading(true);
            const res = await axios.patch(`/admin/withdrawals/${approveModal.item.id}/approve`, {
                txn_hash: approveModal.txn_hash
            });
            if (res.data.success) {
                fetchWithdrawals(pagination.page);
                setApproveModal({ isOpen: false, item: null, txn_hash: '' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Approval sequence failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setActionLoading(true);
            const res = await axios.patch(`/admin/withdrawals/${rejectModal.item.id}/reject`, {
                admin_note: rejectModal.note
            });
            if (res.data.success) {
                fetchWithdrawals(pagination.page);
                setRejectModal({ isOpen: false, item: null, note: '' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Rejection sequence failed');
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Address copied to clipboard');
    };

    const columns = [
        {
            header: 'Timestamp',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{row?.requested_at ? new Date(row.requested_at).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{row?.requested_at ? new Date(row.requested_at).toLocaleTimeString() : ''}</span>
                </div>
            )
        },
        {
            header: 'Entity Identity',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 leading-tight">{row?.full_name || 'Unknown'}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{row?.email || 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Target Protocol',
            render: (row) => (
                <div className="flex items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 max-w-[150px] truncate">
                        {row?.to_tron_address}
                    </span>
                    <button
                        onClick={() => copyToClipboard(row.to_tron_address)}
                        className="p-1 px-1.5 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Copy size={12} />
                    </button>
                    <a
                        href={`https://shasta.tronscan.org/#/address/${row.to_tron_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 px-1.5 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ExternalLink size={12} />
                    </a>
                </div>
            )
        },
        {
            header: 'Extraction Quantum',
            render: (row) => (
                <span className="font-black text-gray-900 tracking-tighter text-lg">${parseFloat(row.amount || 0).toFixed(2)}</span>
            )
        },
        {
            header: 'Signal Status',
            render: (row) => {
                const variants = { pending: 'amber', approved: 'emerald', rejected: 'rose' };
                return <Badge variant={variants[row.status]}>{row.status}</Badge>;
            }
        },
        {
            header: 'Commands',
            className: 'text-right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    {row.status === 'pending' ? (
                        <>
                            <button
                                onClick={() => setApproveModal({ isOpen: true, item: row, txn_hash: '' })}
                                className="btn btn-success h-10 px-4 text-xs font-black uppercase tracking-widest"
                            >
                                <ShieldCheck size={16} /> Approve
                            </button>
                            <button
                                onClick={() => setRejectModal({ isOpen: true, item: row, note: '' })}
                                className="btn btn-secondary h-10 px-4 text-xs font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50"
                            >
                                <ShieldAlert size={16} /> Reject
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {row.processed_at ? new Date(row.processed_at).toLocaleDateString() : 'PROCESSED'}
                            </span>
                            {row.txn_hash && (
                                <a
                                    href={`https://shasta.tronscan.org/#/transaction/${row.txn_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout title="Withdrawal Protocols">
            <div className="space-y-6">
                {/* Protocol Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm shadow-indigo-100/10">
                        <button
                            onClick={() => handleStatusChange('pending')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${status === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <span className="flex items-center gap-2"><Clock size={16} /> Pending Signals</span>
                        </button>
                        <button
                            onClick={() => handleStatusChange('approved')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${status === 'approved' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <span className="flex items-center gap-2"><CheckCircle size={16} /> Completed</span>
                        </button>
                        <button
                            onClick={() => handleStatusChange('rejected')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${status === 'rejected' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <span className="flex items-center gap-2"><XCircle size={16} /> Dead Signals</span>
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        <ListFilter size={16} /> Sorting by Priority Initialization
                    </div>
                </div>

                <div className="card">
                    <DataTable
                        columns={columns}
                        data={requests}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(p) => fetchWithdrawals(p)}
                        emptyTitle="Clear Protocol"
                        emptyMessage={`No ${status} withdrawal signals detected.`}
                    />
                </div>
            </div>

            {/* Approval Modal */}
            <Modal
                isOpen={approveModal.isOpen}
                onClose={() => !actionLoading && setApproveModal({ isOpen: false, item: null, txn_hash: '' })}
                title="Execute Extraction Protocol"
                footer={
                    <>
                        <button className="btn btn-secondary" disabled={actionLoading} onClick={() => setApproveModal({ ...approveModal, isOpen: false })}>Abort</button>
                        <button className="btn btn-primary bg-indigo-600" disabled={actionLoading || !approveModal.txn_hash} onClick={handleApprove}>
                            {actionLoading ? <LoadingSpinner color="text-white" /> : 'Authorize Broadcast'}
                        </button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Target Node Identity</p>
                        <h4 className="text-xl font-black text-gray-900 leading-tight">{approveModal.item?.full_name}</h4>
                        <div className="mt-4 flex items-center justify-between text-indigo-600">
                            <span className="text-[10px] font-black uppercase tracking-widest">Quantum Amount</span>
                            <span className="text-2xl font-black tracking-tighter">${parseFloat(approveModal.item?.amount || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-amber-700">
                            <AlertCircle className="shrink-0" size={18} />
                            <p className="text-xs font-bold leading-relaxed">Ensure the manual transaction on TRON network matches the target protocol address before authorizing.</p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Blockchain Txn Hash (Required)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="input pl-10 border-indigo-100 focus:ring-indigo-100"
                                    placeholder="Enter 64-char transaction hash..."
                                    value={approveModal.txn_hash}
                                    onChange={(e) => setApproveModal({ ...approveModal, txn_hash: e.target.value })}
                                />
                                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Rejection Modal */}
            <Modal
                isOpen={rejectModal.isOpen}
                onClose={() => !actionLoading && setRejectModal({ isOpen: false, item: null, note: '' })}
                title="Kill Extraction Signal"
                footer={
                    <>
                        <button className="btn btn-secondary" disabled={actionLoading} onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}>Abort</button>
                        <button className="btn btn-danger" disabled={actionLoading} onClick={handleReject}>
                            {actionLoading ? <LoadingSpinner color="text-white" /> : 'Kill Signal & Refund'}
                        </button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">Active Target Node</p>
                        <h4 className="text-xl font-black text-gray-900 leading-tight">{rejectModal.item?.full_name}</h4>
                        <div className="mt-4 flex items-center justify-between text-rose-600">
                            <span className="text-[10px] font-black uppercase tracking-widest">Quantum to Refund</span>
                            <span className="text-2xl font-black tracking-tighter">${parseFloat(rejectModal.item?.amount || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Protocol Rejection Rationale (Internal Note)</label>
                        <textarea
                            className="input min-h-[100px] py-4 bg-gray-50 border-gray-100"
                            placeholder="Reason for de-authorizing extraction..."
                            value={rejectModal.note}
                            onChange={(e) => setRejectModal({ ...rejectModal, note: e.target.value })}
                        ></textarea>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default Withdrawals;
