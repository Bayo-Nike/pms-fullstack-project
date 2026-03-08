// import axios from "axios";
// import { API_BASE_API } from "./base";

// const api = axios.create({
//     baseURL: API_BASE_API,
//     headers: { "Content-Type": "application/json" },
// });

// // Request interceptor
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("token");
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // Response interceptor
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // Only redirect on 401 for non-login endpoints
//         const isLoginRequest = error.config?.url?.includes('/auth/login');

//         if (error.response?.status === 401 && !isLoginRequest) {
//             // Clear auth data
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');

//             // Redirect to login if not already there
//             if (!window.location.pathname.includes('/login')) {
//                 window.location.href = '/login';
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// export default api;


// api.js
import axios from "axios";
import { API_BASE_API } from "./base";
import { decryptToken } from "../utility/simpleEncryption";

const api = axios.create({
    baseURL: API_BASE_API,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor - decrypt token before sending
api.interceptors.request.use(
    (config) => {
        const encryptedToken = localStorage.getItem('encrypted_token');
        if (encryptedToken) {
            const token = decryptToken(encryptedToken);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                localStorage.removeItem('encrypted_token');
                localStorage.removeItem('encrypted_user');
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('encrypted_token');
            localStorage.removeItem('encrypted_user');

            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;