// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//     ArrowBack, Payments, CalendarMonth, LocationOn, Work, Badge,
//     TrendingUp, Engineering, Info, Add, Edit, Delete,
//     Assignment, Close, HelpOutline, Search, Explore, Schedule,
//     Visibility, AccessTime, Diversity3, DateRange, Payment,
//     Description, UploadFile, CloudDone
// } from '@mui/icons-material';
// import projectApi from '../../api/modules/project';
// import taskApi from '../../api/modules/task';
// import adminApi from '../../api/modules/admin'; // Added
// import AlertMessage from '../../components/Reusable/AlertMessage';
// import { useAuth } from '../../context/AuthContext';
// import ProgressPie from '../../utility/ProgressPie';

// const ProjectDetails = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { can } = useAuth();

//     // Data States
//     const [project, setProject] = useState(null);
//     const [tasks, setTasks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

//     // Registry States (for suggestions)
//     const [taskTypeRegistry, setTaskTypeRegistry] = useState([]);
//     const [filteredSuggestions, setFilteredSuggestions] = useState([]);

//     // UI States
//     const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
//     const [editingTask, setEditingTask] = useState(null);
//     const [viewingTask, setViewingTask] = useState(null);
//     const [teamSearch, setTeamSearch] = useState('');
//     const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, taskName: '' });

//     // File States
//     const [supportDocument, setSupportDocument] = useState(null);
//     const [existingFile, setExistingFile] = useState('');

//     // Form State
//     const [taskFormData, setTaskFormData] = useState({
//         taskName: '', taskCost: '', startDate: '', endDate: '', description: '',
//         status: 'TO_DO', priority: 'LOW', weight: 0,
//         latitude: '', longitude: '', locationIds: [], employeeIds: []
//     });

//     useEffect(() => {
//         const loadPageData = async () => {
//             if (!id || id === 'create') return;
//             try {
//                 const [pRes, tRes, regRes] = await Promise.all([
//                     projectApi.GET_PROJECT(id),
//                     taskApi.GET_TASKS_BY_PROJECT(id),
//                     adminApi.GET_TASK_TYPES() // Load global registry
//                 ]);
//                 // setProject(pRes.data.data);
//                 const rawProject = pRes.data.data;

//                 // Calculate total days on the fly
//                 const extensions = rawProject.extensions || [];
//                 const totalDays = extensions.reduce((sum, ext) => sum + (Number(ext.extendedDays) || 0), 0);

//                 // Calculate the actual Final Date
//                 let finalDate = rawProject.endDate;
//                 if (totalDays > 0 && rawProject.endDate) {
//                     const dateObj = new Date(rawProject.endDate);
//                     dateObj.setDate(dateObj.getDate() + totalDays);
//                     finalDate = dateObj.toISOString().split('T')[0]; // Format back to YYYY-MM-DD
//                 }

//                 setProject({
//                     ...rawProject,
//                     totalExtendedDays: totalDays,
//                     finalEndDate: finalDate // Use this for all UI displays
//                 });
//                 setTasks(tRes.data.data || []);
//                 setExistingFile(tRes.data?.data.supportDocument || '');
//                 setTaskTypeRegistry(regRes.data?.data || []);
//             } catch (err) {
//                 setAlert({ show: true, type: 'error', message: 'Sync error.' });
//             } finally {
//                 setLoading(false);
//             }
//         };
//         loadPageData();
//     }, [id]);

//     // Filter suggestions based on current project category
//     useEffect(() => {
//         if (isTaskModalOpen && project && taskTypeRegistry.length > 0) {
//             const filtered = taskTypeRegistry.filter(
//                 type => type.projectType === project.projectType
//             );
//             setFilteredSuggestions(filtered);
//         }
//     }, [isTaskModalOpen, project, taskTypeRegistry]);

//     const projectStaff = useMemo(() => {
//         if (!project) return [];
//         const ids = project.employeeIds || [];
//         const names = project.employeeNames || [];
//         return ids.map((eid, i) => ({
//             id: eid,
//             fullName: names[i] || "Unknown Employee"
//         })).filter(e => e.fullName.toLowerCase().includes(teamSearch.toLowerCase()));
//     }, [project, teamSearch]);

//     const projectSites = useMemo(() => {
//         if (!project) return [];
//         return (project.locationIds || []).map((lid, i) => ({
//             id: lid,
//             name: project.locationNames?.[i] || `Site ${lid}`
//         }));
//     }, [project]);

//     const handleTaskAction = async (e) => {
//         e.preventDefault();

//         try {
//             const formData = new FormData();

//             // BUILD DTO OBJECT (THIS IS WHAT BACKEND EXPECTS)
//             const dto = {
//                 taskName: taskFormData.taskName.trim(),
//                 taskCost: taskFormData.taskCost ? parseFloat(taskFormData.taskCost) : 0.0,
//                 projectId: Number(id),
//                 employeeIds: taskFormData.employeeIds || [],
//                 locationIds: taskFormData.locationIds || [],
//                 startDate: taskFormData.startDate || null,
//                 endDate: taskFormData.endDate || null,
//                 description: taskFormData.description || "",
//                 status: taskFormData.status,
//                 priority: taskFormData.priority,
//                 weight: taskFormData.weight ? parseFloat(taskFormData.weight) : 0.0,
//                 latitude: taskFormData.latitude ? parseFloat(taskFormData.latitude) : null,
//                 longitude: taskFormData.longitude ? parseFloat(taskFormData.longitude) : null
//             };

//             // SEND DTO AS JSON BLOB (MANDATORY FOR @RequestPart)
//             formData.append(
//                 "data",
//                 new Blob([JSON.stringify(dto)], {
//                     type: "application/json"
//                 })
//             );

//             // OPTIONAL FILE
//             if (supportDocument instanceof File) {
//                 formData.append("supportDocument", supportDocument);
//             }

//             // API CALL
//             if (editingTask?.id) {
//                 await taskApi.UPDATE_TASK(editingTask.id, formData);
//             } else {
//                 await taskApi.CREATE_TASK(formData);
//             }

//             // REFRESH LIST
//             const tRes = await taskApi.GET_TASKS_BY_PROJECT(id);
//             setTasks(tRes.data.data || []);

//             setIsTaskModalOpen(false);

//             setAlert({
//                 show: true,
//                 type: "success",
//                 message: "Task configuration synchronized."
//             });

//         } catch (err) {
//             console.error("ERROR:", err?.response?.data || err);

//             setAlert({
//                 show: true,
//                 type: "error",
//                 message: err?.response?.data?.message || "Sync failed"
//             });
//         }
//     };

//     const executeDeleteTask = async () => {
//         const { id: taskId, taskName } = deleteConfig;
//         setDeleteConfig({ show: false, id: null, taskName: '' });
//         try {
//             await taskApi.DELETE_TASK(taskId);
//             setTasks(prev => prev.filter(t => t.id !== taskId));
//             setAlert({ show: true, type: 'success', message: `Task "${taskName}" removed.` });
//         } catch (err) {
//             setAlert({ show: true, type: 'error', message: 'Deletion rejected.' });
//         }
//     };

//     const getTaskStatusStyle = (s) => {
//         const styles = {
//             'TO_DO': 'bg-slate-50 text-slate-500 border-slate-200',
//             'IN_PROGRESS': 'bg-sky-50 text-sky-700 border-sky-100',
//             'IN_REVIEW': 'bg-amber-50 text-amber-700 border-amber-100',
//             'COMPLETED': 'bg-green-50 text-green-700 border-green-100'
//         };
//         return styles[s] || styles.TO_DO;
//     };

