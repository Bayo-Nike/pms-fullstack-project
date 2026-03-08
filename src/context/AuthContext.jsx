// import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// import authApi from '../api/modules/auth';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(localStorage.getItem('token'));
//     const [user, setUser] = useState(() => {
//         const savedUser = localStorage.getItem('user');
//         return savedUser ? JSON.parse(savedUser) : null;
//     });
//     const [loading, setLoading] = useState(true);


//     const logout = async () => {
//         try {
//             console.log("Attempting server-side logout...");
//             await authApi.LOGOUT();
//             console.log("Server-side logout completed. ")
//         } catch (err) {
//             console.error("Server-side logout failed", err);
//         } finally {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             setToken(null);
//             setUser(null);
//         }
//     };

//     const verifySession = useCallback(async () => {
//         const savedToken = localStorage.getItem('token');
//         if (savedToken) {
//             try {
//                 const res = await authApi.GET_PROFILE();
//                 const userData = res.data || res;
//                 setUser(userData);
//                 localStorage.setItem('user', JSON.stringify(userData));
//             } catch (err) {
//                 logout();
//             }
//         }
//         setLoading(false);
//     }, [logout]);

//     useEffect(() => {
//         verifySession();
//     }, [verifySession]);

//     const login = (authData) => {
//         const { accessToken, user: userData } = authData;
//         localStorage.setItem('token', accessToken);
//         localStorage.setItem('user', JSON.stringify(userData));
//         setToken(accessToken);
//         setUser(userData);
//     };

//     const can = useCallback((permissionSlug) => {
//         if (!user) return false;
//         if (user.roles?.includes('SUPER_ADMIN')) return true;
//         return user.permissions?.includes(permissionSlug) || false;
//     }, [user]);

//     return (
//         <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token, can }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) throw new Error("useAuth must be used within AuthProvider");
//     return context;
// };


// import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
// import authApi from '../api/modules/auth';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(localStorage.getItem('token'));
//     const [user, setUser] = useState(() => {
//         const savedUser = localStorage.getItem('user');
//         return savedUser ? JSON.parse(savedUser) : null;
//     });
//     const [loading, setLoading] = useState(true);

//     // Track if initial verification is done
//     const verifiedRef = useRef(false);

//     // Clean logout function - no dependencies
//     const logout = useCallback(async () => {
//         try {
//             await authApi.LOGOUT();
//         } catch (err) {
//             console.error("Logout error:", err);
//         } finally {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             setToken(null);
//             setUser(null);
//         }
//     }, []);

//     // Login function
//     const login = useCallback((authData) => {
//         const { accessToken, user: userData } = authData;
//         localStorage.setItem('token', accessToken);
//         localStorage.setItem('user', JSON.stringify(userData));
//         setToken(accessToken);
//         setUser(userData);
//     }, []);

//     // Permission checker
//     const can = useCallback((permissionSlug) => {
//         if (!user) return false;

//         // SUPER_ADMIN has all permissions
//         if (user.roles?.includes('SUPER_ADMIN')) return true;

//         // Check specific permission
//         return user.permissions?.includes(permissionSlug) || false;
//     }, [user]);

//     // Single verification on mount
//     useEffect(() => {
//         const verifySession = async () => {
//             const savedToken = localStorage.getItem('token');

//             // No token, just stop loading
//             if (!savedToken) {
//                 setLoading(false);
//                 return;
//             }

//             // Already have user and verified, don't fetch again
//             if (verifiedRef.current && user) {
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const response = await authApi.GET_PROFILE();
//                 const userData = response.data || response;

//                 setUser(userData);
//                 localStorage.setItem('user', JSON.stringify(userData));
//                 verifiedRef.current = true;
//             } catch (error) {
//                 console.error("Session verification failed:", error);

//                 // Clear invalid session
//                 localStorage.removeItem('token');
//                 localStorage.removeItem('user');
//                 setToken(null);
//                 setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         verifySession();
//     }, []); // Empty array = run once on mount

//     // Memoize context value to prevent unnecessary re-renders
//     const contextValue = React.useMemo(() => ({
//         user,
//         token,
//         login,
//         logout,
//         loading,
//         can,
//         isAuthenticated: !!token
//     }), [user, token, login, logout, loading, can]);

//     return (
//         <AuthContext.Provider value={contextValue}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error("useAuth must be used within AuthProvider");
//     }
//     return context;
// };


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
        if (user.roles?.includes('SUPER_ADMIN')) return true;
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