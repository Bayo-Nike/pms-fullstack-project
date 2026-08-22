// // context/AuthContext.jsx
// import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
// import authApi from '../api/modules/auth';
// import { encrypt, decrypt, encryptToken, decryptToken } from '../utility/simpleEncryption';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(() => {
//         const encrypted = localStorage.getItem('encrypted_token');
//         return encrypted ? decryptToken(encrypted) : null;
//     });

//     const [user, setUser] = useState(() => {
//         const encrypted = localStorage.getItem('encrypted_user');
//         return encrypted ? decrypt(encrypted) : null;
//     });

//     const [loading, setLoading] = useState(true);
//     const verifiedRef = useRef(false);

//     const saveToStorage = (token, user) => {
//         if (token) {
//             localStorage.setItem('encrypted_token', encryptToken(token));
//         } else {
//             localStorage.removeItem('encrypted_token');
//         }

//         if (user) {
//             localStorage.setItem('encrypted_user', encrypt(user));
//         } else {
//             localStorage.removeItem('encrypted_user');
//         }
//     };

//     const logout = useCallback(async () => {
//         try {
//             await authApi.LOGOUT();
//         } catch (err) {
//             // Silently handle error
//         } finally {
//             localStorage.removeItem('encrypted_token');
//             localStorage.removeItem('encrypted_user');
//             setToken(null);
//             setUser(null);
//         }
//     }, []);

//     const login = useCallback((authData) => {
//         const { accessToken, user: userData } = authData;
//         saveToStorage(accessToken, userData);
//         setToken(accessToken);
//         setUser(userData);
//     }, []);

//     const can = useCallback((permissionSlug) => {
//         if (!user) return false;
//         // if (user.roles?.includes('SUPER_ADMIN')) return true;
//         return user.permissions?.includes(permissionSlug) || false;
//     }, [user]);

//     useEffect(() => {
//         const verifySession = async () => {
//             const encryptedToken = localStorage.getItem('encrypted_token');

//             if (!encryptedToken) {
//                 setLoading(false);
//                 return;
//             }

//             if (verifiedRef.current && user) {
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const response = await authApi.GET_PROFILE();
//                 const userData = response.data || response;

//                 setUser(userData);
//                 saveToStorage(token, userData);
//                 verifiedRef.current = true;
//             } catch (error) {
//                 localStorage.removeItem('encrypted_token');
//                 localStorage.removeItem('encrypted_user');
//                 setToken(null);
//                 setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         verifySession();
//     }, []); // eslint-disable-line react-hooks/exhaustive-deps

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





// // context/AuthContext.jsx
// import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
// import authApi from '../api/modules/auth';
// import { encrypt, decrypt, encryptToken, decryptToken } from '../utility/simpleEncryption';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(() => {
//         const encrypted = localStorage.getItem('encrypted_token');
//         return encrypted ? decryptToken(encrypted) : null;
//     });

//     const [user, setUser] = useState(() => {
//         const encrypted = localStorage.getItem('encrypted_user');
//         return encrypted ? decrypt(encrypted) : null;
//     });

//     const [loading, setLoading] = useState(true);
//     const verifiedRef = useRef(false);

//     const saveToStorage = (token, user) => {
//         if (token) {
//             localStorage.setItem('encrypted_token', encryptToken(token));
//         } else {
//             localStorage.removeItem('encrypted_token');
//         }

//         if (user) {
//             localStorage.setItem('encrypted_user', encrypt(user));
//         } else {
//             localStorage.removeItem('encrypted_user');
//         }
//     };

//     const logout = useCallback(async () => {
//         try {
//             await authApi.LOGOUT();
//         } catch (err) {
//             // Silently handle error
//         } finally {
//             localStorage.removeItem('encrypted_token');
//             localStorage.removeItem('encrypted_user');
//             setToken(null);
//             setUser(null);
//         }
//     }, []);

//     const login = useCallback((authData) => {
//         const { accessToken, user: userData } = authData;
//         saveToStorage(accessToken, userData);
//         setToken(accessToken);
//         setUser(userData);
//     }, []);

//     const can = useCallback((permissionSlug) => {
//         if (!user) return false;
//         return user.permissions?.includes(permissionSlug) || false;
//     }, [user]);

//     useEffect(() => {
//         const verifySession = async () => {
//             const encryptedToken = localStorage.getItem('encrypted_token');

//             if (!encryptedToken) {
//                 setLoading(false);
//                 return;
//             }

//             if (verifiedRef.current && user) {
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const response = await authApi.GET_PROFILE();
//                 const userData = response.data || response;

//                 // userData now contains: divisionId, divisionGroup, subCityId
//                 setUser(userData);
//                 saveToStorage(token, userData);
//                 verifiedRef.current = true;
//             } catch (error) {
//                 localStorage.removeItem('encrypted_token');
//                 localStorage.removeItem('encrypted_user');
//                 setToken(null);
//                 setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         verifySession();
//     }, [token]); // Added token to dependencies to sync if it changes

