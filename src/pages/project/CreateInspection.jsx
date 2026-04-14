// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import {
//     ArrowBack, Save, FactCheck, HelpOutline, Layers,
//     Description, Person, LocationCity, EventNote,
//     MyLocation, CloudUpload, AttachFile, DeleteOutline
// } from '@mui/icons-material';
// import adminApi from '../../api/modules/admin';
// import projectApi from '../../api/modules/project';
// import taskApi from '../../api/modules/task';
// import AlertMessage from '../../components/Reusable/AlertMessage';
// import { useAuth } from '../../context/AuthContext';

// export default function CreateInspection() {
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const { user: currentUser, can } = useAuth();
//     const isEdit = Boolean(id);

//     const [formData, setFormData] = useState({
//         inspectionTypeId: '',
//         inspectionLevel: 'PROJECT',
//         projectId: '',
//         taskId: '',
//         inspectionDate: new Date().toISOString().split('T')[0],
//         inspectionResult: '',
//         weatherCondition: '',
//         activeWorkers: '',
//         latitude: '',
//         longitude: ''
//     });

//     const [myProjects, setMyProjects] = useState([]);
//     const [allMyTasks, setAllMyTasks] = useState([]);
//     const [inspectionTemplates, setInspectionTemplates] = useState([]);
//     const [selectedProject, setSelectedProject] = useState(null);
//     const [cityName, setCityName] = useState('...');
//     const [selectedFiles, setSelectedFiles] = useState([]);

//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [showConfirm, setShowConfirm] = useState(false);
//     const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

//     const showAlert = (type, message) => {
//         setAlert({ show: true, type, message });
//         if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
//     };

//     useEffect(() => {
//         const initData = async () => {
//             try {
//                 const [pRes, tRes, typeRes, cityRes] = await Promise.all([
//                     projectApi.GET_MY_PROJECTS({ size: 1000 }),
//                     taskApi.GET_MY_TASKS(),
//                     adminApi.GET_INSPECTION_TYPES(),
//                     adminApi.GET_CITY()
//                 ]);

//                 const projects = pRes.data?.data?.content || [];
//                 setMyProjects(projects);
//                 setAllMyTasks(tRes.data?.data || []);
//                 setInspectionTemplates(typeRes.data?.data || typeRes.data || []);
//                 setCityName(cityRes.data || cityRes);

//                 if (isEdit) {
//                     const logRes = await projectApi.GET_INSPECTION_LOG(id);
//                     const d = logRes.data?.data || logRes.data;
//                     setFormData({
//                         ...d,
//                         projectId: String(d.projectId || ''),
//                         taskId: String(d.taskId || ''),
//                         inspectionTypeId: String(d.inspectionTypeId || ''),
//                         activeWorkers: String(d.activeWorkers || ''),
//                         latitude: String(d.latitude || ''),
//                         longitude: String(d.longitude || ''),
//                         inspectionDate: new Date().toISOString().split('T')[0]
//                     });
//                     const context = projects.find(p => p.id === d.projectId);
//                     setSelectedProject(context);
//                 }
//             } catch (err) {
//                 showAlert('error', 'Context initialization failed.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         initData();
//     }, [id, isEdit]);

//     const filteredTasks = useMemo(() => {
//         if (!formData.projectId) return [];
//         return allMyTasks.filter(t => Number(t.projectId) === Number(formData.projectId));
//     }, [formData.projectId, allMyTasks]);

//     const filteredTemplates = useMemo(() => {
//         if (!selectedProject) return [];
//         return inspectionTemplates.filter(t => t.projectType === selectedProject.projectType);
//     }, [selectedProject, inspectionTemplates]);

//     const handleProjectChange = (projId) => {
//         const proj = myProjects.find(p => String(p.id) === String(projId));
//         setSelectedProject(proj);
//         setFormData(prev => ({ ...prev, projectId: projId, taskId: '', inspectionTypeId: '' }));
//     };

//     const handleFileSelect = (e) => {
//         const files = Array.from(e.target.files);
//         setSelectedFiles(prev => [...prev, ...files]);
//     };

//     const removeFile = (index) => {
//         setSelectedFiles(prev => prev.filter((_, i) => i !== index));
//     };

