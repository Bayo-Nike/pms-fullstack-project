import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, PinDrop, LocationOn, HelpOutline, Language
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateLocation() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        subCityId: '',
        lat: '',
        lng: ''
    });

    const [subCities, setSubCities] = useState([]);
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
                const subRes = await adminApi.GET_SUB_CITIES();
                const subListData = subRes.data?.data || subRes.data || [];
                setSubCities(subListData);

                if (isEdit) {
                    const locRes = await adminApi.GET_LOCATION(id);
                    const l = locRes.data?.data || locRes.data;
                    if (l) {
                        setFormData({
                            name: l.name || '',
                            subCityId: l.subCityId || '',
                            lat: l.lat ?? '', // Handle null from DB
                            lng: l.lng ?? ''  // Handle null from DB
                        });
                    }
                }
            } catch (err) {
                showAlert('error', 'Failed to synchronize with location registry.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id, isEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveTrigger = () => {
        const { name, subCityId } = formData;

        // VALIDATION: Lat and Lng are now excluded from the mandatory check
        if (!name?.toString().trim() || !subCityId) {
            showAlert('error', 'Validation Error: Site name and Jurisdiction are mandatory.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            // PAYLOAD: Convert empty strings to null, otherwise parse to Float
            const payload = {
                name: formData.name.trim(),
                subCityId: Number(formData.subCityId),
                lat: formData.lat === '' ? null : parseFloat(formData.lat),
                lng: formData.lng === '' ? null : parseFloat(formData.lng)
            };

            if (isEdit) {
                await adminApi.UPDATE_LOCATION(id, payload);
                showAlert('success', 'Site configuration updated successfully.');
            } else {
                await adminApi.CREATE_LOCATION(payload);
                showAlert('success', 'New location registered successfully.');
            }
            setTimeout(() => navigate('/admin/locations'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction rejected.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 italic animate-pulse">Syncing Site Context...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-100 text-center">
                        <HelpOutline className="text-[#0284C7] mb-4 mx-auto" style={{ fontSize: 56 }} />
                        <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Save <b>{formData.name}</b> to the spatial registry?
                        </p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100 hover:bg-[#016da3]">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/locations')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Update Site' : 'Create Location'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Spatial Data</p>
                    </div>
                </div>
                <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 uppercase tracking-widest">
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : 'COMMIT LOCATION'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                        <PinDrop className="text-slate-400" fontSize="small" />
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Site Identity</span>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Location Name</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] transition-all shadow-sm" placeholder="e.g. Megenagna Square" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Sub-City</label>
                            <select name="subCityId" value={formData.subCityId} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer">
                                <option value="">-- Select Sub-City --</option>
                                {subCities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                        <Language className="text-slate-400" fontSize="small" />
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">GIS (Optional)</span>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Latitude</label>
                                <input name="lat" type="number" step="any" value={formData.lat} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] transition-all" placeholder="Optional" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Longitude</label>
                                <input name="lng" type="number" step="any" value={formData.lng} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] transition-all" placeholder="Optional" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">GPS data is used for mapping and geo-fencing projects.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}