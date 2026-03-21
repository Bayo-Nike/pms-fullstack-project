import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, FactCheck, HelpOutline, Layers,
    Assignment, Description, Person, Engineering, Business,
    LocationCity, EventNote
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import projectApi from '../../api/modules/project';
import taskApi from '../../api/modules/task';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function CreateInspection() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user: currentUser } = useAuth(); // Contains employeeId
    const { can } = useAuth(); // Authorization check
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        inspectionTypeId: '',
        inspectionLevel: 'PROJECT', // PROJECT or TASK
        projectId: '',
        taskId: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionResult: ''
    });

    // Data Lookups
    const [myProjects, setMyProjects] = useState([]);
    const [allMyTasks, setAllMyTasks] = useState([]);
    const [inspectionTemplates, setInspectionTemplates] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [cityName, setCityName] = useState('...');

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        const initData = async () => {
            try {
                // parallel fetch of authorized context
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
                        employeeId: String(d.employeeId || currentUser?.employeeId || '')
                    });

                    const context = projects.find(p => p.id === d.projectId);
                    setSelectedProject(context);
                }
            } catch (err) {
                showAlert('error', 'Initialization error: Assigned context unavailable.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id, isEdit, currentUser]);

    // Filter Logic
    const filteredTasks = useMemo(() => {
        if (!formData.projectId) return [];
        return allMyTasks.filter(t => Number(t.projectId) === Number(formData.projectId));
    }, [formData.projectId, allMyTasks]);

    const filteredTemplates = useMemo(() => {
        if (!selectedProject) return [];
        // Only show templates matching selected project type (BUILDING / WATER_AND_ROAD)
        return inspectionTemplates.filter(t => t.projectType === selectedProject.projectType);
    }, [selectedProject, inspectionTemplates]);

    const handleProjectChange = (projId) => {
        const proj = myProjects.find(p => String(p.id) === String(projId));
        setSelectedProject(proj);
        setFormData(prev => ({ ...prev, projectId: projId, taskId: '', inspectionTypeId: '' }));
    };

    const handleSaveTrigger = () => {
        const { projectId, inspectionTypeId, inspectionResult, inspectionLevel, taskId } = formData;

        if (!projectId || !inspectionTypeId || !inspectionResult.trim()) {
            showAlert('error', 'Required validation failed: Project, Template Type, and Results must be filled.');
            return;
        }
        if (inspectionLevel === 'TASK' && !taskId) {
            showAlert('error', 'Context Error: Please select the specific Task Component.');
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
                projectId: Number(formData.projectId),
                taskId: formData.taskId ? Number(formData.taskId) : null,
                employeeId: Number(formData.employeeId),
                inspectionDate: formData.inspectionDate,
                inspectionResult: formData.inspectionResult.trim()
            };

            console.log(payload);
            if (isEdit) await projectApi.UPDATE_INSPECTION_LOG(id, payload);
            
            else await projectApi.CREATE_INSPECTION_LOG(payload);

            navigate('/inspections');
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction rejected by server.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Establishing QA Context...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-4 relative animate-fadeIn">
            {showConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-bold uppercase tracking-tight">Save Entry</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Save this inspection record to the permanent registry?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 bg-[#0284C7] text-white rounded-2xl font-bold text-[11px] uppercase shadow-lg">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/inspections')} className="p-2.5 bg-slate-50 border rounded-2xl hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">{isEdit ? 'Update Results' : 'Perform Quality Check'}</h1>
                        <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Standardized QC Entry</p>
                    </div>
                </div>
                {
                    can('CAN_UPDATE_INSPECTION') && (
                        <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 hover:bg-[#0369a1] active:scale-95 transition-all shadow-xl disabled:opacity-50 uppercase tracking-widest">
                            <Save style={{ fontSize: 20 }} /> {saving ? 'SAVING...' : 'COMMIT LOG'}
                        </button>
                    )
                }

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* COLUMN 1: TARGETING */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><Layers className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Target Scope</span></div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Log Level</label>
                            <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                                {['PROJECT', 'TASK'].map(lvl => (
                                    <button key={lvl} onClick={() => setFormData({ ...formData, inspectionLevel: lvl, taskId: '' })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.inspectionLevel === lvl ? 'bg-white text-[#0284C7] shadow-sm border border-slate-200' : 'text-slate-400'}`}>{lvl}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Assigned Project</label>
                            <select value={formData.projectId} onChange={e => handleProjectChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer">
                                <option value="">-- Choose Assigned Project --</option>
                                {myProjects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.projectCode})</option>)}
                            </select>
                            {selectedProject && (
                                <div className="flex items-center gap-2 mt-2 ml-1 text-slate-400">
                                    <LocationCity style={{ fontSize: 14 }} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{cityName} &bull; {selectedProject.projectType?.replace(/_/g, ' ')}</span>
                                </div>
                            )}
                        </div>

                        {formData.inspectionLevel === 'TASK' && (
                            <div className="space-y-2 animate-fadeIn">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Component Task</label>
                                <select value={formData.taskId} onChange={e => setFormData({ ...formData, taskId: e.target.value })} disabled={!formData.projectId} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none disabled:opacity-50">
                                    <option value="">-- Choose My Tasks --</option>
                                    {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.taskName}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 2: METRICS */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><Description className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Execution Metrics</span></div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={`text-[10px] font-bold uppercase ml-1 ${!selectedProject ? 'text-slate-300' : 'text-slate-400'}`}>Template Type</label>
                                <select
                                    value={formData.inspectionTypeId}
                                    onChange={e => setFormData({ ...formData, inspectionTypeId: e.target.value })}
                                    disabled={!selectedProject}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none disabled:opacity-50 cursor-pointer"
                                >
                                    <option value="">-- Select --</option>
                                    {filteredTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Entry Date</label>
                                <div className="relative">
                                    <EventNote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" style={{ fontSize: 20 }} />
                                    <input type="date" value={formData.inspectionDate} onChange={e => setFormData({ ...formData, inspectionDate: e.target.value })} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Formal Observation / Result</label>
                            <textarea rows="5" value={formData.inspectionResult} onChange={e => setFormData({ ...formData, inspectionResult: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-6 py-5 text-sm font-medium outline-none resize-none focus:border-[#0284C7] transition-all" placeholder="Enter observation details, compliance status, or remedial actions..."></textarea>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Person className="text-slate-300" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Inspector</span>
                            </div>
                            <span className="text-xs font-black text-[#0284C7] uppercase">@{currentUser?.username || 'user'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}