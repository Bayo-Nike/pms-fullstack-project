// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import authApi from '../api/modules/auth';
import { encrypt, decrypt, encryptToken, decryptToken } from '../utility/simpleEncryption';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const encrypted = localStorage.getItem('encrypted_token');
        return encrypted ? decryptToken(encrypted) : null;
    });

    const [user, setUser] = useState(() => {
        const encrypted = localStorage.getItem('encrypted_user');
        return encrypted ? decrypt(encrypted) : null;
    });

    const [loading, setLoading] = useState(true);
    const verifiedRef = useRef(false);

    const saveToStorage = (token, user) => {
        if (token) {
            localStorage.setItem('encrypted_token', encryptToken(token));
        } else {
            localStorage.removeItem('encrypted_token');
        }

        if (user) {
            localStorage.setItem('encrypted_user', encrypt(user));
        } else {
            localStorage.removeItem('encrypted_user');
        }
    };

    const logout = useCallback(async () => {
        try {
            await authApi.LOGOUT();
        } catch (err) {
            // Silently handle error
        } finally {
            localStorage.removeItem('encrypted_token');
            localStorage.removeItem('encrypted_user');
            setToken(null);
            setUser(null);
        }
    }, []);

    const login = useCallback((authData) => {
        const { accessToken, user: userData } = authData;
        saveToStorage(accessToken, userData);
        setToken(accessToken);
        setUser(userData);
    }, []);

    const can = useCallback((permissionSlug) => {
        if (!user) return false;
        // if (user.roles?.includes('SUPER_ADMIN')) return true;
        return user.permissions?.includes(permissionSlug) || false;
    }, [user]);

    useEffect(() => {
        const verifySession = async () => {
            const encryptedToken = localStorage.getItem('encrypted_token');

            if (!encryptedToken) {
                setLoading(false);
                return;
            }

            if (verifiedRef.current && user) {
                setLoading(false);
                return;
            }

            try {
                const response = await authApi.GET_PROFILE();
                const userData = response.data || response;

                setUser(userData);
                saveToStorage(token, userData);
                verifiedRef.current = true;
            } catch (error) {
                localStorage.removeItem('encrypted_token');
                localStorage.removeItem('encrypted_user');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const contextValue = React.useMemo(() => ({
        user,
        token,
        login,
        logout,
        loading,
        can,
        isAuthenticated: !!token
    }), [user, token, login, logout, loading, can]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};