// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { ArrowBack, Save, CorporateFare, AccountTree, HelpOutline, InfoOutlined } from '@mui/icons-material';
// import adminApi from '../../api/modules/admin';
// import AlertMessage from '../../components/Reusable/AlertMessage';

// export default function CreateDivision() {
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const isEdit = Boolean(id);

//     // Form States
//     const [name, setName] = useState('');
//     const [parentId, setParentId] = useState(''); // Stores the ID of the parent division

//     // UI & Data States
//     const [availableDivisions, setAvailableDivisions] = useState([]);
//     const [currentDivisionData, setCurrentDivisionData] = useState(null); // Full response data if editing
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
//                 // 1. Fetch all divisions to populate the "Parent" dropdown
//                 const listRes = await adminApi.GET_DIVISIONS();
//                 const list = listRes.data || listRes;

//                 // Filter out the current division from the parent list if editing 
//                 // (a division cannot be its own parent)
//                 const filteredList = isEdit ? list.filter(d => d.id.toString() !== id) : list;
//                 setAvailableDivisions(filteredList);

//                 // 2. Fetch specific division details if editing
//                 if (isEdit) {
//                     const detailRes = await adminApi.GET_DIVISION(id);
//                     const data = detailRes.data || detailRes;
//                     setCurrentDivisionData(data);
//                     setName(data.name || '');
//                     setParentId(data.parentId || '');
//                 }
//             } catch (err) {
//                 console.error(err);
//                 showAlert('error', 'Critical: Failed to synchronize organizational structure.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         initData();
//     }, [id, isEdit]);

//     const handleSaveTrigger = () => {
//         if (!name.trim()) {
//             showAlert('error', 'Validation Error: Division name is mandatory.');
//             return;
//         }
//         setShowConfirm(true);
//     };

//     const executeSave = async () => {
//         setShowConfirm(false);
//         setSaving(true);
//         try {
//             // Payload matches DivisionRequestDto
//             const payload = {
//                 name: name.trim(),
//                 parentId: parentId === '' ? null : parentId
//             };

//             if (isEdit) {
//                 await adminApi.UPDATE_DIVISION(id, payload);
//                 showAlert('success', 'Organizational unit updated successfully.');
//             } else {
//                 await adminApi.CREATE_DIVISION(payload);
//                 showAlert('success', 'New division established successfully.');
//             }

//             setTimeout(() => navigate('/admin/divisions'), 1500);
//         } catch (err) {
//             showAlert('error', err.response?.data?.message || 'Transaction failed: Dependency or duplicate name issue.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) return <div className="p-10 text-center text-slate-400 italic animate-pulse">Building Hierarchy Map...</div>;

//     return (
//         <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

//             {/* Confirmation Dialog */}
//             {showConfirm && (
//                 <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
//                     <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 text-center">
//                         <HelpOutline className="text-[#0284C7] mb-4" style={{ fontSize: 48 }} />
//                         <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
//                         <p className="text-sm text-slate-500 mt-2">
//                             Are you sure you want to save <b>{name}</b> {parentId ? 'under the selected parent' : 'as a root unit'}?
//                         </p>
//                         <div className="flex gap-3 mt-8">
//                             <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Cancel</button>
//                             <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100 transition-all">Confirm</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <AlertMessage
//                 show={alert.show}
//                 type={alert.type}
//                 message={alert.message}
//                 onClose={() => setAlert(prev => ({ ...prev, show: false }))}
//             />

//             {/* Header / Action Bar */}
//             <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
//                 <div className="flex items-center gap-3">
//                     <button onClick={() => navigate('/admin/divisions')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
//                         <ArrowBack fontSize="small" />
//                     </button>
//                     <div>
//                         <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit Division' : 'Create Unit'}</h1>
//                         <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Organizational Matrix</p>
//                     </div>
//                 </div>
//                 <button
//                     onClick={handleSaveTrigger}
//                     disabled={saving}
//                     className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50"
//                 >
//                     <Save style={{ fontSize: 16 }} /> {saving ? 'PROCESSSING...' : isEdit ? 'UPDATE UNIT' : 'SAVE DIVISION'}
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 {/* Left Card: General Info */}
//                 <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
//                     <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
//                         <CorporateFare className="text-slate-400" fontSize="small" />
//                         <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">General Identification</span>
//                     </div>