//     const contextValue = React.useMemo(() => ({
//         user,
//         token,
//         // New data fields for consumption
//         divisionId: user?.divisionId || null,
//         divisionGroup: user?.divisionGroup || null,
//         subCityId: user?.subCityId || null,
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




// // context/AuthContext.jsx
// import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
// import authApi from '../api/modules/auth';
// import { encrypt, decrypt, encryptToken, decryptToken } from '../utility/simpleEncryption';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(() => {
//         const encrypted = localStorage.getItem('encrypted_token');
//         return encrypted ? decryptToken(encrypted) : null;
//     });

//     const [user, setUser] = useState(() => {
//         const encrypted = localStorage.getItem('encrypted_user');
//         return encrypted ? decrypt(encrypted) : null;
//     });

//     const [loading, setLoading] = useState(true);
//     const verifiedRef = useRef(false);

//     const saveToStorage = (token, user) => {
//         if (token) {
//             localStorage.setItem('encrypted_token', encryptToken(token));
//         } else {
//             localStorage.removeItem('encrypted_token');
//         }

//         if (user) {
//             localStorage.setItem('encrypted_user', encrypt(user));
//         } else {
//             localStorage.removeItem('encrypted_user');
//         }
//     };

//     const logout = useCallback(async () => {
//         try {
//             await authApi.LOGOUT();
//         } catch (err) {
//             // Silently handle error
//         } finally {
//             localStorage.removeItem('encrypted_token');
//             localStorage.removeItem('encrypted_user');
//             setToken(null);
//             setUser(null);
//         }
//     }, []);

//     const login = useCallback((authData) => {
//         const { accessToken, user: userData } = authData;
//         saveToStorage(accessToken, userData);
//         setToken(accessToken);
//         setUser(userData);
//     }, []);

//     const can = useCallback((permissionSlug) => {
//         if (!user) return false;
//         return user.permissions?.includes(permissionSlug) || false;
//     }, [user]);

//     useEffect(() => {
//         const verifySession = async () => {
//             const encryptedToken = localStorage.getItem('encrypted_token');

//             if (!encryptedToken) {
//                 setLoading(false);
//                 return;
//             }

//             if (verifiedRef.current && user) {
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const response = await authApi.GET_PROFILE();
//                 const userData = response.data || response;

//                 setUser(userData);
//                 saveToStorage(token, userData);
//                 verifiedRef.current = true;
//             } catch (error) {
//                 localStorage.removeItem('encrypted_token');
//                 localStorage.removeItem('encrypted_user');
//                 setToken(null);
//                 setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         verifySession();
//     }, [token]);

//     const contextValue = React.useMemo(() => ({
//         user,
//         token,
//         // Fields for consumption
//         divisionId: user?.divisionId || null,
//         divisionGroup: user?.divisionGroup || null,
//         subCityId: user?.subCityId || null,
//         positionId: user?.positionId || null, // <--- Added positionId
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


import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
    useMemo,
} from "react";

import authApi from "../api/modules/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Load the authenticated user from the backend.
     *
     * The browser automatically sends:
     *
     * Cookie: access_token=...
     *
     * because api.js has:
     *
     * withCredentials: true
     */
    const refreshProfile = useCallback(async () => {

        try {

            const response = await authApi.GET_PROFILE();

            const userData = response.data;

            setUser(userData);

            return userData;

        } catch (error) {

            setUser(null);

            throw error;
        }
    }, []);

    /**
     * Login
     *
     * The backend has already placed the JWT
     * inside the HttpOnly cookie.
     *
     * We only keep the user in React state.
     */
    const login = useCallback((authData) => {

        const userData = authData?.user;

        if (!userData) {
            throw new Error("Login response does not contain user data.");
        }

        setUser(userData);

    }, []);

    /**
     * Logout
     *
     * Backend will invalidate/clear the cookie.
     */
    const logout = useCallback(async () => {

        try {

            await authApi.LOGOUT();

        } catch (error) {

            // Even if backend logout fails,
            // clear the frontend authentication state.

        } finally {

            setUser(null);
        }

    }, []);

    /**
     * Permission helper
     */
    const can = useCallback(
        (permissionSlug) => {

            if (!user) {
                return false;
            }

            return user.permissions?.includes(permissionSlug) || false;
        },
        [user]
    );

    /**
     * Restore authentication when React starts.
     *
     * We DON'T check localStorage.
     *
     * We ask Spring Boot:
     *
     * GET /api/auth/profile
     *
     * The browser automatically sends the HttpOnly cookie.
     */
    useEffect(() => {

        const initializeAuth = async () => {

            try {

                await refreshProfile();

            } catch (error) {

                // No valid session.
                setUser(null);

            } finally {

                setLoading(false);
            }
        };

        initializeAuth();

    }, [refreshProfile]);

    const contextValue = useMemo(
        () => ({
            user,

            divisionId: user?.divisionId || null,
            divisionGroup: user?.divisionGroup || null,
            subCityId: user?.subCityId || null,
            positionId: user?.positionId || null,

            login,
            logout,

            loading,

            can,

            isAuthenticated: !!user,
        }),
        [
            user,
            login,
            logout,
            loading,
            can,
        ]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
};
