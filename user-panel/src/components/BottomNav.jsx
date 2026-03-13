import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Users,
    PlusCircle,
    Wallet,
    User
} from 'lucide-react';

const BottomNav = () => {
    const navItems = [
        { icon: <Home size={22} />, label: 'Home', path: '/' },
        { icon: <Users size={22} />, label: 'Referral', path: '/referral' },
        { icon: <PlusCircle size={24} />, label: 'Deposit', path: '/deposit', isAction: true },
        { icon: <Wallet size={22} />, label: 'Wallet', path: '/transactions' },
        { icon: <User size={22} />, label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar-dark/80 backdrop-blur-xl border-t border-card-border flex items-center justify-around px-2 pb-safe z-bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                        relative flex flex-col items-center justify-center w-full h-full transition-all duration-300
                        ${isActive ? 'text-primary' : 'text-white/40 hover:text-white/60'}
                    `}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_var(--color-primary-glow)]" />
                            )}
                            <div className={`p-1 ${item.isAction && !isActive ? 'p-2 mt-[-20px] bg-primary text-white rounded-full glow-purple' : ''}`}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
