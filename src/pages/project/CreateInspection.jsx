import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, FactCheck, HelpOutline, Layers,
    Assignment, Description, AccessTime, Person
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import projectApi from '../../api/modules/project'; // Corrected Import
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function CreateInspection() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const isEdit = Boolean(id);

    // Form State
    const [formData, setFormData] = useState({
        level: 'PROJECT',
        projectId: '',
        taskId: '',
        typeId: '',
        inspectionResult: '',
        inspectedBy: currentUser?.username || '',
        inspectionDateTime: new Date().toISOString().slice(0, 16)
    });

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [inspectionTypes, setInspectionTypes] = useState([]);
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
                const [pRes, typeRes] = await Promise.all([
                    projectApi.GET_PROJECTS({ size: 1000 }),
                    adminApi.GET_INSPECTION_TYPES()
                ]);
                setProjects(pRes.data?.data?.content || []);
                setInspectionTypes(typeRes.data?.data || typeRes.data || []);

                if (isEdit) {
                    const logRes = await projectApi.GET_INSPECTION_LOG(id);
                    const d = logRes.data?.data || logRes.data;
                    setFormData({
                        ...d,
                        projectId: String(d.projectId || ''),
                        taskId: String(d.taskId || ''),
                        typeId: String(d.typeId || d.inspectionTypeId || ''),
                        inspectionDateTime: d.inspectionDateTime?.slice(0, 16)
                    });
                    if (d.projectId && d.level === 'TASK') {
                        const tRes = await projectApi.GET_TASKS_BY_PROJECT(d.projectId);
                        setTasks(tRes.data.data || []);
                    }
                }
            } catch (err) { showAlert('error', 'Critical synchronization failure.'); }
            finally { setLoading(false); }
        };
        initData();
    }, [id, isEdit]);

    const handleProjectChange = async (projId) => {
        setFormData(prev => ({ ...prev, projectId: projId, taskId: '' }));
        if (projId && formData.level === 'TASK') {
            try {
                const res = await projectApi.GET_TASKS_BY_PROJECT(projId);
                setTasks(res.data.data || []);
            } catch (e) { setTasks([]); }
        }
    };

    const handleSaveTrigger = () => {
        const { projectId, typeId, inspectionResult, level, taskId } = formData;
        if (!projectId || !typeId || !inspectionResult.trim()) {
            showAlert('error', 'Please ensure Project, Template, and Findings are filled.');
            return;
        }
        if (level === 'TASK' && !taskId) {
            showAlert('error', 'Please select the specific Task.');
            return;
        }
        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const payload = {
                ...formData,
                projectId: Number(formData.projectId),
                taskId: formData.taskId ? Number(formData.taskId) : null,
                typeId: Number(formData.typeId)
            };

            if (isEdit) await projectApi.UPDATE_INSPECTION_LOG(id, payload);
            else await projectApi.CREATE_INSPECTION_LOG(payload);

            showAlert('success', 'Inspection log established.');
            setTimeout(() => navigate('/admin/inspections'), 1500);
        } catch (err) { showAlert('error', 'Transaction rejected.'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic">Connecting QA Matrix...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-4 relative animate-fadeIn">
            {showConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-bold uppercase">Confirm Log</h3>
                        <p className="text-sm text-slate-500 mt-2">Publish this record to project registry?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-bold uppercase hover:bg-slate-50">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 bg-[#0284C7] text-white rounded-2xl font-bold text-[11px] uppercase shadow-lg">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/projects/inspections')} className="p-2.5 bg-slate-50 border rounded-2xl hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div><h1 className="text-xl font-bold text-slate-900 leading-none">{isEdit ? 'Update Results' : 'Log Inspection'}</h1><p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-bold">QA Execution</p></div>
                </div>
                <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 hover:bg-[#0369a1] active:scale-95 transition-all shadow-xl disabled:opacity-50 tracking-widest uppercase">
                    <Save style={{ fontSize: 20 }} /> {saving ? 'PROCESSING...' : 'COMMIT LOG'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Layers className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Scope Mapping</span></div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Context Level</label>
                            <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                                {['PROJECT', 'TASK'].map(lvl => (
                                    <button key={lvl} onClick={() => setFormData({ ...formData, level: lvl, taskId: '' })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.level === lvl ? 'bg-white text-[#0284C7] shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>{lvl}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Assignment</label>
                            <select value={formData.projectId} onChange={e => handleProjectChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none">
                                <option value="">-- Choose Project --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </div>
                        {formData.level === 'TASK' && (
                            <div className="space-y-2 animate-fadeIn">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Specific Task</label>
                                <select value={formData.taskId} onChange={e => setFormData({ ...formData, taskId: e.target.value })} disabled={!formData.projectId} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none disabled:opacity-50">
                                    <option value="">-- Choose Component --</option>
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.taskName}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><Description className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Execution Log</span></div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Template</label>
                                <select value={formData.typeId} onChange={e => setFormData({ ...formData, typeId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                    <option value="">-- Select --</option>
                                    {inspectionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date</label>
                                <input type="datetime-local" value={formData.inspectionDateTime} onChange={e => setFormData({ ...formData, inspectionDateTime: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" />
                            </div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Remarks</label><textarea rows="4" value={formData.inspectionResult} onChange={e => setFormData({ ...formData, inspectionResult: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-6 py-5 text-sm font-medium outline-none resize-none" placeholder="Observation details..."></textarea></div>
                    </div>
                </div>
            </div>
        </div>
    );
}