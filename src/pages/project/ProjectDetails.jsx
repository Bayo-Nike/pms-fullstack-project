// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//     ArrowBack, Payments, CalendarMonth, LocationOn, Work, Badge,
//     TrendingUp, Engineering, Info, Add, Edit, Delete,
//     Assignment, Close, HelpOutline, Scale, Search, Explore, Schedule
// } from '@mui/icons-material';
// import projectApi from '../../api/modules/project';
// import taskApi from '../../api/modules/task';
// import AlertMessage from '../../components/Reusable/AlertMessage';
// import { useAuth } from '../../context/AuthContext';

// export default function ProjectDetails() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { can } = useAuth();
//     const dropdownRef = useRef(null);

//     const [project, setProject] = useState(null);
//     const [tasks, setTasks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
//     const [editingTask, setEditingTask] = useState(null);
//     const [teamSearch, setTeamSearch] = useState('');
//     const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

//     // 1. UPDATED INITIAL STATE: Matches TaskStatus.NOT_STARTED
//     const [taskFormData, setTaskFormData] = useState({
//         taskName: '', startDate: '', endDate: '', description: '',
//         status: 'TO_DO', priority: 'LOW', weight: 0,
//         latitude: '', longitude: '', locationIds: [], employeeIds: []
//     });

//     const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

//     useEffect(() => {
//         const loadPageData = async () => {
//             if (!id || id === 'create') return;
//             try {
//                 const [pRes, tRes] = await Promise.all([
//                     projectApi.GET_PROJECT(id),
//                     taskApi.GET_TASKS_BY_PROJECT(id)
//                 ]);
//                 setProject(pRes.data.data);
//                 setTasks(tRes.data.data || []);
//             } catch (err) { setAlert({ show: true, type: 'error', message: 'Sync error.' }); } finally { setLoading(false); }
//         };
//         loadPageData();
//     }, [id]);

//     const projectStaff = useMemo(() => {
//         if (!project) return [];
//         return project.employeeIds.map((eid, i) => ({ id: eid, fullName: project.employeeNames[i] }))
//             .filter(e => e.fullName.toLowerCase().includes(teamSearch.toLowerCase()));
//     }, [project, teamSearch]);

//     const projectSites = useMemo(() => {
//         if (!project) return [];
//         return (project.locationIds || []).map((lid, i) => ({ id: lid, name: project.locationNames?.[i] || `Site ${lid}` }));
//     }, [project]);

//     const handleTaskAction = async (e) => {
//         e.preventDefault();

//         // 2. PAYLOAD MAPPING: Ensures exact Enum strings and numeric types
//         const payload = {
//             taskName: taskFormData.taskName.trim(),
//             projectId: Number(id),
//             employeeIds: taskFormData.employeeIds.map(Number),
//             locationIds: taskFormData.locationIds.map(Number),
//             startDate: taskFormData.startDate || null,
//             endDate: taskFormData.endDate || null,
//             description: taskFormData.description || null,
//             status: taskFormData.status,      // matches TaskStatus enum
//             priority: taskFormData.priority,  // matches ProjectPriority enum
//             latitude: taskFormData.latitude !== '' ? parseFloat(taskFormData.latitude) : null,
//             longitude: taskFormData.longitude !== '' ? parseFloat(taskFormData.longitude) : null,
//             weight: taskFormData.weight !== '' ? parseFloat(taskFormData.weight) : 0.0
//         };

//         try {
//             if (editingTask) {
//                 await taskApi.UPDATE_TASK(editingTask.id, payload);
//             } else {
//                 await taskApi.CREATE_TASK(payload);
//             }
//             const tRes = await taskApi.GET_TASKS_BY_PROJECT(id);
//             setTasks(tRes.data.data || []);
//             setIsTaskModalOpen(false);
//             setAlert({ show: true, type: 'success', message: 'Task configuration synchronized.' });
//         } catch (err) {
//             setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Bad Request: Check enum/numeric constraints.' });
//         }
//     };

