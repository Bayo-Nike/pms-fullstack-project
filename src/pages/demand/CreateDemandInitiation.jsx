import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ArrowBack, Save, Info, LocationOn, PinDrop,
    Close, AssignmentTurnedIn, HelpOutline, CalendarMonth, Visibility
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateDemandInitiation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const isEdit = Boolean(id) && location.pathname.includes('/edit');
    const isView = Boolean(id) && location.pathname.includes('/view');

    const [formData, setFormData] = useState({
        projectCode: '', title: '', description: '', projectType: 'BUILDING',
        category: 'GOVERNMENT', projectLevel: 'CITY', subCityId: '', woredaIds: [],
        locationIds: [], phase: 'INITIATION', agreementDate: '', startDate: '', endDate: ''
    });

    const [lookups, setLookups] = useState({ subCities: [], woredas: [],  locations: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    useEffect(() => {
        const init = async () => {
            try {
                const [subRes, woredaRes, locRes] = await Promise.all([
                    adminApi.GET_SUB_CITIES(), adminApi.GET_WOREDAS(), adminApi.GET_LOCATIONS()
                ]);
                setLookups({
                    subCities: subRes.data?.data || subRes.data || [],
                    woredas: woredaRes.data?.data || woredaRes.data || [],
                    locations: locRes.data?.data || locRes.data || []
                });

                if (id) {
                    const res = await projectApi.GET_PROJECT_INITIATION(id);
                    const d = res.data?.data || res.data;
                    setFormData({
                        ...d,
                        category: d.category || 'GOVERNMENT',
                        subCityId: d.subCityId ? String(d.subCityId) : '',
                        woredaIds: d.woredaId ? [Number(d.woredaId)] : (d.woredaIds ? d.woredaIds.map(Number) : []),
                        locationIds: Array.isArray(d.locationIds) ? d.locationIds.map(Number) : [],
                        phase: d.phase || 'INITIATION',
                        agreementDate: d.agreementDate || '',
                        startDate: d.startDate || '',
                        endDate: d.endDate || ''
                    });
                }
            } catch (err) { setAlert({ show: true, type: 'error', message: 'Registry sync failed.' }); }
            finally { setLoading(false); }
        };
        init();
    }, [id]);

     
    const handleInputChange = (e) => {
        if (isView) return;
        const { name, value } = e.target;
        setFormData(prev => {
            const update = { ...prev, [name]: value };
            // Cascading Reset: If Sub-City changes, Woredas and Locations must clear
            if (name === 'subCityId') {
                update.woredaIds = [];
                update.locationIds = [];
            }
            return update;
        });
    };

     
    // 1. Filter Woredas by Sub-City
    const filteredWoredas = useMemo(() => {
        if (!formData.subCityId) return [];
        return lookups.woredas.filter(w => 
            String(w.subCityId) === String(formData.subCityId) || 
            String(w.subCity?.id) === String(formData.subCityId)
        );
    }, [formData.subCityId, lookups.woredas]);

    // 2. Filter Locations by the list of selected Woredas
    const filteredLocations = useMemo(() => {
        if (formData.woredaIds.length === 0) return [];
        return lookups.locations.filter(loc => 
            formData.woredaIds.includes(Number(loc.woredaId)) || 
            formData.woredaIds.includes(Number(loc.woreda?.id))
        );
    }, [formData.woredaIds, lookups.locations]);
    
    const executeSave = async () => {
        // 1. Level Validation
        if (formData.projectLevel === 'SUB_CITY' && !formData.subCityId) {
            setShowConfirm(false);
            return setAlert({ show: true, type: 'error', message: 'Sub-City assignment required for Sub-City level.' });
        }

        // 2. Data Validation for EXECUTION Phase (Mandatory Agreement, Start and End dates)
        if (formData.phase === 'EXECUTION') {
            if (!formData.agreementDate || !formData.startDate || !formData.endDate) {
                setShowConfirm(false);
                return setAlert({ show: true, type: 'error', message: 'Agreement Date, Launch Date, and Deadline are mandatory for EXECUTION phase.' });
            }

            // Logic: Start Date <= End Date
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (start > end) {
                setShowConfirm(false);
                return setAlert({ show: true, type: 'error', message: 'Launch Date cannot be later than the Handover Deadline.' });
            }
        }

        setSaving(true);
        setShowConfirm(false);
        try {
            const payload = {
                ...formData,
                subCityId: formData.subCityId ? Number(formData.subCityId) : null,
                
                // CHANGED AREA: Map array back to singular woredaId for backend
                woredaId: formData.woredaIds.length > 0 ? Number(formData.woredaIds[0]) : null,
                locationIds: formData.locationIds.map(Number),
                agreementDate: formData.phase === 'EXECUTION' ? formData.agreementDate : null,
                startDate: formData.phase === 'EXECUTION' ? formData.startDate : null,
                endDate: formData.phase === 'EXECUTION' ? formData.endDate : null
            };

            if (isEdit) await projectApi.UPDATE_PROJECT_INITIATION(id, payload);
            else await projectApi.CREATE_PROJECT_INITIATION(payload);

            setAlert({ show: true, type: 'success', message: 'Initiation Record Successfully Submitted.' });
            setTimeout(() => navigate('/initiations'), 1500);
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Transaction rejected.' }); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center italic animate-pulse text-slate-400 text-xs tracking-widest uppercase font-black">Syncing Parameters...</div>;

    return (
        <div className="w-full space-y-8 pb-12 px-6 animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {showConfirm && !isView && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full text-center border animate-scaleIn">
                        <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-black uppercase tracking-tight">Registry Update</h3>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed">Commit initiation record <b>{formData.title || 'New Entry'}</b>?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-black uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 bg-[#0284C7] text-white font-black text-[11px] uppercase shadow-lg hover:bg-sky-700 transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/demands')} className="p-3 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                            {isView ? 'View Initiation' : isEdit ? 'Modify Initiation' : 'Demand Initiation'}
                        </h1>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest italic tracking-[0.2em]">
                            {isView ? 'Read-Only Mode' : 'Registry Form'}
                        </p>
                    </div>
                </div>
                {!isView && (
                    <button onClick={() => setShowConfirm(true)} disabled={saving} className="bg-[#0284C7] text-white px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 uppercase shadow-xl tracking-widest hover:bg-[#0369a1] transition-all">
                        <Save /> {saving ? 'PROCESSING...' : 'SAVE INITIATION'}
                    </button>
                )}
                {isView && (
                    <button onClick={() => navigate(`/initiations/edit/${id}`)} className="bg-[#FBAF1E] text-white px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 uppercase shadow-xl tracking-widest hover:bg-amber-600 transition-all">
                        Edit Mode
                    </button>
                )}
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${isView ? 'opacity-90' : ''}`}>
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b bg-slate-50/40 flex items-center gap-3"><Info className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Identification</span></div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Demand Code</label>
                                <input name="projectCode" value={formData.projectCode || ""} placeholder="AUTO-GEN" disabled className="w-full text-sm font-bold bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} disabled={isView} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none">
                                    <option value="GOVERNMENT">Government</option>
                                    <option value="NON_GOVERNMENT">Non-Government</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Project Type</label>
                            <select name="projectType" value={formData.projectType} onChange={handleInputChange} disabled={isView} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none">
                                <option value="BUILDING">Building</option>
                                <option value="WATER_AND_ROAD">Water & Road</option>
                            </select>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Initiation Title *</label><input name="title" value={formData.title} onChange={handleInputChange} disabled={isView} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7]" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} disabled={isView} rows="4" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7] resize-none"></textarea></div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b bg-slate-50/40 flex items-center gap-3"><LocationOn className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Hub Assignment</span></div>
                    <div className="p-8 space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Project Level</label>
                            <select name="projectLevel" value={formData.projectLevel} onChange={handleInputChange} disabled={isView} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none">
                                <option value="CITY">City Hub (HQ)</option>
                                <option value="SUB_CITY">Sub-City Hub (Region)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Sub-City {formData.projectLevel === 'SUB_CITY' ? '*' : '(Optional)'}</label>
                            <select
                                name="subCityId" value={formData.subCityId} onChange={handleInputChange} disabled={isView}
                                className={`w-full text-sm font-semibold bg-slate-50 border rounded-2xl px-4 py-3.5 outline-none appearance-none cursor-pointer ${formData.projectLevel === 'SUB_CITY' && !formData.subCityId ? 'border-amber-300' : 'border-slate-200'}`}
                            >
                                <option value="">-- Select Sub-City --</option>
                                {lookups.subCities.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase ml-1 text-slate-400 tracking-widest">Woreda</label>
                            <div className="relative">
                                <PinDrop className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 22 }} />
                                <select
                                    disabled={!formData.subCityId || isView}
                                    onChange={(e) => { 
                                        const v = Number(e.target.value); 
                                        // CHANGED AREA: Ensure only ONE woreda is selected (replace array instead of push)
                                        if (v) setFormData(p => ({ ...p, woredaIds: [v] })); 
                                    }}
                                    className="w-full pl-12 pr-4 py-3.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl appearance-none outline-none disabled:opacity-50"
                                >
                                    <option value="">{formData.subCityId ? '-- Select Woreda --' : 'Select Sub-City First'}</option>
                                    {filteredWoredas.map(w => (
                                        <option key={w.id} value={w.id}>{w.woredaName || w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.woredaIds.map(worId => {
                                    const wor = lookups.woredas.find(w => w.id === worId);
                                    return wor ? (
                                        <div key={worId} className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            {wor.woredaName || wor.name}
                                            {!isView && <Close onClick={() => setFormData(p => {
                                                const newWoredaIds = p.woredaIds.filter(i => i !== worId);
                                                // When removing a woreda, we should also remove its associated locations
                                                const newLocationIds = p.locationIds.filter(locId => {
                                                    const loc = lookups.locations.find(l => l.id === locId);
                                                    return Number(loc?.woredaId) !== worId;
                                                });
                                                return { ...p, woredaIds: newWoredaIds, locationIds: newLocationIds };
                                            })} className="cursor-pointer hover:text-rose-400" style={{ fontSize: 14 }} />}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase ml-1 text-slate-400 tracking-widest">Sites / Locations (Multiple)</label>
                            <div className="relative">
                                <LocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 22 }} />
                                <select
                                    disabled={formData.woredaIds.length === 0 || isView}
                                    onChange={(e) => { 
                                        const v = Number(e.target.value); 
                                        if (v && !formData.locationIds.includes(v)) {
                                            setFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); 
                                        }
                                    }}
                                    className="w-full pl-12 pr-4 py-3.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl appearance-none outline-none disabled:opacity-50"
                                >
                                    <option value="">{formData.woredaIds.length > 0 ? '-- Select Site --' : '-- Select Woreda First --'}</option>
                                    {filteredLocations.filter(l => !formData.locationIds.includes(l.id)).map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.locationIds.map(locId => {
                                    const loc = lookups.locations.find(l => l.id === locId);
                                    return loc ? (
                                        <div key={locId} className="flex items-center gap-2 bg-sky-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            {loc.name}
                                            {!isView && <Close onClick={() => setFormData(p => ({ ...p, locationIds: p.locationIds.filter(i => i !== locId) }))} className="cursor-pointer hover:text-rose-400" style={{ fontSize: 14 }} />}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                    

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-8 flex flex-col gap-8 transition-all">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-50 rounded-2xl text-[#0284C7]"><AssignmentTurnedIn /></div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Registry phase</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Current lifecycle phase</p>
                        </div>
                    </div>
                    <div className="w-64">
                        <select name="phase" value={formData.phase} onChange={handleInputChange} disabled className="w-full text-[11px] font-black bg-sky-50 border border-sky-100 text-[#0284C7] rounded-2xl px-6 py-4 outline-none uppercase tracking-tighter cursor-pointer shadow-sm">
                            <option value="INITIATION">Initiation</option>
                            <option value="EXECUTION">Execution</option>
                        </select>
                    </div>
                </div>

                {formData.phase === 'EXECUTION' && (
                    <div className="space-y-8 pt-8 border-t border-slate-50 animate-fadeIn">
                        {/* New Requirement: Agreement Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                                <AssignmentTurnedIn style={{ fontSize: 16 }} className="text-[#0284C7]" /> Agreement Signature Date *
                            </label>
                            <input name="agreementDate" type="date" value={formData.agreementDate} onChange={handleInputChange} disabled={isView} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-[20px] px-6 py-4 outline-none focus:border-[#0284C7]" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                                    <CalendarMonth style={{ fontSize: 16 }} className="text-sky-500" /> Launch Date *
                                </label>
                                <input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} disabled={isView} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-[20px] px-6 py-4 outline-none focus:border-[#0284C7]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-2">
                                    <CalendarMonth style={{ fontSize: 16 }} className="text-rose-500" /> Handover Deadline *
                                </label>
                                <input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} disabled={isView} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-[20px] px-6 py-4 outline-none focus:border-[#0284C7]" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}