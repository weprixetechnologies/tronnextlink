import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="text-xl font-bold text-blue-600">MLM System</div>

            <div className="flex items-center space-x-4 gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <Bell size={20} />
                </button>

                <div className="flex items-center space-x-2 gap-2 border-l pl-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
