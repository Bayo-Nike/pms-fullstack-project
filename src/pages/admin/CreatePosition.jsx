import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Save, Work, AccountTree, CorporateFare, HelpOutline } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreatePosition() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Form States
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const [divisionId, setDivisionId] = useState('');

    // Selection Data States
    const [availablePositions, setAvailablePositions] = useState([]);
    const [availableDivisions, setAvailableDivisions] = useState([]);

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
                // 1. Fetch Positions for Parent dropdown (filter self if editing)
                const posRes = await adminApi.GET_POSITIONS();
                const posList = posRes.data || posRes;
                setAvailablePositions(isEdit ? posList.filter(p => p.id.toString() !== id) : posList);

                // 2. Fetch Divisions
                const divRes = await adminApi.GET_DIVISIONS();
                setAvailableDivisions(divRes.data || divRes);

                // 3. Fetch specific position if editing
                if (isEdit) {
                    const detailRes = await adminApi.GET_POSITION(id);
                    const d = detailRes.data || detailRes;
                    setName(d.name || '');
                    setParentId(d.parentId || '');
                    setDivisionId(d.divisionId || '');
                }
            } catch (err) {
                showAlert('error', 'Initialization failed.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id, isEdit]);

    const handleSaveTrigger = () => {
        if (!name.trim()) return showAlert('error', 'Position name is required.');
        if (!divisionId) return showAlert('error', 'Division assignment is required.');
        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                parentId: parentId === '' ? null : parentId,
                divisionId: divisionId
            };

            if (isEdit) {
                await adminApi.UPDATE_POSITION(id, payload);
                showAlert('success', 'Position updated.');
            } else {
                await adminApi.CREATE_POSITION(payload);
                showAlert('success', 'Position created.');
            }
            setTimeout(() => navigate('/admin/positions'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction failed.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 italic">Synchronizing Position Matrix...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border text-center">
                        <HelpOutline className="text-[#0284C7] mb-4 mx-auto" style={{ fontSize: 48 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2">Save designation <b>{name}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/positions')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit Position' : 'Create Position'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Hierarchy Registry</p>
                    </div>
                </div>
                <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50">
                    <Save style={{ fontSize: 16 }} /> {saving ? 'PROCESSSING...' : isEdit ? 'UPDATE POSITION' : 'SAVE POSITION'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2"><Work className="text-slate-400" fontSize="small" /><span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Job Details</span></div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Position Name</label>
                            <input className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] transition-all" placeholder="e.g. Senior Project Engineer" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Division Assignment</label>
                            <select value={divisionId} onChange={(e) => setDivisionId(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer">
                                <option value="">-- Select Division --</option>
                                {availableDivisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2"><AccountTree className="text-slate-400" fontSize="small" /><span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Reporting Line</span></div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Superior Position (Reports To)</label>
                            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer">
                                <option value="">None (Top Level Position)</option>
                                {availablePositions.map(p => <option key={p.id} value={p.id}>{p.name} {p.divisionName ? `[${p.divisionName}]` : ''}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}