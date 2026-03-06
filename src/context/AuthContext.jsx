import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authApi from '../api/modules/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);


    const logout = async () => {
        try {
            console.log("Attempting server-side logout...");
            await authApi.LOGOUT();
            console.log("Server-side logout completed. ")
        } catch (err) {
            console.error("Server-side logout failed", err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    };

    const verifySession = useCallback(async () => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            try {
                const res = await authApi.GET_PROFILE();
                const userData = res.data || res;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (err) {
                logout();
            }
        }
        setLoading(false);
    }, [logout]);

    useEffect(() => {
        verifySession();
    }, [verifySession]);

    const login = (authData) => {
        const { accessToken, user: userData } = authData;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
    };

    const can = useCallback((permissionSlug) => {
        if (!user) return false;
        if (user.roles?.includes('SUPER_ADMIN')) return true;
        return user.permissions?.includes(permissionSlug) || false;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token, can }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};