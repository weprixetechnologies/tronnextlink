import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAuthPage = ['/login', '/signup'].includes(location.pathname);

    if (isAuthPage) {
        return (
            <main className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-4">
                {/* Background Blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-purple/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-secondary-teal/10 rounded-full blur-[100px] animate-pulse-slow ml-20" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 w-full max-w-[420px]">
                    {children}
                </div>
            </main>
        );
    }

    // Map path to title
    const titles = {
        '/': 'Dashboard',
        '/referral': 'Referral Program',
        '/deposit': 'Deposit USDT',
        '/withdrawal': 'Withdraw Funds',
        '/transactions': 'Transaction History',
        '/profile': 'My Profile'
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="md:pl-[260px] pb-20 md:pb-0">
                <TopBar title={titles[location.pathname]} />
                <main className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
            <BottomNav />
        </div>
    );
};

const pulseKeyframes = `
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.3; }
}
`;

export default Layout;
