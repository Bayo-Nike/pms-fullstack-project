import api from "../api";

const demandApi = {

    CREATE_DEMAND: (data) => api.post("/projects/demands", data,{
        headers: {
        // Ensure we DON'T force application/json here
        'Content-Type': 'multipart/form-data', 
    }}),
    GET_DEMANDS: (params) => api.get("/projects/demands", { params }),
    GET_DEMAND: (id) => api.get(`/projects/demands/${id}`),
    UPDATE_DEMAND: (id, data) => api.put(`/projects/demands/${id}`, data,{
        headers: {
        // Ensure we DON'T force application/json here
        'Content-Type': 'multipart/form-data', 
    }}),

    REVIEW_DEMAND: (id, data) => api.patch(`/projects/demands/${id}/review`, data),
    DELETE_DEMAND: (id) => api.delete(`/projects/demands/${id}`),
    DOWNLOAD_DEMAND_DOCUMENT: (id) => api.get(`/projects/demands/files/download/${id}`, {
        responseType: 'blob' // This allows the transfer of binary files
    }),


};
export default demandApi;