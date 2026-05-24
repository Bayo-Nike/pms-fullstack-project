import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowBack, Payments, CalendarMonth, LocationOn, Work, Badge,
    TrendingUp, Engineering, Info, Add, Edit, Delete,
    Assignment, Close, HelpOutline, Search, Explore, Schedule,
    Visibility, AccessTime, Diversity3, DateRange, Payment,
    Description, UploadFile, CloudDone
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import taskApi from '../../api/modules/task';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';
import ProgressPie from '../../utility/ProgressPie';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can } = useAuth();

    // --- Data States ---
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    // --- Registry States ---
    const [taskTypeRegistry, setTaskTypeRegistry] = useState([]);
    const [filteredTaskTypes, setFilteredTaskTypes] = useState([]);

    // --- UI States ---
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [teamSearch, setTeamSearch] = useState('');
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, taskName: '' });

    // --- File States ---
    const [supportDocument, setSupportDocument] = useState(null);
    const [existingFile, setExistingFile] = useState('');

    // --- Form State ---
    const [taskFormData, setTaskFormData] = useState({
        taskTypeId: '',
        projectId: null,
        employeeIds: [],
        locationIds: [],
        startDate: '',
        endDate: '',
        description: '',
        status: 'TO_DO',
        priority: 'MEDIUM',
        weight: 0,
        latitude: '',
        longitude: '',
        taskCost: ''
    });

    useEffect(() => {
        const loadPageData = async () => {
            if (!id || id === 'create') return;
            try {
                const [pRes, tRes, regRes] = await Promise.all([
                    projectApi.GET_PROJECT(id),
                    taskApi.GET_TASKS_BY_PROJECT(id),
                    adminApi.GET_TASK_TYPES()
                ]);
                const rawProject = pRes.data.data;

                // Preservation: Timeline Extension Summation
                const extensions = rawProject.extensions || [];
                const totalDays = extensions.reduce((sum, ext) => sum + (Number(ext.extendedDays) || 0), 0);

                // Preservation: Adjusted Final Date Calculation
                let finalDate = rawProject.endDate;
                if (totalDays > 0 && rawProject.endDate) {
                    const dateObj = new Date(rawProject.endDate);
                    dateObj.setDate(dateObj.getDate() + totalDays);
                    finalDate = dateObj.toISOString().split('T')[0];
                }

                setProject({
                    ...rawProject,
                    totalExtendedDays: totalDays,
                    finalEndDate: finalDate
                });
                setTasks(tRes.data.data || []);
                setExistingFile(tRes.data?.data.supportDocument || '');
                setTaskTypeRegistry(regRes.data?.data || []);
            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Sync error.' });
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, [id]);

    // Preservation: Logic for 'OTHERS' task types only
    useEffect(() => {
        if (isTaskModalOpen && project && taskTypeRegistry.length > 0) {
            const filtered = taskTypeRegistry.filter(
                t => t.projectType === project.projectType && t.taskTypeProjectPhase === 'EXECUTION'
            );
            setFilteredTaskTypes(filtered);
        }
    }, [isTaskModalOpen, project, taskTypeRegistry]);

    const projectStaff = useMemo(() => {
        if (!project) return [];
        const ids = project.employeeIds || [];
        const names = project.employeeNames || [];
        return ids.map((eid, i) => ({ id: eid, fullName: names[i] || "Unknown Staff" }))
            .filter(e => e.fullName.toLowerCase().includes(teamSearch.toLowerCase()));
    }, [project, teamSearch]);

    const projectSites = useMemo(() => {
        if (!project) return [];
        return (project.locationIds || []).map((lid, i) => ({ id: lid, name: project.locationNames?.[i] || `Site ${lid}` }));
    }, [project]);

    const handleTaskAction = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            const dto = {
                taskTypeId: Number(taskFormData.taskTypeId),
                projectId: Number(id),
                employeeIds: taskFormData.employeeIds,
                locationIds: taskFormData.locationIds,
                startDate: taskFormData.startDate || null,
                endDate: taskFormData.endDate || null,
                description: taskFormData.description || "",
                status: taskFormData.status,
                priority: taskFormData.priority,
                weight: parseFloat(taskFormData.weight) || 0.0,
                latitude: taskFormData.latitude ? parseFloat(taskFormData.latitude) : null,
                longitude: taskFormData.longitude ? parseFloat(taskFormData.longitude) : null,
                taskCost: taskFormData.taskCost ? parseFloat(taskFormData.taskCost) : 0.0
            };

            formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
            if (supportDocument instanceof File) formData.append("supportDocument", supportDocument);

            if (editingTask?.id) await taskApi.UPDATE_TASK(editingTask.id, formData);
            else await taskApi.CREATE_TASK(formData);

            const tRes = await taskApi.GET_TASKS_BY_PROJECT(id);
            setTasks(tRes.data.data || []);
            setIsTaskModalOpen(false);
            setAlert({ show: true, type: "success", message: "Task registry updated." });
        } catch (err) {
            setAlert({ show: true, type: "error", message: err?.response?.data?.message || "Sync failed" });
        }
    };

    const executeDeleteTask = async () => {
        const { id: taskId, taskName } = deleteConfig;
        setDeleteConfig({ show: false, id: null, taskName: '' });
        try {
            await taskApi.DELETE_TASK(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setAlert({ show: true, type: 'success', message: `Task "${taskName}" removed.` });
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Deletion failed.' }); }
    };

    const getTaskStatusStyle = (s) => {
        const styles = { 'TO_DO': 'bg-slate-50 text-slate-500 border-slate-200', 'IN_PROGRESS': 'bg-sky-50 text-sky-700 border-sky-100', 'IN_REVIEW': 'bg-amber-50 text-amber-700 border-amber-100', 'COMPLETED': 'bg-green-50 text-green-700 border-green-100' };
        return styles[s] || styles.TO_DO;
    };

    if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-400">Synchronizing Dossier...</div>;
    if (!project) return <div className="p-20 text-center font-bold text-slate-300">NOT FOUND</div>;

    return (
        <div className="w-full space-y-6 pb-20 px-4 animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Delete Modal */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] p-10 max-w-sm w-full mx-4 text-center border shadow-2xl">
                        <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-black uppercase tracking-tight">Remove Task</h3>
                        <p className="text-sm text-slate-500 mt-2">Remove <b>{deleteConfig.taskName}</b> from Implementation Registry?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setDeleteConfig({ show: false, id: null, taskName: '' })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDeleteTask} className="flex-1 px-4 py-3 bg-red-500 text-white font-bold text-[10px] uppercase shadow-lg active:scale-95 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header: Preservation of Deadline and Extension calculation */}
            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/projects')} className="p-2 bg-slate-50 border rounded-xl hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 uppercase">{project.projectCode}</span>
                            <h1 className="text-xl font-black text-slate-900">{project.title}</h1>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1"><LocationOn style={{ fontSize: 12 }} /> {project.cityName} &bull; {project.subCityName}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right border-r pr-6 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Status</p><span className="text-xs font-black text-[#0284C7] uppercase">{project.status}</span></div>
                    <div className="text-right border-l pl-6 border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1"><AccessTime fontSize="small" /> Project Deadline</p>
                        <div className="flex flex-col items-end">
                            <span className={`text-sm font-black ${project.totalExtendedDays > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{new Date(project.finalEndDate).toLocaleDateString()}</span>
                            <div className="flex items-center gap-2 mt-1">
                                {project.totalExtendedDays > 0 && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">+{project.totalExtendedDays} Days Extension</span>}
                                {(() => {
                                    const today = new Date(); today.setHours(0, 0, 0, 0);
                                    const end = new Date(project.finalEndDate); end.setHours(0, 0, 0, 0);
                                    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
                                    if (diff > 0) return <span className="text-[9px] text-green-600 font-bold uppercase">{diff} Days Left</span>;
                                    if (diff === 0) return <span className="text-[9px] text-amber-500 font-bold uppercase">Due Today</span>;
                                    return <span className="text-[9px] text-red-500 font-bold uppercase">{Math.abs(diff)} days Overdue</span>;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panels: Financial Context & Progress Pie Preservation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Payment fontSize="small" /> Financial Context</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Contract Sum</p><p className="text-lg font-black text-slate-900">{project.currencyType} {project.budget?.toLocaleString()}</p></div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Expenditure</p><p className="text-lg font-black text-[#0284C7]">{project.currencyType} {project.budgetUsed?.toLocaleString()}</p></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm"><div className="flex items-center gap-2 mb-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Info fontSize="small" /> Project Description</div><p className="text-xs text-slate-500 italic line-clamp-3">{project.description || 'N/A'}</p></div>
                </div>
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4 h-full text-center">
                        <div className="flex items-center justify-center gap-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><TrendingUp fontSize="small" /> Implementation Progress</div>
                        <ProgressPie progress={project.projectProgress || 0} />
                        <div className="pt-4 border-t border-slate-50 space-y-2">
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-left"><Badge className="text-sky-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Manager</p><p className="text-xs font-bold text-slate-700">{project.projectManagerName}</p></div></div>
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-left"><Work className="text-amber-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Contractor</p><p className="text-xs font-bold text-slate-700">{project.contractorName}</p></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registry Table: Preservation of Initiation-Phase Read-only Gate */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><Assignment /></div><div><h2 className="text-lg font-bold text-slate-900 leading-none">Task Registry</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lifecycle Tracking</p></div></div>
                    {can('CAN_CREATE_TASK') && (
                        <button onClick={() => { setEditingTask(null); setTaskFormData({ taskTypeId: '', taskCost: '', startDate: '', endDate: '', description: '', status: 'TO_DO', priority: 'MEDIUM', weight: 0, latitude: '', longitude: '', locationIds: [], employeeIds: [] }); setSupportDocument(null); setIsTaskModalOpen(true); }} className="bg-[#0284C7] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase shadow-lg active:scale-95 transition-all"><Add style={{ fontSize: 18 }} /> New Task</button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <tr><th className="px-8 py-4">Task Component</th><th className="px-6 py-4 text-center">Weight</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4">Artifact</th><th className="px-8 py-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tasks.map((task) => {
                                const isInitiatedTask = task.taskTypeProjectPhase === 'INITIATION';
                                return (
                                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-700">{task.taskName}</span>
                                                    {isInitiatedTask && <span className="text-[7px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border uppercase">Initiation</span>}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1"><Schedule style={{ fontSize: 10 }} /> {task.startDate} &rarr; {task.endDate}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center"><span className="text-xs font-black text-slate-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">{task.weight}%</span></td>
                                        <td className="px-6 py-4 text-center"><span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${getTaskStatusStyle(task.status)}`}>{task.status.replace(/_/g, ' ')}</span></td>
                                        <td className="px-6 py-4">
                                            {task.supportDocument ? (
                                                <a href={`http://localhost:8080/api/tasks/download/${task.supportDocument}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#0284C7] hover:text-[#016da3]"><CloudDone style={{ fontSize: 16 }} /> <span className="text-[10px] font-bold border-b border-sky-200 uppercase tracking-tighter">View</span></a>
                                            ) : <span className="text-[10px] text-slate-300 font-bold uppercase">No Artifact</span>}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setViewingTask(task)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-all"><Visibility style={{ fontSize: 18 }} /></button>
                                                {!isInitiatedTask && (can('CAN_EDIT_TASK')) && (
                                                    <button onClick={() => { setEditingTask(task); setTaskFormData({ ...task, taskTypeId: task.taskTypeId || '', employeeIds: task.employeeIds || [], locationIds: task.locationIds || [] }); setSupportDocument(null); setExistingFile(task.supportDocument || ''); setIsTaskModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-[#0284C7] transition-all"><Edit style={{ fontSize: 18 }} /></button>
                                                )}
                                                {!isInitiatedTask && can('CAN_DELETE_TASK') && (
                                                    <button onClick={() => setDeleteConfig({ show: true, id: task.id, taskName: task.taskName })} className="p-1.5 text-slate-400 hover:text-red-500 transition-all"><Delete style={{ fontSize: 18 }} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Task Editor Modal: DROPDOWN FOR TASK TYPE */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl border w-full max-w-5xl overflow-hidden max-h-[95vh] flex flex-col">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">{editingTask ? 'Modify Execution Task' : 'Register New Task'}</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400 transition-all"><Close /></button>
                        </div>
                        <form onSubmit={handleTaskAction} className="p-8 overflow-y-auto space-y-6 no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Title *</label>
                                        <select
                                            required
                                            value={taskFormData.taskTypeId}
                                            onChange={e => setTaskFormData({ ...taskFormData, taskTypeId: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-[#0284C7] appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Select Standard Blueprint --</option>
                                            {filteredTaskTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Cost({project.currencyType})</label><input type="number" step="0.01" value={taskFormData.taskCost} onChange={e => setTaskFormData({ ...taskFormData, taskCost: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weight (%)</label><input type="number" step="0.01" value={taskFormData.weight} onChange={e => setTaskFormData({ ...taskFormData, weight: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold" /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select value={taskFormData.priority} onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label><input type="date" value={taskFormData.startDate} onChange={e => setTaskFormData({ ...taskFormData, startDate: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 font-bold text-sm" required /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date</label><input type="date" value={taskFormData.endDate} onChange={e => setTaskFormData({ ...taskFormData, endDate: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 font-bold text-sm" required /></div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase"><Explore style={{ fontSize: 16 }} /> Coordinates (Preserved)</div>
                                        <div className="grid grid-cols-2 gap-3"><input placeholder="LAT" value={taskFormData.latitude ?? ""} onChange={e => setTaskFormData({ ...taskFormData, latitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono outline-none" /><input placeholder="LNG" value={taskFormData.longitude ?? ""} onChange={e => setTaskFormData({ ...taskFormData, longitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono outline-none" /></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Status</label><select value={taskFormData.status} onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="TO_DO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="IN_REVIEW">In Review</option><option value="COMPLETED">Completed</option></select></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Site(s)</label><select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.locationIds.includes(v)) setTaskFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase outline-none"><option value="">-- Select Site --</option>{projectSites.filter(s => !taskFormData.locationIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><div className="flex flex-wrap gap-1 mt-2">{taskFormData.locationIds.map(id => (<span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-lg text-[9px] font-bold text-slate-600">{(projectSites.find(s => s.id === id))?.name} <button type="button" onClick={() => setTaskFormData(p => ({ ...p, locationIds: p.locationIds.filter(lid => lid !== id) }))}><Close style={{ fontSize: 12 }} /></button></span>))}</div></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Assigned Site Engiiner</label><select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.employeeIds.includes(v)) setTaskFormData(p => ({ ...p, employeeIds: [...p.employeeIds, v] })); }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase outline-none"><option value="">-- Assign --</option>{projectStaff.filter(s => !taskFormData.employeeIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select><div className="flex flex-wrap gap-1 mt-2">{taskFormData.employeeIds.map(id => (<span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 border border-sky-100 rounded-lg text-[9px] font-bold text-[#0284C7]">{(projectStaff.find(s => s.id === id))?.fullName} <button type="button" onClick={() => setTaskFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(eid => eid !== id) }))}><Close style={{ fontSize: 12 }} /></button></span>))}</div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl border p-6 space-y-4"><div className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400"><Description fontSize="small" /> Artifact (Preserved)</div><div className="border-2 border-dashed rounded-[28px] p-8 text-center relative cursor-pointer group bg-slate-50/20"><input type="file" onChange={(e) => setSupportDocument(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><UploadFile className="text-slate-100 group-hover:text-[#0284C7] mb-2" style={{ fontSize: 32 }} /><p className="text-[10px] font-bold text-slate-500 group-hover:text-[#0284C7] uppercase font-black">Upload Proof</p></div>{(supportDocument || existingFile) && (<div className="flex items-center gap-2 p-2 rounded-xl border bg-sky-50/30 border-sky-100"><Description className="text-[#0284C7]" /><div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate text-slate-700">{supportDocument ? supportDocument.name : existingFile}</p></div>{supportDocument && <Close onClick={() => setSupportDocument(null)} className="cursor-pointer text-slate-400" style={{ fontSize: 14 }} />}</div>)}</div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label><textarea rows="4" value={taskFormData.description} onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium resize-none focus:border-[#0284C7] outline-none" placeholder="Task descriptions..." /></div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#0284C7] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Save Execution Task</button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal: Read-only dossier */}
            {viewingTask && (
                <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl border w-full max-w-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between"><div className="flex items-center gap-3"><Visibility className="text-emerald-500" /><h3 className="font-black text-slate-800 uppercase tracking-tight">Task Dossier</h3></div><button onClick={() => setViewingTask(null)} className="p-2 hover:bg-white rounded-full"><Close /></button></div>
                        <div className="p-10 space-y-6">
                            <div className="flex justify-between items-start"><div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Component Name</p><p className="text-xl font-black text-slate-800">{viewingTask.taskName}</p></div><span className={`text-[10px] font-black px-4 py-2 rounded-xl border uppercase ${getTaskStatusStyle(viewingTask.status)}`}>{viewingTask.status.replace(/_/g, ' ')}</span></div>
                            <div className="grid grid-cols-2 gap-8">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weighting</p><p className="text-sm font-bold text-slate-700">{viewingTask.weight}% Contribution</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Planned Cost</p><p className="text-sm font-bold text-slate-700">{project.currencyType} {viewingTask.taskCost?.toLocaleString()}</p></div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Scope Detail</p><p className="text-xs text-slate-600 italic leading-relaxed">"{viewingTask.description || 'No additional scope details provided.'}"</p></div>
                        </div>
                        <div className="p-8 border-t bg-slate-50/30 flex justify-end"><button onClick={() => setViewingTask(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Dismiss</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;