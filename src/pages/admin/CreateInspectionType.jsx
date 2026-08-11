import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Save, FactCheck, HelpOutline, Description } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateInspectionType() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        projectType: 'BUILDING'
    });

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
                    const res = await adminApi.GET_INSPECTION_TYPE(id);
                    const data = res.data?.data || res.data;
                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        projectType: data.projectType || 'BUILDING'
                    });
                } catch (err) {
                    showAlert('error', 'Critical: Could not retrieve inspection configuration.');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [id, isEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveTrigger = () => {
        // Validation: Name and ProjectType are mandatory
        if (!formData.name.trim() || !formData.projectType) {
            showAlert('error', 'Validation Error: Template Name and Project Type are required.');
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
                description: formData.description.trim(),
                projectType: formData.projectType
            };

            if (isEdit) {
                await adminApi.UPDATE_INSPECTION_TYPE(id, payload);
                showAlert('success', 'Inspection blueprint updated successfully.');
            } else {
                await adminApi.CREATE_INSPECTION_TYPE(payload);
                showAlert('success', 'New inspection template established.');
            }

            setTimeout(() => navigate('/admin/inspection-types'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction rejected by server.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 italic animate-pulse">Syncing configuration matrix...</div>;

    return (
        <div className="w-full space-y-4 pb-12 px-2 relative animate-fadeIn">
            {/* Save Confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-[#0284C7] mb-4 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Apply settings for <b>{formData.name}</b>?</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3 rounded-xl bg-[#0284C7] text-white font-bold text-[10px] uppercase shadow-lg shadow-sky-100 transition-all hover:bg-[#016da3]">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/inspection-types')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit Blueprint' : 'Register Inspection'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Standardized Inspections</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveTrigger}
                    disabled={saving}
                    className="bg-[#0284C7] text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 uppercase tracking-widest"
                >
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : 'SAVE INSPECTION'}
                </button>
            </div>

            {/* Form */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                    <FactCheck className="text-slate-400" fontSize="small" />
                    <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Configuration Details</span>
                </div>

                <div className="p-8 space-y-6 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Inspection Name *</label>
                            <input
                                name="name"
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0284C7] transition-all shadow-sm"
                                placeholder="e.g. Electrical Safety Audit"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Project Classification *</label>
                            <select
                                name="projectType"
                                value={formData.projectType}
                                onChange={handleInputChange}
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0284C7] appearance-none cursor-pointer"
                            >
                                <option value="BUILDING">Building</option>
                                <option value="WATER_AND_IRRIGATION">Water and Irrigation</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Description style={{ fontSize: 14 }} /> Detailed Technical Inspection Scope
                        </label>
                        <textarea
                            name="description"
                            rows="4"
                            className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0284C7] transition-all resize-none"
                            placeholder="Provide details regarding the checklists and quality standards for this inspection..."
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}