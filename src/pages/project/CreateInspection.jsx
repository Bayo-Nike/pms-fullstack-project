import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, HelpOutline, Layers,
    Description, LocationCity, EventNote,
    MyLocation, CloudUpload, AttachFile, DeleteOutline, Visibility, Close
} from '@mui/icons-material';
import {
    AlertCircle, CheckCircle2, MapPin, ExternalLink
} from 'lucide-react';
import adminApi from '../../api/modules/admin';
import projectApi from '../../api/modules/project';
import taskApi from '../../api/modules/task';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';
import { getCurrentGPS } from '../../utility/geolocation';

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
    const [fetchingGPS, setFetchingGPS] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    // Custom Modern Confirmation State
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: ''
    });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    /**
     * GPS Capture Logic: Triggered on creation only
     */
    const fetchLocation = async () => {
        setFetchingGPS(true);
        try {
            const coords = await getCurrentGPS();
            setFormData(prev => ({
                ...prev,
                latitude: coords.latitude,
                longitude: coords.longitude
            }));
        } catch (err) {
            showAlert('warning', 'GPS Capture Failed: Ensure location services are active.');
        } finally {
            setFetchingGPS(false);
        }
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

                // AUTO GPS STAMP: Only if creating new record
                if (!isEdit) {
                    fetchLocation();
                }

                if (isEdit) {
                    const logRes = await projectApi.GET_INSPECTION_LOG(id);
                    const d = logRes.data?.data || logRes.data;

                    setFormData({
                        inspectionTypeId: String(d.inspectionTypeId || ''),
                        inspectionLevel: d.inspectionLevel || 'PROJECT',
                        projectId: String(d.projectId || ''),
                        taskId: String(d.taskId || ''),
                        inspectionDate: d.inspectionDate || new Date().toISOString().split('T')[0],
                        inspectionResult: d.inspectionResult || '',
                        weatherCondition: d.weatherCondition || '',
                        activeWorkers: String(d.activeWorkers || ''),
                        latitude: String(d.latitude || ''),
                        longitude: String(d.longitude || ''),
                        inspectionDocumentUrl: d.inspectionDocumentUrl || ''
                    });

                    const context = projects.find(p => String(p.id) === String(d.projectId));
                    if (context) setSelectedProject(context);
                }
            } catch (err) {
                showAlert('error', 'Failed to synchronize with central registry.');
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
        setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    };

    const triggerSave = () => {
        const { projectId, inspectionTypeId, inspectionResult, weatherCondition, activeWorkers, inspectionLevel, taskId } = formData;

        if (!projectId || !inspectionTypeId || !inspectionResult.trim() || !weatherCondition || !activeWorkers) {
            showAlert('error', 'Required verification fields (*) must be completed.');
            return;
        }
        if (inspectionLevel === 'TASK' && !taskId) {
            showAlert('error', 'Specific Task Component must be defined.');
            return;
        }

        setConfirmModal({
            show: true,
            title: isEdit ? 'Update Entry?' : 'Commit Log?',
            message: 'This record will be permanently saved with your ID and GPS coordinates. Proceed?'
        });
    };

    const executeSave = async () => {
        setConfirmModal({ ...confirmModal, show: false });
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
            selectedFiles.forEach(file => bodyFormData.append('files', file));

            if (isEdit) await projectApi.UPDATE_INSPECTION_LOG(id, bodyFormData);
            else await projectApi.CREATE_INSPECTION_LOG(bodyFormData);

            showAlert('success', `Quality log ${isEdit ? 'updated' : 'recorded'} successfully.`);
            setTimeout(() => navigate('/inspections'), 2000);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction rejected by server.');
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse text-xs uppercase tracking-widest">Establishing Registry Context...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-6 bg-[#F8FAFC] animate-fadeIn text-slate-700">

            {/* MODERN CUSTOM CONFIRMATION MODAL */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden animate-slideUp">
                        <div className="p-10 text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                                <HelpOutline style={{ fontSize: 40 }} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-800 uppercase">{confirmModal.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{confirmModal.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="py-4 rounded-2xl font-black text-[10px] uppercase bg-slate-50 text-slate-400">Cancel Action</button>
                                <button onClick={executeSave} className="py-4 rounded-2xl font-black text-[10px] uppercase bg-slate-900 text-white shadow-xl hover:bg-black transition-all">Confirm Commit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {showPreview && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fadeIn p-6">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-scaleUp border relative">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Document Registry Preview</h3>
                            <button onClick={() => setShowPreview(false)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Close /></button>
                        </div>
                        <iframe src={formData.inspectionDocumentUrl} title="Registry Preview" className="flex-1 w-full border-none" />
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} />

            {/* HEADER */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/inspections')} className="p-3 bg-slate-50 border rounded-[20px] hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">{isEdit ? 'Log Maintenance' : 'Quality Inspection'}</h1>
                        <p className="text-[10px] text-sky-600 mt-2 font-bold uppercase tracking-widest italic">Digital Verification Hub</p>
                    </div>
                </div>
                {can('CAN_UPDATE_INSPECTION') && (
                    <button onClick={triggerSave} disabled={saving} className="bg-[#0284C7] text-white px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 shadow-xl hover:bg-[#0369a1] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest">
                        <Save style={{ fontSize: 20 }} /> {saving ? 'SYNCING...' : 'COMMIT CHANGES'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: CONTEXT & METRICS */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3">
                            <Layers className="text-slate-400" fontSize="small" />
                            <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Inspection Scope</span>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hierarchy Level *</label>
                                <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100 gap-1">
                                    {['PROJECT', 'TASK'].map(lvl => (
                                        <button key={lvl} onClick={() => setFormData({ ...formData, inspectionLevel: lvl, taskId: '' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.inspectionLevel === lvl ? 'bg-white text-[#0284C7] shadow-sm border border-slate-100' : 'text-slate-400'}`}>{lvl}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Project *</label>
                                <select value={formData.projectId} onChange={e => handleProjectChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-sky-500 transition-all">
                                    <option value="">-- Choose Project --</option>
                                    {myProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                            {formData.inspectionLevel === 'TASK' && (
                                <div className="space-y-2 animate-slideUp">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Component Task *</label>
                                    <select value={formData.taskId} onChange={e => setFormData({ ...formData, taskId: e.target.value })} disabled={!formData.projectId} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none disabled:opacity-50">
                                        <option value="">-- Select Specific Task --</option>
                                        {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.taskName}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="p-5 bg-slate-900 rounded-[24px] flex items-center gap-4 shadow-lg shadow-slate-200">
                                <LocationCity className="text-sky-400" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regional Registry</p>
                                    <p className="text-xs font-black text-white uppercase">{cityName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3">
                            <EventNote className="text-slate-400" fontSize="small" />
                            <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Operational Metrics</span>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weather *</label>
                                <select value={formData.weatherCondition} onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                    <option value="">-- Select Condition --</option>
                                    {['SUNNY', 'CLOUD', 'RAIN', 'WINDY', 'STORM', 'SNOW', 'UNKNOWN'].map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel on Site *</label>
                                <input type="number" value={formData.activeWorkers} onChange={(e) => setFormData({ ...formData, activeWorkers: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="0" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Log Date (Auto-locked)</label>
                                <input type="date" value={formData.inspectionDate} readOnly className="w-full bg-slate-100 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: OBSERVATIONS & GPS */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3">
                            <Description className="text-slate-400" fontSize="small" />
                            <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Findings & Evidence</span>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Standard Template *</label>
                                <select value={formData.inspectionTypeId} onChange={e => setFormData({ ...formData, inspectionTypeId: e.target.value })} disabled={!selectedProject} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-6 py-5 text-sm font-bold outline-none disabled:opacity-50">
                                    <option value="">-- Choose QC Template --</option>
                                    {filteredTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observation Detail *</label>
                                <textarea rows="9" value={formData.inspectionResult} onChange={e => setFormData({ ...formData, inspectionResult: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-[32px] px-8 py-7 text-sm font-medium outline-none resize-none focus:border-[#0284C7] transition-all" placeholder="Describe technical status, non-compliance issues, or progress notes..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* READ-ONLY GPS COORDINATES SECTION */}
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MyLocation className={fetchingGPS ? "animate-spin text-sky-500" : "text-slate-400"} fontSize="small" />
                                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">GPS Coordinates</span>
                                </div>
                                {!isEdit && (
                                    <button onClick={fetchLocation} className="text-[9px] font-black text-sky-600 uppercase hover:underline">Recalibrate</button>
                                )}
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Latitude</label>
                                        <input type="text" value={formData.latitude} readOnly placeholder={fetchingGPS ? "Locating..." : "0.000000"} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-slate-500 cursor-not-allowed outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Longitude</label>
                                        <input type="text" value={formData.longitude} readOnly placeholder={fetchingGPS ? "Locating..." : "0.000000"} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-slate-500 cursor-not-allowed outline-none" />
                                    </div>
                                </div>

                                {formData.latitude && formData.longitude ? (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-sky-600 uppercase tracking-widest hover:bg-sky-50 transition-all group"
                                    >
                                        <MapPin size={14} className="group-hover:animate-bounce" />
                                        View on Google Maps
                                        <ExternalLink size={12} className="opacity-50" />
                                    </a>
                                ) : !fetchingGPS && (
                                    <p className="text-[9px] text-amber-500 font-bold italic uppercase tracking-tight text-center">Location capture required for log validity</p>
                                )}
                            </div>
                        </div>

                        {/* EVIDENCE REGISTRY SECTION */}
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3">
                                <CloudUpload className="text-slate-400" fontSize="small" />
                                <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Evidence Registry</span>
                            </div>
                            <div className="p-8 space-y-4">
                                {formData.inspectionDocumentUrl && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between group animate-fadeIn">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <AttachFile className="text-blue-400 shrink-0" style={{ fontSize: 20 }} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Stored File</span>
                                                <span className="text-[11px] text-blue-600 truncate font-medium max-w-[120px]">Reference Docs</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowPreview(true)} className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-90 flex items-center gap-2 px-4"><Visibility style={{ fontSize: 16 }} /><span className="text-[9px] font-bold uppercase">View</span></button>
                                    </div>
                                )}
                                <div className="relative border-2 border-dashed border-slate-200 rounded-[28px] p-6 text-center hover:bg-slate-50 transition-all cursor-pointer group">
                                    <input type="file" multiple onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <AttachFile className="text-slate-300 group-hover:text-[#0284C7] mb-2" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Files</p>
                                </div>
                                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto pr-2">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-all hover:border-slate-300 group">
                                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[180px]">{file.name}</span>
                                            <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors"><DeleteOutline style={{ fontSize: 18 }} /></button>
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