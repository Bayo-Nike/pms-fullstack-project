import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, Info, LocationOn, CalendarMonth,
    Payments, Groups, HelpOutline, PinDrop, Badge, LocationCity, Description
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateProject() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        projectCode: '',
        title: '',
        description: '', // <--- Added back
        projectType: 'BUILDING',
        cityId: 1,
        subCityId: '', // <--- Starts empty
        locationId: '',
        contractorId: '',
        projectManagerId: '',
        startDate: '',
        endDate: '',
        status: 'PLANNING',
        priority: 'MEDIUM',
        currencyType: 'ETB',
        budget: '',
        budgetUsed: '0',
        employeeIds: []
    });

    const [lookups, setLookups] = useState({ subCities: [], locations: [], employees: [] });
    const [cityName, setCityName] = useState('...');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        const init = async () => {
            try {
                const [subRes, locRes, empRes, cityRes] = await Promise.all([
                    adminApi.GET_SUB_CITIES(),
                    adminApi.GET_LOCATIONS(),
                    adminApi.GET_EMPLOYEES(),
                    adminApi.GET_CITY()
                ]);

                setLookups({
                    subCities: subRes.data?.data || subRes.data || [],
                    locations: locRes.data?.data || locRes.data || [],
                    employees: empRes.data?.data || empRes.data || []
                });
                setCityName(cityRes.data || cityRes);

                if (isEdit) {
                    const res = await projectApi.GET_PROJECT(id);
                    setFormData({ ...res.data.data });
                }
            } catch (err) {
                showAlert('error', 'Critical synchronization error.');
            } finally { setLoading(false); }
        };
        init();
    }, [id, isEdit]);

    const filteredLocations = useMemo(() => lookups.locations.filter(l => l.subCityId === Number(formData.subCityId)), [formData.subCityId, lookups.locations]);
    const filteredManagers = useMemo(() => lookups.employees.filter(e => e.subCityId === Number(formData.subCityId)), [formData.subCityId, lookups.employees]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'subCityId') {
            setFormData(prev => ({ ...prev, subCityId: value, locationId: '', projectManagerId: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveTrigger = () => {
        // Validation: Description is EXCLUDED from this check
        const { projectCode, title, projectType, subCityId, locationId, projectManagerId, startDate, endDate, budget } = formData;

        if (!projectCode.trim() || !title.trim() || !projectType || !subCityId || !locationId || !projectManagerId || !startDate || !endDate || !budget) {
            showAlert('error', 'Validation Error: All fields except description are mandatory.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                locationId: Number(formData.locationId),
                projectManagerId: Number(formData.projectManagerId),
                budget: parseFloat(formData.budget),
                budgetUsed: parseFloat(formData.budgetUsed)
            };
            if (isEdit) await projectApi.UPDATE_PROJECT(id, payload);
            else await projectApi.CREATE_PROJECT(payload);
            navigate('/projects');
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction failed.');
        } finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Establishing Project Context...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">
            {showConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-[#0284C7] mb-4 mx-auto" style={{ fontSize: 56 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2">Initialize project <b>{formData.projectCode}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 rounded-2xl bg-[#0284C7] text-white font-bold text-[10px] uppercase shadow-lg transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/projects')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div><h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit Project' : 'New Project Initiation'}</h1><p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Portfolio Management</p></div>
                </div>
                <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 tracking-widest uppercase">
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : isEdit ? 'UPDATE CHANGES' : 'SAVE PROJECT'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Identification */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2"><Info className="text-slate-400" fontSize="small" /><span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Identification</span></div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Project Code *</label><input name="projectCode" value={formData.projectCode} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0284C7] transition-all" /></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Type *</label><select name="projectType" value={formData.projectType} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none appearance-none"><option value="BUILDING">Building</option><option value="WATER_AND_ROAD">Water & Road</option></select></div>
                        </div>
                        <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Formal Title *</label><input name="title" value={formData.title} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0284C7] transition-all" /></div>

                        {/* Description Field Added Back (Optional) */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0284C7] transition-all resize-none" placeholder="Brief project summary..."></textarea>
                        </div>
                    </div>
                </div>

                {/* 2. Site Assignment */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2"><LocationOn className="text-slate-400" fontSize="small" /><span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Location Assignment</span></div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Sub-City *</label>
                            <div className="flex gap-2">
                                <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black flex items-center gap-1 uppercase whitespace-nowrap shadow-sm"><LocationCity style={{ fontSize: 14 }} /> {cityName}</div>
                                <select name="subCityId" value={formData.subCityId} onChange={handleInputChange} className="flex-1 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0284C7] appearance-none"><option value="">Select Sub-City</option>{lookups.subCities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className={`text-[9px] font-bold uppercase ml-1 ${!formData.subCityId ? 'text-slate-300' : 'text-slate-400'}`}>Site Location *</label>
                            <div className="relative">
                                <PinDrop className={`absolute left-3 top-1/2 -translate-y-1/2 ${!formData.subCityId ? 'text-slate-200' : 'text-slate-400'}`} style={{ fontSize: 18 }} />
                                <select name="locationId" value={formData.locationId} onChange={handleInputChange} disabled={!formData.subCityId} className="w-full pl-10 pr-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0284C7] appearance-none disabled:bg-slate-50/50"><option value="">{formData.subCityId ? '-- Select Site --' : 'Waiting for Sub-City'}</option>{filteredLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Management */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2"><Groups className="text-slate-400" fontSize="small" /><span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Management Assignment</span></div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className={`text-[9px] font-bold uppercase ml-1 ${!formData.subCityId ? 'text-slate-300' : 'text-slate-400'}`}>Project Manager *</label>
                            <div className="relative">
                                <Badge className={`absolute left-3 top-1/2 -translate-y-1/2 ${!formData.subCityId ? 'text-slate-200' : 'text-slate-400'}`} style={{ fontSize: 18 }} />
                                <select name="projectManagerId" value={formData.projectManagerId} onChange={handleInputChange} disabled={!formData.subCityId} className="w-full pl-10 pr-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0284C7] appearance-none disabled:bg-slate-50/50"><option value="">{formData.subCityId ? '-- Select Manager --' : 'Waiting for Sub-City'}</option>{filteredManagers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}</select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Status *</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"><option value="PLANNING">PLANNING</option><option value="ACTIVE">ACTIVE</option><option value="ON_HOLD">ON_HOLD</option></select></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Priority *</label><select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="URGENT">URGENT</option></select></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><Payments className="text-[#FBAF1E]" fontSize="small" /> Financial Configuration</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Project Budget *</label><input name="budget" type="number" value={formData.budget} onChange={handleInputChange} className="w-full text-lg font-black bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-[#0284C7]" placeholder="0.00" /></div>
                        <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Currency *</label><select name="currencyType" value={formData.currencyType} onChange={handleInputChange} className="w-full h-[52px] font-bold bg-slate-50 border border-slate-200 rounded-2xl px-4 appearance-none"><option value="ETB">ETB - Birr</option><option value="USD">USD - Dollar</option></select></div>
                    </div>
                </div>
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest"><CalendarMonth className="text-sky-500" fontSize="small" /> Project Schedule</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Start Date *</label><input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-[#0284C7]" /></div>
                        <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">End Date *</label><input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-[#0284C7]" /></div>
                    </div>
                </div>
            </div>
        </div>
    );
}