//     if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse italic">Synchronizing Dossier...</div>;
//     if (!project) return <div className="p-20 text-center font-bold text-slate-300">NOT FOUND</div>;

//     return (
//         <div className="w-full space-y-6 pb-20 px-4 animate-fadeIn">
//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

//             {/* Delete Confirmation */}
//             {deleteConfig.show && (
//                 <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
//                         <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 64 }} />
//                         <h3 className="text-xl font-black uppercase tracking-tight">Remove Task</h3>
//                         <p className="text-sm text-slate-500 mt-3 leading-relaxed">Are you sure you want to remove <b>{deleteConfig.taskName}</b>?</p>
//                         <div className="flex gap-4 mt-10">
//                             <button onClick={() => setDeleteConfig({ show: false, id: null, taskName: '' })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">Cancel</button>
//                             <button onClick={executeDeleteTask} className="flex-1 px-4 py-3 bg-red-500 text-white font-bold text-[10px] uppercase shadow-lg shadow-red-100 active:scale-95 transition-all">Confirm Delete</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

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
//                     <div className="text-right border-r pr-4 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Category</p><span className="text-xs font-black text-[#FBAF1E] uppercase">{project.projectType?.replace(/_/g, ' ')}</span></div>
//                 </div>
//                 <div className="text-right border-l pl-4 border-slate-100">
//                     <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1"><DateRange fontSize="small" />Start Date</p>
//                     <span className="text-xs font-black text-slate-700">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
//                 </div>
//                 <div className="text-right">
//                     <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1">
//                         <AccessTime fontSize="small" /> Project Deadline
//                     </p>

//                     <div className="flex flex-col items-end">
//                         {project.finalEndDate ? (
//                             <>
//                                 {/* The Adjusted Date */}
//                                 <span className={`text-sm font-black ${project.totalExtendedDays > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
//                                     {new Date(project.finalEndDate).toLocaleDateString()}
//                                 </span>

//                                 {/* The Status Badge */}
//                                 <div className="flex items-center gap-2 mt-1">
//                                     {project.totalExtendedDays > 0 && (
//                                         <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 uppercase">
//                                             +{project.totalExtendedDays} days Extension
//                                         </span>
//                                     )}

//                                     {(() => {
//                                         const today = new Date(); today.setHours(0, 0, 0, 0);
//                                         const end = new Date(project.finalEndDate); end.setHours(0, 0, 0, 0);
//                                         const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

//                                         if (diff > 0) return <span className="text-[9px] text-green-600 font-bold uppercase tracking-tighter">{diff} Days Left</span>;
//                                         if (diff === 0) return <span className="text-[9px] text-amber-500 font-bold uppercase tracking-tighter">Due Today</span>;
//                                         return <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">{Math.abs(diff)} days Overdue</span>;
//                                     })()}
//                                 </div>
//                             </>
//                         ) : "N/A"}
//                     </div>
//                 </div>
//             </div>

//             {/* Panels */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//                 <div className="lg:col-span-8 space-y-4">
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
//                         <div className="flex items-center justify-between mb-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Payment fontSize="small" /> Financial Context</div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Contract Sum</p><p className="text-lg font-black text-slate-900">{project.currencyType} {project.budget?.toLocaleString()}</p></div>
//                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Expenditure</p><p className="text-lg font-black text-[#0284C7]">{project.currencyType} {project.budgetUsed?.toLocaleString()}</p></div>
//                         </div>
//                     </div>
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm"><div className="flex items-center gap-2 mb-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Info fontSize="small" /> Project Description</div><p className="text-xs text-slate-500 italic line-clamp-3">{project.description || 'N/A'}</p></div>
//                 </div>
//                 <div className="lg:col-span-4">
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4 h-full">
//                         <div className="flex items-center gap-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Engineering fontSize="small" /> Assignments</div>
//                         <div className="space-y-2">
//                             <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//                                 <Badge className="text-sky-500" style={{ fontSize: 16 }} />
//                                 <div><p className="text-[8px] font-bold text-slate-400 uppercase">Manager</p><p className="text-xs font-bold text-slate-700">{project.projectManagerName}</p></div>
//                             </div>
//                             <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//                                 <Work className="text-amber-500" style={{ fontSize: 16 }} />
//                                 <div><p className="text-[8px] font-bold text-slate-400 uppercase">Contractor</p><p className="text-xs font-bold text-slate-700">{project.contractorName}</p></div>
//                             </div>
//                         </div>
//                         <div className="pt-2">
//                             <div className="flex items-center gap-2 mb-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Diversity3 fontSize="small" /> Team</div>
//                             <div className="flex flex-wrap gap-1">{project.employeeNames?.map((n, i) => (<span key={i} className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 rounded uppercase border border-slate-200">{n}</span>))}</div>
//                         </div>
//                         <div className="pt-4 border-t border-slate-50">
//                             <div className="flex items-center gap-2 mb-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><TrendingUp fontSize="small" /> Real-time Progress</div>
//                             <ProgressPie progress={project.projectProgress || 0} />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Task Registry Table */}
//             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
//                 <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
//                     <div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><Assignment /></div><div><h2 className="text-lg font-bold text-slate-900 leading-none">Task Registry</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lifecycle Tracking</p></div></div>
//                     {can('CAN_CREATE_TASK') && (
//                         <button onClick={() => { setEditingTask(null); setTaskFormData({ taskName: '', taskCost: '', startDate: '', endDate: '', description: '', status: 'TO_DO', priority: 'LOW', weight: 0, latitude: '', longitude: '', locationIds: [], employeeIds: [] }); setSupportDocument(null); setIsTaskModalOpen(true); }} className="bg-[#0284C7] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all"><Add style={{ fontSize: 18 }} /> New Task</button>
//                     )}
//                 </div>
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                         <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
//                             <tr><th className="px-8 py-4">Task Component</th><th className="px-6 py-4 text-center">Weight</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4">Support Doc.</th><th className="px-8 py-4 text-right">Actions</th></tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-50">
//                             {tasks.length === 0 ? (<tr><td colSpan="5" className="px-8 py-12 text-center text-slate-300 text-xs italic font-bold">No tasks defined.</td></tr>) : tasks.map((task) => (
//                                 <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
//                                     <td className="px-8 py-4">
//                                         <div className="flex flex-col"><span className="text-sm font-bold text-slate-700">{task.taskName}</span>
//                                             <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
//                                                 <Schedule style={{ fontSize: 10 }} /> {task.startDate || 'TBD'} &rarr; {task.endDate || 'TBD'}
//                                                 &rarr; {task.endDate && (() => {
//                                                     const today = new Date(); today.setHours(0, 0, 0, 0);
//                                                     const end = new Date(task.endDate); end.setHours(0, 0, 0, 0);
//                                                     const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
//                                                     return diffDays > 0 ? <span className="text-green-600">{diffDays} days left</span> :
//                                                         diffDays === 0 ? <span className="text-amber-500">Today</span> :
//                                                             <span className="text-red-500">{Math.abs(diffDays)} days overdue</span>;
//                                                 })()}
//                                             </span>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 text-center"><span className="text-xs font-black text-slate-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">{task.weight}%</span></td>
//                                     <td className="px-6 py-4 text-center"><span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${getTaskStatusStyle(task.status)}`}>{task.status.replace(/_/g, ' ')}</span></td>
//                                     <td className="px-6 py-4">
//                                         {task.supportDocument ? (
//                                             <a href={`http://localhost:8080/api/tasks/download/${task.supportDocument}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#0284C7] hover:text-[#016da3]">
//                                                 <CloudDone style={{ fontSize: 16 }} /> <span className="text-[10px] font-bold border-b border-sky-200 uppercase tracking-tighter">View</span>
//                                             </a>
//                                         ) : <span className="text-[10px] text-slate-300 font-bold uppercase">No Artifact</span>}
//                                     </td>
//                                     <td className="px-8 py-4 text-right">
//                                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                             <button onClick={() => setViewingTask(task)} className="p-1.5 text-slate-400 hover:text-emerald-600"><Visibility style={{ fontSize: 18 }} /></button>
//                                             {(can('CAN_EDIT_TASK') || can('CAN_UPDATE_TASK')) && (
//                                                 <button onClick={() => {
//                                                     setEditingTask(task); setTaskFormData({
//                                                         ...task, employeeIds: task.employeeIds || [],
//                                                         locationIds: task.locationIds || [],

