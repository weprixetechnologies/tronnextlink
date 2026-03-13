import React from 'react';
import {
    Home,
    Users,
    CreditCard,
    ArrowUpRight,
    BarChart3,
    User,
    LogOut
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const navItems = [
        { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
        { icon: <Users size={20} />, label: 'Referral', path: '/referral' },
        { icon: <CreditCard size={20} />, label: 'Deposit', path: '/deposit' },
        { icon: <ArrowUpRight size={20} />, label: 'Withdrawal', path: '/withdrawal' },
        { icon: <BarChart3 size={20} />, label: 'Transactions', path: '/transactions' },
        { icon: <User size={20} />, label: 'Profile', path: '/profile' },
    ];

    return (
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[260px] bg-sidebar-dark border-r border-card-border z-sidebar">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center glow-purple">
                        <span className="text-xl font-black">M</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">CRYPTO<span className="text-primary">MLM</span></span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-primary text-white glow-purple'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'}
                        `}
                    >
                        <span className="transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-card-border bg-black/20">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center font-bold text-sm">
                        {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{user?.full_name}</p>
                        <p className="text-xs text-white/40 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
