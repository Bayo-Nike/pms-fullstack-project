// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     Search, Add, Assignment, Visibility, Edit, Delete,
//     HelpOutline, CalendarMonth, LocationOn, ChevronLeft, ChevronRight,
//     Payments, AccountCircle
// } from '@mui/icons-material';
// import projectApi from '../../api/modules/project';
// import AlertMessage from '../../components/Reusable/AlertMessage';
// import { useAuth } from '../../context/AuthContext';

// export default function Projects() {
//     const navigate = useNavigate();
//     const { can } = useAuth();
//     const [projects, setProjects] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [pageInfo, setPageInfo] = useState({ current: 0, total: 0, size: 5 });
//     const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
//     const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, title: '' });

//     useEffect(() => { fetchProjects(0); }, []);

//     const fetchProjects = async (page) => {
//         setLoading(true);
//         try {
//             const res = await projectApi.GET_PROJECTS({ page, size: pageInfo.size });
//             const pageData = res.data.data;
//             setProjects(pageData.content || []);
//             setPageInfo({ current: pageData.number, total: pageData.totalPages, size: pageData.size });
//         } catch (err) {
//             setAlert({ show: true, type: 'error', message: 'Failed to load projects.' });
//         } finally { setLoading(false); }
//     };

//     const executeDelete = async () => {
//         const { id, title } = deleteConfig;
//         setDeleteConfig({ show: false, id: null, title: '' });
//         try {
//             await projectApi.DELETE_PROJECT(id);
//             setAlert({ show: true, type: 'success', message: `Project ${title} removed.` });
//             fetchProjects(0);
//         } catch (err) {
//             setAlert({ show: true, type: 'error', message: 'Deletion failed. Project might be linked to active data.' });
//         }
//     };

//     const getStatusStyle = (s) => {
//         const styles = {
//             'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
//             'ON_GOING': 'bg-green-50 text-green-700 border-green-100',
//             'ON_HOLD': 'bg-amber-50 text-amber-700 border-amber-100',
//             'NOT_STARTED': 'bg-slate-50 text-slate-500 border-slate-200',
//             'COMPLETED': 'bg-sky-50 text-sky-700 border-sky-100',
//             'CANCELLED': 'bg-red-50 text-red-700 border-red-100'
//         };
//         return styles[s] || styles.NOT_STARTED;
//     };

//     return (
//         <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
//             {deleteConfig.show && (
//                 <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-slate-100">
//                         <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 48 }} />
//                         <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Delete</h3>
//                         <p className="text-sm text-slate-500 mt-2">Are you sure you want to remove <b>{deleteConfig.title}</b>?</p>
//                         <div className="flex gap-3 mt-8">
//                             <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
//                             <button onClick={executeDelete} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">Delete</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

//             <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
//                 <div>
//                     <h1 className="text-base font-bold text-slate-900 leading-none">Project Portfolio</h1>
//                     <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Active Site & Infrastructure Registry</p>
//                 </div>
//                 {can('CAN_CREATE_PROJECTS') && (
//                     <button onClick={() => navigate('/projects/create')} className="bg-[#0284C7] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest active:scale-95 shadow-lg shadow-sky-100">
//                         <Add style={{ fontSize: 18 }} /> Launch Project
//                     </button>
//                 )}
//             </div>

