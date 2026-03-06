import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Save, Apartment, HelpOutline } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateSubCity() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Form State
    const [name, setName] = useState('');

    // UI States
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        if (isEdit) {
            const fetchDetails = async () => {
                try {
                    const res = await adminApi.GET_SUB_CITY(id);
                    const data = res.data || res;
                    setName(data.name || '');
                } catch (err) {
                    showAlert('error', 'Critical: Could not retrieve sub-city configuration.');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [id, isEdit]);

    const handleSaveTrigger = () => {
        if (!name.trim()) {
            showAlert('error', 'Validation Error: Sub-city name is mandatory.');
            return;
        }
        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const payload = { name: name.trim() };

            if (isEdit) {
                await adminApi.UPDATE_SUB_CITY(id, payload);
                showAlert('success', 'Sub-city configuration updated successfully.');
            } else {
                await adminApi.CREATE_SUB_CITY(payload);
                showAlert('success', 'New sub-city jurisdiction established.');
            }

            setTimeout(() => navigate('/admin/sub-cities'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction failed: Server rejected the request.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 italic animate-pulse">Synchronizing geographic registry...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

            {/* Save/Update Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 text-center">
                        <HelpOutline className="text-[#0284C7] mb-4" style={{ fontSize: 48 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Changes</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Are you sure you want to {isEdit ? 'update' : 'register'} <b>{name}</b> in the system?
                        </p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100 transition-all">Confirm</button>
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

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/sub-cities')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit Jurisdiction' : 'Create Sub-City'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Geographic Module</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveTrigger}
                    disabled={saving}
                    className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : isEdit ? 'UPDATE NAME' : 'COMMIT REGISTRATION'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                    <Apartment className="text-slate-400" fontSize="small" />
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">General Information</span>
                </div>

                <div className="p-8 max-w-2xl">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Sub-City Name / Region Title</label>
                        <input
                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] focus:bg-white transition-all shadow-sm"
                            placeholder="e.g. Kirkos, Yeka, Nifas Silk..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 italic ml-1 mt-2">
                            This designation will be available for project categorization and filtering.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}