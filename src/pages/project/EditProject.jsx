import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, Info, Groups, Close, Search, Add
} from '@mui/icons-material';
import {
    History, UserCheck, Handshake, Landmark, AlertTriangle,
    CalendarPlus, Trash2, ChevronRight, FileSignature, Lock,
    UserMinus, Building2, Briefcase, UserCircle, AlertCircle, CheckCircle2
} from 'lucide-react';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function EditProject() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        projectCode: '', title: '', description: '', projectType: '',
        category: '', projectLevel: '', status: '', subCityId: '',
        subCityName: '', locationNames: [], locationIds: [],
        startDate: '', endDate: '', finalEndDate: '', projectProgress: 0,
        agreementDate: null,
        contractorId: '', consultantId: '', clientId: '',
        projectManagerId: '', priority: 'MEDIUM', currencyType: 'ETB',
        budget: '', budgetUsed: '0', employeeIds: [],
        totalExtendedDays: 0, extensions: []
    });

    const [lookups, setLookups] = useState({ employees: [], contractors: [], consultancies: [], clients: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    // Search States
    const [teamSearch, setTeamSearch] = useState('');
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
    const [pmSearch, setPmSearch] = useState('');
    const [isPmDropdownOpen, setIsPmDropdownOpen] = useState(false);
    const [contractorSearch, setContractorSearch] = useState('');
    const [isContractorDropdownOpen, setIsContractorDropdownOpen] = useState(false);
    const [consultantSearch, setConsultantSearch] = useState('');
    const [isConsultantDropdownOpen, setIsConsultantDropdownOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    // Modal States
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [extensionData, setExtensionData] = useState({ extendedDays: '', reason: '' });

    // BETTER CONFIRMATION STATE
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'info' // 'info' (blue) or 'danger' (red)
    });

    const isLocked = !formData.agreementDate;

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const isEmployeeCompatible = (emp) => {
        if (!formData.projectType) return true;
        const type = formData.projectType;
        const group = emp.divisionGroup;
        if (type === 'BUILDING') return group === 'BLD' || group === 'BTH';
        if (type === 'WATER_AND_ROAD') return group === 'WAR' || group === 'BTH';
        return true;
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

    const pmOptions = useMemo(() => (lookups.employees || []).filter(emp => emp.status === 'ACTIVE' && !formData.employeeIds.includes(emp.id) && isEmployeeCompatible(emp) && emp.fullName?.toLowerCase().includes(pmSearch.toLowerCase())), [lookups.employees, formData.employeeIds, pmSearch, formData.projectType]);
    const teamOptions = useMemo(() => (lookups.employees || []).filter(emp => emp.status === 'ACTIVE' && !formData.employeeIds.includes(emp.id) && String(emp.id) !== String(formData.projectManagerId) && isEmployeeCompatible(emp) && emp.fullName?.toLowerCase().includes(teamSearch.toLowerCase())), [lookups.employees, formData.employeeIds, formData.projectManagerId, teamSearch, formData.projectType]);
    const contractorOptions = useMemo(() => (lookups.contractors || []).filter(c => c.status === 'ACTIVE' && c.contractorName?.toLowerCase().includes(contractorSearch.toLowerCase())), [lookups.contractors, contractorSearch]);
    const consultantOptions = useMemo(() => (lookups.consultancies || []).filter(c => c.status === 'ACTIVE' && c.consultantName?.toLowerCase().includes(consultantSearch.toLowerCase())), [lookups.consultancies, consultantSearch]);
    const clientOptions = useMemo(() => (lookups.clients || []).filter(c => c.status === 'ACTIVE' && c.clientName?.toLowerCase().includes(clientSearch.toLowerCase())), [lookups.clients, clientSearch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Actions
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

    const confirmDeleteExtension = (extId) => {
        if (isLocked) return;
        setConfirmModal({
            show: true,
            title: 'Revert Timeline?',
            message: 'This will remove the last timeline adjustment and restore the previous completion date. This action is recorded in the audit log.',
            type: 'danger',
            onConfirm: () => executeDeleteExtension(extId)
        });
    };

    const executeDeleteExtension = async (extId) => {
        setSaving(true);
        try {
            await projectApi.DELETE_EXTENSION(id, extId);
            const res = await projectApi.GET_PROJECT(id);
            setFormData(normalizeData(res.data?.data || res.data));
            showAlert('success', 'Timeline reverted');
        } catch (err) { showAlert('error', 'Reversion failed'); } finally { setSaving(false); setConfirmModal(p => ({ ...p, show: false })); }
    };

    const confirmSave = () => {
        if (isLocked) return showAlert('error', 'Action prohibited: Agreement Date missing.');
        setConfirmModal({
            show: true,
            title: 'Confirm Update?',
            message: '',
            type: 'info',
            onConfirm: executeSave
        });
    };

    const executeSave = async () => {
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
        } catch (err) { showAlert('error', 'Update failed.'); } finally { setSaving(false); setConfirmModal(p => ({ ...p, show: false })); }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse text-xs uppercase tracking-widest">Synchronizing PMS Hub...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-6 bg-[#F8FAFC] animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} />

            {/* MODAL: BETTER CONFIRMATION DIALOG */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
                        <div className="p-10 text-center space-y-6">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'}`}>
                                {confirmModal.type === 'danger' ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{confirmModal.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{confirmModal.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button onClick={() => setConfirmModal(p => ({ ...p, show: false }))} className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all">Cancel</button>
                                <button onClick={confirmModal.onConfirm} className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all ${confirmModal.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' : 'bg-slate-900 hover:bg-black shadow-slate-200'}`}>
                                    {confirmModal.type === 'danger' ? 'Cancel Update' : 'Submit Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Timeline Extension */}
            {showExtendModal && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-slideUp">
                        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-3"><History className="text-amber-500" /><h3 className="text-xl font-black text-slate-800 uppercase">Timeline Extension</h3></div>
                            <button onClick={() => setShowExtendModal(false)}><Close /></button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days</label><input type="number" value={extensionData.extendedDays} onChange={(e) => setExtensionData(p => ({ ...p, extendedDays: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] px-8 py-5 text-2xl font-black outline-none focus:border-amber-500" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Justification</label><textarea rows="4" value={extensionData.reason} onChange={(e) => setExtensionData(p => ({ ...p, reason: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] px-8 py-5 text-sm outline-none resize-none" /></div>
                            <button onClick={handleExtendProject} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs">Authorize Extension</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/projects')} className="p-3 bg-slate-50 border rounded-[20px] hover:bg-slate-100"><ArrowBack fontSize="small" /></button>
                    <div><h1 className="text-2xl font-black text-slate-900 leading-none">Project Execution Phase</h1><p className="text-[10px] text-sky-600 mt-2 font-bold uppercase tracking-widest">{formData.projectCode}</p></div>
                </div>
                <div className="flex items-center gap-4">
                    {isLocked && <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 text-[10px] font-black uppercase italic"><Lock size={14} /> Legally Unverified (Agreement Missing)</div>}
                    <button onClick={confirmSave} disabled={saving || isLocked} className={`px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 transition-all shadow-xl uppercase tracking-widest ${isLocked ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-[#0284C7] text-white hover:bg-[#0369a1] shadow-sky-100'}`}><Save style={{ fontSize: 20 }} /> {saving ? 'SYNCING...' : 'UPDATE PROJECT'}</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ROW 1: INITIATION (READ-ONLY) */}
                <div className="lg:col-span-3 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex justify-between items-center">
                        <div className="flex items-center gap-3"><Info className="text-slate-400" fontSize="small" /><span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Initiation Profile</span></div>
                        <div className="flex items-center gap-6">
                            <span className="px-3 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[9px] font-black uppercase tracking-widest">{formData.status?.replace(/_/g, ' ')}</span>
                            <div className="flex items-center gap-4 border-l pl-6"><span className="text-[10px] font-black uppercase text-slate-400">Progress: {Number(formData.projectProgress || 0).toFixed(1)}%</span><div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${formData.projectProgress}%` }} /></div></div>
                        </div>
                    </div>
                    <div className="p-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{formData.title}</h2>
                            <p className="text-sm text-slate-500 italic">"{formData.description || 'No description logged.'}"</p>
                            <div className="flex flex-wrap gap-2 pt-2"><p className="text-[10px] font-black text-sky-600 uppercase">{formData.subCityName}</p>{formData.locationNames?.map((loc, i) => (<span key={i} className="px-2 py-1 bg-slate-100 text-slate-500 border rounded text-[9px] font-black uppercase">{loc}</span>))}</div>
                        </div>
                        <div className="space-y-4 border-l pl-8"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Classification</label><p className="text-xs font-bold text-slate-700">{formData.projectType} / {formData.category}</p><p className="text-[10px] font-black text-sky-600 uppercase">{formData.projectLevel} LEVEL PROJECT</p></div>
                        <div className="space-y-4 border-l pl-8"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contractual Dates</label><div className="text-[11px] font-bold text-slate-600"><p>Start: {formData.startDate}</p><p>End: {formData.endDate}</p>{formData.totalExtendedDays > 0 && <p className="text-amber-600 font-black mt-1 uppercase">Revised: {formData.finalEndDate}</p>}</div></div>
                        <div className="space-y-4 border-l pl-8"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileSignature size={12} /> Agreement Date</label>{formData.agreementDate ? (<p className="text-sm font-black text-slate-800">{formData.agreementDate}</p>) : (<p className="text-[10px] font-bold text-amber-500 italic uppercase">Awaiting Signature</p>)}</div>
                    </div>
                </div>

                {/* ROW 2: SEARCHABLE PM */}
                <div className={`bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3"><UserCheck className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Project Manager</span></div>
                        {isLocked && <Lock size={14} className="text-amber-500" />}
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="text" placeholder={isLocked ? "Registry Locked..." : "Find Manager..."} disabled={isLocked} className="w-full pl-12 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={pmSearch} onFocus={() => setIsPmDropdownOpen(true)} onChange={(e) => setPmSearch(e.target.value)} />
                            {isPmDropdownOpen && pmOptions.length > 0 && !isLocked && (
                                <div className="absolute z-30 w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-48 overflow-y-auto">{pmOptions.map(emp => (<div key={emp.id} onClick={() => { setFormData(p => ({ ...p, projectManagerId: String(emp.id), employeeIds: p.employeeIds.filter(id => String(id) !== String(emp.id)) })); setPmSearch(''); setIsPmDropdownOpen(false); }} className="px-5 py-3 hover:bg-sky-50 cursor-pointer flex justify-between items-center group border-b last:border-none"><span className="text-xs font-bold text-slate-700">{emp.fullName}</span><Add size={16} className="text-slate-300" /></div>))}</div>
                            )}
                        </div>
                        {formData.projectManagerId ? (() => {
                            const pm = lookups.employees.find(e => String(e.id) === String(formData.projectManagerId));
                            return pm ? (<div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl animate-fadeIn"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center font-black text-xs">{pm.fullName.charAt(0)}</div><div><p className="text-[10px] font-black uppercase leading-tight">{pm.fullName}</p><p className="text-[8px] text-slate-400 uppercase">Assigned PM</p></div></div>{!isLocked && <button onClick={() => setFormData(p => ({ ...p, projectManagerId: '' }))}><UserMinus size={16} /></button>}</div>) : null;
                        })() : <div className="border-2 border-dashed border-slate-100 rounded-2xl p-4 text-center"><p className="text-[10px] font-black text-slate-300 uppercase">No Manager</p></div>}
                    </div>
                </div>

                {/* ROW 2: SEARCHABLE IMPLEMENTATION TEAM */}
                <div className={`lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Groups className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Implementation Team</span></div>
                        {isLocked && <Lock size={14} className="text-amber-500" />}
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="relative max-w-lg">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input type="text" placeholder={isLocked ? "Registry Locked..." : "Search personnel..."} disabled={isLocked} className="w-full pl-14 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={teamSearch} onFocus={() => setIsTeamDropdownOpen(true)} onChange={(e) => setTeamSearch(e.target.value)} />
                            {isTeamDropdownOpen && teamOptions.length > 0 && !isLocked && (
                                <div className="absolute z-20 w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-48 overflow-y-auto">{teamOptions.map(emp => (<div key={emp.id} onClick={() => { setFormData(p => ({ ...p, employeeIds: [...p.employeeIds, emp.id], projectManagerId: String(p.projectManagerId) === String(emp.id) ? '' : p.projectManagerId })); setTeamSearch(''); setIsTeamDropdownOpen(false); }} className="px-5 py-3 hover:bg-sky-50 cursor-pointer flex justify-between items-center group border-b last:border-none"><span className="text-xs font-bold text-slate-700">{emp.fullName}</span><Add size={16} className="text-slate-300" /></div>))}</div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">{formData.employeeIds.map(empId => {
                            const emp = lookups.employees.find(e => e.id === empId);
                            return emp ? (<div key={empId} className="flex items-center gap-2 bg-slate-800 text-white pl-4 pr-1.5 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg">{emp.fullName}{!isLocked && <Close onClick={() => setFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(id => id !== empId) }))} className="cursor-pointer" style={{ fontSize: 16 }} />}</div>) : null;
                        })}</div>
                    </div>
                </div>

                {/* ROW 3: SEARCHABLE EXTERNAL PARTNERSHIPS */}
                <div className={`lg:col-span-3 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Handshake className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">External Partnerships</span></div>
                        {isLocked && <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase italic"><Lock size={12} /> Signatures required</div>}
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* CONTRACTOR */}
                        <div className="space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contractor</label><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} /><input type="text" placeholder="Search Contractor..." disabled={isLocked} className="w-full pl-10 pr-4 py-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none" value={contractorSearch} onFocus={() => setIsContractorDropdownOpen(true)} onChange={(e) => setContractorSearch(e.target.value)} />{isContractorDropdownOpen && contractorOptions.length > 0 && !isLocked && (<div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-40 overflow-y-auto">{contractorOptions.map(c => (<div key={c.id} onClick={() => { setFormData(p => ({ ...p, contractorId: String(c.id) })); setContractorSearch(''); setIsContractorDropdownOpen(false); }} className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-[11px] font-bold text-slate-600 border-b last:border-none">{c.contractorName}</div>))}</div>)}</div>{formData.contractorId && (() => { const c = lookups.contractors.find(x => String(x.id) === String(formData.contractorId)); return c ? (<div className="flex items-center justify-between bg-sky-50 border border-sky-100 p-3 rounded-xl animate-fadeIn"><div className="flex items-center gap-2"><Building2 size={14} className="text-sky-600" /><span className="text-[11px] font-black text-sky-800 uppercase">{c.contractorName}</span></div>{!isLocked && <button onClick={() => setFormData(p => ({ ...p, contractorId: '' }))}><Close style={{ fontSize: 16 }} className="text-sky-400 hover:text-sky-600" /></button>}</div>) : null; })()}</div>
                        {/* CONSULTANT */}
                        <div className="space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultant</label><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} /><input type="text" placeholder="Search Consultant..." disabled={isLocked} className="w-full pl-10 pr-4 py-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none" value={consultantSearch} onFocus={() => setIsConsultantDropdownOpen(true)} onChange={(e) => setConsultantSearch(e.target.value)} />{isConsultantDropdownOpen && consultantOptions.length > 0 && !isLocked && (<div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-40 overflow-y-auto">{consultantOptions.map(c => (<div key={c.id} onClick={() => { setFormData(p => ({ ...p, consultantId: String(c.id) })); setConsultantSearch(''); setIsConsultantDropdownOpen(false); }} className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-[11px] font-bold text-slate-600 border-b last:border-none">{c.consultantName}</div>))}</div>)}</div>{formData.consultantId && (() => { const c = lookups.consultancies.find(x => String(x.id) === String(formData.consultantId)); return c ? (<div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl animate-fadeIn"><div className="flex items-center gap-2"><Briefcase size={14} className="text-emerald-600" /><span className="text-[11px] font-black text-emerald-800 uppercase">{c.consultantName}</span></div>{!isLocked && <button onClick={() => setFormData(p => ({ ...p, consultantId: '' }))}><Close style={{ fontSize: 16 }} className="text-emerald-400 hover:text-emerald-600" /></button>}</div>) : null; })()}</div>
                        {/* CLIENT */}
                        <div className="space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</label><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} /><input type="text" placeholder="Search Client..." disabled={isLocked} className="w-full pl-10 pr-4 py-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none" value={clientSearch} onFocus={() => setIsClientDropdownOpen(true)} onChange={(e) => setClientSearch(e.target.value)} />{isClientDropdownOpen && clientOptions.length > 0 && !isLocked && (<div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-40 overflow-y-auto">{clientOptions.map(c => (<div key={c.id} onClick={() => { setFormData(p => ({ ...p, clientId: String(c.id) })); setClientSearch(''); setIsClientDropdownOpen(false); }} className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-[11px] font-bold text-slate-600 border-b last:border-none">{c.clientName}</div>))}</div>)}</div>{formData.clientId && (() => { const c = lookups.clients.find(x => String(x.id) === String(formData.clientId)); return c ? (<div className="flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl animate-fadeIn"><div className="flex items-center gap-2"><UserCircle size={14} className="text-purple-600" /><span className="text-[11px] font-black text-purple-800 uppercase">{c.clientName}</span></div>{!isLocked && <button onClick={() => setFormData(p => ({ ...p, clientId: '' }))}><Close style={{ fontSize: 16 }} className="text-purple-400 hover:text-purple-600" /></button>}</div>) : null; })()}</div>
                    </div>
                </div>

                {/* ROW 4: PRIORITY STRIP (LOCKED) */}
                <div className={`lg:col-span-3 bg-white rounded-[24px] border border-amber-100 shadow-sm p-6 flex items-center justify-between transition-all ${isLocked ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-4"><div className="p-3 bg-amber-50 rounded-xl"><AlertTriangle className="text-amber-500" size={20} /></div><span className="text-xs font-bold text-slate-700">Priority for Implementation</span></div>
                    <select name="priority" value={formData.priority} onChange={handleInputChange} disabled={isLocked} className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 text-xs font-black uppercase outline-none">{['MEDIUM', 'LOW', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}</select>
                </div>

                {/* ROW 5: FINANCIAL CONTEXT (LOCKED) */}
                <div className={`lg:col-span-3 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Landmark className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Financial Context</span></div>
                        {isLocked && <Lock size={14} className="text-amber-500" />}
                    </div>
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="flex items-center gap-8"><div className="flex-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Budget</label><input name="budget" type="number" value={formData.budget} onChange={handleInputChange} disabled={isLocked} className="w-full text-3xl font-black bg-slate-50 border border-slate-200 rounded-3xl px-8 py-6 outline-none" placeholder="0.00" /></div><div className="w-32 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</label><select name="currencyType" value={formData.currencyType} onChange={handleInputChange} disabled={isLocked} className="w-full h-[84px] font-black bg-slate-50 border border-slate-200 rounded-3xl px-6 text-xl"><option value="ETB">ETB</option><option value="USD">USD</option></select></div></div>
                        <div className="flex items-center justify-end text-right"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Disbursed Funds</p><p className="text-4xl font-black text-slate-700 mt-2">{Number(formData.budgetUsed || 0).toLocaleString()} <span className="text-base text-slate-300">{formData.currencyType}</span></p></div></div>
                    </div>
                </div>

                {/* TIMELINE EXTENSION REGISTRY (LOCKED) */}
                <div className={`lg:col-span-3 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all ${isLocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
                        <div className="flex items-center gap-3"><History className="text-slate-400" size={18} /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Timeline Extensions & History</span></div>
                        <button onClick={() => setShowExtendModal(true)} disabled={isLocked} className="flex items-center gap-2 px-4 py-2 bg-amber-500 disabled:bg-slate-300 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"><CalendarPlus size={14} /> New Extension</button>
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
                                            <div className="flex justify-between items-start mb-4"><span className="text-[10px] font-black bg-white px-2.5 py-1 rounded-lg text-amber-600 border border-amber-100">+{ext.extendedDays} Days</span>{isLatest && !isLocked && <button onClick={() => confirmDeleteExtension(ext.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>}</div>
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