//             <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
//                 <div className="p-4 border-b border-slate-50 bg-slate-50/20 flex items-center gap-4">
//                     <div className="relative max-w-sm w-full">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
//                         <input type="text" placeholder="Search projects..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0284C7] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse">
//                         <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
//                             <tr>
//                                 <th className="px-6 py-4">Identification</th>
//                                 <th className="px-6 py-4">Type</th>
//                                 <th className="px-6 py-4">Timeline</th>
//                                 <th className="px-6 py-4">Budget Utilization</th>
//                                 <th className="px-6 py-4 text-center">Status</th>
//                                 <th className="px-6 py-4 text-right">Operations</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-50">
//                             {loading ? (
//                                 <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-xs italic animate-pulse">Synchronizing PMS Core...</td></tr>
//                             ) : projects.map((proj) => (
//                                 <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
//                                     <td className="px-6 py-4">
//                                         <div className="flex flex-col">
//                                             <div className="flex items-center gap-1.5">
//                                                 <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{proj.projectCode}</span>
//                                                 <span className="text-sm font-bold text-slate-800">{proj.title}</span>
//                                             </div>
//                                             <div className="flex items-center gap-2 mt-1">
//                                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{proj.projectType === 'WATER_AND_ROAD' ? 'Water & Road' : 'Building'}</span>
//                                                 <span className="text-[9px] text-slate-400 border-l pl-2 flex items-center gap-1 uppercase font-medium"><LocationOn style={{ fontSize: 12 }} /> {proj.subCityName}</span>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex flex-col gap-1">
//                                             <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><CalendarMonth style={{ fontSize: 14 }} className="text-slate-300" /> {proj.projectType}</span>
//                                             <span className="text-[10px] text-slate-400 uppercase font-medium">Target: {proj.projectType}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex flex-col gap-1">
//                                             <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><CalendarMonth style={{ fontSize: 14 }} className="text-slate-300" /> {new Date(proj.startDate).toLocaleDateString()}</span>
//                                             <span className="text-[10px] text-slate-400 uppercase font-medium">Target: {new Date(proj.endDate).toLocaleDateString()}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 min-w-[180px]">
//                                         <div className="space-y-1.5">
//                                             <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
//                                                 <span className="text-[#0284C7]">{proj.currencyType} {proj.budgetUsed.toLocaleString()}</span>
//                                                 <span className="text-slate-400">/ {proj.budget.toLocaleString()}</span>
//                                             </div>
//                                             <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
//                                                 <div className="h-full bg-[#FBAF1E] transition-all duration-1000" style={{ width: `${Math.min((proj.budgetUsed / proj.budget) * 100, 100)}%` }}></div>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 text-center">
//                                         <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${getStatusStyle(proj.status)}`}>
//                                             {proj.status.replace(/_/g, ' ')}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4 text-right">
//                                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                             <button onClick={() => navigate(`/projects/${proj.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition-all"><Visibility style={{ fontSize: 18 }} /></button>
//                                             {can('CAN_EDIT_PROJECTS') && (
//                                                 <button onClick={() => navigate(`/projects/edit/${proj.id}`)} className="p-1.5 text-slate-400 hover:text-[#FBAF1E] hover:bg-amber-50 rounded-lg transition-all"><Edit style={{ fontSize: 18 }} /></button>
//                                             )}
//                                             {can('CAN_DELETE_PROJECTS') && (
//                                                 <button onClick={() => setDeleteConfig({ show: true, id: proj.id, title: proj.title })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Delete style={{ fontSize: 18 }} /></button>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
//                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {pageInfo.current + 1} of {pageInfo.total}</span>
//                     <div className="flex gap-2">
//                         <button disabled={pageInfo.current === 0} onClick={() => fetchProjects(pageInfo.current - 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronLeft fontSize="small" /></button>
//                         <button disabled={pageInfo.current + 1 >= pageInfo.total} onClick={() => fetchProjects(pageInfo.current + 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronRight fontSize="small" /></button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }






