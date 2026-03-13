import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const Layout = ({ title, children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex">
            {/* Sidebar */}
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}
            >
                <AdminNavbar title={title} />
                <main className="flex-1 p-8 animate-fade-in overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
