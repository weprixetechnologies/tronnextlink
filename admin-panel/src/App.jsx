import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Plans from './pages/Plans';
import Wallets from './pages/Wallets';
import Ledger from './pages/Ledger';
import Withdrawals from './pages/Withdrawals';
import PlatformEarnings from './pages/PlatformEarnings';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AdminLogin />} />

                <Route path="/dashboard" element={
                    <ProtectedRoute><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/users" element={
                    <ProtectedRoute><Users /></ProtectedRoute>
                } />
                <Route path="/users/:userId" element={
                    <ProtectedRoute><UserDetail /></ProtectedRoute>
                } />
                <Route path="/plans" element={
                    <ProtectedRoute><Plans /></ProtectedRoute>
                } />
                <Route path="/wallets" element={
                    <ProtectedRoute><Wallets /></ProtectedRoute>
                } />
                <Route path="/ledger" element={
                    <ProtectedRoute><Ledger /></ProtectedRoute>
                } />
                <Route path="/withdrawals" element={
                    <ProtectedRoute><Withdrawals /></ProtectedRoute>
                } />
                <Route path="/earnings" element={
                    <ProtectedRoute><PlatformEarnings /></ProtectedRoute>
                } />
                <Route path="/analytics" element={
                    <ProtectedRoute><Analytics /></ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