//                                                     }); setSupportDocument(null); setExistingFile(task.supportDocument || ''); setIsTaskModalOpen(true);
//                                                 }} className="p-1.5 text-slate-400 hover:text-[#0284C7]"><Edit style={{ fontSize: 18 }} /></button>
//                                             )}
//                                             {can('CAN_DELETE_TASK') && (
//                                                 <button onClick={() => setDeleteConfig({ show: true, id: task.id, taskName: task.taskName })} className="p-1.5 text-slate-400 hover:text-red-500"><Delete style={{ fontSize: 18 }} /></button>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* View Modal */}
//             {viewingTask && (
//                 <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col">
//                         <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
//                             <div className="flex items-center gap-3"><div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Visibility style={{ fontSize: 18 }} /></div><h3 className="font-black text-slate-800 uppercase tracking-tight">Task Details</h3></div>
//                             <button onClick={() => setViewingTask(null)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button>
//                         </div>
//                         <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar">
//                             <div className="grid grid-cols-2 gap-6">
//                                 <div className="col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Task Name</p><p className="text-lg font-black text-slate-800 leading-tight">{viewingTask.taskName}</p></div>
//                                 <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Status</p><span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getTaskStatusStyle(viewingTask.status)}`}>{viewingTask.status?.replace(/_/g, ' ')}</span></div>
//                                 <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Priority</p><span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase">{viewingTask.priority}</span></div>
//                                 <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Contribution</p><p className="text-sm font-bold text-slate-700">{viewingTask.weight}% Weight</p></div>
//                                 <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Cost Projection</p><p className="text-sm font-bold text-slate-700">{project.currencyType} {viewingTask.taskCost?.toLocaleString()}</p></div>
//                                 <div className="col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Team Assigned</p><div className="flex flex-wrap gap-2">{viewingTask.employeeNames?.map((name, i) => (<span key={i} className="px-2 py-1 bg-sky-50 text-[#0284C7] text-[10px] font-bold rounded-lg border border-sky-100 uppercase">{name}</span>))}</div></div>
//                                 <div className="col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Active Sites</p><div className="flex flex-wrap gap-2">{viewingTask.locationNames?.map((loc, i) => (<span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 uppercase">{loc}</span>))}</div></div>
//                                 <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Explore style={{ fontSize: 14 }} /> Coordinates</p><p className="text-xs font-mono text-slate-600">LAT: {viewingTask.latitude || '0.0'} / LNG: {viewingTask.longitude || '0.0'}</p></div>
//                                 <div className="col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Scope Details</p><p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border italic leading-relaxed whitespace-pre-line">{viewingTask.description || 'N/A'}</p></div>
//                             </div>
//                         </div>
//                         <div className="p-6 bg-slate-50/50 border-t flex justify-end"><button onClick={() => setViewingTask(null)} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Dismiss</button></div>
//                     </div>
//                 </div>
//             )}

