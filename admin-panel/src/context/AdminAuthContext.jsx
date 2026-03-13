import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const res = await axios.get('/auth/me');
                    if (res.data.data.role === 'admin') {
                        setAdmin(res.data.data);
                    } else {
                        localStorage.removeItem('adminToken');
                    }
                } catch (err) {
                    localStorage.removeItem('adminToken');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        if (res.data.data.user.role !== 'admin') {
            throw new Error('Unauthorized access');
        }
        localStorage.setItem('adminToken', res.data.data.token);
        setAdmin(res.data.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
