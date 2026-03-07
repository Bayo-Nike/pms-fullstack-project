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
    GET_CITY: () => api.get("/admin/cities"),
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
    // CREATE_CONTRACTOR: (data) => api.post("/admin/contractors", data),
    CREATE_CONTRACTOR: (data) =>
        api.post("/admin/contractors", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    // UPDATE_CONTRACTOR: (id, data) => api.put(`/admin/contractors/${id}`, data),
    UPDATE_CONTRACTOR: (id, data) => 
        api.put(`/admin/contractors/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    DELETE_CONTRACTOR: (id) => api.delete(`/admin/contractors/${id}`),
};

export default adminApi;