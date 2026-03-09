import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, Badge, Work, Business,
    LocationOn, HelpOutline, Mail, ToggleOn,
    LocationCity
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateEmployee() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Form States (Matches CreateEmployeeRequestDto)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        divisionId: '',
        positionId: '',
        subCityId: '',
        status: 'ACTIVE'
    });

    // Lookup Data States
    const [divisions, setDivisions] = useState([]);
    const [positions, setPositions] = useState([]);
    const [subCities, setSubCities] = useState([]);
    const [parentCityName, setParentCityName] = useState('...');

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // parallel fetch for speed
                const [divRes, posRes, subRes, cityRes] = await Promise.all([
                    adminApi.GET_DIVISIONS(),
                    adminApi.GET_POSITIONS(),
                    adminApi.GET_SUB_CITIES(),
                    adminApi.GET_CITY() // Returns raw string e.g., "Addis Ababa"
                ]);

                setDivisions(divRes.data || divRes);
                setPositions(posRes.data || posRes);
                setSubCities(subRes.data || subRes);

                // Handle raw string response
                const cityNameValue = cityRes.data !== undefined ? cityRes.data : cityRes;
                setParentCityName(cityNameValue || "Main Municipality");

                if (isEdit) {
                    const empRes = await adminApi.GET_EMPLOYEE(id);
                    const e = empRes.data || empRes;
                    setFormData({
                        fullName: e.fullName || '',
                        email: e.email || '',
                        divisionId: e.divisionId || '',
                        positionId: e.positionId || '',
                        subCityId: e.subCityId || '',
                        status: e.status || 'ACTIVE'
                    });
                }
            } catch (err) {
                showAlert('error', 'Critical synchronization error: Unable to load organizational lookups.');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, isEdit]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveTrigger = () => {
        const { fullName, email, divisionId, positionId, status } = formData;

        // Strict Validation: No empty fields allowed
        if (!fullName.trim() || !email.trim() || !divisionId || !positionId || !status) {
            showAlert('error', 'Validation Failed: All fields are mandatory Except Subcity. Please complete the form.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            // Mapping ensuring numeric IDs for the DTO
            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                divisionId: Number(formData.divisionId),
                positionId: Number(formData.positionId),
                subCityId: Number(formData.subCityId),
                status: formData.status
            };

            if (isEdit) {
                await adminApi.UPDATE_EMPLOYEE(id, payload);
                showAlert('success', 'Employee profile has been updated successfully.');
            } else {
                await adminApi.CREATE_EMPLOYEE(payload);
                showAlert('success', 'New employee has been successfully registered.');
            }

            setTimeout(() => navigate('/admin/employees'), 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Transaction failed: The server rejected the request.';
            showAlert('error', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Establishing Profile Context...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

            {/* Confirmation Dialog Overlay */}
            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-100 text-center">
                        <HelpOutline className="text-[#0284C7] mb-4 mx-auto" style={{ fontSize: 56 }} />
                        <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Are you sure you want to commit <b>{formData.fullName}</b> to the directory?
                        </p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100 hover:bg-[#016da3] transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage
                show={alert.show}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(prev => ({ ...prev, show: false }))}
            />

            {/* Header Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/employees')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Update Profile' : 'New Employee'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Employee Registry</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveTrigger}
                    disabled={saving}
                    className="bg-[#0284C7] text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 tracking-widest uppercase"
                >
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : (isEdit ? 'UPDATE CHANGES' : 'SAVE RECORD')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Identity Card */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                        <Badge className="text-slate-400" fontSize="small" />
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Identification</span>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Full Legal Name</label>
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all shadow-sm"
                                placeholder="e.g. Elias D."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" style={{ fontSize: 18 }} />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0284C7] focus:bg-white transition-all shadow-sm"
                                    placeholder="email@company.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Account Status</label>
                            <div className="relative">
                                <ToggleOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" style={{ fontSize: 18 }} />
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0284C7] appearance-none cursor-pointer shadow-sm"
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="ON_LEAVE">ON LEAVE</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignment Card */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                        <Business className="text-slate-400" fontSize="small" />
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Job Assignment</span>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Division</label>
                            <select
                                name="divisionId"
                                value={formData.divisionId}
                                onChange={handleInputChange}
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="">-- Assign Division --</option>
                                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Position</label>
                            <select
                                name="positionId"
                                value={formData.positionId}
                                onChange={handleInputChange}
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="">-- Assign Position --</option>
                                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Work Location</label>
                            <div className="flex gap-2">
                                {/* Raw String display from GET_CITY */}
                                <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black flex items-center gap-2 uppercase whitespace-nowrap shadow-sm">
                                    <LocationCity style={{ fontSize: 16 }} />
                                    {parentCityName}
                                </div>
                                <select
                                    name="subCityId"
                                    value={formData.subCityId}
                                    onChange={handleInputChange}
                                    className="flex-1 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer shadow-sm"
                                >
                                    <option value="">-- Select Sub-City --</option>
                                    {subCities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}