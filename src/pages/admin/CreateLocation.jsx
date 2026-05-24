import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, PinDrop, LocationOn, HelpOutline, Language
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

// --- LEAFLET IMPORTS ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon path issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper: Handles single click to set coordinates
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Helper: Centers map when editing or selecting
function ChangeMapView({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords[0] && coords[1]) {
            map.setView(coords, map.getZoom());
        }
    }, [coords, map]);
    return null;
}

export default function CreateLocation() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        subCityId: '',
        woredaId: '',
        lat: '',
        lng: ''
    });

    const [subCities, setSubCities] = useState([]);
    const [allWoredas, setAllWoredas] = useState([]);
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
                // const subRes = await adminApi.GET_SUB_CITIES();
                // const subListData = subRes.data?.data || subRes.data || [];
                // setSubCities(subListData);
                const [subRes, woredaRes] = await Promise.all([
                    adminApi.GET_SUB_CITIES(),
                    adminApi.GET_WOREDAS()
                ]);

                setSubCities(subRes.data?.data || subRes.data || []);
                setAllWoredas(woredaRes.data?.data || woredaRes.data || []);

                if (isEdit) {
                    const locRes = await adminApi.GET_LOCATION(id);
                    const l = locRes.data?.data || locRes.data;
                    if (l) {
                        setFormData({
                            name: l.name || '',
                            subCityId: l.subCity?.id || l.subCityId || '',
                            woredaId: l.woreda?.id || l.woredaId || '',
                            lat: l.lat ?? '', 
                            lng: l.lng ?? ''  
                        });
                    }
                }
            } catch (err) {
                showAlert('error', 'Failed to synchronize with Site registry.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id, isEdit]);

    // 2. Hierarchical Filter: Only show woredas belonging to selected sub-city
    const filteredWoredas = useMemo(() => {
        if (!formData.subCityId) return [];
        return allWoredas.filter(w => 
            String(w.subCityId) === String(formData.subCityId) || 
            String(w.subCity?.id) === String(formData.subCityId)
        );
    }, [formData.subCityId, allWoredas]);

    // --- EVENT HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value,
            // Reset Woreda if Sub-City changes
            ...(name === 'subCityId' ? { woredaId: '' } : {})
         }));
    };

    // --- MAP CLICK LOGIC ---
    const handleMapClick = (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            lat: lat.toFixed(7),
            lng: lng.toFixed(7)
        }));
    };

    const handleSaveTrigger = () => {
        const { name, subCityId, woredaId } = formData;
        if (!name?.toString().trim() || !subCityId) {
            showAlert('error', 'Validation Error: Site name, SUb-city and Woreda are mandatory.');
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
                name: formData.name.trim(),
                subCityId: Number(formData.subCityId),
                woredaId: Number(formData.woredaId),
                lat: formData.lat === '' ? null : parseFloat(formData.lat),
                lng: formData.lng === '' ? null : parseFloat(formData.lng)
            };

            if (isEdit) {
                await adminApi.UPDATE_LOCATION(id, payload);
                showAlert('success', 'Site configuration updated successfully.');
            } else {
                await adminApi.CREATE_LOCATION(payload);
                showAlert('success', 'New Site registered successfully.');
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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-100 text-center">
                        <HelpOutline className="text-[#0284C7] mb-4 mx-auto" style={{ fontSize: 56 }} />
                        <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Save <b>{formData.name}</b> to the spatial registry?
                        </p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase shadow-lg hover:bg-[#016da3]">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            {/* HEADER */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/locations')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Update Site' : 'Create site'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Spatial Data Management</p>
                    </div>
                </div>
                <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 uppercase tracking-widest">
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : 'COMMIT SITE'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* LEFT COLUMN: IDENTITY */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                        <PinDrop className="text-slate-400" fontSize="small" />
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Site Identity</span>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Sub-City</label>
                            <select name="subCityId" value={formData.subCityId} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white appearance-none cursor-pointer">
                                <option value="">-- Select Sub-City --</option>
                                {subCities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Woreda Designation</label>
                            <select 
                                name="woredaId" 
                                value={formData.woredaId} 
                                onChange={handleInputChange} 
                                disabled={!formData.subCityId}
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white appearance-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="">-- Select Woreda --</option>
                                {filteredWoredas.map(w => <option key={w.id} value={w.id}>{w.woredaName || w.name}</option>)}
                            </select>
                            {!formData.subCityId && <p className="text-[9px] text-amber-500 font-bold ml-1 italic">Select a Sub-City first</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Site Name</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] transition-all shadow-sm" placeholder="e.g. Megenagna Square" />
                        </div>
                        
                    </div>
                </div>

                {/* RIGHT COLUMN: GIS MAP */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Language className="text-slate-400" fontSize="small" />
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">GIS Mapping</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                           {formData.lat ? `${formData.lat}, ${formData.lng}` : 'No coords set'}
                        </div>
                    </div>

                    <div className="flex-1 relative z-0">
                        <MapContainer 
                            center={[9.0192, 38.7525]} 
                            zoom={12} 
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            
                            <MapClickHandler onMapClick={handleMapClick} />
                            
                            {formData.lat && formData.lng && (
                                <>
                                    <ChangeMapView coords={[formData.lat, formData.lng]} />
                                    <Marker position={[formData.lat, formData.lng]} />
                                </>
                            )}
                        </MapContainer>
                    </div>

                    <div className="p-4 bg-slate-50/50 grid grid-cols-2 gap-4 border-t border-slate-100">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Latitude</label>
                            <input name="lat" type="number" step="any" value={formData.lat} onChange={handleInputChange} disabled className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7]" placeholder="Click map..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Longitude</label>
                            <input name="lng" type="number" step="any" value={formData.lng} onChange={handleInputChange} disabled className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7]" placeholder="Click map..." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}