//     const handleSaveTrigger = () => {
//         const { projectId, inspectionTypeId, inspectionResult, weatherCondition, activeWorkers, inspectionLevel, taskId } = formData;
//         if (!projectId || !inspectionTypeId || !inspectionResult.trim() || !weatherCondition || !activeWorkers) {
//             showAlert('error', 'Please fill all required fields (*).');
//             return;
//         }
//         if (inspectionLevel === 'TASK' && !taskId) {
//             showAlert('error', 'Please select a specific Task.');
//             return;
//         }
//         setShowConfirm(true);
//     };

//     const executeSave = async () => {
//         setShowConfirm(false);
//         setSaving(true);
//         try {
//             // 1. Create the Payload Object
//             const payload = {
//                 inspectionTypeId: Number(formData.inspectionTypeId),
//                 inspectionLevel: formData.inspectionLevel,
//                 weatherCondition: formData.weatherCondition,
//                 projectId: Number(formData.projectId),
//                 taskId: formData.taskId ? Number(formData.taskId) : null,
//                 inspectionDate: formData.inspectionDate,
//                 inspectionResult: formData.inspectionResult.trim(),
//                 activeWorkers: Number(formData.activeWorkers),
//                 latitude: formData.latitude,
//                 longitude: formData.longitude
//             };

//             // 2. Wrap in FormData to include actual files
//             const bodyFormData = new FormData();
//             bodyFormData.append('data', JSON.stringify(payload));
//             selectedFiles.forEach(file => {
//                 bodyFormData.append('files', file);
//             });

//             // 3. Send to API
//             if (isEdit) await projectApi.UPDATE_INSPECTION_LOG(id, bodyFormData);
//             else await projectApi.CREATE_INSPECTION_LOG(bodyFormData);

//             showAlert('success', `Log ${isEdit ? 'updated' : 'created'} successfully!`);
//             setTimeout(() => navigate('/inspections'), 2000);
//         } catch (err) {
//             showAlert('error', err.response?.data?.message || 'Upload failed.');
//             setSaving(false);
//         }
//     };

//     if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Establishing Context...</div>;

//     return (
//         <div className="w-full space-y-6 pb-12 px-4 relative animate-fadeIn">
//             {showConfirm && (
//                 <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
//                     <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
//                         <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
//                         <h3 className="text-xl font-bold uppercase tracking-tight">Confirm Save</h3>
//                         <p className="text-sm text-slate-500 mt-2">Commit log and upload documents?</p>
//                         <div className="flex gap-4 mt-10">
//                             <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-bold uppercase hover:bg-slate-50">Cancel</button>
//                             <button onClick={executeSave} className="flex-1 px-4 py-3 bg-[#0284C7] text-white rounded-2xl font-bold text-[11px] uppercase shadow-lg">Confirm</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

