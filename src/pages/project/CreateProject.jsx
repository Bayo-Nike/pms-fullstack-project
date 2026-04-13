// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import {
//     ArrowBack, Save, Info, LocationOn, CalendarMonth,
//     Payments, Groups, HelpOutline, PinDrop,
//     LocationCity, Close, Search, Add
// } from '@mui/icons-material';
// import projectApi from '../../api/modules/project';
// import adminApi from '../../api/modules/admin';
// import AlertMessage from '../../components/Reusable/AlertMessage';
// import { useAuth } from '../../context/AuthContext';

// export default function CreateProject() {
//     // 1. Extract positionId from AuthContext
//     const { can, subCityId: authSubCityId, divisionGroup: authDivisionGroup, positionId: authPositionId } = useAuth();

//     const navigate = useNavigate();
//     const { id } = useParams();
//     const isEdit = Boolean(id);
//     const dropdownRef = useRef(null);

//     const [formData, setFormData] = useState({
//         projectCode: '',
//         title: '',
//         description: '',
//         progress: '0',
//         projectLevel: 'CITY',
//         projectType: 'BUILDING',
//         cityId: 1,
//         subCityId: '',
//         locationIds: [],
//         contractorId: '',
//         consultantId: '',
//         clientId: '',
//         projectManagerId: '',
//         startDate: '',
//         endDate: '',
//         status: 'NOT_STARTED',
//         priority: 'MEDIUM',
//         currencyType: 'ETB',
//         budget: '',
//         budgetUsed: '0',
//         employeeIds: []
//     });

//     const [lookups, setLookups] = useState({ subCities: [], locations: [], employees: [], contractors: [], consultancies: [], clients: [] });
//     const [cityName, setCityName] = useState('...');
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [showConfirm, setShowConfirm] = useState(false);
//     const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
//     const [teamSearch, setTeamSearch] = useState('');
//     const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

//     const showAlert = (type, message) => {
//         setAlert({ show: true, type, message });
//         if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
//     };

//     useEffect(() => {
//         if (!isEdit && authDivisionGroup === 'BTH') {
//             if (authSubCityId) {
//                 setFormData(prev => ({ ...prev, projectLevel: 'SUB_CITY', subCityId: String(authSubCityId) }));
//             } else {
//                 setFormData(prev => ({ ...prev, projectLevel: 'CITY', subCityId: '' }));
//             }
//         }
//     }, [authSubCityId, authDivisionGroup, isEdit]);

//     useEffect(() => {
//         const init = async () => {
//             try {
//                 const [subRes, locRes, empRes, cityRes, contractorRes, consultantRes, clientRes] = await Promise.all([
//                     adminApi.GET_SUB_CITIES(),
//                     adminApi.GET_LOCATIONS(),
//                     adminApi.GET_EMPLOYEES(),
//                     adminApi.GET_CITY(),
//                     adminApi.GET_CONTRACTORS(),
//                     adminApi.GET_CONSULTANTS(),
//                     adminApi.GET_CLIENTS(),
//                 ]);

//                 setLookups({
//                     subCities: subRes.data?.data || subRes.data || [],
//                     locations: locRes.data?.data || locRes.data || [],
//                     employees: empRes.data?.data || empRes.data || [],
//                     contractors: contractorRes.data?.data || contractorRes.data || [],
//                     consultancies: consultantRes.data?.data || consultantRes.data || [],
//                     clients: clientRes.data?.data || clientRes.data || [],
//                 });

//                 const cityValue = cityRes.data !== undefined ? cityRes.data : cityRes;
//                 setCityName(typeof cityValue === 'string' ? cityValue : "Jurisdiction");

//                 if (isEdit) {
//                     const res = await projectApi.GET_PROJECT(id);
//                     const d = res.data?.data || res.data;
//                     if (d) {
//                         setFormData({
//                             ...d,
//                             subCityId: d.subCityId ? String(d.subCityId) : '',
//                             projectManagerId: d.projectManagerId ? String(d.projectManagerId) : '',
//                             contractorId: d.contractorId ? String(d.contractorId) : '',
//                             consultantId: d.consultantId ? String(d.consultantId) : '',
//                             clientId: d.clientId ? String(d.clientId) : '',
//                             locationIds: d.locationIds || [],
//                             employeeIds: d.employeeIds || []
//                         });
//                     }
//                 }
//             } catch (err) { showAlert('error', 'Critical synchronization error.'); } finally { setLoading(false); }
//         };
//         init();
//     }, [id, isEdit]);

//     const filteredEmployeesByGroup = useMemo(() => {
//         const employees = lookups.employees || [];
//         if (formData.projectType === 'BUILDING') {
//             return employees.filter(e => e?.divisionGroup === 'BLD' || e?.divisionGroup === 'BTH');
//         } else if (formData.projectType === 'WATER_AND_ROAD') {
//             return employees.filter(e => e?.divisionGroup === 'WAR' || e?.divisionGroup === 'BTH');
//         }
//         return employees;
//     }, [lookups.employees, formData.projectType]);

