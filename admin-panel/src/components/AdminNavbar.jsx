import React from 'react';
import { User, Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = ({ title, adminName = 'System Admin' }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <header className="sticky top-0 right-0 z-40 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm">
            {/* Left: Page Title */}
            <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
            </div>

            {/* Middle: Search bar (optional visual filler) */}
            {/* <div className="hidden md:flex relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search ledger or users..." 
                    className="w-full bg-gray-50 border-none px-10 py-2 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                />
            </div> */}

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
                {/* <button className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button> */}

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-gray-900 leading-none">{adminName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Super Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
                        {adminName.substring(0, 1)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;
