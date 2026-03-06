import api from "../api";

const authApi = {
    LOGIN: (data) => api.post("/auth/login", data),
    REGISTER: (data) => api.post("/auth/register", data),
    LOGOUT: () => api.post("/auth/logout"),
    GET_PROFILE: () => api.get("/auth/profile"),
    UPDATE_PROFILE: (data) => api.put("/auth/profile", data),
    CHANGE_PASSWORD: (data) => api.put("/auth/change-password", data),
    FORGOT_PASSWORD: (data) => api.post("/auth/forgot-password", data),
    RESET_PASSWORD: (data) => api.post("/auth/reset-password", data),
    VERIFY_EMAIL: (data) => api.post("/auth/verify-email", data),
    RESEND_VERIFICATION_EMAIL: (data) => api.post("/auth/resend-verification-email", data),
};

export default authApi;