//     const finalPersonnelList = useMemo(() => {
//         const list = filteredEmployeesByGroup || [];
//         if (formData.projectLevel === 'SUB_CITY' && formData.subCityId) {
//             return list.filter(e => String(e?.subCityId) === String(formData.subCityId));
//         }
//         return list;
//     }, [formData.projectLevel, formData.subCityId, filteredEmployeesByGroup]);

//     // 2. Updated Tagging logic: Only allow tagging if employee.positionParentId === auth.positionId
//     const teamOptions = useMemo(() => {
//         const list = finalPersonnelList || [];
//         return list.filter(emp =>
//             emp &&
//             !formData.employeeIds.includes(emp.id) &&
//             emp.fullName?.toLowerCase().includes(teamSearch.toLowerCase()) &&
//             // Strict Hierarchical Check:
//             (Number(emp.positionParentId) === Number(authPositionId))
//         );
//     }, [finalPersonnelList, formData.employeeIds, teamSearch, authPositionId]);

//     const availableLocations = useMemo(() => {
//         if (!formData.subCityId) return [];
//         return (lookups.locations || []).filter(l => String(l.subCityId) === String(formData.subCityId));
//     }, [formData.subCityId, lookups.locations]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         if (name === 'subCityId') {
//             setFormData(prev => ({ ...prev, subCityId: value, locationIds: [], projectManagerId: '', employeeIds: [] }));
//         } else if (name === 'projectType') {
//             setFormData(prev => ({ ...prev, [name]: value, projectManagerId: '', employeeIds: [] }));
//         } else {
//             setFormData(prev => ({ ...prev, [name]: value }));
//         }
//     };

//     const executeSave = async () => {
//         setShowConfirm(false);
//         setSaving(true);
//         try {
//             const payload = {
//                 ...formData,
//                 subCityId: formData.subCityId ? Number(formData.subCityId) : null,
//                 projectManagerId: formData.projectManagerId ? Number(formData.projectManagerId) : null,
//                 budget: formData.budget ? parseFloat(formData.budget) : 0,
//                 employeeIds: formData.employeeIds
//             };
//             if (isEdit) await projectApi.UPDATE_PROJECT(id, payload);
//             else await projectApi.CREATE_PROJECT(payload);
//             showAlert('success', 'Project synchronized successfully.');
//             setTimeout(() => navigate('/projects'), 1500);
//         } catch (err) { showAlert('error', err.response?.data?.message || 'Transaction failed.'); } finally { setSaving(false); }
//     };

//     if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Establishing Context...</div>;

//     return (
//         <div className="w-full space-y-8 pb-12 px-6 relative animate-fadeIn">
//             {showConfirm && (
//                 <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
//                     <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
//                         <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
//                         <h3 className="text-xl font-bold uppercase tracking-tight">Confirm Save</h3>
//                         <p className="text-sm text-slate-500 mt-3 leading-relaxed">Save project <b>{formData.projectCode}</b> to registry?</p>
//                         <div className="flex gap-4 mt-10">
//                             <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
//                             <button onClick={executeSave} className="flex-1 px-4 py-3 bg-[#0284C7] text-white font-bold text-[11px] uppercase shadow-lg">Confirm</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

//             {/* Action Bar */}
//             <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
//                 <div className="flex items-center gap-5">
//                     <button onClick={() => navigate('/projects')} className="p-3 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
//                     <div>
//                         <h1 className="text-2xl font-bold text-slate-900 leading-none">{isEdit ? 'Update Project' : 'Launch Project'}</h1>
//                         <div className="flex items-center gap-2 mt-2">
//                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${formData.projectLevel === 'CITY' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
//                                 {formData.projectLevel} LEVEL
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//                 {((!isEdit && can('CAN_CREATE_PROJECT')) || (isEdit && can('CAN_UPDATE_PROJECT'))) && (
//                     <button onClick={() => setShowConfirm(true)} disabled={saving} className="bg-[#0284C7] text-white px-10 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 hover:bg-[#0369a1] active:scale-95 transition-all shadow-xl shadow-sky-100 disabled:opacity-50 tracking-widest uppercase">
//                         <Save style={{ fontSize: 20 }} /> {saving ? 'SAVING...' : 'COMMIT CHANGES'}
//                     </button>
//                 )}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Identification Card */}
//                 <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
//                     <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Info className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Identification</span></div>
//                     <div className="p-8 space-y-6 flex-1">
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Code *</label><input name="projectCode" value={formData.projectCode} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7]" /></div>
//                             <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type *</label><select name="projectType" value={formData.projectType} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none appearance-none"><option value="BUILDING">Building</option><option value="WATER_AND_ROAD">Water & Road</option></select></div>
//                         </div>
//                         <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Formal Title *</label><input name="title" value={formData.title} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7]" /></div>
//                         <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Summary</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7] resize-none"></textarea></div>

