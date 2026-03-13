import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Dashboard from './pages/Dashboard';
import Referral from './pages/Referral';
import Deposit from './pages/Deposit';
import Withdrawal from './pages/Withdrawal';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );

    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const AuthRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );

    return !user ? <Layout>{children}</Layout> : <Navigate to="/" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                    <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/referral" element={<PrivateRoute><Referral /></PrivateRoute>} />
                    <Route path="/deposit" element={<PrivateRoute><Deposit /></PrivateRoute>} />
                    <Route path="/withdrawal" element={<PrivateRoute><Withdrawal /></PrivateRoute>} />
                    <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