//                     <div className="p-6 space-y-4">
//                         <div className="space-y-1.5">
//                             <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Division Name</label>
//                             <input
//                                 className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all"
//                                 placeholder="e.g. Roads & Infrastructure Department"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                             />
//                         </div>

//                         {isEdit && currentDivisionData?.children?.length > 0 && (
//                             <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <InfoOutlined className="text-amber-600" fontSize="small" />
//                                     <span className="text-[10px] font-bold text-amber-700 uppercase">Warning</span>
//                                 </div>
//                                 <p className="text-[10px] text-amber-600 leading-relaxed">
//                                     This division currently manages <b>{currentDivisionData.children.length} sub-units</b>.
//                                     Changing its name or parent will affect the entire downward hierarchy.
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Right Card: Hierarchy Context */}
//                 <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
//                     <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
//                         <AccountTree className="text-slate-400" fontSize="small" />
//                         <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Parent Hierarchy</span>
//                     </div>

//                     <div className="p-6 space-y-4">
//                         <div className="space-y-1.5">
//                             <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Parent Unit (Optional)</label>
//                             <select
//                                 value={parentId}
//                                 onChange={(e) => setParentId(e.target.value)}
//                                 className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all appearance-none cursor-pointer"
//                             >
//                                 <option value="">None (Top Level / Root Division)</option>
//                                 {availableDivisions.map(d => (
//                                     <option key={d.id} value={d.id}>
//                                         {d.name} {d.parentName ? `(Under ${d.parentName})` : ''}
//                                     </option>
//                                 ))}
//                             </select>
//                             <p className="text-[10px] text-slate-400 italic ml-1 mt-2">
//                                 Leave as "None" if this is a primary department reporting directly to the CEO/Admin.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { ArrowBack, Save, CorporateFare, AccountTree, HelpOutline, InfoOutlined, Schema } from '@mui/icons-material';
// import adminApi from '../../api/modules/admin';
// import AlertMessage from '../../components/Reusable/AlertMessage';

// export default function CreateDivision() {
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const isEdit = Boolean(id);

//     const [name, setName] = useState('');
//     const [divisionGroup, setDivisionGroup] = useState('BLD'); // New Attribute State
//     const [parentId, setParentId] = useState('');

//     const [availableDivisions, setAvailableDivisions] = useState([]);
//     const [currentDivisionData, setCurrentDivisionData] = useState(null);
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
//                 const listRes = await adminApi.GET_DIVISIONS();
//                 const list = listRes.data || listRes;
//                 const filteredList = isEdit ? list.filter(d => d.id.toString() !== id) : list;
//                 setAvailableDivisions(filteredList);

//                 if (isEdit) {
//                     const detailRes = await adminApi.GET_DIVISION(id);
//                     const data = detailRes.data || detailRes;
//                     setCurrentDivisionData(data);
//                     setName(data.name || '');
//                     setDivisionGroup(data.divisionGroup || 'BLD'); // Load from response
//                     setParentId(data.parentId || '');
//                 }
//             } catch (err) {
//                 console.error(err);
//                 showAlert('error', 'Critical: Failed to synchronize organizational structure.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         initData();
//     }, [id, isEdit]);

//     const handleSaveTrigger = () => {
//         if (!name.trim()) {
//             showAlert('error', 'Validation Error: Division name is mandatory.');
//             return;
//         }
//         setShowConfirm(true);
//     };

//     const executeSave = async () => {
//         setShowConfirm(false);
//         setSaving(true);
//         try {
//             const payload = {
//                 name: name.trim(),
//                 divisionGroup: divisionGroup, // Included in payload
//                 parentId: parentId === '' ? null : parentId
//             };

