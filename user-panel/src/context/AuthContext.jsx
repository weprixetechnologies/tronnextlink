import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get('/auth/me');
                if (res.data.success) {
                    setUser(res.data.data);
                } else {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        if (res.data.success) {
            localStorage.setItem('token', res.data.data.token);
            setUser(res.data.data.user);
        }
        return res.data;
    };

    const signup = async (data) => {
        const res = await axios.post('/auth/signup', data);
        if (res.data.success) {
            localStorage.setItem('token', res.data.data.token);
            setUser(res.data.data.user);
        }
        return res.data;
    };

    const updateProfile = async (full_name) => {
        const res = await axios.put('/auth/update-profile', { full_name });
        if (res.data.success) {
            setUser(res.data.data);
        }
        return res.data;
    };

    const changePassword = async (current_password, new_password) => {
        const res = await axios.put('/auth/change-password', { current_password, new_password });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            signup,
            logout,
            updateProfile,
            changePassword,
            refreshUser: checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