//             <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => navigate('/inspections')} className="p-2.5 bg-slate-50 border rounded-2xl hover:bg-slate-100"><ArrowBack fontSize="small" /></button>
//                     <div>
//                         <h1 className="text-xl font-bold text-slate-900 leading-none">{isEdit ? 'Update Entry' : 'New Quality Check'}</h1>
//                         <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Standardized Entry</p>
//                     </div>
//                 </div>
//                 {can('CAN_UPDATE_INSPECTION') && (
//                     <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 shadow-xl disabled:opacity-50 uppercase tracking-widest">
//                         <Save style={{ fontSize: 20 }} /> {saving ? 'SAVING...' : 'SAVE LOG'}
//                     </button>
//                 )}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//                 <div className="lg:col-span-4 space-y-6">
//                     <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
//                         <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><Layers className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Scope Selection</span></div>
//                         <div className="p-6 space-y-5">
//                             <div className="space-y-2">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Level *</label>
//                                 <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
//                                     {['PROJECT', 'TASK'].map(lvl => (
//                                         <button key={lvl} onClick={() => setFormData({ ...formData, inspectionLevel: lvl, taskId: '' })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.inspectionLevel === lvl ? 'bg-white text-[#0284C7] shadow-sm border border-slate-200' : 'text-slate-400'}`}>{lvl}</button>
//                                     ))}
//                                 </div>
//                             </div>
//                             <div className="space-y-2">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project *</label>
//                                 <select value={formData.projectId} onChange={e => handleProjectChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none">
//                                     <option value="">-- Select Project --</option>
//                                     {myProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
//                                 </select>
//                             </div>
//                             {formData.inspectionLevel === 'TASK' && (
//                                 <div className="space-y-2 animate-fadeIn">
//                                     <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task *</label>
//                                     <select value={formData.taskId} onChange={e => setFormData({ ...formData, taskId: e.target.value })} disabled={!formData.projectId} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none disabled:opacity-50">
//                                         <option value="">-- Choose Task --</option>
//                                         {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.taskName}</option>)}
//                                     </select>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
//                         <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><EventNote className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Entry Metrics</span></div>
//                         <div className="p-6 space-y-5">
//                             <div className="space-y-1">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weather *</label>
//                                 <select value={formData.weatherCondition} onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })} className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl bg-slate-50">
//                                     <option value="">-- Weather --</option>
//                                     {['SUNNY', 'CLOUD', 'RAIN', 'WINDY', 'STORM', 'SNOW', 'UNKNOWN'].map(w => <option key={w} value={w}>{w}</option>)}
//                                 </select>
//                             </div>
//                             <div className="space-y-1">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Workers *</label>
//                                 <input type="number" value={formData.activeWorkers} onChange={(e) => setFormData({ ...formData, activeWorkers: e.target.value })} className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl bg-slate-50" placeholder="Count" />
//                             </div>
//                             <div className="space-y-1">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Entry Date (Locked)</label>
//                                 <input type="date" value={formData.inspectionDate} readOnly className="w-full text-sm font-bold px-4 py-3 border border-slate-100 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed" />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="lg:col-span-8 space-y-6">
//                     <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm h-fit">
//                         <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><Description className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Observations</span></div>
//                         <div className="p-8 space-y-6">
//                             <div className="space-y-2">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Template *</label>
//                                 <select value={formData.inspectionTypeId} onChange={e => setFormData({ ...formData, inspectionTypeId: e.target.value })} disabled={!selectedProject} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none disabled:opacity-50">
//                                     <option value="">-- Choose Template --</option>
//                                     {filteredTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//                                 </select>
//                             </div>
//                             <div className="space-y-2">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Results *</label>
//                                 <textarea rows="6" value={formData.inspectionResult} onChange={e => setFormData({ ...formData, inspectionResult: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-6 py-5 text-sm font-medium outline-none" placeholder="Enter formal findings..."></textarea>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {/* GPS FORM */}
//                         <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm h-fit">
//                             <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><MyLocation className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">GPS Entry</span></div>
//                             <div className="p-6 space-y-4">
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div className="space-y-1">
//                                         <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Lat</label>
//                                         <input type="text" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} placeholder="0.000000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
//                                     </div>
//                                     <div className="space-y-1">
//                                         <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Long</label>
//                                         <input type="text" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} placeholder="0.000000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* DOCUMENT UPLOAD FORM */}
//                         <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm h-fit">
//                             <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><CloudUpload className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Documents</span></div>
//                             <div className="p-6">
//                                 <div className="relative border-2 border-dashed border-slate-100 rounded-2xl p-4 text-center hover:bg-slate-50 transition-all cursor-pointer group">
//                                     <input type="file" multiple onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
//                                     <AttachFile className="text-slate-300 group-hover:text-[#0284C7] mb-1" />
//                                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Add Attachments</p>
//                                 </div>
//                                 <div className="mt-3 space-y-1 max-h-24 overflow-y-auto">
//                                     {selectedFiles.map((file, idx) => (
//                                         <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
//                                             <span className="text-[9px] font-bold text-slate-600 truncate max-w-[120px]">{file.name}</span>
//                                             <button onClick={() => removeFile(idx)} className="text-red-400"><DeleteOutline style={{ fontSize: 16 }} /></button>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }









import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, FactCheck, HelpOutline, Layers,
    Description, Person, LocationCity, EventNote,
    MyLocation, CloudUpload, AttachFile, DeleteOutline, Visibility, Close
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import projectApi from '../../api/modules/project';
import taskApi from '../../api/modules/task';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function CreateInspection() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user: currentUser, can } = useAuth();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        inspectionTypeId: '',
        inspectionLevel: 'PROJECT',
        projectId: '',
        taskId: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionResult: '',
        weatherCondition: '',
        activeWorkers: '',
        latitude: '',
        longitude: '',
        inspectionDocumentUrl: ''
    });

    const [myProjects, setMyProjects] = useState([]);
    const [allMyTasks, setAllMyTasks] = useState([]);
    const [inspectionTemplates, setInspectionTemplates] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [cityName, setCityName] = useState('...');
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        const initData = async () => {
            try {
                const [pRes, tRes, typeRes, cityRes] = await Promise.all([
                    projectApi.GET_MY_PROJECTS({ size: 1000 }),
                    taskApi.GET_MY_TASKS(),
                    adminApi.GET_INSPECTION_TYPES(),
                    adminApi.GET_CITY()
                ]);

                const projects = pRes.data?.data?.content || [];
                setMyProjects(projects);
                setAllMyTasks(tRes.data?.data || []);
                setInspectionTemplates(typeRes.data?.data || typeRes.data || []);
                setCityName(cityRes.data || cityRes);

                if (isEdit) {
                    const logRes = await projectApi.GET_INSPECTION_LOG(id);
                    const d = logRes.data?.data || logRes.data;
                    setFormData({
                        ...d,
                        projectId: String(d.projectId || ''),
                        taskId: String(d.taskId || ''),
                        inspectionTypeId: String(d.inspectionTypeId || ''),
                        activeWorkers: String(d.activeWorkers || ''),
                        latitude: String(d.latitude || ''),
                        longitude: String(d.longitude || ''),
                        inspectionDocumentUrl: d.inspectionDocumentUrl || '',
                        inspectionDate: new Date().toISOString().split('T')[0]
                    });
                    const context = projects.find(p => p.id === d.projectId);
                    setSelectedProject(context);
                }
            } catch (err) {
                showAlert('error', 'Initialization error: Context unavailable.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id, isEdit]);

    const filteredTasks = useMemo(() => {
        if (!formData.projectId) return [];
        return allMyTasks.filter(t => Number(t.projectId) === Number(formData.projectId));
    }, [formData.projectId, allMyTasks]);

    const filteredTemplates = useMemo(() => {
        if (!selectedProject) return [];
        return inspectionTemplates.filter(t => t.projectType === selectedProject.projectType);
    }, [selectedProject, inspectionTemplates]);

    const handleProjectChange = (projId) => {
        const proj = myProjects.find(p => String(p.id) === String(projId));
        setSelectedProject(proj);
        setFormData(prev => ({ ...prev, projectId: projId, taskId: '', inspectionTypeId: '' }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveTrigger = () => {
        const { projectId, inspectionTypeId, inspectionResult, weatherCondition, activeWorkers, inspectionLevel, taskId } = formData;
        if (!projectId || !inspectionTypeId || !inspectionResult.trim() || !weatherCondition || !activeWorkers) {
            showAlert('error', 'Required validation failed: All fields marked with * must be filled.');
            return;
        }
        if (inspectionLevel === 'TASK' && !taskId) {
            showAlert('error', 'Please select a specific Task.');
            return;
        }
        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const payload = {
                inspectionTypeId: Number(formData.inspectionTypeId),
                inspectionLevel: formData.inspectionLevel,
                weatherCondition: formData.weatherCondition,
                projectId: Number(formData.projectId),
                taskId: formData.taskId ? Number(formData.taskId) : null,
                inspectionDate: formData.inspectionDate,
                inspectionResult: formData.inspectionResult.trim(),
                activeWorkers: Number(formData.activeWorkers),
                latitude: formData.latitude,
                longitude: formData.longitude
            };

            const bodyFormData = new FormData();
            bodyFormData.append('data', JSON.stringify(payload));
            selectedFiles.forEach(file => {
                bodyFormData.append('files', file);
            });

            if (isEdit) await projectApi.UPDATE_INSPECTION_LOG(id, bodyFormData);
            else await projectApi.CREATE_INSPECTION_LOG(bodyFormData);

            showAlert('success', `Success: Inspection log has been ${isEdit ? 'updated' : 'created'} successfully.`);
            setTimeout(() => navigate('/inspections'), 2000);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction rejected by server.');
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Establishing QA Context...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-4 relative animate-fadeIn">
            {/* Save Confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-bold uppercase tracking-tight">Save Entry</h3>
                        <p className="text-sm text-slate-500 mt-2">Commit log and upload documents to registry?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-bold uppercase hover:bg-slate-50">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 bg-[#0284C7] text-white rounded-2xl font-bold text-[11px] uppercase shadow-lg hover:bg-[#0369a1]">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fadeIn p-4 sm:p-10">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative border animate-scaleUp">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <AttachFile className="text-[#0284C7]" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Document Registry Preview</h3>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Close style={{ fontSize: 20 }} /></button>
                        </div>
                        <div className="flex-1 bg-slate-100">
                            <iframe src={formData.inspectionDocumentUrl} title="Document Preview" className="w-full h-full border-none" />
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/inspections')} className="p-2.5 bg-slate-50 border rounded-2xl hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">{isEdit ? 'Update Entry' : 'New Quality Check'}</h1>
                        <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Standardized QC Entry</p>
                    </div>
                </div>
                {can('CAN_UPDATE_INSPECTION') && (
                    <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 hover:bg-[#0369a1] active:scale-95 transition-all shadow-xl disabled:opacity-50 uppercase tracking-widest">
                        <Save style={{ fontSize: 20 }} /> {saving ? 'SAVING...' : 'SAVE LOG'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><Layers className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Target Scope</span></div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Log Level *</label>
                                <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                                    {['PROJECT', 'TASK'].map(lvl => (
                                        <button key={lvl} onClick={() => setFormData({ ...formData, inspectionLevel: lvl, taskId: '' })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.inspectionLevel === lvl ? 'bg-white text-[#0284C7] shadow-sm border border-slate-200' : 'text-slate-400'}`}>{lvl}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Assigned Project *</label>
                                <select value={formData.projectId} onChange={e => handleProjectChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none cursor-pointer">
                                    <option value="">-- Choose Project --</option>
                                    {myProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                            {formData.inspectionLevel === 'TASK' && (
                                <div className="space-y-2 animate-fadeIn">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task *</label>
                                    <select value={formData.taskId} onChange={e => setFormData({ ...formData, taskId: e.target.value })} disabled={!formData.projectId} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none disabled:opacity-50">
                                        <option value="">-- Select Task --</option>
                                        {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.taskName}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <LocationCity className="text-slate-300" style={{ fontSize: 20 }} />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Registry Location</p>
                                    <p className="text-xs font-black text-slate-600 uppercase">{cityName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><EventNote className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Entry Metrics</span></div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weather *</label>
                                <select value={formData.weatherCondition} onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })} className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl bg-slate-50">
                                    <option value="">-- Select Weather --</option>
                                    {['SUNNY', 'CLOUD', 'RAIN', 'WINDY', 'STORM', 'SNOW', 'UNKNOWN'].map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Active Workers *</label>
                                <input type="number" value={formData.activeWorkers} onChange={(e) => setFormData({ ...formData, activeWorkers: e.target.value })} className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl bg-slate-50" placeholder="Number" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Log Date (Locked)</label>
                                <input type="date" value={formData.inspectionDate} readOnly className="w-full text-sm font-bold px-4 py-3 border border-slate-100 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm h-fit">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><Description className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Observations</span></div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Template Type *</label>
                                <select value={formData.inspectionTypeId} onChange={e => setFormData({ ...formData, inspectionTypeId: e.target.value })} disabled={!selectedProject} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none disabled:opacity-50">
                                    <option value="">-- Select Template --</option>
                                    {filteredTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Result Findings *</label>
                                <textarea rows="6" value={formData.inspectionResult} onChange={e => setFormData({ ...formData, inspectionResult: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-6 py-5 text-sm font-medium outline-none" placeholder="Enter formal findings..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* GPS Coordinate Form */}
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm h-fit">
                            <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><MyLocation className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">GPS Entry</span></div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Latitude</label>
                                        <input type="text" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} placeholder="0.000000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#0284C7]" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Longitude</label>
                                        <input type="text" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} placeholder="0.000000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#0284C7]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Uploading Form */}
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm h-fit">
                            <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><CloudUpload className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Documents</span></div>
                            <div className="p-6">
                                {formData.inspectionDocumentUrl && (
                                    <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between group animate-fadeIn">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <AttachFile className="text-blue-400 shrink-0" style={{ fontSize: 20 }} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-blue-800 uppercase">Registry File</span>
                                                <span className="text-[11px] text-blue-600 truncate">Reference Document</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowPreview(true)} className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-90 flex items-center gap-2 px-4">
                                            <Visibility style={{ fontSize: 16 }} />
                                            <span className="text-[9px] font-bold uppercase">View</span>
                                        </button>
                                    </div>
                                )}
                                <div className="relative border-2 border-dashed border-slate-100 rounded-2xl p-4 text-center hover:bg-slate-50 transition-all cursor-pointer group">
                                    <input type="file" multiple onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <AttachFile className="text-slate-300 group-hover:text-[#0284C7] mb-1" />
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Select Evidence Files</p>
                                </div>
                                <div className="mt-3 space-y-1 max-h-24 overflow-y-auto">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <span className="text-[9px] font-bold text-slate-600 truncate max-w-[120px]">{file.name}</span>
                                            <button onClick={() => removeFile(idx)} className="text-red-400"><DeleteOutline style={{ fontSize: 16 }} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}