import api from "../api";

const dashboardApi = {
    getSummary: () => api.get('/dashboard/summary'),

    // You can add more specific calls here later
    getProjectDetails: (id) => api.get(`/dashboard/project/${id}`),

    getMyReportees: () => api.get('/jurisdiction/reportees'),
}
export default dashboardApi;