import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowBack, CalendarMonth, LocationOn, Info, Add, Edit, Delete,
    Assignment, Close, HelpOutline, Schedule, Visibility,
    Category, Explore, Description, UploadFile, CloudDone, Lock
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import taskApi from '../../api/modules/task';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

const ProjectInitiationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can } = useAuth();

    // Data States
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    // Registry States
    const [taskTypeRegistry, setTaskTypeRegistry] = useState([]);
    const [filteredTaskTypes, setFilteredTaskTypes] = useState([]);

    // UI States
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, taskName: '' });
    const [supportDocument, setSupportDocument] = useState(null);

    // Lifecycle Lock: Modification only allowed if phase is INITIATED
    const canModifyTasks = useMemo(() => project?.phase === 'INITIATION', [project]);

    const [taskFormData, setTaskFormData] = useState({
        taskTypeId: '', // Requirement: Use ID for payload
        taskCost: '', startDate: '', endDate: '', description: '',
        status: 'TO_DO', priority: 'LOW', weight: 0,
        latitude: '', longitude: '', locationIds: [], employeeIds: []
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [pRes, tRes, regRes] = await Promise.all([
                    projectApi.GET_PROJECT_INITIATION(id),
                    taskApi.GET_TASKS_BY_PROJECT(id),
                    adminApi.GET_TASK_TYPES()
                ]);
                setProject(pRes.data.data);
                setTasks(tRes.data.data || []);
                setTaskTypeRegistry(regRes.data?.data || []);
            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Registry sync failed.' });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Apply strict filtering for Task Type Dropdown
    useEffect(() => {
        if (isTaskModalOpen && project && taskTypeRegistry.length > 0) {
            const filtered = taskTypeRegistry.filter(t =>
                t.projectType === project.projectType &&
                t.taskTypeProjectPhase === 'INITIATION'
            );
            setFilteredTaskTypes(filtered);
        }
    }, [isTaskModalOpen, project, taskTypeRegistry]);

    const handleTaskAction = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // Build DTO matching CreateTaskRequestDTO
            const dto = {
                taskTypeId: Number(taskFormData.taskTypeId),
                projectId: Number(id),
                employeeIds: taskFormData.employeeIds || [],
                locationIds: taskFormData.locationIds || [],
                startDate: taskFormData.startDate || null,
                endDate: taskFormData.endDate || null,
                description: taskFormData.description || "",
                status: taskFormData.status,
                priority: taskFormData.priority,
                weight: parseFloat(taskFormData.weight) || 0,
                latitude: taskFormData.latitude ? parseFloat(taskFormData.latitude) : null,
                longitude: taskFormData.longitude ? parseFloat(taskFormData.longitude) : null,
                taskCost: parseFloat(taskFormData.taskCost) || 0
            };

            formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
            if (supportDocument instanceof File) formData.append("supportDocument", supportDocument);

            if (editingTask?.id) await taskApi.UPDATE_TASK(editingTask.id, formData);
            else await taskApi.CREATE_TASK(formData);

            const tRes = await taskApi.GET_TASKS_BY_PROJECT(id);
            setTasks(tRes.data.data || []);
            setIsTaskModalOpen(false);
            setAlert({ show: true, type: 'success', message: 'Task registry successfully updated.' });
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Synchronization error.' }); }
    };

    const executeDeleteTask = async () => {
        try {
            await taskApi.DELETE_TASK(deleteConfig.id);
            setTasks(prev => prev.filter(t => t.id !== deleteConfig.id));
            setAlert({ show: true, type: 'success', message: 'Component removed from plan.' });
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Deletion failed.' }); }
        finally { setDeleteConfig({ show: false, id: null, taskName: '' }); }
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

    if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-400">Loading Initiation Dossier...</div>;

    return (
        <div className="w-full space-y-6 pb-20 px-4 animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Delete Modal */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center border shadow-2xl animate-scaleIn">
                        <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-black uppercase text-slate-800">Remove Component</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Delete <b>{deleteConfig.taskName}</b> from initiation plan?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setDeleteConfig({ show: false, id: null, taskName: '' })} className="flex-1 px-4 py-3 rounded-2xl border font-black uppercase text-[10px] hover:bg-slate-50">Cancel</button>
                            <button onClick={executeDeleteTask} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header: Read Only Profile */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/initiations')} className="p-3 bg-slate-50 border rounded-2xl hover:bg-slate-100 transition-all"><ArrowBack fontSize="small" /></button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-sky-50 text-[#0284C7] px-2 py-0.5 rounded border border-sky-100 uppercase">{project.projectCode}</span>
                            <h1 className="text-xl font-black text-slate-900">{project.title}</h1>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-2"><LocationOn style={{ fontSize: 14 }} /> {project.subCityName || 'City Wide Hub'}</p>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="text-right border-r pr-8 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Phase</p><span className={`text-xs font-black uppercase ${project.phase === 'EXECUTION' ? 'text-emerald-600' : 'text-[#0284C7]'}`}>{project.phase}</span></div>
                    <div className="text-right border-r pr-8 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Category</p><span className="text-xs font-black text-amber-600 uppercase">{project.category}</span></div>
                    <div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Window</p><span className="text-xs font-black text-slate-700">{project.startDate || 'TBD'} &rarr; {project.endDate || 'TBD'}</span></div>
                </div>
            </div>

            {/* Component List */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg">{canModifyTasks ? <Assignment /> : <Lock />}</div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Planned Initiation Components</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                {canModifyTasks ? 'Define tasks for this initiation' : 'Planning locked: project implementation has started'}
                            </p>
                        </div>
                    </div>
                    {canModifyTasks && can('CAN_CREATE_INITIATION_TASK') && (
                        <button onClick={() => { setEditingTask(null); setTaskFormData({ taskTypeId: '', taskCost: '', startDate: '', endDate: '', description: '', status: 'TO_DO', priority: 'LOW', weight: 0, latitude: '', longitude: '', locationIds: [], employeeIds: [] }); setSupportDocument(null); setIsTaskModalOpen(true); }} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"><Add /> New Task</button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr><th className="px-10 py-5">Task Details</th><th className="px-6 py-5 text-center">Weight</th><th className="px-6 py-5 text-center">Status</th><th className="px-10 py-5 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tasks.length === 0 ? (
                                <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-300 italic font-bold uppercase tracking-widest">No tasks defined.</td></tr>
                            ) : tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50/50 group transition-all">
                                    <td className="px-10 py-5">
                                        <div className="flex flex-col"><span className="text-sm font-black text-slate-800">{task.taskName}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 mt-1"><Schedule style={{ fontSize: 14 }} /> {task.startDate || 'TBD'} &rarr; {task.endDate || 'TBD'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center"><span className="text-xs font-black bg-amber-50 text-amber-700 px-3 py-1 rounded-xl border border-amber-100">{task.weight}%</span></td>
                                    <td className="px-6 py-5 text-center"><span className={`text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-tighter ${getTaskStatusStyle(task.status)}`}>{task.status.replace(/_/g, ' ')}</span></td>
                                    <td className="px-10 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setViewingTask(task)} className="p-2 text-slate-400 hover:text-emerald-600 transition-all"><Visibility fontSize="small" /></button>
                                            {canModifyTasks && (
                                                <>
                                                    {
                                                        can('CAN_EDIT_INITIATION_TASK') && (
                                                            <button onClick={() => { setEditingTask(task); setTaskFormData({ ...task, taskTypeId: task.taskTypeId || '' }); setIsTaskModalOpen(true); }} className="p-2 text-slate-400 hover:text-[#0284C7] transition-all"><Edit fontSize="small" /></button>
                                                        )
                                                    }
                                                    {
                                                        can('CAN_DELETE_INITIATION_TASK') && (
                                                            <button onClick={() => setDeleteConfig({ show: true, id: task.id, taskName: task.taskName })} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Delete fontSize="small" /></button>
                                                        )
                                                    }
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Read-Only Viewing Modal */}
            {viewingTask && (
                <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl border w-full max-w-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3"><Visibility className="text-emerald-500" /><h3 className="font-black text-slate-800 uppercase tracking-tight">Component Dossier</h3></div>
                            <button onClick={() => setViewingTask(null)} className="p-2 hover:bg-white rounded-full"><Close /></button>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Component Name</p><p className="text-xl font-black text-slate-800">{viewingTask.taskName}</p></div>
                                <span className={`text-[10px] font-black px-4 py-2 rounded-xl border uppercase ${getTaskStatusStyle(viewingTask.status)}`}>{viewingTask.status.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contribution</p><p className="text-sm font-bold text-slate-700">{viewingTask.weight}% Weight</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Planned Cost</p><p className="text-sm font-bold text-slate-700">{project.currencyType} {viewingTask.taskCost?.toLocaleString()}</p></div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Scope Justification</p><p className="text-xs text-slate-600 italic leading-relaxed">"{viewingTask.description || 'No additional scope details provided.'}"</p></div>
                        </div>
                        <div className="p-8 border-t bg-slate-50/30 flex justify-end"><button onClick={() => setViewingTask(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Dismiss</button></div>
                    </div>
                </div>
            )}

            {/* Creation / Editing Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingTask ? 'Modify Planned Component' : 'New Initiation Component'}</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all"><Close /></button>
                        </div>
                        <form onSubmit={handleTaskAction} className="p-10 overflow-y-auto space-y-8 no-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Component Title (Registry Dropdown) *</label>
                                        <select
                                            required
                                            value={taskFormData.taskTypeId}
                                            onChange={e => setTaskFormData({ ...taskFormData, taskTypeId: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#0284C7] text-sm font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Select Initiation Blueprint --</option>
                                            {filteredTaskTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Current Progress Status</label>
                                            <select value={taskFormData.status} onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })} className="w-full bg-sky-50 border-2 border-sky-100 text-[#0284C7] rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none cursor-pointer">
                                                <option value="TO_DO">To Do</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="IN_REVIEW">In Review</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Est. Weight (%)</label><input type="number" step="0.01" value={taskFormData.weight} onChange={e => setTaskFormData({ ...taskFormData, weight: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Start Window</label><input type="date" value={taskFormData.startDate} onChange={e => setTaskFormData({ ...taskFormData, startDate: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-sm" /></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">End Window</label><input type="date" value={taskFormData.endDate} onChange={e => setTaskFormData({ ...taskFormData, endDate: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-sm" /></div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Scope & Detail</label><textarea rows="5" value={taskFormData.description} onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 text-sm font-medium resize-none focus:border-[#0284C7] outline-none" placeholder="Elaborate on the task objectives..."></textarea></div>
                                    <div className="bg-slate-50 rounded-[28px] border-2 border-slate-100 border-dashed p-10 text-center relative group hover:bg-white transition-all cursor-pointer">
                                        <input type="file" onChange={(e) => setSupportDocument(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <UploadFile className="text-slate-200 group-hover:text-[#0284C7] mb-2" style={{ fontSize: 40 }} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attach Proof of Work</p>
                                    </div>
                                    {supportDocument && <div className="flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-100"><div className="flex items-center gap-3"><CloudDone className="text-[#0284C7]" /><span className="text-[11px] font-bold text-slate-700 truncate max-w-[200px]">{supportDocument.name}</span></div><Close onClick={() => setSupportDocument(null)} className="cursor-pointer text-slate-400" /></div>}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#0284C7] text-white py-5 rounded-[24px] font-black uppercase text-xs shadow-xl shadow-sky-100 hover:bg-[#0369a1] active:scale-95 transition-all tracking-[0.2em]">{editingTask ? 'Update Initiation Component' : 'Save Planned Component'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectInitiationDetails;