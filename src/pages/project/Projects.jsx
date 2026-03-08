import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Add, Visibility, Edit, Delete,
    HelpOutline, CalendarMonth, ChevronLeft, ChevronRight
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Projects() {
    const navigate = useNavigate();
    const { can } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageInfo, setPageInfo] = useState({ current: 0, total: 0, size: 5 });
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, title: null });

    useEffect(() => {
        fetchProjects(0);
    }, []);

    const fetchProjects = async (page) => {
        setLoading(true);
        try {
            const res = await projectApi.GET_PROJECTS({ page, size: pageInfo.size });

            // Extract data from ApiResponse wrapper
            const apiResponse = res.data;
            const pageData = apiResponse.data; // This is the Page object

            console.log("Projects data:", pageData); // For debugging

            setProjects(pageData.content || []);
            setPageInfo({
                current: pageData.number || 0,
                total: pageData.totalPages || 0,
                size: pageData.size || pageInfo.size
            });
        } catch (err) {
            console.error("Error fetching projects:", err);
            setAlert({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Failed to load projects.'
            });
        } finally {
            setLoading(false);
        }
    };

    const executeDelete = async () => {
        const { id, title } = deleteConfig;
        setDeleteConfig({ show: false, id: null, title: null });
        try {
            await projectApi.DELETE_PROJECT(id);
            setAlert({
                show: true,
                type: 'success',
                message: `Project "${title}" removed successfully.`
            });
            fetchProjects(0);
        } catch (err) {
            setAlert({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Deletion failed.'
            });
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
            'ON_HOLD': 'bg-amber-50 text-amber-700 border-amber-100',
            'COMPLETED': 'bg-blue-50 text-blue-700 border-blue-100',
            'CANCELLED': 'bg-red-50 text-red-700 border-red-100',
            'NOT_STARTED': 'bg-slate-50 text-slate-600 border-slate-100'
        };
        return styles[status] || 'bg-slate-50 text-slate-600 border-slate-100';
    };

    const formatCurrency = (amount, currency = 'ETB') => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getProjectTypeDisplay = (type) => {
        return type === 'WATER_AND_ROAD' ? 'Water & Road' : 'Building';
    };

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            {/* Delete Confirmation Modal */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-4" style={{ fontSize: 48 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase">Confirm Delete</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Permanently remove <b>{deleteConfig.title}</b>?
                        </p>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setDeleteConfig({ show: false, id: null, title: null })}
                                className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage
                show={alert.show}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, show: false })}
            />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900">Project Portfolio</h1>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
                        Enterprise Registry
                    </p>
                </div>
                {can('CAN_CREATE_PROJECTS') && (
                    <button
                        onClick={() => navigate('/projects/create')}
                        className="bg-[#0284C7] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest active:scale-95 hover:bg-[#026ba3] transition-all"
                    >
                        <Add style={{ fontSize: 18 }} /> New Project
                    </button>
                )}
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Identification</th>
                            <th className="px-6 py-4">Timeline</th>
                            <th className="px-6 py-4">Budget Utilization</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-slate-400 text-xs italic">Loading projects...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : projects.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-xs italic">
                                    No projects found
                                </td>
                            </tr>
                        ) : (
                            projects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded uppercase border border-sky-100">
                                                    {proj.projectCode || `PRJ-${proj.id}`}
                                                </span>
                                                <span className="text-sm font-bold text-slate-800">
                                                    {proj.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                    {getProjectTypeDisplay(proj.projectType)}
                                                </span>
                                                <span className="text-[10px] text-slate-400 border-l pl-2 uppercase font-medium">
                                                    {proj.subCityName || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                                <CalendarMonth style={{ fontSize: 14 }} className="text-slate-300" />
                                                {formatDate(proj.startDate)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                                Target: {formatDate(proj.endDate)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[200px]">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                                                <span className="text-[#0284C7]">
                                                    {proj.currencyType || 'ETB'} {formatCurrency(proj.budgetUsed)}
                                                </span>
                                                <span className="text-slate-400">
                                                    Total: {formatCurrency(proj.budget)}
                                                </span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#FBAF1E] transition-all duration-1000"
                                                    style={{
                                                        width: proj.budget ? `${Math.min((proj.budgetUsed / proj.budget) * 100, 100)}%` : '0%'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${getStatusStyle(proj.status)}`}>
                                            {proj.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => navigate(`/projects/${proj.id}`)}
                                                className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Visibility style={{ fontSize: 18 }} />
                                            </button>
                                            {can('CAN_EDIT_PROJECTS') && (
                                                <button
                                                    onClick={() => navigate(`/projects/edit/${proj.id}`)}
                                                    className="p-1.5 text-slate-400 hover:text-[#FBAF1E] hover:bg-amber-50 rounded-lg transition-all"
                                                    title="Edit Project"
                                                >
                                                    <Edit style={{ fontSize: 18 }} />
                                                </button>
                                            )}
                                            {can('CAN_DELETE_PROJECTS') && (
                                                <button
                                                    onClick={() => setDeleteConfig({
                                                        show: true,
                                                        id: proj.id,
                                                        title: proj.title
                                                    })}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Project"
                                                >
                                                    <Delete style={{ fontSize: 18 }} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && projects.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Page {pageInfo.current + 1} of {pageInfo.total}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={pageInfo.current === 0}
                                onClick={() => fetchProjects(pageInfo.current - 1)}
                                className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <ChevronLeft fontSize="small" />
                            </button>
                            <button
                                disabled={pageInfo.current + 1 >= pageInfo.total}
                                onClick={() => fetchProjects(pageInfo.current + 1)}
                                className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <ChevronRight fontSize="small" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}