import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, UploadFile, HelpOutline,
    CorporateFare, ToggleOn, Description, CheckCircle, Close
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateConsultant() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Form States
    const [consultantName, setConsultantName] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [registeredDate, setRegisteredDate] = useState('');
    const [licenseExpiryDate, setlicenseExpiryDate] = useState('');
    const [document, setDocument] = useState(null);
    const [existingFile, setExistingFile] = useState('');

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
            const loadData = async () => {
                try {
                    const res = await adminApi.GET_CONSULTANT(id);
                    const data = res.data?.data || res.data || res;

                    setConsultantName(data.consultantName || '');
                    setCategory(data.category || '');
                    setRegisteredDate(data.registeredDate || '');
                    setlicenseExpiryDate(data.licenseExpiryDate || '');
                    setStatus(data.status || 'ACTIVE');
                    setExistingFile(data.document || '');
                } catch (err) {
                    showAlert('error', 'Failed to synchronize partner dossier.');
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [id, isEdit]);

    const handleSaveTrigger = () => {
        if (!consultantName.trim()) return showAlert('error', 'Consultant Name is mandatory.');
        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("consultantName", consultantName.trim());
            formData.append("category", category);
            formData.append("registeredDate", registeredDate);
            formData.append("licenseExpiryDate",licenseExpiryDate);
            formData.append("status", status);
            if (document) {
                formData.append("document", document);
            }

            if (isEdit) {
                await adminApi.UPDATE_CONSULTANT(id, formData);
                showAlert('success', 'Profile updated successfully.');
            } else {
                await adminApi.CREATE_CONSULTANT(formData);
                showAlert('success', 'New Consultant established in registry.');
            }
            setTimeout(() => navigate('/consultancy'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction rejected.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Syncing partner registry...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-4 relative animate-fadeIn">

            {showConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border border-slate-100">
                        <HelpOutline className="text-[#0284C7] mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-bold uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Save configuration for <b>{consultantName}</b>?</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3.5 rounded-2xl border text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-3.5 rounded-2xl bg-[#0284C7] text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-sky-100 hover:bg-[#016da3] transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/consultancy')} className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">{isEdit ? 'Update Consultant' : 'Register Consultant'}</h1>
                        <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Partner Configuration</p>
                    </div>
                </div>
                <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 tracking-widest uppercase">
                    <Save style={{ fontSize: 18 }} /> {saving ? 'PROCESSING...' : 'SAVE CONSULTANT'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Identity Card */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><CorporateFare className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Consultant Identity</span></div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Consultant Legal Name *</label>
                            <input type="text" value={consultantName} onChange={(e) => setConsultantName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0284C7] transition-all text-sm font-semibold" placeholder="e.g. ABC Consultant" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Consultant Category</label>
                            <div className="relative">
                                <ToggleOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0284C7] appearance-none cursor-pointer text-sm font-bold">
                                    <option value="">--- Select Category ---</option>
                                    <option value="GOVERNMENT">GOVERNMENT</option>
                                    <option value="NON_GOVERNMENT">NON GOVERNMENT</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Partnership Status</label>
                            <div className="relative">
                                <ToggleOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0284C7] appearance-none cursor-pointer text-sm font-bold">
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="SUSPENDED">SUSPENDED</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Card */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-3">License Expiry Date</label>
                        <input name="licenseExpiryDate" type="date" value={licenseExpiryDate} onChange={(e) => setlicenseExpiryDate(e.target.value)} required className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-[24px] px-6 py-4 outline-none focus:border-[#0284C7]" />
                    </div>
                    <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3"><Description className="text-slate-400" fontSize="small" /><span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">License & Artifacts</span></div>
                    <div className="p-8 space-y-6">
                        <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center hover:border-[#0284C7] transition-colors relative cursor-pointer group bg-slate-50/20">
                            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setDocument(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadFile className="text-slate-300 group-hover:text-[#0284C7] mb-3" style={{ fontSize: 48 }} />
                            <p className="text-xs font-bold text-slate-500 group-hover:text-[#0284C7]">Upload Verification Document</p>
                            <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-tighter">Supported: PDF, Images, Word</p>
                        </div>

                        {(document || existingFile) && (
                            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${document ? 'bg-sky-50 border-sky-100' : 'bg-slate-50 border-slate-100'}`}>
                                <Description className={document ? 'text-[#0284C7]' : 'text-slate-400'} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{document ? document.name : existingFile}</p>
                                    <p className="text-[9px] font-black uppercase text-[#0284C7]">
                                        {document ? 'Ready to sync' : 'Stored in cloud'}
                                    </p>
                                </div>
                                {document && <Close onClick={() => setDocument(null)} className="cursor-pointer text-slate-400 hover:text-red-500" style={{ fontSize: 16 }} />}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Registeration Date</label>
                            <input name="registeredDate" type="date" value={registeredDate} onChange={(e) => setRegisteredDate(e.target.value)} required className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-[24px] px-6 py-4 outline-none focus:border-[#0284C7]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}