//             if (isEdit) {
//                 await adminApi.UPDATE_DIVISION(id, payload);
//                 showAlert('success', 'Organizational unit updated successfully.');
//             } else {
//                 await adminApi.CREATE_DIVISION(payload);
//                 showAlert('success', 'New division established successfully.');
//             }

//             setTimeout(() => navigate('/admin/divisions'), 1500);
//         } catch (err) {
//             showAlert('error', err.response?.data?.message || 'Transaction failed: Dependency or duplicate name issue.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) return <div className="p-10 text-center text-slate-400 italic animate-pulse">Building Hierarchy Map...</div>;

//     return (
//         <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

//             {showConfirm && (
//                 <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
//                     <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 text-center">
//                         <HelpOutline className="text-[#0284C7] mb-4" style={{ fontSize: 48 }} />
//                         <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
//                         <p className="text-sm text-slate-500 mt-2">
//                             Are you sure you want to save <b>{name}</b> {parentId ? 'under the selected parent' : 'as a root unit'}?
//                         </p>
//                         <div className="flex gap-3 mt-8">
//                             <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Cancel</button>
//                             <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100 transition-all">Confirm</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

//             <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
//                 <div className="flex items-center gap-3">
//                     <button onClick={() => navigate('/admin/divisions')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
//                         <ArrowBack fontSize="small" />
//                     </button>
//                     <div>
//                         <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit Division' : 'Create Unit'}</h1>
//                         <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Organizational Matrix</p>
//                     </div>
//                 </div>
//                 <button
//                     onClick={handleSaveTrigger}
//                     disabled={saving}
//                     className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50"
//                 >
//                     <Save style={{ fontSize: 16 }} /> {saving ? 'PROCESSSING...' : isEdit ? 'UPDATE UNIT' : 'SAVE DIVISION'}
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
//                     <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
//                         <CorporateFare className="text-slate-400" fontSize="small" />
//                         <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">General Identification</span>
//                     </div>

//                     <div className="p-6 space-y-4">
//                         <div className="space-y-1.5">
//                             <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Division Name</label>
//                             <input
//                                 className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all"
//                                 placeholder="e.g. Roads & Infrastructure Department"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                             />
//                         </div>

//                         {/* Division Group Selection */}
//                         <div className="space-y-1.5">
//                             <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Division Group</label>
//                             <select
//                                 value={divisionGroup}
//                                 onChange={(e) => setDivisionGroup(e.target.value)}
//                                 className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all appearance-none cursor-pointer"
//                             >
//                                 <option value="BLD">Building (BLD)</option>
//                                 <option value="WAR">Water and Road (WAR)</option>
//                                 <option value="BTH">Both (BTH)</option>
//                             </select>
//                         </div>

//                         {isEdit && currentDivisionData?.children?.length > 0 && (
//                             <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <InfoOutlined className="text-amber-600" fontSize="small" />
//                                     <span className="text-[10px] font-bold text-amber-700 uppercase">Warning</span>
//                                 </div>
//                                 <p className="text-[10px] text-amber-600 leading-relaxed">
//                                     This division currently manages <b>{currentDivisionData.children.length} sub-units</b>.
//                                     Changing its name or parent will affect the entire downward hierarchy.
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
//                     <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
//                         <AccountTree className="text-slate-400" fontSize="small" />
//                         <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Parent Hierarchy</span>
//                     </div>

//                     <div className="p-6 space-y-4">
//                         <div className="space-y-1.5">
//                             <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Parent Unit (Optional)</label>
//                             <select
//                                 value={parentId}
//                                 onChange={(e) => setParentId(e.target.value)}
//                                 className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all appearance-none cursor-pointer"
//                             >
//                                 <option value="">None (Top Level / Root Division)</option>
//                                 {availableDivisions.map(d => (
//                                     <option key={d.id} value={d.id}>
//                                         {d.name} {d.parentName ? `(Under ${d.parentName})` : ''}
//                                     </option>
//                                 ))}
//                             </select>
//                             <p className="text-[10px] text-slate-400 italic ml-1 mt-2">
//                                 Leave as "None" if this is a primary department reporting directly to the CEO/Admin.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }




