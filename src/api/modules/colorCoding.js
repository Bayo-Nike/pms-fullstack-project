import api from "../api";

const colorCodingApi = {
    GET_COLOR_CODINGS: (params) => api.get("/colorCodes", { params }),
    GET_COLOR_CODING: (id) => api.get(`/colorCodes/${id}`),
    CREATE_COLOR_CODING: (data) => api.post("/colorCodes", data),
    // UPDATE_COLOR_CODING: (id, data) => api.put(`/colorCodes/${id}`, data),
    UPDATE_COLOR_CODING: (id, data) =>
        api.put(`/colorCodes/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    DELETE_COLOR_CODING: (id) => api.delete(`/colorCodes/${id}`),
    GET_FISCAL_YEARS: (params) => api.get("/colorCodes/fiscal-years", { params }),
    SUBMIT_ACHIEVEMENT: (payload) => api.post('/colorCodes/submit-achievement', payload),
    // api/modules/colorCoding.js
    GET_ACHIEVEMENT_HISTORY: (id) => api.get(`/colorCodes/${id}/achievements`),

    UPDATE_ACHIEVEMENT: (id, data) =>
        api.put(`/colorCodes/achievement/${id}`, data),

    
    
};

export default colorCodingApi;