//             {/* Create/Edit Modal */}
//             {isTaskModalOpen && (
//                 <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-5xl overflow-hidden max-h-[95vh] flex flex-col">
//                         <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
//                             <h3 className="font-black text-slate-800 uppercase tracking-tight">{editingTask ? 'Edit Task Component' : 'Register New Task Component'}</h3>
//                             <button onClick={() => setIsTaskModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button>
//                         </div>
//                         <form onSubmit={handleTaskAction} className="p-8 overflow-y-auto space-y-6 no-scrollbar">
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                 <div className="space-y-4">
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Title (Task Name Suggestions)</label>
//                                         <div className="relative">
//                                             <input list="task-suggestions" value={taskFormData.taskName} onChange={e => {
//                                                 const v = e.target.value; setTaskFormData({ ...taskFormData, taskName: v });
//                                                 const selected = filteredSuggestions.find(t => t.name === v);
//                                                 if (selected) setTaskFormData(prev => ({ ...prev, description: selected.description || prev.description }));
//                                             }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 outline-none focus:border-[#0284C7] text-sm font-bold" required />
//                                             <datalist id="task-suggestions">
//                                                 {filteredSuggestions.map(t => <option key={t.id} value={t.name}>{t.projectType} Task</option>)}
//                                             </datalist>
//                                         </div>
//                                     </div>
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Cost ({project.currencyType})</label><input type="number" step="0.01" value={taskFormData.taskCost} onChange={e => setTaskFormData({ ...taskFormData, taskCost: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-bold" /></div>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weight (%)</label><input type="number" step="0.01" value={taskFormData.weight} onChange={e => setTaskFormData({ ...taskFormData, weight: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-bold" /></div>
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select value={taskFormData.priority} onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label><input type="date" value={taskFormData.startDate} onChange={e => setTaskFormData({ ...taskFormData, startDate: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 font-bold text-sm" required /></div>
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date</label><input type="date" value={taskFormData.endDate} onChange={e => setTaskFormData({ ...taskFormData, endDate: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 font-bold text-sm" required /></div>
//                                     </div>
//                                     <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
//                                         <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase"><Explore style={{ fontSize: 16 }} /> Coordinates (Optional)</div>
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <input placeholder="LAT" value={taskFormData.latitude ?? ""} onChange={e => setTaskFormData({ ...taskFormData, latitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono" />
//                                             <input placeholder="LNG" value={taskFormData.longitude ?? ""} onChange={e => setTaskFormData({ ...taskFormData, longitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono" />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-4">
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label><select value={taskFormData.status} onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="TO_DO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="IN_REVIEW">In Review</option><option value="COMPLETED">Completed</option></select></div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Sites</label>
//                                         <select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.locationIds.includes(v)) setTaskFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="">-- Link Site --</option>{projectSites.filter(s => !taskFormData.locationIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
//                                         <div className="flex flex-wrap gap-1 mt-2">{taskFormData.locationIds.map(id => (<span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-lg text-[9px] font-bold text-slate-600 uppercase">{(projectSites.find(s => s.id === id))?.name || `ID: ${id}`} <button type="button" onClick={() => setTaskFormData(p => ({ ...p, locationIds: p.locationIds.filter(lid => lid !== id) }))}><Close style={{ fontSize: 12 }} /></button></span>))}</div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Team Members</label>
//                                         <select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.employeeIds.includes(v)) setTaskFormData(p => ({ ...p, employeeIds: [...p.employeeIds, v] })); }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="">-- Assign Person --</option>{projectStaff.filter(s => !taskFormData.employeeIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select>
//                                         <div className="flex flex-wrap gap-1 mt-2">{taskFormData.employeeIds.map(id => (<span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 border border-sky-100 rounded-lg text-[9px] font-bold text-[#0284C7] uppercase">{(projectStaff.find(s => s.id === id))?.fullName || `ID: ${id}`} <button type="button" onClick={() => setTaskFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(eid => eid !== id) }))}><Close style={{ fontSize: 12 }} /></button></span>))}</div>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-4">
//                                     <div className="bg-white rounded-2xl border p-6 space-y-4">
//                                         <div className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400"><Description fontSize="small" /> Verification Artifact</div>
//                                         <div className="border-2 border-dashed rounded-[28px] p-8 text-center relative cursor-pointer group bg-slate-50/20">
//                                             <input type="file" onChange={(e) => {const f = e.target.files[0]; setSupportDocument(f);}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
//                                             <UploadFile className="text-slate-100 group-hover:text-[#0284C7] mb-2" style={{ fontSize: 32 }} />
//                                             <p className="text-[10px] font-bold text-slate-500 group-hover:text-[#0284C7] uppercase">Upload Verification Doc</p>
//                                         </div>
//                                         {(supportDocument || existingFile) && (
//                                             <div className="flex items-center gap-2 p-2 rounded-xl border bg-sky-50/30 border-sky-100">
//                                                 <Description className="text-[#0284C7]" />
//                                                 <div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate text-slate-700">{supportDocument ? supportDocument.name : existingFile}</p></div>
//                                                 {supportDocument && <Close onClick={() => setSupportDocument(null)} className="cursor-pointer text-slate-400 hover:text-red-500" style={{ fontSize: 14 }} />}
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Detailed Scope</label><textarea rows="4" value={taskFormData.description} onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-medium resize-none" placeholder="Explain the execution plan..."></textarea></div>
//                                 </div>
//                             </div>
//                             <button type="submit" className="w-full bg-[#0284C7] text-white py-4 rounded-2xl font-bold uppercase text-[10px] shadow-xl hover:bg-[#016da3] transition-all">Update Task</button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProjectDetails;







// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//     ArrowBack, Payments, CalendarMonth, LocationOn, Work, Badge,
//     TrendingUp, Engineering, Info, Add, Edit, Delete,
//     Assignment, Close, HelpOutline, Search, Explore, Schedule,
//     Visibility, AccessTime, Diversity3, DateRange, Payment,
//     Description, UploadFile, CloudDone
// } from '@mui/icons-material';
// import projectApi from '../../api/modules/project';
// import taskApi from '../../api/modules/task';
// import adminApi from '../../api/modules/admin';
// import AlertMessage from '../../components/Reusable/AlertMessage';
// import { useAuth } from '../../context/AuthContext';
// import ProgressPie from '../../utility/ProgressPie';

// const ProjectDetails = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { can } = useAuth();

//     // Data States
//     const [project, setProject] = useState(null);
//     const [tasks, setTasks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

//     // Registry States
//     const [taskTypeRegistry, setTaskTypeRegistry] = useState([]);
//     const [filteredSuggestions, setFilteredSuggestions] = useState([]);

//     // UI States
//     const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
//     const [editingTask, setEditingTask] = useState(null);
//     const [viewingTask, setViewingTask] = useState(null);
//     const [teamSearch, setTeamSearch] = useState('');
//     const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, taskName: '' });

//     // File States
//     const [supportDocument, setSupportDocument] = useState(null);
//     const [existingFile, setExistingFile] = useState('');

//     // Form State
//     const [taskFormData, setTaskFormData] = useState({
//         taskName: '', taskCost: '', startDate: '', endDate: '', description: '',
//         status: 'TO_DO', priority: 'LOW', weight: 0,
//         latitude: '', longitude: '', locationIds: [], employeeIds: []
//     });

//     useEffect(() => {
//         const loadPageData = async () => {
//             if (!id || id === 'create') return;
//             try {
//                 const [pRes, tRes, regRes] = await Promise.all([
//                     projectApi.GET_PROJECT(id),
//                     taskApi.GET_TASKS_BY_PROJECT(id),
//                     adminApi.GET_TASK_TYPES()
//                 ]);
//                 const rawProject = pRes.data.data;

//                 // Preservation: Extension Calculation logic
//                 const extensions = rawProject.extensions || [];
//                 const totalDays = extensions.reduce((sum, ext) => sum + (Number(ext.extendedDays) || 0), 0);
//                 let finalDate = rawProject.endDate;
//                 if (totalDays > 0 && rawProject.endDate) {
//                     const dateObj = new Date(rawProject.endDate);
//                     dateObj.setDate(dateObj.getDate() + totalDays);
//                     finalDate = dateObj.toISOString().split('T')[0];
//                 }

//                 setProject({
//                     ...rawProject,
//                     totalExtendedDays: totalDays,
//                     finalEndDate: finalDate
//                 });
//                 setTasks(tRes.data.data || []);
//                 setExistingFile(tRes.data?.data.supportDocument || '');
//                 setTaskTypeRegistry(regRes.data?.data || []);
//             } catch (err) {
//                 setAlert({ show: true, type: 'error', message: 'Sync error.' });
//             } finally {
//                 setLoading(false);
//             }
//         };
//         loadPageData();
//     }, [id]);

//     // NEW LOGIC: Filter suggestions for OTHERS only
//     useEffect(() => {
//         if (isTaskModalOpen && project && taskTypeRegistry.length > 0) {
//             const filtered = taskTypeRegistry.filter(
//                 type => type.projectType === project.projectType &&
//                     type.taskTypeProjectStatus === 'OTHERS'
//             );
//             setFilteredSuggestions(filtered);
//         }
//     }, [isTaskModalOpen, project, taskTypeRegistry]);

//     const projectStaff = useMemo(() => {
//         if (!project) return [];
//         const ids = project.employeeIds || [];
//         const names = project.employeeNames || [];
//         return ids.map((eid, i) => ({
//             id: eid,
//             fullName: names[i] || "Unknown Employee"
//         })).filter(e => e.fullName.toLowerCase().includes(teamSearch.toLowerCase()));
//     }, [project, teamSearch]);

//     const projectSites = useMemo(() => {
//         if (!project) return [];
//         return (project.locationIds || []).map((lid, i) => ({
//             id: lid,
//             name: project.locationNames?.[i] || `Site ${lid}`
//         }));
//     }, [project]);

//     const handleTaskAction = async (e) => {
//         e.preventDefault();
//         try {
//             const formData = new FormData();
//             const dto = {
//                 taskName: taskFormData.taskName.trim(),
//                 taskCost: taskFormData.taskCost ? parseFloat(taskFormData.taskCost) : 0.0,
//                 projectId: Number(id),
//                 employeeIds: taskFormData.employeeIds || [],
//                 locationIds: taskFormData.locationIds || [],
//                 startDate: taskFormData.startDate || null,
//                 endDate: taskFormData.endDate || null,
//                 description: taskFormData.description || "",
//                 status: taskFormData.status,
//                 priority: taskFormData.priority,
//                 weight: taskFormData.weight ? parseFloat(taskFormData.weight) : 0.0,
//                 latitude: taskFormData.latitude ? parseFloat(taskFormData.latitude) : null,
//                 longitude: taskFormData.longitude ? parseFloat(taskFormData.longitude) : null
//             };
//             formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
//             if (supportDocument instanceof File) formData.append("supportDocument", supportDocument);

//             if (editingTask?.id) await taskApi.UPDATE_TASK(editingTask.id, formData);
//             else await taskApi.CREATE_TASK(formData);

//             const tRes = await taskApi.GET_TASKS_BY_PROJECT(id);
//             setTasks(tRes.data.data || []);
//             setIsTaskModalOpen(false);
//             setAlert({ show: true, type: "success", message: "Task configuration synchronized." });
//         } catch (err) {
//             setAlert({ show: true, type: "error", message: err?.response?.data?.message || "Sync failed" });
//         }
//     };

//     const executeDeleteTask = async () => {
//         const { id: taskId, taskName } = deleteConfig;
//         setDeleteConfig({ show: false, id: null, taskName: '' });
//         try {
//             await taskApi.DELETE_TASK(taskId);
//             setTasks(prev => prev.filter(t => t.id !== taskId));
//             setAlert({ show: true, type: 'success', message: `Task "${taskName}" removed.` });
//         } catch (err) {
//             setAlert({ show: true, type: 'error', message: 'Deletion rejected.' });
//         }
//     };

//     const getTaskStatusStyle = (s) => {
//         const styles = {
//             'TO_DO': 'bg-slate-50 text-slate-500 border-slate-200',
//             'IN_PROGRESS': 'bg-sky-50 text-sky-700 border-sky-100',
//             'IN_REVIEW': 'bg-amber-50 text-amber-700 border-amber-100',
//             'COMPLETED': 'bg-green-50 text-green-700 border-green-100'
//         };
//         return styles[s] || styles.TO_DO;
//     };

//     if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse italic">Synchronizing Dossier...</div>;
//     if (!project) return <div className="p-20 text-center font-bold text-slate-300">NOT FOUND</div>;

//     return (
//         <div className="w-full space-y-6 pb-20 px-4 animate-fadeIn">
//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

//             {/* Preservation: Delete confirmation UI */}
//             {deleteConfig.show && (
//                 <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full text-center border">
//                         <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 64 }} />
//                         <h3 className="text-xl font-black uppercase tracking-tight">Remove Task</h3>
//                         <p className="text-sm text-slate-500 mt-3 leading-relaxed">Are you sure you want to remove <b>{deleteConfig.taskName}</b>?</p>
//                         <div className="flex gap-4 mt-10">
//                             <button onClick={() => setDeleteConfig({ show: false, id: null, taskName: '' })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">Cancel</button>
//                             <button onClick={executeDeleteTask} className="flex-1 px-4 py-3 bg-red-500 text-white font-bold text-[10px] uppercase shadow-lg active:scale-95 transition-all">Confirm Delete</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Preservation: Header Info */}
//             <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => navigate('/projects')} className="p-2 bg-slate-50 border rounded-xl hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded uppercase border border-sky-100">{project.projectCode}</span>
//                             <h1 className="text-xl font-black text-slate-900">{project.title}</h1>
//                         </div>
//                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1"><LocationOn style={{ fontSize: 12 }} /> {project.cityName} &bull; {project.subCityName}</p>
//                     </div>
//                 </div>
//                 <div className="flex gap-4">
//                     <div className="text-right border-r pr-4 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Status</p><span className="text-xs font-black text-[#0284C7] uppercase">{project.status}</span></div>
//                     <div className="text-right border-r pr-4 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Category</p><span className="text-xs font-black text-[#FBAF1E] uppercase">{project.projectType?.replace(/_/g, ' ')}</span></div>
//                 </div>
//                 <div className="text-right border-l pl-4 border-slate-100">
//                     <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1"><DateRange fontSize="small" />Start Date</p>
//                     <span className="text-xs font-black text-slate-700">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
//                 </div>
//                 <div className="text-right">
//                     <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1"><AccessTime fontSize="small" /> Project Deadline</p>
//                     <div className="flex flex-col items-end">
//                         {project.finalEndDate ? (
//                             <>
//                                 <span className={`text-sm font-black ${project.totalExtendedDays > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{new Date(project.finalEndDate).toLocaleDateString()}</span>
//                                 <div className="flex items-center gap-2 mt-1">
//                                     {project.totalExtendedDays > 0 && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 uppercase">+{project.totalExtendedDays} days Extension</span>}
//                                     {(() => {
//                                         const today = new Date(); today.setHours(0, 0, 0, 0);
//                                         const end = new Date(project.finalEndDate); end.setHours(0, 0, 0, 0);
//                                         const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
//                                         if (diff > 0) return <span className="text-[9px] text-green-600 font-bold uppercase">{diff} Days Left</span>;
//                                         if (diff === 0) return <span className="text-[9px] text-amber-500 font-bold uppercase">Due Today</span>;
//                                         return <span className="text-[9px] text-red-500 font-bold uppercase">{Math.abs(diff)} days Overdue</span>;
//                                     })()}
//                                 </div>
//                             </>
//                         ) : "N/A"}
//                     </div>
//                 </div>
//             </div>

//             {/* Preservation: Expenditure and Assignment Panels */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//                 <div className="lg:col-span-8 space-y-4">
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
//                         <div className="flex items-center justify-between mb-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Payment fontSize="small" /> Financial Context</div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Contract Sum</p><p className="text-lg font-black text-slate-900">{project.currencyType} {project.budget?.toLocaleString()}</p></div>
//                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Expenditure</p><p className="text-lg font-black text-[#0284C7]">{project.currencyType} {project.budgetUsed?.toLocaleString()}</p></div>
//                         </div>
//                     </div>
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm"><div className="flex items-center gap-2 mb-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Info fontSize="small" /> Project Description</div><p className="text-xs text-slate-500 italic line-clamp-3">{project.description || 'N/A'}</p></div>
//                 </div>
//                 <div className="lg:col-span-4">
//                     <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4 h-full">
//                         <div className="flex items-center gap-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Engineering fontSize="small" /> Assignments</div>
//                         <div className="space-y-2">
//                             <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Badge className="text-sky-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Manager</p><p className="text-xs font-bold text-slate-700">{project.projectManagerName}</p></div></div>
//                             <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Work className="text-amber-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Contractor</p><p className="text-xs font-bold text-slate-700">{project.contractorName}</p></div></div>
//                         </div>
//                         <div className="pt-2"><div className="flex items-center gap-2 mb-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Diversity3 fontSize="small" /> Team</div><div className="flex flex-wrap gap-1">{project.employeeNames?.map((n, i) => (<span key={i} className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 rounded uppercase border border-slate-200">{n}</span>))}</div></div>
//                         <div className="pt-4 border-t border-slate-50"><div className="flex items-center gap-2 mb-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><TrendingUp fontSize="small" /> Real-time Progress</div><ProgressPie progress={project.projectProgress || 0} /></div>
//                     </div>
//                 </div>
//             </div>

//             {/* Task Registry Table */}
//             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
//                 <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
//                     <div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><Assignment /></div><div><h2 className="text-lg font-bold text-slate-900 leading-none">Task Registry</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lifecycle Tracking</p></div></div>
//                     {can('CAN_CREATE_TASK') && (
//                         <button onClick={() => { setEditingTask(null); setTaskFormData({ taskName: '', taskCost: '', startDate: '', endDate: '', description: '', status: 'TO_DO', priority: 'LOW', weight: 0, latitude: '', longitude: '', locationIds: [], employeeIds: [] }); setSupportDocument(null); setIsTaskModalOpen(true); }} className="bg-[#0284C7] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all"><Add style={{ fontSize: 18 }} /> New Task</button>
//                     )}
//                 </div>
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                         <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
//                             <tr><th className="px-8 py-4">Task Component</th><th className="px-6 py-4 text-center">Weight</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4">Support Doc.</th><th className="px-8 py-4 text-right">Actions</th></tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-50">
//                             {tasks.length === 0 ? (<tr><td colSpan="5" className="px-8 py-12 text-center text-slate-300 text-xs italic font-bold">No tasks defined.</td></tr>) : tasks.map((task) => {
//                                 // NEW LOGIC: INITIATED tasks are View-Only
//                                 const isInitiatedTask = task.taskTypeProjectStatus === 'INITIATED';
//                                 return (
//                                     <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
//                                         <td className="px-8 py-4">
//                                             <div className="flex flex-col">
//                                                 <div className="flex items-center gap-2">
//                                                     <span className="text-sm font-bold text-slate-700">{task.taskName}</span>
//                                                     {isInitiatedTask && <span className="text-[7px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border uppercase">Initiation</span>}
//                                                 </div>
//                                                 <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1"><Schedule style={{ fontSize: 10 }} /> {task.startDate || 'TBD'} &rarr; {task.endDate || 'TBD'}</span>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-center"><span className="text-xs font-black text-slate-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">{task.weight}%</span></td>
//                                         <td className="px-6 py-4 text-center"><span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${getTaskStatusStyle(task.status)}`}>{task.status.replace(/_/g, ' ')}</span></td>
//                                         <td className="px-6 py-4">
//                                             {task.supportDocument ? (
//                                                 <a href={`http://localhost:8080/api/tasks/download/${task.supportDocument}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#0284C7] hover:text-[#016da3]"><CloudDone style={{ fontSize: 16 }} /> <span className="text-[10px] font-bold border-b border-sky-200 uppercase tracking-tighter">View</span></a>
//                                             ) : <span className="text-[10px] text-slate-300 font-bold uppercase">No Artifact</span>}
//                                         </td>
//                                         <td className="px-8 py-4 text-right">
//                                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                                 <button onClick={() => setViewingTask(task)} className="p-1.5 text-slate-400 hover:text-emerald-600"><Visibility style={{ fontSize: 18 }} /></button>

//                                                 {/* Guarded Buttons: Hide Edit/Delete for Initiation tasks */}
//                                                 {!isInitiatedTask && (can('CAN_EDIT_TASK') || can('CAN_UPDATE_TASK')) && (
//                                                     <button onClick={() => {
//                                                         setEditingTask(task); setTaskFormData({ ...task, employeeIds: task.employeeIds || [], locationIds: task.locationIds || [] }); setSupportDocument(null); setExistingFile(task.supportDocument || ''); setIsTaskModalOpen(true);
//                                                     }} className="p-1.5 text-slate-400 hover:text-[#0284C7]"><Edit style={{ fontSize: 18 }} /></button>
//                                                 )}
//                                                 {!isInitiatedTask && can('CAN_DELETE_TASK') && (
//                                                     <button onClick={() => setDeleteConfig({ show: true, id: task.id, taskName: task.taskName })} className="p-1.5 text-slate-400 hover:text-red-500"><Delete style={{ fontSize: 18 }} /></button>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Preservation: Create/Edit Modal with Registry Suggestion Filter */}
//             {isTaskModalOpen && (
//                 <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-5xl overflow-hidden max-h-[95vh] flex flex-col">
//                         <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
//                             <h3 className="font-black text-slate-800 uppercase tracking-tight">{editingTask ? 'Edit Task Component' : 'Register New Task Component'}</h3>
//                             <button onClick={() => setIsTaskModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button>
//                         </div>
//                         <form onSubmit={handleTaskAction} className="p-8 overflow-y-auto space-y-6 no-scrollbar">
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                 <div className="space-y-4">
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Title (Domain Others Suggestions)</label>
//                                         <div className="relative">
//                                             <input list="task-suggestions-others" value={taskFormData.taskName} onChange={e => {
//                                                 const v = e.target.value; setTaskFormData({ ...taskFormData, taskName: v });
//                                                 const selected = filteredSuggestions.find(t => t.name === v);
//                                                 if (selected) setTaskFormData(prev => ({ ...prev, description: selected.description || prev.description }));
//                                             }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 outline-none focus:border-[#0284C7] text-sm font-bold" required />
//                                             <datalist id="task-suggestions-others">
//                                                 {filteredSuggestions.map(t => <option key={t.id} value={t.name}>{t.projectType} Component</option>)}
//                                             </datalist>
//                                         </div>
//                                     </div>
//                                     {/* Preservation: All inputs from your file remain here */}
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Cost ({project.currencyType})</label><input type="number" step="0.01" value={taskFormData.taskCost} onChange={e => setTaskFormData({ ...taskFormData, taskCost: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-bold" /></div>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weight (%)</label><input type="number" step="0.01" value={taskFormData.weight} onChange={e => setTaskFormData({ ...taskFormData, weight: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-bold" /></div>
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select value={taskFormData.priority} onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label><input type="date" value={taskFormData.startDate} onChange={e => setTaskFormData({ ...taskFormData, startDate: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 font-bold text-sm" required /></div>
//                                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date</label><input type="date" value={taskFormData.endDate} onChange={e => setTaskFormData({ ...taskFormData, endDate: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 font-bold text-sm" required /></div>
//                                     </div>
//                                     <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
//                                         <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase"><Explore style={{ fontSize: 16 }} /> Coordinates</div>
//                                         <div className="grid grid-cols-2 gap-3"><input placeholder="LAT" value={taskFormData.latitude ?? ""} onChange={e => setTaskFormData({ ...taskFormData, latitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono" /><input placeholder="LNG" value={taskFormData.longitude ?? ""} onChange={e => setTaskFormData({ ...taskFormData, longitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono" /></div>
//                                     </div>
//                                 </div>
//                                 <div className="space-y-4">
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label><select value={taskFormData.status} onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="TO_DO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="IN_REVIEW">In Review</option><option value="COMPLETED">Completed</option></select></div>
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Sites</label><select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.locationIds.includes(v)) setTaskFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="">-- Link Site --</option>{projectSites.filter(s => !taskFormData.locationIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><div className="flex flex-wrap gap-1 mt-2">{taskFormData.locationIds.map(id => (<span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-lg text-[9px] font-bold text-slate-600 uppercase">{(projectSites.find(s => s.id === id))?.name || `ID: ${id}`} <button type="button" onClick={() => setTaskFormData(p => ({ ...p, locationIds: p.locationIds.filter(lid => lid !== id) }))}><Close style={{ fontSize: 12 }} /></button></span>))}</div></div>
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Team Members</label><select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.employeeIds.includes(v)) setTaskFormData(p => ({ ...p, employeeIds: [...p.employeeIds, v] })); }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="">-- Assign Person --</option>{projectStaff.filter(s => !taskFormData.employeeIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select><div className="flex flex-wrap gap-1 mt-2">{taskFormData.employeeIds.map(id => (<span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 border border-sky-100 rounded-lg text-[9px] font-bold text-[#0284C7] uppercase">{(projectStaff.find(s => s.id === id))?.fullName || `ID: ${id}`} <button type="button" onClick={() => setTaskFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(eid => eid !== id) }))}><Close style={{ fontSize: 12 }} /></button></span>))}</div></div>
//                                 </div>
//                                 <div className="space-y-4">
//                                     <div className="bg-white rounded-2xl border p-6 space-y-4"><div className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400"><Description fontSize="small" /> Verification Artifact</div><div className="border-2 border-dashed rounded-[28px] p-8 text-center relative cursor-pointer group bg-slate-50/20"><input type="file" onChange={(e) => setSupportDocument(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><UploadFile className="text-slate-100 group-hover:text-[#0284C7] mb-2" style={{ fontSize: 32 }} /><p className="text-[10px] font-bold text-slate-500 group-hover:text-[#0284C7] uppercase">Upload Verification Doc</p></div>{(supportDocument || existingFile) && (<div className="flex items-center gap-2 p-2 rounded-xl border bg-sky-50/30 border-sky-100"><Description className="text-[#0284C7]" /><div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate text-slate-700">{supportDocument ? supportDocument.name : existingFile}</p></div>{supportDocument && <Close onClick={() => setSupportDocument(null)} className="cursor-pointer text-slate-400 hover:text-red-500" style={{ fontSize: 14 }} />}</div>)}</div>
//                                     <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Detailed Scope</label><textarea rows="4" value={taskFormData.description} onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-medium resize-none" placeholder="Explain the execution plan..."></textarea></div>
//                                 </div>
//                             </div>
//                             <button type="submit" className="w-full bg-[#0284C7] text-white py-4 rounded-2xl font-bold uppercase text-[10px] shadow-xl hover:bg-[#016da3] transition-all">Update Task</button>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Preservation: View modal details */}
//             {viewingTask && (
//                 <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col">
//                         <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Visibility style={{ fontSize: 18 }} /></div><h3 className="font-black text-slate-800 uppercase tracking-tight">Task Details</h3></div><button onClick={() => setViewingTask(null)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button></div>
//                         <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar">
//                             <div className="grid grid-cols-2 gap-6">
//                                 <div className="col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Task Name</p><p className="text-lg font-black text-slate-800 leading-tight">{viewingTask.taskName}</p></div>
//                                 <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Status</p><span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getTaskStatusStyle(viewingTask.status)}`}>{viewingTask.status?.replace(/_/g, ' ')}</span></div>
//                                 <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Priority</p><span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase">{viewingTask.priority}</span></div>
//                                 <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Contribution</p><p className="text-sm font-bold text-slate-700">{viewingTask.weight}% Weight</p></div>
//                                 <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Cost Projection</p><p className="text-sm font-bold text-slate-700">{project.currencyType} {viewingTask.taskCost?.toLocaleString()}</p></div>
//                                 <div className="col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Team Assigned</p><div className="flex flex-wrap gap-2">{viewingTask.employeeNames?.map((name, i) => (<span key={i} className="px-2 py-1 bg-sky-50 text-[#0284C7] text-[10px] font-bold rounded-lg border border-sky-100 uppercase">{name}</span>))}</div></div>
//                                 <div className="col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Active Sites</p><div className="flex flex-wrap gap-2">{viewingTask.locationNames?.map((loc, i) => (<span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 uppercase">{loc}</span>))}</div></div>
//                                 <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Explore style={{ fontSize: 14 }} /> Coordinates</p><p className="text-xs font-mono text-slate-600">LAT: {viewingTask.latitude || '0.0'} / LNG: {viewingTask.longitude || '0.0'}</p></div>
//                                 <div className="col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Scope Details</p><p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border italic leading-relaxed whitespace-pre-line">{viewingTask.description || 'N/A'}</p></div>
//                             </div>
//                         </div>
//                         <div className="p-6 bg-slate-50/50 border-t flex justify-end"><button onClick={() => setViewingTask(null)} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Dismiss</button></div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProjectDetails;













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

    // --- Form State (Aligned with CreateTaskRequestDTO) ---
    const [taskFormData, setTaskFormData] = useState({
        taskTypeId: '', // Mandatory for selection
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

                // Preservation: Timeline Extension & Final Date Logic
                const extensions = rawProject.extensions || [];
                const totalDays = extensions.reduce((sum, ext) => sum + (Number(ext.extendedDays) || 0), 0);

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

    // Logic: Only show 'OTHERS' task types that match current Project Type
    useEffect(() => {
        if (isTaskModalOpen && project && taskTypeRegistry.length > 0) {
            const filtered = taskTypeRegistry.filter(
                t => t.projectType === project.projectType && t.taskTypeProjectStatus === 'OTHERS'
            );
            setFilteredTaskTypes(filtered);
        }
    }, [isTaskModalOpen, project, taskTypeRegistry]);

    const projectStaff = useMemo(() => {
        if (!project) return [];
        const ids = project.employeeIds || [];
        const names = project.employeeNames || [];
        return ids.map((eid, i) => ({
            id: eid,
            fullName: names[i] || "Staff Member"
        })).filter(e => e.fullName.toLowerCase().includes(teamSearch.toLowerCase()));
    }, [project, teamSearch]);

    const projectSites = useMemo(() => {
        if (!project) return [];
        return (project.locationIds || []).map((lid, i) => ({
            id: lid,
            name: project.locationNames?.[i] || `Site ${lid}`
        }));
    }, [project]);

    const handleTaskAction = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // Requirement: DTO Payload Construction
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

            if (supportDocument instanceof File) {
                formData.append("supportDocument", supportDocument);
            }

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
    if (!project) return <div className="p-20 text-center font-bold text-slate-300 tracking-widest uppercase">Project Not Found</div>;

    return (
        <div className="w-full space-y-6 pb-20 px-4 animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Delete Modal */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] p-10 max-w-sm w-full mx-4 text-center border shadow-2xl">
                        <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-black uppercase tracking-tight">Remove Task</h3>
                        <p className="text-sm text-slate-500 mt-3">Delete <b>{deleteConfig.taskName}</b> from implementation registry?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setDeleteConfig({ show: false, id: null, taskName: '' })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDeleteTask} className="flex-1 px-4 py-3 bg-red-500 text-white font-bold text-[10px] uppercase shadow-lg shadow-red-100 active:scale-95 transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Profiling */}
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
                <div className="flex gap-8">
                    <div className="text-right border-r pr-8 border-slate-100"><p className="text-[9px] font-bold text-slate-400 uppercase">Status</p><span className="text-xs font-black text-[#0284C7] uppercase">{project.status}</span></div>
                    <div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Final Deadline</p><span className={`text-sm font-black ${project.totalExtendedDays > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{new Date(project.finalEndDate).toLocaleDateString()}</span></div>
                </div>
            </div>

            {/* Financial and Detail Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Payment fontSize="small" /> Financial Context</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Contract Sum</p><p className="text-lg font-black text-slate-900">{project.currencyType} {project.budget?.toLocaleString()}</p></div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase">Expenditure</p><p className="text-lg font-black text-[#0284C7]">{project.currencyType} {project.budgetUsed?.toLocaleString()}</p></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm"><div className="flex items-center gap-2 mb-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Info fontSize="small" /> Project Description</div><p className="text-xs text-slate-500 italic line-clamp-3 leading-relaxed">{project.description || 'No description provided.'}</p></div>
                </div>
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4 h-full">
                        <div className="flex items-center gap-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Engineering fontSize="small" /> Real-time Progress</div>
                        <ProgressPie progress={project.projectProgress || 0} />
                        <div className="pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Badge className="text-sky-500" style={{ fontSize: 16 }} /><div><p className="text-[8px] font-bold text-slate-400 uppercase">Project Lead</p><p className="text-xs font-bold text-slate-700">{project.projectManagerName}</p></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Registry Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><Assignment /></div><div><h2 className="text-lg font-bold text-slate-900 leading-none">Task Registry</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lifecycle Tracking</p></div></div>
                    {can('CAN_CREATE_TASK') && (
                        <button onClick={() => { setEditingTask(null); setTaskFormData({ taskTypeId: '', taskCost: '', startDate: '', endDate: '', description: '', status: 'TO_DO', priority: 'MEDIUM', weight: 0, latitude: '', longitude: '', locationIds: [], employeeIds: [] }); setSupportDocument(null); setIsTaskModalOpen(true); }} className="bg-[#0284C7] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase shadow-lg active:scale-95 transition-all"><Add /> New Task</button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <tr><th className="px-8 py-4">Task Component</th><th className="px-6 py-4 text-center">Weight</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4">Support Doc.</th><th className="px-8 py-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tasks.length === 0 ? (<tr><td colSpan="5" className="px-8 py-12 text-center text-slate-300 text-xs italic font-bold">No tasks registered.</td></tr>) : tasks.map((task) => {
                                const isInitiatedTask = task.taskTypeProjectStatus === 'INITIATED';
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
                                                {!isInitiatedTask && (can('CAN_EDIT_TASK') || can('CAN_UPDATE_TASK')) && (
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

            {/* Task Editor Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-5xl overflow-hidden max-h-[95vh] flex flex-col">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">{editingTask ? 'Edit Implementation Task' : 'Register Task'}</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button>
                        </div>
                        <form onSubmit={handleTaskAction} className="p-8 overflow-y-auto space-y-6 no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Definition (Standard Blueprints) *</label>
                                        <select
                                            required
                                            value={taskFormData.taskTypeId}
                                            onChange={e => setTaskFormData({ ...taskFormData, taskTypeId: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-[#0284C7] appearance-none"
                                        >
                                            <option value="">-- Select Component --</option>
                                            {filteredTaskTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cost Projection ({project.currencyType})</label><input type="number" step="0.01" value={taskFormData.taskCost} onChange={e => setTaskFormData({ ...taskFormData, taskCost: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weight (%)</label><input type="number" step="0.01" value={taskFormData.weight} onChange={e => setTaskFormData({ ...taskFormData, weight: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold" /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select value={taskFormData.priority} onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label><input type="date" value={taskFormData.startDate} onChange={e => setTaskFormData({ ...taskFormData, startDate: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 font-bold text-sm" required /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date</label><input type="date" value={taskFormData.endDate} onChange={e => setTaskFormData({ ...taskFormData, endDate: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 font-bold text-sm" required /></div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase"><Explore style={{ fontSize: 16 }} /> Coordinates (Optional)</div>
                                        <div className="grid grid-cols-2 gap-3"><input placeholder="LAT" value={taskFormData.latitude ?? ""} onChange={e => setTaskFormData({ ...taskFormData, latitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono outline-none" /><input placeholder="LNG" value={taskFormData.longitude ?? ""} onChange={e => setTaskFormData({ ...taskFormData, longitude: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-mono outline-none" /></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Execution Status</label><select value={taskFormData.status} onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase"><option value="TO_DO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="IN_REVIEW">In Review</option><option value="COMPLETED">Completed</option></select></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Linked Sites</label><select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.locationIds.includes(v)) setTaskFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase outline-none"><option value="">-- Link --</option>{projectSites.filter(s => !taskFormData.locationIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><div className="flex flex-wrap gap-1 mt-2">{taskFormData.locationIds.map(id => (<span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-lg text-[9px] font-bold text-slate-600">{(projectSites.find(s => s.id === id))?.name} <button type="button" onClick={() => setTaskFormData(p => ({ ...p, locationIds: p.locationIds.filter(lid => lid !== id) }))}><Close style={{ fontSize: 12 }} /></button></span>))}</div></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Field Personnel</label><select onChange={(e) => { const v = Number(e.target.value); if (v && !taskFormData.employeeIds.includes(v)) setTaskFormData(p => ({ ...p, employeeIds: [...p.employeeIds, v] })); }} className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold uppercase outline-none"><option value="">-- Assign --</option>{projectStaff.filter(s => !taskFormData.employeeIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select><div className="flex flex-wrap gap-1 mt-2">{taskFormData.employeeIds.map(id => (<span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 border border-sky-100 rounded-lg text-[9px] font-bold text-[#0284C7]">{(projectStaff.find(s => s.id === id))?.fullName} <button type="button" onClick={() => setTaskFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(eid => eid !== id) }))}><Close style={{ fontSize: 12 }} /></button></span>))}</div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl border p-6 space-y-4"><div className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400"><Description fontSize="small" /> Verification Doc</div><div className="border-2 border-dashed rounded-[28px] p-8 text-center relative cursor-pointer group bg-slate-50/20"><input type="file" onChange={(e) => setSupportDocument(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><UploadFile className="text-slate-100 group-hover:text-[#0284C7] mb-2" style={{ fontSize: 32 }} /><p className="text-[10px] font-bold text-slate-500 group-hover:text-[#0284C7] uppercase">Upload Artifact</p></div>{(supportDocument || existingFile) && (<div className="flex items-center gap-2 p-2 rounded-xl border bg-sky-50/30 border-sky-100"><Description className="text-[#0284C7]" /><div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate text-slate-700">{supportDocument ? supportDocument.name : existingFile}</p></div>{supportDocument && <Close onClick={() => setSupportDocument(null)} className="cursor-pointer text-slate-400 hover:text-red-500" style={{ fontSize: 14 }} />}</div>)}</div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Scope Details</label><textarea rows="4" value={taskFormData.description} onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium resize-none focus:border-[#0284C7] outline-none" placeholder="Explain objectives..." /></div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#0284C7] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Update Registry</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Read-Only Viewing Modal */}
            {viewingTask && (
                <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl border w-full max-w-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3"><Visibility className="text-emerald-500" /><h3 className="font-black text-slate-800 uppercase tracking-tight">Task Dossier</h3></div>
                            <button onClick={() => setViewingTask(null)} className="p-2 hover:bg-white rounded-full"><Close /></button>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Component Name</p><p className="text-xl font-black text-slate-800">{viewingTask.taskName}</p></div>
                                <span className={`text-[10px] font-black px-4 py-2 rounded-xl border uppercase ${getTaskStatusStyle(viewingTask.status)}`}>{viewingTask.status.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weighting</p><p className="text-sm font-bold text-slate-700">{viewingTask.weight}% Contribution</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Planned Cost</p><p className="text-sm font-bold text-slate-700">{project.currencyType} {viewingTask.taskCost?.toLocaleString()}</p></div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Scope Justification</p><p className="text-xs text-slate-600 italic leading-relaxed">"{viewingTask.description || 'No additional scope details provided.'}"</p></div>
                        </div>
                        <div className="p-8 border-t bg-slate-50/30 flex justify-end"><button onClick={() => setViewingTask(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Dismiss</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;