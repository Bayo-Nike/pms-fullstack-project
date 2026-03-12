import api from "../api";

const reportsApi = {
    GET_PROJECTS: (params) => api.get("/projects", { params }),
};

export default reportsApi;