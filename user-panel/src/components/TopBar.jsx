import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopBar = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-card-border p-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="md:hidden w-8 h-8 rounded-lg purple-gradient flex items-center justify-center">
                    <span className="text-sm font-black">M</span>
                </div>
                <h1 className="text-lg md:text-xl font-bold truncate">{title || 'Dashboard'}</h1>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger-red rounded-full border-2 border-background"></span>
                </button>
                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-card-border">
                    <div className="text-right">
                        <p className="text-sm font-bold leading-none">{user?.full_name}</p>
                        <p className="text-xs text-text-muted mt-1 leading-none">{user?.status === 'active' ? '⭐ Premium' : 'Free User'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
