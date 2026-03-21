import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, Info, LocationOn, CalendarMonth,
    Payments, Groups, HelpOutline, PinDrop, Badge,
    LocationCity, Close, Search, Add
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function CreateProject() {
    const { can } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const dropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        projectCode: '',
        title: '',
        description: '',
        projectType: 'BUILDING',
        cityId: 1,
        subCityId: '',
        locationIds: [],
        contractorId: '',
        consultantId: '',
        projectManagerId: '',
        startDate: '',
        endDate: '',
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        currencyType: 'ETB',
        budget: '',
        budgetUsed: '0',
        employeeIds: []
    });

    const [lookups, setLookups] = useState({ subCities: [], locations: [], employees: [], contractors: [], consultancies: [], clients: [] });
    const [cityName, setCityName] = useState('...');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [teamSearch, setTeamSearch] = useState('');
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        const init = async () => {
            try {
                const [subRes, locRes, empRes, cityRes, contractorRes, consultantRes, clientRes] = await Promise.all([
                    adminApi.GET_SUB_CITIES(),
                    adminApi.GET_LOCATIONS(),
                    adminApi.GET_EMPLOYEES(),
                    adminApi.GET_CITY(),
                    adminApi.GET_CONTRACTORS(),
                    adminApi.GET_CONSULTANTS(),
                    adminApi.GET_CLIENTS(),
                ]);

                setLookups({
                    subCities: subRes.data?.data || subRes.data || [],
                    locations: locRes.data?.data || locRes.data || [],
                    employees: empRes.data?.data || empRes.data || [],
                    contractors: contractorRes.data?.data || contractorRes.data || [],
                    consultancies: consultantRes.data?.data || consultantRes.data || [],
                    clients: clientRes.data?.data || clientRes.data || [],
                });

                const cityValue = cityRes.data !== undefined ? cityRes.data : cityRes;
                setCityName(cityValue || "Jurisdiction");

                if (isEdit) {
                    const res = await projectApi.GET_PROJECT(id);
                    const d = res.data.data;
                    setFormData({
                        ...d,
                        subCityId: d.subCityId ? String(d.subCityId) : '',
                        projectManagerId: d.projectManagerId ? String(d.projectManagerId) : '',
                        contractorId: d.contractorId ? String(d.contractorId) : '',
                        consultantId: d.consultantId ? String(d.consultantId) : '',
                        locationIds: d.locationIds || [],
                        employeeIds: d.employeeIds || []
                    });
                }
            } catch (err) {
                showAlert('error', 'Critical synchronization error.');
            } finally { setLoading(false); }
        };
        init();
    }, [id, isEdit]);

    useEffect(() => {
        const handleOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsTeamDropdownOpen(false); };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const availableLocations = useMemo(() => {
        if (!formData.subCityId) return [];
        return lookups.locations.filter(l => String(l.subCityId) === String(formData.subCityId));
    }, [formData.subCityId, lookups.locations]);

    const filteredManagers = useMemo(() => {
        if (!formData.subCityId) return [];
        return lookups.employees.filter(e =>
            e.subCityId == null || String(e.subCityId) === String(formData.subCityId)
        );
    }, [formData.subCityId, lookups.employees]);

    const teamOptions = useMemo(() => {
        if (!formData.subCityId) return [];
        return lookups.employees.filter(emp =>
            (emp.subCityId == null || String(emp.subCityId) === String(formData.subCityId)) &&
            !formData.employeeIds.includes(emp.id) &&
            emp.fullName.toLowerCase().includes(teamSearch.toLowerCase())
        );
    }, [lookups.employees, formData.employeeIds, teamSearch, formData.subCityId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'subCityId') {
            setFormData(prev => ({
                ...prev,
                subCityId: value,
                locationIds: [],
                projectManagerId: '',
                employeeIds: []
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveTrigger = () => {
        const { projectCode, title, subCityId, startDate, endDate } = formData;
        if (!String(projectCode).trim() || !String(title).trim() || !subCityId) {
            showAlert('error', 'Validation Error: Project Identification and Sub-City selection are required.');
            return;
        }
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            showAlert('error', 'Schedule Error: Handover date cannot be earlier than Launch date.');
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
                subCityId: Number(formData.subCityId),
                projectManagerId: formData.projectManagerId ? Number(formData.projectManagerId) : null,
                contractorId: formData.contractorId ? Number(formData.contractorId) : null,
                consultantId: formData.consultantId ? Number(formData.consultantId) : null,
                budget: formData.budget ? parseFloat(formData.budget) : 0,
                budgetUsed: parseFloat(formData.budgetUsed || 0),
                employeeIds: formData.employeeIds
            };
            if (isEdit) await projectApi.UPDATE_PROJECT(id, payload);
            else await projectApi.CREATE_PROJECT(payload);

            showAlert('success', 'Project successfully synchronized with portfolio.');
            setTimeout(() => navigate('/projects'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction failed.');
        } finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Establishing Context...</div>;

    return (
        <div className="w-full space-y-8 pb-12 px-6 relative animate-fadeIn">
            {showConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-bold uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed">Save project <b>{formData.projectCode}</b> to the system registry?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 bg-[#0284C7] text-white font-bold text-[11px] uppercase shadow-lg">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/projects')} className="p-3 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div><h1 className="text-2xl font-bold text-slate-900 leading-none">{isEdit ? 'Update Project' : 'Launch Project'}</h1><p className="text-[12px] text-slate-400 mt-1.5 uppercase tracking-[0.2em] font-bold">Lifecycle Panel</p></div>
                </div>

                {/* Save Button Permission Check */}
                {((!isEdit && can('CAN_CREATE_PROJECT')) || (isEdit && can('CAN_UPDATE_PROJECT'))) && (
                    <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-10 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 hover:bg-[#0369a1] active:scale-95 transition-all shadow-xl shadow-sky-100 disabled:opacity-50 tracking-widest uppercase">
                        <Save style={{ fontSize: 20 }} /> {saving ? 'SAVING...' : 'COMMIT CHANGES'}
                    </button>
                )}
            </div>

            {/* ROW 1: CORE FIELDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Info className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Identification</span></div>
                    <div className="p-8 space-y-6 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Code *</label><input name="projectCode" value={formData.projectCode} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7]" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type *</label><select name="projectType" value={formData.projectType} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none appearance-none"><option value="BUILDING">Building</option><option value="WATER_AND_ROAD">Water & Road</option></select></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Formal Title *</label><input name="title" value={formData.title} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7]" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Summary</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7] resize-none"></textarea></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Client Partner</label><select name="clientId" value={formData.clientId} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none appearance-none cursor-pointer"><option value="">TBD</option>{lookups.clients.map(c => <option key={c.id} value={String(c.id)}>{c.clientName}</option>)}</select></div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><LocationOn className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Site Assignment</span></div>
                    <div className="p-8 space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sub-City Jurisdiction *</label>
                            <div className="flex gap-3">
                                <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl px-5 py-3.5 text-[12px] font-black flex items-center gap-2 uppercase shadow-sm"><LocationCity style={{ fontSize: 18 }} /> {cityName}</div>
                                <select name="subCityId" value={formData.subCityId} onChange={handleInputChange} className="flex-1 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7] appearance-none cursor-pointer"><option value="">-- Select --</option>{lookups.subCities.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}</select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={`text-[10px] font-bold uppercase ml-1 ${!formData.subCityId ? 'text-slate-300' : 'text-slate-400'}`}>Project Sites (Multi-Select)</label>
                            <div className="relative">
                                <PinDrop className={`absolute left-4 top-1/2 -translate-y-1/2 ${!formData.subCityId ? 'text-slate-200' : 'text-slate-400'}`} style={{ fontSize: 22 }} />
                                <select
                                    disabled={!formData.subCityId}
                                    onChange={(e) => { const v = Number(e.target.value); if (v && !formData.locationIds.includes(v)) setFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); }}
                                    className="w-full pl-12 pr-4 py-3.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0284C7] appearance-none disabled:bg-slate-50/50 cursor-pointer"
                                >
                                    <option value="">{formData.subCityId ? '-- Tag Locations --' : 'Pending Sub-City'}</option>
                                    {availableLocations.filter(l => !formData.locationIds.includes(l.id)).map(l => <option key={l.id} value={String(l.id)}>{l.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.locationIds.map(locId => {
                                    const loc = lookups.locations.find(l => l.id === locId);
                                    return <div key={locId} className="flex items-center gap-2 bg-slate-800 text-white pl-3 pr-1.5 py-1.5 rounded-xl text-[9px] font-bold uppercase">{loc?.name}<Close onClick={() => setFormData(p => ({ ...p, locationIds: p.locationIds.filter(i => i !== locId) }))} className="cursor-pointer hover:text-red-400" style={{ fontSize: 14 }} /></div>
                                })}
                            </div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Consultancy Partner</label><select name="consultantId" value={formData.consultantId} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none appearance-none cursor-pointer"><option value="">TBD</option>{lookups.consultancies.map(c => <option key={c.id} value={String(c.id)}>{c.consultantName}</option>)}</select></div>
                        
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Groups className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Management</span></div>
                    <div className="p-8 space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className={`text-[10px] font-bold uppercase ml-1 ${!formData.subCityId ? 'text-slate-300' : 'text-slate-400'}`}>Project Lead (Manager)</label>
                            <select name="projectManagerId" value={formData.projectManagerId} onChange={handleInputChange} disabled={!formData.subCityId} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none appearance-none cursor-pointer disabled:opacity-50">
                                <option value="">{formData.subCityId ? 'Unassigned' : 'Select Sub-City First'}</option>
                                {filteredManagers.map(m => <option key={m.id} value={String(m.id)}>{m.fullName} {m.subCityId == null ? '(HQ)' : ''}</option>)}
                            </select>
                        </div>
                        {/* Contractor Permission Check */}
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contractor Partner</label><select name="contractorId" value={formData.contractorId} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none appearance-none cursor-pointer"><option value="">TBD</option>{lookups.contractors.map(c => <option key={c.id} value={String(c.id)}>{c.contractorName}</option>)}</select></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full text-[11px] font-black bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none uppercase">{['NOT_STARTED', 'ON_GOING', 'COMPLETED', 'ON_HOLD', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full text-[11px] font-black bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none uppercase">{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: PERSONNEL TAGGING (FILTERED) */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden" ref={dropdownRef}>
                <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Groups className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Personnel Tagging</span></div>
                <div className="p-10 space-y-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" style={{ fontSize: 24 }} />
                        <input
                            type="text"
                            placeholder={formData.subCityId ? "Search staff from selected Sub-City or HQ..." : "Please select a Sub-City to view assignable staff"}
                            className="w-full pl-14 pr-6 py-4.5 text-base font-semibold bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:border-[#0284C7] transition-all disabled:opacity-50"
                            value={teamSearch}
                            disabled={!formData.subCityId}
                            onChange={(e) => { setTeamSearch(e.target.value); setIsTeamDropdownOpen(true); }}
                            onFocus={() => setIsTeamDropdownOpen(true)}
                        />
                        {isTeamDropdownOpen && teamOptions.length > 0 && (
                            <div className="absolute z-20 w-full mt-3 bg-white border border-slate-100 rounded-[32px] shadow-2xl max-h-64 overflow-y-auto no-scrollbar py-3">
                                {teamOptions.map(emp => (
                                    <div key={emp.id} onClick={() => { setFormData(p => ({ ...p, employeeIds: [...p.employeeIds, emp.id] })); setTeamSearch(''); setIsTeamDropdownOpen(false); }} className="px-8 py-4 hover:bg-sky-50 cursor-pointer flex items-center justify-between group transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-[#0284C7]">{emp.fullName}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">{emp.subCityId == null ? 'Head Office' : 'Regional Staff'}</span>
                                        </div>
                                        <Add className="text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {formData.employeeIds.map(empId => {
                            const emp = lookups.employees.find(e => e.id === empId);
                            return (
                                <div key={empId} className="flex items-center gap-3 bg-[#0284C7] text-white pl-5 pr-3 py-3 rounded-2xl text-[12px] font-bold shadow-lg shadow-sky-100 animate-fadeIn">
                                    {emp?.fullName}
                                    <Close onClick={() => setFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(id => id !== empId) }))} className="cursor-pointer bg-white/20 rounded-full p-1 hover:bg-white/40" style={{ fontSize: 18 }} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ROW 3: FINANCE & TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Finance Permission Check */}
                {can('CAN_SEE_PROJECT_FINANCE') ? (
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
                        <div className="flex items-center gap-4 mb-8 font-bold text-[12px] text-slate-400 uppercase tracking-[0.2em]"><Payments className="text-[#FBAF1E]" /> Financial Context</div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Total Contract Budget</label><input name="budget" type="number" value={formData.budget} onChange={handleInputChange} className="w-full text-2xl font-black bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 outline-none focus:border-[#0284C7] transition-all" placeholder="0.00" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Currency</label><select name="currencyType" value={formData.currencyType} onChange={handleInputChange} className="w-full h-[72px] font-bold bg-slate-50 border border-slate-200 rounded-[28px] px-8 appearance-none"><option value="ETB">ETB - Birr</option><option value="USD">USD - Dollar</option></select></div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 p-10 flex flex-col items-center justify-center text-center">
                        <Payments className="text-slate-200 mb-4" style={{ fontSize: 40 }} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial context restricted</p>
                    </div>
                )}

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
                    <div className="flex items-center gap-4 mb-8 font-bold text-[12px] text-slate-400 uppercase tracking-[0.2em]"><CalendarMonth className="text-sky-500" /> Project Schedule</div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Launch Date</label><input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 outline-none focus:border-[#0284C7] transition-all" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Handover Deadline</label><input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 outline-none focus:border-[#0284C7] transition-all" /></div>
                    </div>
                </div>
            </div>
        </div>
    );
}