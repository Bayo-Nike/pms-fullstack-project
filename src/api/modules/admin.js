import api from "../api";

const adminApi = {
    GET_USERS: () => api.get("/admin/users"),
    GET_USER: (id) => api.get(`/admin/users/${id}`),
    CREATE_USER: (data) => api.post("/admin/users", data),
    UPDATE_USER: (id, data) => api.put(`/admin/users/${id}`, data),
    DELETE_USER: (id) => api.delete(`/admin/users/${id}`),
    GET_ROLES: () => api.get("/admin/roles"),
    GET_ROLE: (id) => api.get(`/admin/roles/${id}`),
    CREATE_ROLE: (data) => api.post("/admin/roles", data),
    UPDATE_ROLE: (id, data) => api.put(`/admin/roles/${id}`, data),
    DELETE_ROLE: (id) => api.delete(`/admin/roles/${id}`),
    GET_PERMISSIONS: () => api.get("/admin/permissions"),

    //city
    GET_CITY: () => api.get("/admin/cities/city"),
    GET_SUB_CITIES: () => api.get('/admin/cities/sub'),
    GET_SUB_CITY: (id) => api.get(`/admin/cities/sub/${id}`),
    CREATE_SUB_CITY: (data) => api.post("/admin/cities/sub", data),
    UPDATE_SUB_CITY: (id, data) => api.put(`/admin/cities/sub/${id}`, data),
    DELETE_SUB_CITY: (id) => api.delete(`/admin/cities/sub/${id}`),

    //Division
    GET_DIVISIONS: () => api.get("/admin/divisions"),
    GET_DIVISION: (id) => api.get(`/admin/divisions/${id}`),
    CREATE_DIVISION: (data) => api.post("/admin/divisions", data),
    UPDATE_DIVISION: (id, data) => api.put(`/admin/divisions/${id}`, data),
    DELETE_DIVISION: (id) => api.delete(`/admin/divisions/${id}`),

    //Position
    GET_POSITIONS: () => api.get("/admin/positions"),
    GET_POSITION: (id) => api.get(`/admin/positions/${id}`),
    CREATE_POSITION: (data) => api.post("/admin/positions", data),
    UPDATE_POSITION: (id, data) => api.put(`/admin/positions/${id}`, data),
    DELETE_POSITION: (id) => api.delete(`/admin/positions/${id}`),

    //employee
    GET_EMPLOYEES: () => api.get("/admin/employees"),
    GET_EMPLOYEE: (id) => api.get(`/admin/employees/${id}`),
    CREATE_EMPLOYEE: (data) => api.post("/admin/employees", data),
    UPDATE_EMPLOYEE: (id, data) => api.put(`/admin/employees/${id}`, data),
    DELETE_EMPLOYEE: (id) => api.delete(`/admin/employees/${id}`),

    //Contractor
    GET_CONTRACTORS: () => api.get("/admin/contractors"),
    GET_CONTRACTOR: (id) => api.get(`/admin/contractors/${id}`),
    CREATE_CONTRACTOR: (data) =>
        api.post("/admin/contractors", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    UPDATE_CONTRACTOR: (id, data) =>
        api.put(`/admin/contractors/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    DELETE_CONTRACTOR: (id) => api.delete(`/admin/contractors/${id}`),

    //Consultancy
    GET_CONSULTANTS: () => api.get("/admin/consultancy"),
    GET_CONSULTANT: (id) => api.get(`/admin/consultancy/${id}`),
    CREATE_CONSULTANT: (data) =>
        api.post("/admin/consultancy", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    UPDATE_CONSULTANT: (id, data) =>
        api.put(`/admin/consultancy/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    DELETE_CONSULTANT: (id) => api.delete(`/admin/consultancy/${id}`),

    //Client
    GET_CLIENTS: () => api.get("/admin/client"),
    GET_CLIENT: (id) => api.get(`/admin/client/${id}`),
    CREATE_CLIENT: (data) =>
        api.post("/admin/client", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    UPDATE_CLIENT: (id, data) =>
        api.put(`/admin/client/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    DELETE_CLIENT: (id) => api.delete(`/admin/client/${id}`),


    GET_LOCATIONS: () => api.get("/admin/locations"),
    GET_LOCATION: (id) => api.get(`/admin/locations/${id}`),
    CREATE_LOCATION: (data) => api.post("/admin/locations", data),
    UPDATE_LOCATION: (id, data) => api.put(`/admin/locations/${id}`, data),
    DELETE_LOCATION: (id) => api.delete(`/admin/locations/${id}`),

    GET_AUDIT_LOGS: () => api.get("/admin/logs"),

    GET_INSPECTION_TYPES: () => api.get("/admin/inspection-types"),
    GET_INSPECTION_TYPE: (id) => api.get(`/admin/inspection-types/${id}`),
    CREATE_INSPECTION_TYPE: (data) => api.post("/admin/inspection-types", data),
    UPDATE_INSPECTION_TYPE: (id, data) => api.put(`/admin/inspection-types/${id}`, data),
    DELETE_INSPECTION_TYPE: (id) => api.delete(`/admin/inspection-types/${id}`),


    // Mobile User Management
    GET_MOBILE_USERS: () => api.get("/admin/mobile-users"),
    REGISTER_MOBILE_USER: (data) => api.post("/admin/mobile-users", data),
    UPDATE_MOBILE_STATUS: (id, status) => api.patch(`/admin/mobile-users/${id}/status?status=${status}`),
    DELETE_MOBILE_USER: (id) => api.delete(`/admin/mobile-users/${id}`),
};

export default adminApi;