//                     </div>
//                 </div>

//                 {/* Site Assignment Card */}
//                 <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
//                     <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><LocationOn className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Site Assignment</span></div>
//                     <div className="p-8 space-y-6 flex-1">
//                         <div className="space-y-2">
//                             <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sub-City {formData.projectLevel === 'SUB_CITY' ? '*' : '(Optional)'}</label>
//                             <div className="flex gap-3">
//                                 <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl px-5 py-3.5 text-[12px] font-black flex items-center gap-2 uppercase shadow-sm"><LocationCity style={{ fontSize: 18 }} /> {cityName}</div>
//                                 <select name="subCityId" value={formData.subCityId} onChange={handleInputChange} disabled={formData.projectLevel === 'SUB_CITY' && authSubCityId} className="flex-1 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7] appearance-none cursor-pointer disabled:opacity-75">
//                                     <option value="">-- {formData.projectLevel === 'CITY' ? 'None / Global' : 'Select'} --</option>
//                                     {(lookups.subCities || []).map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
//                                 </select>
//                             </div>
//                         </div>
//                         <div className="space-y-2">
//                             <label className="text-[10px] font-bold uppercase ml-1 text-slate-400">Project Sites</label>
//                             <div className="relative">
//                                 <PinDrop className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 22 }} />
//                                 <select disabled={!formData.subCityId} onChange={(e) => { const v = Number(e.target.value); if (v && !formData.locationIds.includes(v)) setFormData(p => ({ ...p, locationIds: [...p.locationIds, v] })); }} className="w-full pl-12 pr-4 py-3.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0284C7] appearance-none disabled:bg-slate-50/50"><option value="">-- Tag Locations --</option>{(availableLocations || []).filter(l => !formData.locationIds.includes(l.id)).map(l => <option key={l.id} value={String(l.id)}>{l.name}</option>)}</select>
//                             </div>
//                             <div className="flex flex-wrap gap-2 pt-2">
//                                 {formData.locationIds.map(locId => {
//                                     const loc = (lookups.locations || []).find(l => l.id === locId);
//                                     return loc ? (<div key={locId} className="flex items-center gap-2 bg-slate-800 text-white pl-3 pr-1.5 py-1.5 rounded-xl text-[9px] font-bold uppercase">{loc.name}<Close onClick={() => setFormData(p => ({ ...p, locationIds: p.locationIds.filter(i => i !== locId) }))} className="cursor-pointer" style={{ fontSize: 14 }} /></div>) : null;
//                                 })}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Management Card */}
//                 <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
//                     <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Groups className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Management</span></div>
//                     <div className="p-8 space-y-6 flex-1">
//                         <div className="space-y-2">
//                             <label className="text-[10px] font-bold uppercase ml-1 text-slate-400">Project Lead (Manager)</label>
//                             <select name="projectManagerId" value={formData.projectManagerId} onChange={handleInputChange} disabled={formData.projectLevel === 'SUB_CITY' && !formData.subCityId} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none appearance-none cursor-pointer disabled:opacity-50">
//                                 <option value="">{formData.projectLevel === 'SUB_CITY' && !formData.subCityId ? 'Select Sub-City First' : 'Unassigned'}</option>
//                                 {(finalPersonnelList || []).map(m => <option key={m.id} value={String(m.id)}>{m.fullName} {m.subCityName ? `(${m.subCityName})` : '(HQ)'}</option>)}
//                             </select>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full text-[11px] font-black bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none uppercase">{['NOT_STARTED', 'ON_GOING', 'COMPLETED', 'ON_HOLD', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
//                             <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full text-[11px] font-black bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none uppercase">{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Personnel Tagging Card - Hierarchy Restricted */}
//             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden" ref={dropdownRef}>
//                 <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Groups className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Personnel Tagging</span></div>
//                 <div className="p-10 space-y-8">
//                     <div className="relative max-w-xl">
//                         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" style={{ fontSize: 24 }} />
//                         <input
//                             type="text"
//                             placeholder={formData.projectLevel === 'SUB_CITY' && !formData.subCityId ? "Select Sub-City First" : `Search your direct employees...`}
//                             className="w-full pl-14 pr-6 py-4.5 text-base font-semibold bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:border-[#0284C7] transition-all disabled:opacity-50"
//                             value={teamSearch}
//                             disabled={formData.projectLevel === 'SUB_CITY' && !formData.subCityId}
//                             onChange={(e) => { setTeamSearch(e.target.value); setIsTeamDropdownOpen(true); }}
//                             onFocus={() => setIsTeamDropdownOpen(true)}
//                         />
//                         {isTeamDropdownOpen && teamOptions.length > 0 && (
//                             <div className="absolute z-20 w-full mt-3 bg-white border border-slate-100 rounded-[32px] shadow-2xl max-h-64 overflow-y-auto py-3">
//                                 {teamOptions.map(emp => (
//                                     <div key={emp.id} onClick={() => { setFormData(p => ({ ...p, employeeIds: [...p.employeeIds, emp.id] })); setTeamSearch(''); setIsTeamDropdownOpen(false); }} className="px-8 py-4 hover:bg-sky-50 cursor-pointer flex items-center justify-between group">
//                                         <div className="flex flex-col">
//                                             <span className="text-sm font-bold text-slate-600 group-hover:text-[#0284C7]">{emp.fullName}</span>
//                                             <span className="text-[10px] text-slate-400 uppercase font-bold">{emp.positionName} — {emp.subCityName || 'HQ'}</span>
//                                         </div>
//                                         <Add className="text-slate-300" />
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                         {isTeamDropdownOpen && teamSearch && teamOptions.length === 0 && (
//                             <div className="absolute z-20 w-full mt-3 bg-white border border-slate-100 rounded-3xl shadow-xl p-6 text-center text-slate-400 text-xs italic">
//                                 No direct reports found matching this criteria.
//                             </div>
//                         )}
//                     </div>
//                     <div className="flex flex-wrap gap-3">
//                         {formData.employeeIds.map(empId => {
//                             const emp = (lookups.employees || []).find(e => e.id === empId);
//                             return emp ? (
//                                 <div key={empId} className="flex items-center gap-3 bg-[#0284C7] text-white pl-5 pr-3 py-3 rounded-2xl text-[12px] font-bold shadow-lg animate-fadeIn">
//                                     {emp.fullName}
//                                     <Close onClick={() => setFormData(p => ({ ...p, employeeIds: p.employeeIds.filter(id => id !== empId) }))} className="cursor-pointer bg-white/20 rounded-full p-1" style={{ fontSize: 18 }} />
//                                 </div>
//                             ) : null;
//                         })}
//                     </div>
//                 </div>
//             </div>

//             {/* Timelines and Finance */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {
//                     // can('CAN_SEE_PROJECT_FINANCE') && (
//                     <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
//                         <div className="flex items-center gap-4 mb-8 font-bold text-[12px] text-slate-400 uppercase tracking-[0.2em]"><Payments className="text-[#FBAF1E]" /> Financial Context</div>
//                         <div className="grid grid-cols-2 gap-8">
//                             <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contract Budget</label><input name="budget" type="number" value={formData.budget} onChange={handleInputChange} className="w-full text-2xl font-black bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 outline-none focus:border-[#0284C7]" placeholder="0.00" /></div>
//                             <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Currency</label><select name="currencyType" value={formData.currencyType} onChange={handleInputChange} className="w-full h-[72px] font-bold bg-slate-50 border border-slate-200 rounded-[28px] px-8 appearance-none"><option value="ETB">ETB</option><option value="USD">USD</option></select></div>
//                         </div>
//                     </div>
//                     // )
//                 }
//                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
//                     <div className="flex items-center gap-4 mb-8 font-bold text-[12px] text-slate-400 uppercase tracking-[0.2em]"><CalendarMonth className="text-sky-500" /> Project Schedule</div>
//                     <div className="grid grid-cols-2 gap-8">
//                         <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Launch Date</label><input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 outline-none focus:border-[#0284C7]" /></div>
//                         <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Handover Deadline</label><input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className="w-full font-bold bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 outline-none focus:border-[#0284C7]" /></div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }





import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, Info, LocationOn, CalendarMonth,
    Payments, Groups, HelpOutline, PinDrop,
    LocationCity, Close, Search, Add
} from '@mui/icons-material';
import { 
    History, Timer, Calendar, ClipboardList, 
    TrendingUp, CalendarPlus, AlertCircle, ChevronRight, CheckCircle2
} from 'lucide-react';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function CreateProject() {
    const { can, subCityId: authSubCityId, divisionGroup: authDivisionGroup, positionId: authPositionId } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const dropdownRef = useRef(null);

    // Initial State Structure
    const [formData, setFormData] = useState({
        projectCode: '', title: '', description: '', progress: '0',
        projectLevel: 'CITY', projectType: 'BUILDING', cityId: 1,
        subCityId: '', locationIds: [], contractorId: '', consultantId: '',
        clientId: '', projectManagerId: '', startDate: '', endDate: '',
        status: 'NOT_STARTED', priority: 'MEDIUM', currencyType: 'ETB',
        budget: '', budgetUsed: '0', totalExtendedDays: 0,
        employeeIds: [], extensions: [] 
    });

    const [lookups, setLookups] = useState({ subCities: [], locations: [], employees: [], contractors: [], consultancies: [], clients: [] });
    const [cityName, setCityName] = useState('...');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [teamSearch, setTeamSearch] = useState('');
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
    
    // Extension specific state
    const [extensionData, setExtensionData] = useState({ extendedDays: '', reason: '' });
    const [showExtendModal, setShowExtendModal] = useState(false);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    /**
     * CRITICAL: Normalizes backend data to prevent "null" errors in React
     */
    const normalizeData = (d) => {
        if (!d) return formData;
        // Calculate total days from the extensions array
        const extensions = d.extensions || [];
        const sumOfDays = extensions.reduce((acc, ext) => acc + (Number(ext.extendedDays) || 0), 0);
        return {
            ...d,
            subCityId: d.subCityId ? String(d.subCityId) : '',
            projectManagerId: d.projectManagerId ? String(d.projectManagerId) : '',
            contractorId: d.contractorId ? String(d.contractorId) : '',
            consultantId: d.consultantId ? String(d.consultantId) : '',
            clientId: d.clientId ? String(d.clientId) : '',
            locationIds: d.locationIds || [],
            employeeIds: d.employeeIds || [],
            extensions: d.extensions || [],
            totalExtendedDays: sumOfDays,
            // totalExtendedDays: d.totalExtendedDays || 0
        };
    };

    useEffect(() => {
        if (!isEdit && authDivisionGroup === 'BTH') {
            setFormData(prev => ({ 
                ...prev, 
                projectLevel: authSubCityId ? 'SUB_CITY' : 'CITY', 
                subCityId: authSubCityId ? String(authSubCityId) : '' 
            }));
        }
    }, [authSubCityId, authDivisionGroup, isEdit]);

    useEffect(() => {
        const init = async () => {
            try {
                const [subRes, locRes, empRes, cityRes, contractorRes, consultantRes, clientRes] = await Promise.all([
                    adminApi.GET_SUB_CITIES(), adminApi.GET_LOCATIONS(), adminApi.GET_EMPLOYEES(),
                    adminApi.GET_CITY(), adminApi.GET_CONTRACTORS(), adminApi.GET_CONSULTANTS(), adminApi.GET_CLIENTS(),
                ]);

                setLookups({
                    subCities: subRes.data?.data || subRes.data || [],
                    locations: locRes.data?.data || locRes.data || [],
                    employees: empRes.data?.data || empRes.data || [],
                    contractors: contractorRes.data?.data || contractorRes.data || [],
                    consultancies: consultantRes.data?.data || consultantRes.data || [],
                    clients: clientRes.data?.data || clientRes.data || [],
                });

                setCityName(cityRes.data !== undefined ? cityRes.data : "Jurisdiction");

                if (isEdit) {
                    const res = await projectApi.GET_PROJECT(id);
                    setFormData(normalizeData(res.data?.data || res.data));
                }
            } catch (err) { showAlert('error', 'Synchronization error.'); } finally { setLoading(false); }
        };
        init();
    }, [id, isEdit]);

    const teamOptions = useMemo(() => {
        const list = lookups.employees || [];
        const selectedIds = formData.employeeIds || []; 
        return list.filter(emp =>
            emp && 
            !selectedIds.includes(emp.id) && 
            emp.fullName?.toLowerCase().includes(teamSearch.toLowerCase()) &&
            (Number(emp.positionParentId) === Number(authPositionId))
        );
    }, [lookups.employees, formData.employeeIds, teamSearch, authPositionId]);

    const availableLocations = useMemo(() => {
        if (!formData.subCityId) return [];
        return (lookups.locations || []).filter(l => String(l.subCityId) === String(formData.subCityId));
    }, [formData.subCityId, lookups.locations]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExtendProject = async () => {
        if (!extensionData.extendedDays || !extensionData.reason) {
            return showAlert('error', 'Please provide days and reason');
        }
        try {
            setSaving(true);
            await projectApi.EXTEND_PROJECT(id, {
                extendedDays: Number(extensionData.extendedDays),
                reason: extensionData.reason
            });
            showAlert('success', 'Project timeline adjusted successfully');
            
            // Refetch and reset form
            const res = await projectApi.GET_PROJECT(id);
            setFormData(normalizeData(res.data?.data || res.data));
            setExtensionData({ extendedDays: '', reason: '' });
            setShowExtendModal(false); // Close after successful addition
        } catch (err) { showAlert('error', 'Extension failed'); } finally { setSaving(false); }
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const { projectCode, extensions, totalExtendedDays, ...rest } = formData;
            const payload = { ...rest, 
                subCityId: formData.subCityId ? Number(formData.subCityId) : null,
                budget: formData.budget ? parseFloat(formData.budget) : 0
            };
            if (isEdit) await projectApi.UPDATE_PROJECT(id, payload);
            else await projectApi.CREATE_PROJECT(payload);
            showAlert('success', 'Project Registry Updated.');
            setTimeout(() => navigate('/projects'), 1500);
        } catch (err) { showAlert('error', 'Transaction failed.'); } finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse tracking-widest uppercase text-xs">Syncing with Registry...</div>;

    return (
        <div className="w-full space-y-8 pb-12 px-6 relative animate-fadeIn bg-[#F8FAFC]">
            
            {/* Modal: Dual-Pane Extension Dashboard */}
            {showExtendModal && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 py-6">
                    <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[90vh] shadow-2xl border border-white overflow-hidden flex flex-col animate-slideUp">
                        
                        {/* Modal Header */}
                        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 rounded-2xl"><History className="text-amber-600" /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Timeline Management</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{formData.projectCode} Registry History</p>
                                </div>
                            </div>
                            <button onClick={() => setShowExtendModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><Close /></button>
                        </div>

                        {/* Dual-Pane Body */}
                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            
                            {/* Left Pane: History Registry */}
                            <div className="lg:w-2/5 border-r bg-slate-50/30 overflow-y-auto p-8 custom-scrollbar">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Audit Trail</span>
                                    <span className="px-3 py-1 bg-white border rounded-full text-[9px] font-black text-slate-400 italic">{(formData.extensions || []).length} Records Found</span>
                                </div>

                                {(!formData.extensions || formData.extensions.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                        <History size={40} className="mb-2" />
                                        <p className="text-[10px] font-bold uppercase">No Prior Adjustments</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 relative border-l-2 border-slate-200 ml-2">
                                        {formData.extensions.map((ext, i) => (
                                            <div key={i} className="relative pl-8 pb-2">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-amber-400 shadow-sm" />
                                                <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 uppercase">+{ext.extendedDays} Days</span>
                                                        <span className="text-[8px] font-bold text-slate-300 uppercase">{ext.createdAt || 'Approved'}</span>
                                                    </div>
                                                    <p className="text-[12px] text-slate-600 font-medium leading-relaxed mb-4 italic">"{ext.reason}"</p>
                                                    <div className="flex items-center gap-3 pt-3 border-t border-slate-50 text-[10px]">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-300 font-bold uppercase text-[7px]">From</span>
                                                            <span className="font-bold text-slate-500">{ext.previousEndDate}</span>
                                                        </div>
                                                        <ChevronRight size={12} className="text-slate-200" />
                                                        <div className="flex flex-col">
                                                            <span className="text-sky-400 font-bold uppercase text-[7px]">Target</span>
                                                            <span className="font-black text-[#0284C7]">{ext.newEndDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Pane: New Extension Form */}
                            <div className="lg:w-3/5 p-10 overflow-y-auto">
                                <div className="max-w-md mx-auto h-full flex flex-col">
                                    <div className="mb-10 text-center">
                                        <div className="w-16 h-16 bg-blue-50 text-[#0284C7] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                            <CalendarPlus size={32} />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tight">New Extension Request</h4>
                                        <p className="text-xs text-slate-400 font-medium mt-1">Authorized personnel only. This action is immutable.</p>
                                    </div>

                                    <div className="space-y-8 flex-1">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Extension Duration</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="Enter number of days"
                                                    value={extensionData.extendedDays}
                                                    onChange={(e) => setExtensionData(p => ({ ...p, extendedDays: e.target.value }))}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] px-8 py-5 text-2xl font-black outline-none focus:border-[#0284C7] focus:bg-white transition-all pr-24"
                                                />
                                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">Days</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Formal Justification</label>
                                            <textarea
                                                rows="5"
                                                placeholder="Provide the technical or administrative reason for this timeline adjustment..."
                                                value={extensionData.reason}
                                                onChange={(e) => setExtensionData(p => ({ ...p, reason: e.target.value }))}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] px-8 py-5 text-sm font-medium outline-none focus:border-[#0284C7] focus:bg-white transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-12 flex flex-col gap-3">
                                        <button 
                                            onClick={handleExtendProject}
                                            disabled={saving}
                                            className="w-full bg-slate-900 text-white rounded-[24px] py-5 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle2 size={18} className="text-green-400" /> {saving ? 'PROCESSING...' : 'AUTHORIZE & LOG REGISTRY'}
                                        </button>
                                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed">
                                            By authorizing, you acknowledge this revision will be permanently logged <br/> against project {formData.projectCode}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirm Global Save */}
            {showConfirm && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full text-center border animate-scaleIn">
                        <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-black uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-3">Sync project <b>{isEdit ? formData.projectCode : 'New Entry'}</b> to registry?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-black uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 bg-[#0284C7] text-white font-black text-[11px] uppercase shadow-lg hover:bg-sky-700 transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Action Bar */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/projects')} className="p-3 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{isEdit ? 'Update Project' : 'Launch Project'}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${formData.projectLevel === 'CITY' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {formData.projectLevel} JURISDICTION
                            </span>
                        </div>
                    </div>
                </div>
                {((!isEdit && can('CAN_CREATE_PROJECT')) || (isEdit && can('CAN_UPDATE_PROJECT'))) && (
                    <button onClick={() => setShowConfirm(true)} disabled={saving} className="bg-[#0284C7] text-white px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 hover:bg-[#0369a1] active:scale-95 transition-all shadow-xl shadow-sky-100 disabled:opacity-50 tracking-widest uppercase">
                        <Save style={{ fontSize: 20 }} /> {saving ? 'SAVING...' : 'COMMIT CHANGES'}
                    </button>
                )}
            </div>

            {/* Form Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Identification */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Info className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Identification</span></div>
                    <div className="p-8 space-y-6 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Code</label>
                                <input name="projectCode" value={formData.projectCode || ""} placeholder="AUTO-GEN" disabled className="w-full text-sm font-bold bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type *</label><select name="projectType" value={formData.projectType || ""} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none"><option value="BUILDING">Building</option><option value="WATER_AND_ROAD">Water & Road</option></select></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Formal Title *</label><input name="title" value={formData.title || ""} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7]" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Client Partner</label><select name="clientId" value={formData.clientId || ""} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none"><option value="">TBD / Global</option>{lookups.clients.map(c => <option key={c.id} value={String(c.id)}>{c.clientName}</option>)}</select></div>
                    </div>
                </div>

                {/* Site Assignment */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><LocationOn className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Site Assignment</span></div>
                    <div className="p-8 space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sub-City</label>
                            <div className="flex gap-3">
                                <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl px-5 py-3.5 text-[12px] font-black flex items-center gap-2 uppercase tracking-tighter"><LocationCity style={{ fontSize: 18 }} /> {cityName}</div>
                                <select name="subCityId" value={formData.subCityId || ""} onChange={handleInputChange} disabled={formData.projectLevel === 'SUB_CITY' && authSubCityId} className="flex-1 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none appearance-none cursor-pointer">
                                    <option value="">-- {formData.projectLevel === 'CITY' ? 'Global' : 'Select'} --</option>
                                    {(lookups.subCities || []).map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase ml-1 text-slate-400">Locations</label>
                            <div className="relative">
                                <PinDrop className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 22 }} />
                                <select disabled={!formData.subCityId} onChange={(e) => { const v = Number(e.target.value); if (v && !(formData.locationIds || []).includes(v)) setFormData(p => ({ ...p, locationIds: [...(p.locationIds || []), v] })); }} className="w-full pl-12 pr-4 py-3.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl appearance-none outline-none disabled:bg-slate-50/50"><option value="">-- Tag Locations --</option>{(availableLocations || []).filter(l => !(formData.locationIds || []).includes(l.id)).map(l => <option key={l.id} value={String(l.id)}>{l.name}</option>)}</select>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {(formData.locationIds || []).map(locId => {
                                    const loc = (lookups.locations || []).find(l => l.id === locId);
                                    return loc ? (<div key={locId} className="flex items-center gap-2 bg-slate-800 text-white pl-3 pr-1.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest">{loc.name}<Close onClick={() => setFormData(p => ({ ...p, locationIds: (p.locationIds || []).filter(i => i !== locId) }))} className="cursor-pointer" style={{ fontSize: 14 }} /></div>) : null;
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Groups className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Management</span></div>
                    <div className="p-8 space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase ml-1 text-slate-400">Project Manager</label>
                            <select name="projectManagerId" value={formData.projectManagerId || ""} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 appearance-none cursor-pointer">
                                <option value="">Unassigned</option>
                                {lookups.employees.map(m => <option key={m.id} value={String(m.id)}>{m.fullName}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label><select name="status" value={formData.status || ""} onChange={handleInputChange} className="w-full text-[11px] font-black bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none uppercase tracking-[0.1em]">{['NOT_STARTED', 'ON_GOING', 'COMPLETED', 'ON_HOLD', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority</label><select name="priority" value={formData.priority || ""} onChange={handleInputChange} className="w-full text-[11px] font-black bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none uppercase tracking-widest">{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personnel Tagging Card */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden" ref={dropdownRef}>
                <div className="p-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3"><Groups className="text-slate-400" fontSize="small" /><span className="text-[12px] font-bold uppercase text-slate-500 tracking-widest">Personnel Tagging</span></div>
                <div className="p-10 space-y-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" style={{ fontSize: 24 }} />
                        <input
                            type="text"
                            placeholder="Search direct reports..."
                            className="w-full pl-14 pr-6 py-4.5 text-base font-semibold bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:border-[#0284C7] transition-all"
                            value={teamSearch}
                            onChange={(e) => { setTeamSearch(e.target.value); setIsTeamDropdownOpen(true); }}
                            onFocus={() => setIsTeamDropdownOpen(true)}
                        />
                        {isTeamDropdownOpen && teamOptions.length > 0 && (
                            <div className="absolute z-20 w-full mt-3 bg-white border border-slate-100 rounded-[32px] shadow-2xl max-h-64 overflow-y-auto py-3 animate-fadeIn">
                                {teamOptions.map(emp => (
                                    <div key={emp.id} onClick={() => { setFormData(p => ({ ...p, employeeIds: [...(p.employeeIds || []), emp.id] })); setTeamSearch(''); setIsTeamDropdownOpen(false); }} className="px-8 py-4 hover:bg-sky-50 cursor-pointer flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-[#0284C7]">{emp.fullName}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">{emp.positionName}</span>
                                        </div>
                                        <Add className="text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {(formData.employeeIds || []).map(empId => {
                            const emp = (lookups.employees || []).find(e => e.id === empId);
                            return emp ? (
                                <div key={empId} className="flex items-center gap-3 bg-[#0284C7] text-white pl-5 pr-3 py-3 rounded-2xl text-[12px] font-bold shadow-lg shadow-sky-100 animate-scaleIn">
                                    {emp.fullName}
                                    <Close onClick={() => setFormData(p => ({ ...p, employeeIds: (p.employeeIds || []).filter(id => id !== empId) }))} className="cursor-pointer bg-white/20 rounded-full p-1" style={{ fontSize: 18 }} />
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
            </div>

            {/* Timelines and Finance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
                    <div className="flex items-center gap-4 mb-8 font-bold text-[12px] text-slate-400 uppercase tracking-[0.2em]"><Payments className="text-[#FBAF1E]" /> Financial Context</div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Project Budget</label><input name="budget" type="number" value={formData.budget || ""} onChange={handleInputChange} className="w-full text-2xl font-black bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 outline-none focus:border-[#0284C7]" placeholder="0.00" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Currency</label><select name="currencyType" value={formData.currencyType || ""} onChange={handleInputChange} className="w-full h-[72px] font-bold bg-slate-50 border border-slate-200 rounded-[28px] px-8 appearance-none outline-none"><option value="ETB">ETB</option><option value="USD">USD</option></select></div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col relative overflow-hidden">
                    {formData.totalExtendedDays > 0 && (
                        <div className="absolute top-0 right-0 p-4">
                            <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl flex items-center gap-2 border border-amber-200">
                                <AlertCircle size={14} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Extended by {formData.totalExtendedDays} Days</span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4 font-bold text-[12px] text-slate-400 uppercase tracking-[0.2em]"><CalendarMonth className="text-sky-500" /> Project Schedule</div>
                        {isEdit && (
                            <button onClick={() => setShowExtendModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-100">
                                <History size={14} /> Extension Dashboard
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Launch Date</label><input name="startDate" type="date" value={formData.startDate || ""} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-[24px] px-6 py-4 outline-none focus:border-[#0284C7]" /></div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Planned Deadline</label>
                            <input name="endDate" type="date" value={formData.endDate || ""} onChange={handleInputChange} className={`w-full text-sm font-black rounded-[24px] px-6 py-4 outline-none border ${formData.totalExtendedDays > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`} />
                            {/* The "+ Days" Indicator (Only shows if totalExtendedDays > 0) */}
                            {formData.totalExtendedDays > 0 && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                    <div className="h-4 w-[1px] bg-amber-200 mr-2" /> {/* Divider line */}
                                    <span className="text-[11px] font-black text-amber-600 bg-white px-2.5 py-1 rounded-xl shadow-sm border border-amber-100 flex items-center gap-1">
                                        <TrendingUp size={12} />
                                        + {formData.totalExtendedDays} Days
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Horizontal Timeline Summary at the bottom */}
            {isEdit && formData.extensions?.length > 0 && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <History className="text-slate-400" size={18} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Timeline Extension Summary</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {formData.extensions.map((ext, i) => (
                            <div key={i} className="min-w-[280px] bg-slate-50 border border-slate-100 rounded-[24px] p-6">
                                <div className="flex justify-between mb-3">
                                    <span className="text-[9px] font-black px-2 py-1 bg-white rounded-lg text-amber-600">+{ext.extendedDays} Days</span>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase italic">Rev #{formData.extensions.length - i}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-2 italic font-medium">"{ext.reason}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}