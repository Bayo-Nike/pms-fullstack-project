import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Save, Info, LocationOn, Close, Search, Add, CloudUpload, Delete, RateReview } from '@mui/icons-material';
import { Building2, Briefcase, Map, ShieldCheck, Lock, FileText } from 'lucide-react';
import demandApi from '../../api/modules/demand';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function EditDemandInitiation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, can } = useAuth(); // Assume 'user.role' exists

    // ROLES
    const isReviewer = can('CAN_REVIEW_DEMAND_FOR_DECISION'); 
    const isClient = !isReviewer; // Or specific client role check

    const [formData, setFormData] = useState({
        title: '', description: '', category: '', demandType: '',
        demandLevel: '', subCityId: '', woredaId: '', siteLocation: '',
        contractorId: null, consultancyId: null, locationId: null,
        status: '', reviewerRemark: ''
    });

    const [existingDocs, setExistingDocs] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [removedFileIds, setRemovedFileIds] = useState([]);
    const [lookups, setLookups] = useState({ subCities: [], woredas: [], contractors: [], consultancies: [], locations: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    // Lock Logic
    const isApproved = formData.status === 'APPROVED';
    const clientDisabled = !isClient || isApproved;
    const reviewerDisabled = !isReviewer || isApproved;

    useEffect(() => {
        const init = async () => {
            try {
                const [subRes, woredaRes, contRes, consRes, locRes, demandRes] = await Promise.all([
                    adminApi.GET_SUB_CITIES(), adminApi.GET_WOREDAS(),
                    adminApi.GET_CONTRACTORS(), adminApi.GET_CONSULTANTS(),
                    adminApi.GET_LOCATIONS(), demandApi.GET_DEMAND(id)
                ]);
                setLookups({
                    subCities: subRes.data?.data || [], woredas: woredaRes.data?.data || [],
                    contractors: contRes.data?.data || [], consultancies: consRes.data?.data || [],
                    locations: locRes.data?.data || []
                });
                const d = demandRes.data;
                
                setFormData({ ...d });
                setExistingDocs(d.documents || []);
            } catch (err) { setAlert({ show: true, type: 'error', message: 'Sync failed.' }); }
            finally { setLoading(false); }
        };
        init();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = new FormData();
            
            if (isClient) {
                // Client Update (Full Data + Files)
                data.append('demand', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
                newFiles.forEach(file => data.append('files', file));
                data.append('removedFileIds', new Blob([JSON.stringify(removedFileIds)], { type: 'application/json' }));
                await demandApi.UPDATE_DEMAND(id, data);
            } else {
                // Reviewer Update (Only Status & Remark)
                const reviewPayload = { status: formData.status, remark: formData.reviewerRemark };
                await demandApi.REVIEW_DEMAND(id, reviewPayload);
            }

            setAlert({ show: true, type: 'success', message: 'Record updated successfully.' });
            setTimeout(() => navigate('/demands'), 1500);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Update failed.' });
        } finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Syncing...</div>;

    return (
        <div className="w-full space-y-6 pb-20 px-6 bg-[#F8FAFC]">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} />

            {/* HEADER */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 border rounded-2xl"><ArrowBack /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase">Edit Demand</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{formData.demandCode}</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving || isApproved} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                    {saving ? 'SAVING...' : 'UPDATE RECORD'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: CLIENT FIELDS */}
                <div className={`lg:col-span-8 space-y-6 ${isReviewer ? 'opacity-70 pointer-events-none' : ''}`}>
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                           <div className="flex items-center gap-3"><Info className="text-slate-400" size={18} /><span className="text-[11px] font-black uppercase text-slate-500">Project Details</span></div>
                           {isReviewer && <Lock size={16} className="text-amber-500" />}
                        </div>
                        <div className="space-y-4">
                            <input name="title" value={formData.title} onChange={handleInputChange} disabled={clientDisabled} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold" placeholder="Demand Title" />
                            <textarea name="description" value={formData.description|| ''} onChange={handleInputChange} disabled={clientDisabled} rows="4" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm resize-none" placeholder="Description" />
                        </div>
                        
                        {/* PARTNERS SELECTION (CONTRACTOR/CONSULTANT logic same as create, just use clientDisabled) */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* ... Include your Searchable Contractor/Consultant logic here with disabled={clientDisabled} ... */}
                        </div>
                    </div>

                    {/* DIGITAL DOSSIER (Client Side) */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <span className="text-[11px] font-black uppercase text-slate-500">Attached Documents</span>
                            {!clientDisabled && <label className="cursor-pointer text-[10px] font-bold text-sky-600 uppercase underline"><input type="file" multiple className="hidden" onChange={(e) => setNewFiles([...newFiles, ...Array.from(e.target.files)])} /> Upload New</label>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Existing Files */}
                            {existingDocs.filter(d => !removedFileIds.includes(d.id)).map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                                    <span className="text-xs font-bold truncate max-w-[150px]">{doc.fileName}</span>
                                    {isClient && !isApproved && <Delete className="text-rose-400 cursor-pointer" size={16} onClick={() => setRemovedFileIds([...removedFileIds, doc.id])} />}
                                </div>
                            ))}
                            {/* New Files */}
                            {newFiles.map((file, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-100">
                                    <span className="text-xs font-bold truncate max-w-[150px] text-sky-700">{file.name}</span>
                                    <Close className="text-sky-400 cursor-pointer" size={16} onClick={() => setNewFiles(newFiles.filter((_, idx) => idx !== i))} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: REVIEWER FIELDS */}
                <div className={`lg:col-span-4 space-y-6 ${isClient ? 'opacity-70 pointer-events-none' : ''}`}>
                    <div className="bg-white rounded-[40px] border-2 border-amber-100 shadow-xl p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-amber-50 pb-4">
                            <ShieldCheck className="text-amber-500" size={20} />
                            <span className="text-[11px] font-black uppercase text-amber-600">Reviewer Actions</span>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Review Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} disabled={reviewerDisabled} className="w-full bg-slate-900 text-white rounded-2xl px-5 py-4 text-xs font-black uppercase outline-none">
                                    <option value="PENDING">Pending Review</option>
                                    <option value="APPROVED">Approve Demand</option>
                                    <option value="REJECTED">Reject Demand</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Reviewer Remark</label>
                                <textarea name="reviewerRemark" value={formData.reviewerRemark|| ''} onChange={handleInputChange} disabled={reviewerDisabled} rows="6" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-amber-500" placeholder="Justification for the decision..." />
                            </div>
                        </div>
                    </div>

                    {/* LOCATION (Hub Assignment - Reviewer can see but Client can edit) */}
                    <div className={`bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 ${isReviewer ? 'opacity-100' : ''}`}>
                         {/* ... Include your Hub Assignment Logic here with disabled={clientDisabled} ... */}
                    </div>
                </div>

            </div>
        </div>
    );
}