import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Add, Assignment, Visibility, Edit, Delete,
    HelpOutline, CalendarMonth, LocationOn, ChevronLeft, ChevronRight,
    FilterList, Apartment, BusinessCenter, Close, Person
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Projects() {
    const navigate = useNavigate();
    const { can } = useAuth();

    // Data States
    const [projects, setProjects] = useState([]);
    const [subCities, setSubCities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [subCityFilter, setSubCityFilter] = useState('');
    const [pageInfo, setPageInfo] = useState({ current: 0, total: 0, size: 7, totalElements: 0 });

    // UI States
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, title: '' });

    // Load Sub-Cities for the filter
    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const res = await adminApi.GET_SUB_CITIES();
                setSubCities(res.data?.data || res.data || []);
            } catch (err) { console.error("Sub-city fetch failed", err); }
        };
        fetchLookups();
    }, []);

    const fetchProjects = useCallback(async (page = 0) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: pageInfo.size,
                search: searchTerm || null,
                status: statusFilter || null,
                projectType: typeFilter || null,
                subCityId: subCityFilter || null
            };

            const res = await projectApi.GET_PROJECTS(params);
            const pageData = res.data.data;

            setProjects(pageData.content || []);
            setPageInfo(prev => ({
                ...prev,
                current: pageData.number,
                total: pageData.totalPages,
                totalElements: pageData.totalElements
            }));
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to load projects registry.' });
        } finally {
            setLoading(false);
        }
    }, [pageInfo.size, searchTerm, statusFilter, typeFilter, subCityFilter]);

    useEffect(() => {
        fetchProjects(0);
    }, [statusFilter, typeFilter, subCityFilter, fetchProjects]);

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') fetchProjects(0);
    };

    const executeDelete = async () => {
        const { id, title } = deleteConfig;
        setDeleteConfig({ show: false, id: null, title: '' });
        try {
            await projectApi.DELETE_PROJECT(id);
            setAlert({ show: true, type: 'success', message: `Project ${title} removed.` });
            fetchProjects(pageInfo.current);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Delete operation failed.' });
        }
    };

    const getStatusStyle = (s) => {
        const styles = {
            'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
            'PLANNING': 'bg-sky-50 text-sky-700 border-sky-100',
            'ON_HOLD': 'bg-amber-50 text-amber-700 border-amber-100',
            'NOT_STARTED': 'bg-slate-50 text-slate-500 border-slate-200',
            'COMPLETED': 'bg-indigo-50 text-indigo-700 border-indigo-100',
            'CANCELLED': 'bg-red-50 text-red-700 border-red-100'
        };
        return styles[s] || styles.NOT_STARTED;
    };

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            {/* Delete Confirmation */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 48 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2">Permanently remove <b>{deleteConfig.title}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase shadow-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-2xl flex items-center justify-center shadow-inner"><Assignment /></div>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">Projects Portfolio</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">SCCO Infrastructure Hub</p>
                    </div>
                </div>
                {can('CAN_CREATE_PROJECTS') && (
                    <button onClick={() => navigate('/projects/create')} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <Add /> New Project
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input
                        type="text"
                        placeholder="Title/Code... (Enter)"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-[#0284C7]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchSubmit}
                    />
                    {searchTerm && <Close onClick={() => { setSearchTerm(''); fetchProjects(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-red-400" style={{ fontSize: 16 }} />}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Identification</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Sub-City</th>
                                <th className="px-6 py-4">Timeline</th>
                                <th className="px-6 py-4">Budget Utilization</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-xs italic animate-pulse">Synchronizing PMS Core...</td></tr>
                            ) : projects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{proj.projectCode}</span>
                                                <span className="text-sm font-bold text-slate-800">{proj.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{proj.projectType === 'WATER_AND_ROAD' ? 'Water & Road' : 'Building'}</span>
                                                <span className="text-[9px] text-slate-400 border-l pl-2 flex items-center gap-1 uppercase font-medium"><LocationOn style={{ fontSize: 12 }} /> {proj.subCityName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><CalendarMonth style={{ fontSize: 14 }} className="text-slate-300" /> {proj.projectType}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-medium">Target: {proj.projectType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><CalendarMonth style={{ fontSize: 14 }} className="text-slate-300" /> {proj.subCityName}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-medium">Location: {proj.subCityName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><CalendarMonth style={{ fontSize: 14 }} className="text-slate-300" /> {new Date(proj.startDate).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-medium">Completion Date: {new Date(proj.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[180px]">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                                                <span className="text-[#0284C7]">{proj.currencyType} {proj.budgetUsed.toLocaleString()}</span>
                                                <span className="text-slate-400">/ {proj.budget.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#FBAF1E] transition-all duration-1000" style={{ width: `${Math.min((proj.budgetUsed / proj.budget) * 100, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${getStatusStyle(proj.status)}`}>
                                            {proj.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => navigate(`/projects/${proj.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition-all"><Visibility style={{ fontSize: 18 }} /></button>
                                            {can('CAN_EDIT_PROJECTS') && (
                                                <button onClick={() => navigate(`/projects/edit/${proj.id}`)} className="p-1.5 text-slate-400 hover:text-[#FBAF1E] hover:bg-amber-50 rounded-lg transition-all"><Edit style={{ fontSize: 18 }} /></button>
                                            )}
                                            {can('CAN_DELETE_PROJECTS') && (
                                                <button onClick={() => setDeleteConfig({ show: true, id: proj.id, title: proj.title })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Delete style={{ fontSize: 18 }} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center gap-2">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold uppercase text-slate-600 outline-none cursor-pointer">
                        <option value="">All Status</option>
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_GOING">On Going</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                    </select>

                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold uppercase text-slate-600 outline-none cursor-pointer">
                        <option value="">All Types</option>
                        <option value="BUILDING">Building</option>
                        <option value="WATER_AND_ROAD">Water & Road</option>
                    </select>

                    <select value={subCityFilter} onChange={(e) => setSubCityFilter(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold uppercase text-slate-600 outline-none cursor-pointer">
                        <option value="">All Sub-Cities</option>
                        {subCities.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                </div>

                <div className="ml-auto px-4 py-2 bg-sky-50 rounded-xl border border-sky-100 text-[10px] font-black text-[#0284C7] uppercase tracking-widest">
                    Total: {pageInfo.totalElements}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Project Identification</th>
                            <th className="px-6 py-5">Structure Type</th>
                            <th className="px-6 py-5">Timeline</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <th className="px-8 py-5 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic animate-pulse">Syncing PMS Registry...</td></tr>
                        ) : projects.length === 0 ? (
                            <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 text-xs italic">No projects match your filter.</td></tr>
                        ) : projects.map((proj) => (
                            <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                                {/* Column 1: Identification */}
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 uppercase">{proj.projectCode}</span>
                                            <span className="text-sm font-bold text-slate-800">{proj.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                            <Person style={{ fontSize: 12 }} />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">{proj.projectManagerName || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Column 2: Structure Type */}
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                                        {proj.projectType?.replace(/_/g, ' ')}
                                    </span>
                                </td>

                                {/* Column 3: Timeline */}
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-slate-700">{new Date(proj.startDate).toLocaleDateString()}</span>
                                        <span className="text-[10px] text-slate-400 uppercase font-medium tracking-tighter">Ends: {new Date(proj.endDate).toLocaleDateString()}</span>
                                    </div>
                                </td>

                                {/* Column 4: Status */}
                                <td className="px-6 py-5 text-center">
                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-tighter ${getStatusStyle(proj.status)}`}>
                                        {proj.status?.replace(/_/g, ' ')}
                                    </span>
                                </td>

                                {/* Column 5: Operations */}
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => navigate(`/projects/${proj.id}`)} className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-all" title="View Details"><Visibility style={{ fontSize: 20 }} /></button>
                                        {can('CAN_EDIT_PROJECTS') && (
                                            <button onClick={() => navigate(`/projects/edit/${proj.id}`)} className="p-2 text-slate-400 hover:text-[#FBAF1E] hover:bg-amber-50 rounded-xl transition-all" title="Edit Entry"><Edit style={{ fontSize: 20 }} /></button>
                                        )}
                                        {can('CAN_DELETE_PROJECTS') && (
                                            <button onClick={() => setDeleteConfig({ show: true, id: proj.id, title: proj.title })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Delete style={{ fontSize: 20 }} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Pagination */}
                <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Page {pageInfo.current + 1} of {pageInfo.total || 1}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={pageInfo.current === 0 || loading}
                            onClick={() => fetchProjects(pageInfo.current - 1)}
                            className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all shadow-sm"
                        >
                            <ChevronLeft fontSize="small" />
                        </button>
                        <button
                            disabled={(pageInfo.current + 1) >= pageInfo.total || loading}
                            onClick={() => fetchProjects(pageInfo.current + 1)}
                            className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all shadow-sm"
                        >
                            <ChevronRight fontSize="small" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}