import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Save, CorporateFare, AccountTree, HelpOutline, InfoOutlined } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateDivision() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [name, setName] = useState('');
    const [divisionGroup, setDivisionGroup] = useState('BTH'); // Defaulting to BTH as per "else" logic
    const [parentId, setParentId] = useState('');

    const [availableDivisions, setAvailableDivisions] = useState([]);
    const [currentDivisionData, setCurrentDivisionData] = useState(null);
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
                const listRes = await adminApi.GET_DIVISIONS();
                const list = listRes.data || listRes;
                const filteredList = isEdit ? list.filter(d => d.id.toString() !== id) : list;
                setAvailableDivisions(filteredList);

                if (isEdit) {
                    const detailRes = await adminApi.GET_DIVISION(id);
                    const data = detailRes.data || detailRes;
                    setCurrentDivisionData(data);
                    setName(data.name || '');
                    setDivisionGroup(data.divisionGroup || 'BTH');
                    setParentId(data.parentId || '');
                }
            } catch (err) {
                console.error(err);
                showAlert('error', 'Critical: Failed to synchronize organizational structure.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id, isEdit]);

    // SMART SUGGESTION LOGIC
    const handleNameChange = (val) => {
        setName(val);
        const lower = val.toLowerCase();

        if (lower.includes('building')) {
            setDivisionGroup('BLD');
        } else if (lower.includes('water') || lower.includes('road')) {
            setDivisionGroup('WAR');
        } else {
            setDivisionGroup('BTH');
        }
    };

    const handleSaveTrigger = () => {
        if (!name.trim()) {
            showAlert('error', 'Validation Error: Division name is mandatory.');
            return;
        }
        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                divisionGroup: divisionGroup,
                parentId: parentId === '' ? null : parentId
            };

            if (isEdit) {
                await adminApi.UPDATE_DIVISION(id, payload);
                showAlert('success', 'Organizational unit updated successfully.');
            } else {
                await adminApi.CREATE_DIVISION(payload);
                showAlert('success', 'New division established successfully.');
            }

            setTimeout(() => navigate('/admin/divisions'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction failed: Dependency or duplicate name issue.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 italic animate-pulse">Building Hierarchy Map...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 text-center">
                        <HelpOutline className="text-[#0284C7] mb-4" style={{ fontSize: 48 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Are you sure you want to save <b>{name}</b> {parentId ? 'under the selected parent' : 'as a root unit'}?
                        </p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100 transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/divisions')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit Division' : 'Create Unit'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Organizational Matrix</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveTrigger}
                    disabled={saving}
                    className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                    <Save style={{ fontSize: 16 }} /> {saving ? 'PROCESSSING...' : isEdit ? 'UPDATE UNIT' : 'SAVE DIVISION'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                        <CorporateFare className="text-slate-400" fontSize="small" />
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">General Identification</span>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Division Name</label>
                            <input
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all"
                                placeholder="e.g. Building Infrastructure Dept"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Division Group</label>
                            <select
                                value={divisionGroup}
                                onChange={(e) => setDivisionGroup(e.target.value)}
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                                {/* KEPT CURRENT ORDER */}
                                <option value="BLD">Building (BLD)</option>
                                <option value="WAR">Water and Road (WAR)</option>
                                <option value="BTH">Both (BTH)</option>
                            </select>
                        </div>

                        {isEdit && currentDivisionData?.children?.length > 0 && (
                            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <InfoOutlined className="text-amber-600" fontSize="small" />
                                    <span className="text-[10px] font-bold text-amber-700 uppercase">Warning</span>
                                </div>
                                <p className="text-[10px] text-amber-600 leading-relaxed">
                                    This division currently manages <b>{currentDivisionData.children.length} sub-units</b>.
                                    Changing its name or parent will affect the entire downward hierarchy.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                        <AccountTree className="text-slate-400" fontSize="small" />
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Parent Hierarchy</span>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Parent Unit (Optional)</label>
                            <select
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                                <option value="">None (Top Level / Root Division)</option>
                                {availableDivisions.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} {d.parentName ? `(Under ${d.parentName})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}