//     const deleteTask = async (taskId) => {
//         if (!window.confirm("Remove this task component?")) return;
//         try {
//             await taskApi.DELETE_TASK(taskId);
//             setTasks(tasks.filter(t => t.id !== taskId));
//         } catch (err) { setAlert({ show: true, type: 'error', message: 'Delete failed.' }); }
//     };

//     const getTaskStatusStyle = (s) => {
//         const styles = {
//             'TO_DO': 'bg-slate-50 text-slate-500 border-slate-200',
//             'IN_PROGRESS': 'bg-sky-50 text-sky-700 border-sky-100',
//             'IN_REVIEW': 'bg-sky-50 text-amber-700 border-amber-100',
//             'COMPLETED': 'bg-green-50 text-green-700 border-green-100'
//         };
//         return styles[s] || styles.NOT_STARTED;
//     };

//     if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse italic">Synchronizing Dossier...</div>;
//     if (!project) return <div className="p-20 text-center font-bold text-slate-300">NOT FOUND</div>;

//     return (
//         <div className="w-full space-y-6 pb-20 px-4 animate-fadeIn">
//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

//             {/* Header */}
//             <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => navigate('/projects')} className="p-2 bg-slate-50 border rounded-xl hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded uppercase border border-sky-100">{project.projectCode}</span>
//                             <h1 className="text-xl font-black text-slate-900">{project.title}</h1>
//                         </div>
//                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1"><LocationOn style={{ fontSize: 12 }} /> {project.cityName} &bull; {project.subCityName}</p>
//                     </div>
//                 </div>
//                 <div className="flex gap-4">
//                     <div className="text-right border-r pr-4 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Status</p><span className="text-xs font-black text-[#0284C7] uppercase">{project.status}</span></div>
//                     <div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Priority</p><span className="text-xs font-black text-amber-500 uppercase">{project.priority}</span></div>
//                 </div>
//             </div>

//             {/* Compact Top Panels */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//                 <div className="lg:col-span-8 space-y-4">
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
//                         <div className="flex items-center justify-between mb-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Payments fontSize="small" /> Financial Context</div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Contract Sum</p><p className="text-lg font-black text-slate-900">{project.currencyType} {project.budget?.toLocaleString()}</p></div>
//                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Expenditure</p><p className="text-lg font-black text-[#0284C7]">{project.currencyType} {project.budgetUsed?.toLocaleString()}</p></div>
//                         </div>
//                     </div>
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm h-fit"><div className="flex items-center gap-2 mb-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Info fontSize="small" /> Project Scope</div><p className="text-xs text-slate-500 italic line-clamp-3">{project.description || 'N/A'}</p></div>
//                 </div>
//                 <div className="lg:col-span-4 space-y-4">
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4 h-full">
//                         <div className="flex items-center gap-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Engineering fontSize="small" /> Assignments</div>
//                         <div className="space-y-2">
//                             <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Badge className="text-sky-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Manager</p><p className="text-xs font-bold text-slate-700">{project.projectManagerName}</p></div></div>
//                             <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Work className="text-amber-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Contractor</p><p className="text-xs font-bold text-slate-700">{project.contractorName}</p></div></div>
//                         </div>
//                         <div className="pt-2"><div className="flex items-center gap-2 mb-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><TrendingUp fontSize="small" /> Team</div>
//                             <div className="flex flex-wrap gap-1">{project.employeeNames?.map((n, i) => (<span key={i} className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 rounded uppercase border border-slate-200">{n}</span>))}</div></div>
//                     </div>
//                 </div>
//             </div>

