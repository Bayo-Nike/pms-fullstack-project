import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, Info, CalendarMonth,
    Payments, Groups, LocationCity, Close, Search, Add
} from '@mui/icons-material';
import {
    History, UserCheck, Handshake, Landmark, AlertTriangle,
    CalendarPlus, Trash2, ChevronRight, CheckCircle2, TrendingUp,
    FileSignature, Lock, AlertCircle
} from 'lucide-react';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function EditProject() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        // Initiation (Read-only)
        projectCode: '', title: '', description: '', projectType: '',
        category: '', projectLevel: '', status: '', subCityId: '',
        subCityName: '', locationNames: [], locationIds: [],
        startDate: '', endDate: '', finalEndDate: '', projectProgress: 0,
        agreementDate: null,
        // Implementation (Editable)
        contractorId: '', consultantId: '', clientId: '',
        projectManagerId: '', priority: 'MEDIUM', currencyType: 'ETB',
        budget: '', budgetUsed: '0', employeeIds: [],
        // Computed
        totalExtendedDays: 0, extensions: []
    });

    const [lookups, setLookups] = useState({ employees: [], contractors: [], consultancies: [], clients: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [teamSearch, setTeamSearch] = useState('');
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

    // Extension State
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [extensionData, setExtensionData] = useState({ extendedDays: '', reason: '' });

    // CRITICAL: If no agreement date, the entire implementation registry is locked
    const isLocked = !formData.agreementDate;

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const normalizeData = (d) => {
        if (!d) return formData;
        return {
            ...d,
            subCityId: d.subCityId ? String(d.subCityId) : '',
            projectManagerId: d.projectManagerId ? String(d.projectManagerId) : '',
            contractorId: d.contractorId ? String(d.contractorId) : '',
            consultantId: d.consultantId ? String(d.consultantId) : '',
            clientId: d.clientId ? String(d.clientId) : '',
            employeeIds: d.employeeIds || [],
            extensions: d.extensions || [],
            agreementDate: d.agreementDate || null
        };
    };

    useEffect(() => {
        const init = async () => {
            try {
                const [empRes, contractorRes, consultantRes, clientRes] = await Promise.all([
                    adminApi.GET_EMPLOYEES(), adminApi.GET_CONTRACTORS(),
                    adminApi.GET_CONSULTANTS(), adminApi.GET_CLIENTS(),
                ]);
                setLookups({
                    employees: empRes.data?.data || empRes.data || [],
                    contractors: contractorRes.data?.data || contractorRes.data || [],
                    consultancies: consultantRes.data?.data || consultantRes.data || [],
                    clients: clientRes.data?.data || clientRes.data || [],
                });
                if (id) {
                    const res = await projectApi.GET_PROJECT(id);
                    setFormData(normalizeData(res.data?.data || res.data));
                }
            } catch (err) { showAlert('error', 'Sync error.'); } finally { setLoading(false); }
        };
        init();
    }, [id]);

    const teamOptions = useMemo(() => {
        const list = lookups.employees || [];
        const selectedIds = formData.employeeIds || [];
        return list.filter(emp => !selectedIds.includes(emp.id) && emp.fullName?.toLowerCase().includes(teamSearch.toLowerCase()));
    }, [lookups.employees, formData.employeeIds, teamSearch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExtendProject = async () => {
        if (isLocked) return;
        if (!extensionData.extendedDays || !extensionData.reason) return showAlert('error', 'Fields required');
        setSaving(true);
        try {
            await projectApi.EXTEND_PROJECT(id, { extendedDays: Number(extensionData.extendedDays), reason: extensionData.reason });
            const res = await projectApi.GET_PROJECT(id);
            setFormData(normalizeData(res.data?.data || res.data));
            setExtensionData({ extendedDays: '', reason: '' });
            setShowExtendModal(false);
            showAlert('success', 'Timeline adjusted successfully');
        } catch (err) { showAlert('error', 'Extension failed'); } finally { setSaving(false); }
    };

    const handleDeleteLastExtension = async (extId) => {
        if (isLocked || !window.confirm("Revert last timeline adjustment?")) return;
        setSaving(true);
        try {
            await projectApi.DELETE_EXTENSION(id, extId);
            const res = await projectApi.GET_PROJECT(id);
            setFormData(normalizeData(res.data?.data || res.data));
            showAlert('success', 'Timeline reverted');
        } catch (err) { showAlert('error', 'Reversion failed'); } finally { setSaving(false); }
    };

    const executeSave = async () => {
        if (isLocked) return showAlert('error', 'Action prohibited: Agreement Date missing.');
        setSaving(true);
        try {
            const payload = {
                contractorId: formData.contractorId ? Number(formData.contractorId) : null,
                consultantId: formData.consultantId ? Number(formData.consultantId) : null,
                clientId: formData.clientId ? Number(formData.clientId) : null,
                projectManagerId: formData.projectManagerId ? Number(formData.projectManagerId) : null,
                priority: formData.priority,
                currencyType: formData.currencyType,
                budget: formData.budget ? parseFloat(formData.budget) : 0,
                employeeIds: formData.employeeIds
            };
            await projectApi.UPDATE_PROJECT(id, payload);
            showAlert('success', 'Registry successfully updated.');
            setTimeout(() => navigate('/projects'), 1500);
        } catch (err) { showAlert('error', 'Update failed.'); } finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse text-xs uppercase tracking-widest">Synchronizing PMS Hub...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-6 bg-[#F8FAFC] animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} />

            {/* Modal: Timeline Extension */}
            {showExtendModal && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-slideUp">
                        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <History className="text-amber-500" />
                                <h3 className="text-xl font-black text-slate-800 uppercase">Timeline Extension</h3>
                            </div>
                            <button onClick={() => setShowExtendModal(false)}><Close /></button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days</label>
                                <input type="number" value={extensionData.extendedDays} onChange={(e) => setExtensionData(p => ({ ...p, extendedDays: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] px-8 py-5 text-2xl font-black outline-none focus:border-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Justification</label>
                                <textarea rows="4" value={extensionData.reason} onChange={(e) => setExtensionData(p => ({ ...p, reason: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] px-8 py-5 text-sm outline-none resize-none" />
                            </div>
                            <button onClick={handleExtendProject} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs">Authorize Extension</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/projects')} className="p-3 bg-slate-50 border rounded-[20px] hover:bg-slate-100"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">Implementation Hub</h1>
                        <p className="text-[10px] text-sky-600 mt-2 font-bold uppercase tracking-widest">{formData.projectCode}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {isLocked && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 text-[10px] font-black uppercase italic">
                            <Lock size={14} /> Legally Unverified (Agreement Missing)
                        </div>
                    )}
                    <button
                        onClick={executeSave}
                        disabled={saving || isLocked}
                        className={`px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 transition-all shadow-xl uppercase tracking-widest ${isLocked ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-[#0284C7] text-white hover:bg-[#0369a1] shadow-sky-100'}`}
                    >
                        <Save style={{ fontSize: 20 }} /> {saving ? 'SYNCING...' : 'COMMIT CHANGES'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ROW 1: INITIATION (READ-ONLY) */}
                <div className="lg:col-span-3 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Info className="text-slate-400" fontSize="small" />
                            <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Initiation Profile</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="px-3 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[9px] font-black uppercase tracking-widest">{formData.status?.replace(/_/g, ' ')}</span>
                            <div className="flex items-center gap-4 border-l pl-6">
                                <span className="text-[10px] font-black uppercase text-slate-400">Progress: {Number(formData.projectProgress || 0).toFixed(1)}%</span>
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${formData.projectProgress}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{formData.title}</h2>
                            <p className="text-sm text-slate-500 italic">"{formData.description || 'No description logged.'}"</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <p className="text-[10px] font-black text-sky-600 uppercase">{formData.subCityName}</p>
                                {formData.locationNames?.map((loc, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-500 border rounded text-[9px] font-black uppercase">{loc}</span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 border-l pl-8">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Classification</label>
                            <p className="text-xs font-bold text-slate-700">{formData.projectType} / {formData.category}</p>
                            <p className="text-[10px] font-black text-sky-600 uppercase">{formData.projectLevel} LEVEL PROJECT</p>
                        </div>
                        <div className="space-y-4 border-l pl-8">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contractual Dates</label>
                            <div className="text-[11px] font-bold text-slate-600">
                                <p>Start: {formData.startDate}</p>
                                <p>End: {formData.endDate}</p>
                                {formData.totalExtendedDays > 0 && <p className="text-amber-600 font-black mt-1 uppercase">Revised: {formData.finalEndDate}</p>}
                            </div>
                        </div>
                        <div className="space-y-4 border-l pl-8">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileSignature size={12} /> Agreement Date</label>
                            {formData.agreementDate ? (
                                <p className="text-sm font-black text-slate-800">{formData.agreementDate}</p>
                            ) : (
                                <p className="text-[10px] font-bold text-amber-500 italic uppercase">Awaiting Signature</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ROW 2: PM & PERSONNEL (LOCKED) */}
                <div className={`bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3"><UserCheck className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Project Manager</span></div>
                        {isLocked && <Lock size={14} className="text-amber-500" />}
                    </div>
                    <div className="p-8">
                        <select name="projectManagerId" value={formData.projectManagerId} onChange={handleInputChange} disabled={isLocked} className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none">
                            <option value="">Unassigned</option>
                            {lookups.employees.map(m => <option key={m.id} value={String(m.id)}>{m.fullName}</option>)}
                        </select>
                    </div>
                </div>

                <div className={`lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Groups className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Implementation Team</span></div>
                        {isLocked && <Lock size={14} className="text-amber-500" />}
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="relative max-w-lg">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input type="text" placeholder={isLocked ? "Registry Locked..." : "Search personnel..."} disabled={isLocked} className="w-full pl-14 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={teamSearch} onChange={(e) => { setTeamSearch(e.target.value); setIsTeamDropdownOpen(true); }} />
                            {isTeamDropdownOpen && teamOptions.length > 0 && !isLocked && (
                                <div className="absolute z-20 w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                    {teamOptions.map(emp => (
                                        <div key={emp.id} onClick={() => { setFormData(p => ({ ...p, employeeIds: [...p.employeeIds, emp.id] })); setTeamSearch(''); setIsTeamDropdownOpen(false); }} className="px-5 py-3 hover:bg-sky-50 cursor-pointer flex justify-between items-center group"><span className="text-xs font-bold text-slate-700">{emp.fullName}</span><Add className="text-slate-300" /></div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.employeeIds.map(empId => {
                                const emp = lookups.employees.find(e => e.id === empId);
                                return emp ? (
                                    <div key={empId} className="flex items-center gap-2 bg-slate-800 text-white pl-4 pr-1.5 py-1.5 rounded-xl text-[10px] font-black uppercase">
                                        {emp.fullName}
                                        {!isLocked && <Close onClick={() => setFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(id => id !== empId) }))} className="cursor-pointer" style={{ fontSize: 16 }} />}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>

                {/* ROW 3: EXTERNAL PARTNERSHIPS (LOCKED) */}
                <div className={`lg:col-span-3 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Handshake className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">External Partnerships</span></div>
                        {isLocked && <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase italic"><Lock size={12} /> Signatures required</div>}
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {['contractorId', 'consultantId', 'clientId'].map((field, idx) => (
                            <div key={field} className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.replace('Id', '')}</label>
                                <select name={field} value={formData[field]} onChange={handleInputChange} disabled={isLocked} className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none">
                                    <option value="">TBD</option>
                                    {(idx === 0 ? lookups.contractors : idx === 1 ? lookups.consultancies : lookups.clients).map(c => (
                                        <option key={c.id} value={String(c.id)}>{idx === 0 ? c.contractorName : idx === 1 ? c.consultantName : c.clientName}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ROW 4: PRIORITY STRIP (LOCKED) */}
                <div className={`lg:col-span-3 bg-white rounded-[24px] border border-amber-100 shadow-sm p-6 flex items-center justify-between transition-all ${isLocked ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-xl"><AlertTriangle className="text-amber-500" size={20} /></div>
                        <span className="text-xs font-bold text-slate-700">Priority for Implementation</span>
                    </div>
                    <select name="priority" value={formData.priority} onChange={handleInputChange} disabled={isLocked} className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 text-xs font-black uppercase outline-none">
                        {['MEDIUM', 'LOW', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                {/* ROW 5: FINANCIAL CONTEXT (LOCKED) */}
                <div className={`lg:col-span-3 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Landmark className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Financial Context</span></div>
                        {isLocked && <Lock size={14} className="text-amber-500" />}
                    </div>
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="flex items-center gap-8">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Budget</label>
                                <input name="budget" type="number" value={formData.budget} onChange={handleInputChange} disabled={isLocked} className="w-full text-3xl font-black bg-slate-50 border border-slate-200 rounded-3xl px-8 py-6 outline-none" placeholder="0.00" />
                            </div>
                            <div className="w-32 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</label>
                                <select name="currencyType" value={formData.currencyType} onChange={handleInputChange} disabled={isLocked} className="w-full h-[84px] font-black bg-slate-50 border border-slate-200 rounded-3xl px-6 text-xl">
                                    <option value="ETB">ETB</option><option value="USD">USD</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-end text-right">
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Disbursed Funds</p><p className="text-4xl font-black text-slate-700 mt-2">{Number(formData.budgetUsed || 0).toLocaleString()} <span className="text-base text-slate-300">{formData.currencyType}</span></p></div>
                        </div>
                    </div>
                </div>

                {/* TIMELINE EXTENSION REGISTRY (LOCKED) */}
                <div className={`lg:col-span-3 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
                        <div className="flex items-center gap-3"><History className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Timeline Extensions & History</span></div>
                        <button onClick={() => setShowExtendModal(true)} disabled={isLocked} className="flex items-center gap-2 px-4 py-2 bg-amber-500 disabled:bg-slate-300 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">
                            <CalendarPlus size={14} /> New Extension
                        </button>
                    </div>
                    <div className="p-8">
                        {(!formData.extensions || formData.extensions.length === 0) ? (
                            <div className="p-16 text-center text-slate-300 italic text-sm font-medium">No timeline adjustments registered.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {formData.extensions.map((ext, i) => {
                                    const isLatest = i === (formData.extensions.length - 1);
                                    return (
                                        <div key={i} className={`relative p-6 rounded-[24px] border ${isLatest ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black bg-white px-2.5 py-1 rounded-lg text-amber-600 border border-amber-100">+{ext.extendedDays} Days</span>
                                                {isLatest && !isLocked && (
                                                    <button onClick={() => handleDeleteLastExtension(ext.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-600 italic font-medium leading-relaxed mb-4">"{ext.reason}"</p>
                                            <div className="pt-4 border-t flex items-center justify-between text-[10px] font-bold"><span className="text-slate-500">{ext.previousEndDate}</span><ChevronRight size={12} className="text-slate-300" /><span className="text-[#0284C7] font-black">{ext.newEndDate}</span></div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}