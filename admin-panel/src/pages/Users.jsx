import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import { Search, Filter, User, ShieldAlert, ShieldCheck, ExternalLink, MoreVertical } from 'lucide-react';
import { debounce } from 'lodash';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchUsers = async (page = 1, searchTerm = search, userStatus = status) => {
        try {
            setLoading(true);
            const res = await axios.get('/admin/users', {
                params: {
                    page,
                    limit: 15,
                    search: searchTerm,
                    status: userStatus
                }
            });
            if (res.data.success) {
                setUsers(res.data.data.users);
                setPagination(res.data.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = useCallback(
        debounce((term) => fetchUsers(1, term, status), 500),
        [status]
    );

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedFetch(e.target.value);
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        fetchUsers(1, search, newStatus);
    };

    const handleBlockToggle = async (user) => {
        const action = user.status === 'blocked' ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} ${user.full_name}?`)) return;

        try {
            const res = await axios.patch(`/admin/users/${user.id}/${action}`);
            if (res.data.success) {
                fetchUsers(pagination.page);
            }
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} user`);
        }
    };

    const columns = [
        {
            header: 'User Identity',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 font-black text-sm border border-gray-100 shadow-sm">
                        {row?.full_name?.substring(0, 1)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">{row.full_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{row.email}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Active Protocol',
            render: (row) => (
                <Badge variant={row.plan_name ? 'indigo' : 'gray'}>
                    {row.plan_name || 'NO PLAN'}
                </Badge>
            )
        },
        {
            header: 'Quantum Balance',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 tracking-tighter">${parseFloat(row.balance_usdt || 0).toFixed(2)}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">USDT</span>
                </div>
            )
        },
        {
            header: 'Initialization',
            render: (row) => (
                <span className="text-gray-500 font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
            )
        },
        {
            header: 'Signal Status',
            render: (row) => (
                <Badge variant={row.status === 'active' ? 'emerald' : 'rose'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/users/${row.id}`)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm shadow-black/5"
                        title="View Intel"
                    >
                        <ExternalLink size={18} />
                    </button>
                    <button
                        onClick={() => handleBlockToggle(row)}
                        className={`p-2 rounded-xl transition-all shadow-sm shadow-black/5 ${row.status === 'blocked'
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-rose-600 hover:bg-rose-50'
                            }`}
                        title={row.status === 'blocked' ? 'Authorize Protocol' : 'Kill Signal'}
                    >
                        {row.status === 'blocked' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                    </button>
                </div>
            )
        }
    ];

    return (
        <Layout title="Protocol Participants">
            <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            className="input pl-12 h-12 bg-white border-gray-100 shadow-sm shadow-black/5"
                            placeholder="Search by identity or email..."
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => handleStatusChange('')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!status ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                        >
                            All Logs
                        </button>
                        <button
                            onClick={() => handleStatusChange('active')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${status === 'active' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                        >
                            Live Signals
                        </button>
                        <button
                            onClick={() => handleStatusChange('blocked')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${status === 'blocked' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                        >
                            Blocked
                        </button>
                    </div>
                </div>

                <div className="card">
                    <DataTable
                        columns={columns}
                        data={users}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(page) => fetchUsers(page)}
                        emptyTitle="No Participants Found"
                        emptyMessage="The specific query does not match any protocol participants."
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Users;