//             {/* Row 3: Task Management */}
//             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
//                 <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
//                     <div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><Assignment /></div><div><h2 className="text-lg font-bold text-slate-900 leading-none">Task Registry</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lifecycle Tracking</p></div></div>
//                     {can('CAN_CREATE_TASK') && (
//                         <button onClick={() => { setEditingTask(null); setTaskFormData({ taskName: '', startDate: '', endDate: '', description: '', status: 'TO_DO', priority: 'LOW', weight: 0, latitude: '', longitude: '', locationIds: [], employeeIds: [] }); setIsTaskModalOpen(true); }} className="bg-[#0284C7] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"><Add style={{ fontSize: 18 }} /> New Task</button>
//                     )}
//                 </div>
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left"><thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><tr><th className="px-8 py-4">Task Component</th><th className="px-6 py-4 text-center">Weight</th><th className="px-6 py-4 text-center">Status</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
//                         <tbody className="divide-y divide-slate-50">{tasks.length === 0 ? (<tr><td colSpan="4" className="px-8 py-12 text-center text-slate-300 text-xs italic font-bold">No operational tasks defined.</td></tr>) : tasks.map((task) => (
//                             <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
//                                 <td className="px-8 py-4"><div className="flex flex-col"><span className="text-sm font-bold text-slate-700">{task.taskName}</span><div className="flex items-center gap-2 mt-1"><span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Schedule style={{ fontSize: 10 }} /> {task.startDate || 'TBD'} &rarr; {task.endDate || 'TBD'}</span></div></div></td>
//                                 <td className="px-6 py-4 text-center"><span className="text-xs font-black text-slate-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">{task.weight}%</span></td>
//                                 <td className="px-6 py-4 text-center"><span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${getTaskStatusStyle(task.status)}`}>{task.status.replace(/_/g, ' ')}</span></td>
//                                 <td className="px-8 py-4 text-right"><div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingTask(task); setTaskFormData({ ...task }); setIsTaskModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-[#0284C7] transition-all"><Edit style={{ fontSize: 18 }} /></button><button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-all"><Delete style={{ fontSize: 18 }} /></button></div></td>
//                             </tr>))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* --- TASK MODAL --- */}
//             {isTaskModalOpen && (
//                 <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-4xl overflow-hidden max-h-[95vh] flex flex-col">
//                         <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50"><h3 className="font-black text-slate-800 uppercase tracking-tight">{editingTask ? 'Edit Task' : 'Register Task'}</h3><button onClick={() => setIsTaskModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button></div>
//                         <form onSubmit={handleTaskAction} className="p-8 overflow-y-auto space-y-6 no-scrollbar">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                                 <div className="space-y-4">
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Title *</label><input value={taskFormData.taskName} onChange={e => setTaskFormData({ ...taskFormData, taskName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-[#0284C7] text-sm font-bold" required /></div>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weight (%)</label><input type="number" step="0.01" value={taskFormData.weight} onChange={e => setTaskFormData({ ...taskFormData, weight: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none" /></div>
//                                         {/* 3. UPDATED PRIORITY SELECT */}
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select value={taskFormData.priority} onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label><input type="date" value={taskFormData.startDate} onChange={e => setTaskFormData({ ...taskFormData, startDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-sm" /></div>
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date</label><input type="date" value={taskFormData.endDate} onChange={e => setTaskFormData({ ...taskFormData, endDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-sm" /></div>
//                                     </div>
//                                     {/* Geo-Location */}
//                                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
//                                         <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest"><Explore style={{ fontSize: 16 }} /> Geo-Location (Optional)</div>
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <input placeholder="Latitude" value={taskFormData.latitude} onChange={e => setTaskFormData({ ...taskFormData, latitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono" />
//                                             <input placeholder="Longitude" value={taskFormData.longitude} onChange={e => setTaskFormData({ ...taskFormData, longitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono" />
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="space-y-4">
//                                     {/* 4. UPDATED STATUS SELECT */}
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Lifecycle Status</label>
//                                         <select value={taskFormData.status} onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase">
//                                             <option value="TO_DO">To Do</option>
//                                             <option value="IN_PROGRESS">In Progress</option>
//                                             <option value="IN_REVIEW">In Review</option>
//                                             <option value="COMPLETED">Completed</option>
//                                         </select>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sites (Multi-Select)</label>
//                                         <select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.locationIds.includes(v)) setTaskFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); }} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="">-- Add Site --</option>{projectSites.filter(s => !taskFormData.locationIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
//                                         <div className="flex flex-wrap gap-1.5 mt-2">{taskFormData.locationIds.map(lid => { const s = projectSites.find(x => x.id === lid); return <div key={lid} className="flex items-center gap-2 bg-slate-800 text-white pl-2 pr-1 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter">{s?.name}<Close onClick={() => setTaskFormData(p => ({ ...p, locationIds: p.locationIds.filter(i => i !== lid) }))} style={{ fontSize: 12 }} className="cursor-pointer" /></div>; })}</div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Team (Multi-Select)</label>
//                                         <select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.employeeIds.includes(v)) setTaskFormData(p => ({ ...p, employeeIds: [...p.employeeIds, v] })); }} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="">-- Add Person --</option>{projectStaff.filter(s => !taskFormData.employeeIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select>
//                                         <div className="flex flex-wrap gap-1.5 mt-2">{taskFormData.employeeIds.map(eid => { const s = projectStaff.find(x => x.id === eid); return <div key={eid} className="flex items-center gap-2 bg-[#0284C7] text-white pl-2 pr-1 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter">{s?.fullName}<Close onClick={() => setTaskFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(i => i !== eid) }))} style={{ fontSize: 12 }} className="cursor-pointer" /></div>; })}</div>
//                                     </div>
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Scope Details</label><textarea rows="3" value={taskFormData.description} onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium resize-none"></textarea></div>
//                                 </div>
//                             </div>
//                             <button type="submit" className="w-full bg-[#0284C7] text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-sky-100 hover:bg-[#016da3] transition-all mt-4">Confirm Task Entry</button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowBack, Payments, CalendarMonth, LocationOn, Work, Badge,
    TrendingUp, Engineering, Info, Add, Edit, Delete,
    Assignment, Close, HelpOutline, Search, Explore, Schedule
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import taskApi from '../../api/modules/task';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [teamSearch, setTeamSearch] = useState('');

    // --- NEW: DELETE DIALOG STATE ---
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, taskName: '' });

    const [taskFormData, setTaskFormData] = useState({
        taskName: '', startDate: '', endDate: '', description: '',
        status: 'TO_DO', priority: 'LOW', weight: 0,
        latitude: '', longitude: '', locationIds: [], employeeIds: []
    });

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    useEffect(() => {
        const loadPageData = async () => {
            if (!id || id === 'create') return;
            try {
                const [pRes, tRes] = await Promise.all([
                    projectApi.GET_PROJECT(id),
                    taskApi.GET_TASKS_BY_PROJECT(id)
                ]);
                setProject(pRes.data.data);
                setTasks(tRes.data.data || []);
            } catch (err) { setAlert({ show: true, type: 'error', message: 'Sync error.' }); } finally { setLoading(false); }
        };
        loadPageData();
    }, [id]);

    const projectStaff = useMemo(() => {
        if (!project) return [];
        return project.employeeIds.map((eid, i) => ({ id: eid, fullName: project.employeeNames[i] }))
            .filter(e => e.fullName.toLowerCase().includes(teamSearch.toLowerCase()));
    }, [project, teamSearch]);

    const projectSites = useMemo(() => {
        if (!project) return [];
        return (project.locationIds || []).map((lid, i) => ({ id: lid, name: project.locationNames?.[i] || `Site ${lid}` }));
    }, [project]);

    const handleTaskAction = async (e) => {
        e.preventDefault();
        const payload = {
            taskName: taskFormData.taskName.trim(),
            projectId: Number(id),
            employeeIds: taskFormData.employeeIds.map(Number),
            locationIds: taskFormData.locationIds.map(Number),
            startDate: taskFormData.startDate || null,
            endDate: taskFormData.endDate || null,
            description: taskFormData.description || null,
            status: taskFormData.status,
            priority: taskFormData.priority,
            latitude: taskFormData.latitude !== '' ? parseFloat(taskFormData.latitude) : null,
            longitude: taskFormData.longitude !== '' ? parseFloat(taskFormData.longitude) : null,
            weight: taskFormData.weight !== '' ? parseFloat(taskFormData.weight) : 0.0
        };

        try {
            if (editingTask) await taskApi.UPDATE_TASK(editingTask.id, payload);
            else await taskApi.CREATE_TASK(payload);

            const tRes = await taskApi.GET_TASKS_BY_PROJECT(id);
            setTasks(tRes.data.data || []);
            setIsTaskModalOpen(false);
            setAlert({ show: true, type: 'success', message: 'Task configuration synchronized.' });
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Sync failed: Check inputs.' });
        }
    };

    // --- NEW: EXECUTE DELETE LOGIC ---
    const executeDeleteTask = async () => {
        const { id: taskId, taskName } = deleteConfig;
        setDeleteConfig({ show: false, id: null, taskName: '' });
        try {
            await taskApi.DELETE_TASK(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setAlert({ show: true, type: 'success', message: `Task "${taskName}" removed.` });
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Deletion rejected.' });
        }
    };

    const getTaskStatusStyle = (s) => {
        const styles = {
            'TO_DO': 'bg-slate-50 text-slate-500 border-slate-200',
            'IN_PROGRESS': 'bg-sky-50 text-sky-700 border-sky-100',
            'IN_REVIEW': 'bg-amber-50 text-amber-700 border-amber-100',
            'COMPLETED': 'bg-green-50 text-green-700 border-green-100'
        };
        return styles[s] || styles.TO_DO;
    };

    if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse italic">Synchronizing Dossier...</div>;
    if (!project) return <div className="p-20 text-center font-bold text-slate-300">NOT FOUND</div>;

    return (
        <div className="w-full space-y-6 pb-20 px-4 animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* --- CUSTOM DELETE DIALOG --- */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-black uppercase tracking-tight">Remove Task</h3>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed">Are you sure you want to remove <b>{deleteConfig.taskName}</b> from the project registry?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setDeleteConfig({ show: false, id: null, taskName: '' })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeDeleteTask} className="flex-1 px-4 py-3 bg-red-500 text-white font-bold text-[10px] uppercase shadow-lg shadow-red-100 active:scale-95 transition-all">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/projects')} className="p-2 bg-slate-50 border rounded-xl hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded uppercase border border-sky-100">{project.projectCode}</span>
                            <h1 className="text-xl font-black text-slate-900">{project.title}</h1>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1"><LocationOn style={{ fontSize: 12 }} /> {project.cityName} &bull; {project.subCityName}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right border-r pr-4 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Status</p><span className="text-xs font-black text-[#0284C7] uppercase">{project.status}</span></div>
                    <div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Priority</p><span className="text-xs font-black text-amber-500 uppercase">{project.priority}</span></div>
                </div>
            </div>

            {/* Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-4">
                    {can('CAN_SEE_PROJECT_FINANCE') ? (
                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Payments fontSize="small" /> Financial Context</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Contract Sum</p><p className="text-lg font-black text-slate-900">{project.currencyType} {project.budget?.toLocaleString()}</p></div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Expenditure</p><p className="text-lg font-black text-[#0284C7]">{project.currencyType} {project.budgetUsed?.toLocaleString()}</p></div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 p-6 rounded-[24px] border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            Finance Restricted
                        </div>
                    )}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm h-fit"><div className="flex items-center gap-2 mb-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Info fontSize="small" /> Project Scope</div><p className="text-xs text-slate-500 italic line-clamp-3">{project.description || 'N/A'}</p></div>
                </div>
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4 h-full">
                        <div className="flex items-center gap-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Engineering fontSize="small" /> Assignments</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Badge className="text-sky-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Manager</p><p className="text-xs font-bold text-slate-700">{project.projectManagerName}</p></div></div>
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Work className="text-amber-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Contractor</p><p className="text-xs font-bold text-slate-700">{project.contractorName}</p></div></div>
                        </div>
                        <div className="pt-2"><div className="flex items-center gap-2 mb-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><TrendingUp fontSize="small" /> Team</div>
                            <div className="flex flex-wrap gap-1">{project.employeeNames?.map((n, i) => (<span key={i} className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 rounded uppercase border border-slate-200">{n}</span>))}</div></div>
                    </div>
                </div>
            </div>

            {/* Task Registry */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><Assignment /></div><div><h2 className="text-lg font-bold text-slate-900 leading-none">Task Registry</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lifecycle Tracking</p></div></div>
                    {can('CAN_CREATE_TASK') && (
                        <button onClick={() => { setEditingTask(null); setTaskFormData({ taskName: '', startDate: '', endDate: '', description: '', status: 'TO_DO', priority: 'LOW', weight: 0, latitude: '', longitude: '', locationIds: [], employeeIds: [] }); setIsTaskModalOpen(true); }} className="bg-[#0284C7] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all"><Add style={{ fontSize: 18 }} /> New Task</button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><tr><th className="px-8 py-4">Task Component</th><th className="px-6 py-4 text-center">Weight</th><th className="px-6 py-4 text-center">Status</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {tasks.length === 0 ? (<tr><td colSpan="4" className="px-8 py-12 text-center text-slate-300 text-xs italic font-bold">No tasks defined.</td></tr>) : tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4"><div className="flex flex-col"><span className="text-sm font-bold text-slate-700">{task.taskName}</span><span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1"><Schedule style={{ fontSize: 10 }} /> {task.startDate || 'TBD'} &rarr; {task.endDate || 'TBD'}</span></div></td>
                                    <td className="px-6 py-4 text-center"><span className="text-xs font-black text-slate-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">{task.weight}%</span></td>
                                    <td className="px-6 py-4 text-center"><span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${getTaskStatusStyle(task.status)}`}>{task.status.replace(/_/g, ' ')}</span></td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {(can('CAN_EDIT_TASK') || can('CAN_UPDATE_TASK')) && (
                                                <button onClick={() => { setEditingTask(task); setTaskFormData({ ...task }); setIsTaskModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-[#0284C7]"><Edit style={{ fontSize: 18 }} /></button>
                                            )}
                                            {can('CAN_DELETE_TASK') && (
                                                <button onClick={() => setDeleteConfig({ show: true, id: task.id, taskName: task.taskName })} className="p-1.5 text-slate-400 hover:text-red-500"><Delete style={{ fontSize: 18 }} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Task Modal (unchanged except for save button permission) */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-4xl overflow-hidden max-h-[95vh] flex flex-col">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">{editingTask ? 'Edit Task' : 'Register Task'}</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button>
                        </div>
                        <form onSubmit={handleTaskAction} className="p-8 overflow-y-auto space-y-6 no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Title *</label><input value={taskFormData.taskName} onChange={e => setTaskFormData({ ...taskFormData, taskName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-[#0284C7] text-sm font-bold" required /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weight (%)</label><input type="number" step="0.01" value={taskFormData.weight} onChange={e => setTaskFormData({ ...taskFormData, weight: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none" /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select value={taskFormData.priority} onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label><input type="date" value={taskFormData.startDate} onChange={e => setTaskFormData({ ...taskFormData, startDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-sm" /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date</label><input type="date" value={taskFormData.endDate} onChange={e => setTaskFormData({ ...taskFormData, endDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-sm" /></div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest"><Explore style={{ fontSize: 16 }} /> Geo-Location (Optional)</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input placeholder="Lat" value={taskFormData.latitude} onChange={e => setTaskFormData({ ...taskFormData, latitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono" />
                                            <input placeholder="Lng" value={taskFormData.longitude} onChange={e => setTaskFormData({ ...taskFormData, longitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Lifecycle Status</label><select value={taskFormData.status} onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="TO_DO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="IN_REVIEW">In Review</option><option value="COMPLETED">Completed</option></select></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sites</label><select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.locationIds.includes(v)) setTaskFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); }} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="">-- Add Site --</option>{projectSites.filter(s => !taskFormData.locationIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Team Members</label><select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.employeeIds.includes(v)) setTaskFormData(p => ({ ...p, employeeIds: [...p.employeeIds, v] })); }} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="">-- Add Person --</option>{projectStaff.filter(s => !taskFormData.employeeIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Scope Details</label><textarea rows="3" value={taskFormData.description} onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium resize-none"></textarea></div>
                                </div>
                            </div>
                            {((!editingTask && can('CAN_CREATE_TASK')) || (editingTask && can('CAN_UPDATE_TASK'))) && (
                                <button type="submit" className="w-full bg-[#0284C7] text-white py-4 rounded-2xl font-bold uppercase text-[10px] shadow-xl hover:bg-[#016da3] transition-all mt-4">Confirm Task Entry</button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;