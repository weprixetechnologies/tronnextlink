import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    Wallet,
    FileText,
    ArrowDownCircle,
    BarChart3,
    LogOut,
    ChevronLeft,
    ChevronRight,
    TrendingUp
} from 'lucide-react';

const AdminSidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Users', icon: <Users size={20} />, path: '/users' },
        { name: 'Plans', icon: <Package size={20} />, path: '/plans' },
        { name: 'Wallets', icon: <Wallet size={20} />, path: '/wallets' },
        { name: 'Ledger', icon: <FileText size={20} />, path: '/ledger' },
        { name: 'Withdrawals', icon: <ArrowDownCircle size={20} />, path: '/withdrawals' },
        { name: 'Platform Earnings', icon: <BarChart3 size={20} />, path: '/earnings' },
        { name: 'Analytics & Finance', icon: <TrendingUp size={20} />, path: '/analytics' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-[#1E1B4B] text-[#C7D2FE] transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-indigo-900/50">
                {!collapsed && <span className="font-black text-xl tracking-tighter text-white uppercase italic">Node Admin</span>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 transition-colors"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                            ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                : 'hover:bg-indigo-900/40 hover:text-white'}
                        `}
                    >
                        <div className="shrink-0">{item.icon}</div>
                        {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 border-t border-indigo-900/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-all group"
                >
                    <div className="shrink-0"><LogOut size={20} /></div>
                    {!collapsed && <span className="font-medium text-sm">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
