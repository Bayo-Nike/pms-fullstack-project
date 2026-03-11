import api from "../api";

const colorCodingApi = {
    GET_COLOR_CODINGS: (params) => api.get("/colorCodes", { params }),
    GET_COLOR_CODING: (id) => api.get(`/colorCodes/${id}`),
    CREATE_COLOR_CODING: (data) => api.post("/colorCodes", data),
    UPDATE_COLOR_CODING: (id, data) => api.put(`/colorCodes/${id}`, data),
    DELETE_COLOR_CODING: (id) => api.delete(`/colorCodes/${id}`),
    GET_FISCAL_YEARS: (params) => api.get("/colorCodes/fiscal-years", { params }),
};

export default colorCodingApi;