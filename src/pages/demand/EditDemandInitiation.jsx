import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowBack, Save, Info, LocationOn, Close, Search, Add, 
    CloudUpload, Delete, RateReview, Business, Engineering, 
    Map, Lock,
    PinDrop
} from '@mui/icons-material';
import { Building2, Briefcase, ShieldCheck, AlertCircle, User } from 'lucide-react';
import demandApi from '../../api/modules/demand';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function EditDemandInitiation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can } = useAuth();

    // ROLES & PERMISSIONS
    const isReviewer = can('CAN_REVIEW_DEMAND_FOR_DECISION'); 
    const isClient = !isReviewer;

    // 1. Form State (Synchronized with your Create scenario)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'GOVERNMENT',
        demandType: 'BUILDING',
        demandLevel: 'CITY',
        subCityId: '',
        woredaId: '',
        locationId: '',
        siteLocation: '', 
        contractorId: '',
        consultancyId: '',
        clientId: 1,      
        phase: 'INITIATION',
        status: '',
        reviewerRemark: '',
        demandCode: ''
    });

    // 2. Lookups & Files State
    const [existingDocs, setExistingDocs] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [removedFileIds, setRemovedFileIds] = useState([]);
    const [lookups, setLookups] = useState({ 
        subCities: [], woredas: [], contractors: [], consultancies: [], locations: [] 
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    // 3. Search & UI States
    const [contractorSearch, setContractorSearch] = useState('');
    const [isContractorDropdownOpen, setIsContractorDropdownOpen] = useState(false);
    const [consultantSearch, setConsultantSearch] = useState('');
    const [isConsultantDropdownOpen, setIsConsultantDropdownOpen] = useState(false);
    const [isAlreadyApproved, setIsAlreadyApproved] = useState(false);

    const contractorRef = useRef(null);
    const consultantRef = useRef(null);

    // LOCK LOGIC
    const isApproved = formData.status === 'APPROVED';
    const clientDisabled = !isClient || isAlreadyApproved;
    const reviewerDisabled = !isReviewer || isAlreadyApproved;

    // 4. Load Data (Lookups + Specific Demand)
    useEffect(() => {
        const init = async () => {
            try {
                // Fetch all system registries in parallel
                const [subRes, woredaRes, contRes, consRes, locRes, demandRes] = await Promise.all([
                    adminApi.GET_SUB_CITIES(), 
                    adminApi.GET_WOREDAS(),
                    adminApi.GET_CONTRACTORS(), 
                    adminApi.GET_CONSULTANTS(),
                    adminApi.GET_LOCATIONS(),
                    demandApi.GET_DEMAND(id)
                ]);

                // Set Lookups first
                setLookups({
                    subCities: subRes.data?.data || subRes.data || [],
                    woredas: woredaRes.data?.data || woredaRes.data || [],
                    contractors: contRes.data?.data || contRes.data || [],
                    consultancies: consRes.data?.data || consRes.data || [],
                    locations: locRes.data?.data || locRes.data || []
                });

                // Map Demand Data and sanitize nulls/types
                const d = demandRes.data.data || demandRes.data;
                setIsAlreadyApproved(d.status === 'APPROVED'); 
                setFormData({
                    ...d,
                    title: d.title || '',
                    description: d.description || '',
                    demandLevel: d.demandLevel || 'CITY',
                    subCityId: d.subCityId ? String(d.subCityId) : '',
                    woredaId: d.woredaId ? String(d.woredaId) : '',
                    locationId: d.locationId ? String(d.locationId) : '',
                    contractorId: d.contractorId ? String(d.contractorId) : '',
                    consultancyId: d.consultancyId ? String(d.consultancyId) : '',
                    reviewerRemark: d.reviewerRemark || '',
                    siteLocation: d.siteLocation || ''
                });
                setExistingDocs(d.documents || []);

            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Sync failed: Registries unreachable.' });
            } finally { setLoading(false); }
        };
        init();
    }, [id]);

    // 5. Click-outside listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contractorRef.current && !contractorRef.current.contains(event.target)) setIsContractorDropdownOpen(false);
            if (consultantRef.current && !consultantRef.current.contains(event.target)) setIsConsultantDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 6. Search Filtering
    const contractorOptions = useMemo(() => {
        if (!contractorSearch) return lookups.contractors;
        return lookups.contractors.filter(c => c.contractorName?.toLowerCase().includes(contractorSearch.toLowerCase()));
    }, [lookups.contractors, contractorSearch]);

    const consultantOptions = useMemo(() => {
        if (!consultantSearch) return lookups.consultancies;
        return lookups.consultancies.filter(c => c.consultantName?.toLowerCase().includes(consultantSearch.toLowerCase()));
    }, [lookups.consultancies, consultantSearch]);

    const filteredWoredas = useMemo(() => 
        lookups.woredas.filter(w => String(w.subCityId) === String(formData.subCityId)), 
    [formData.subCityId, lookups.woredas]);

    // 7. Actions
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ 
            ...p, [name]: value,
            ...(name === 'subCityId' ? { woredaId: '', locationId: '' } : {}),
            ...(name === 'woredaId' ? { locationId: '' } : {})
        }));
    };

    const handleSave = async () => {
        // 1. Validation for Reviewer
        if (!isClient && (!formData.status || formData.status === 'PENDING')) {
            return setAlert({ show: true, type: 'error', message: 'Please select Approved or Rejected.' });
        }
        
        setSaving(true);
        try {
            if (isClient) {
                const data = new FormData();
            
                const { 
                    id: _id, 
                    demandCode, 
                    status, 
                    documents, 
                    requestedDate, 
                    respondedDate, 
                    ...dtoPayload 
                } = formData;
    
                data.append('demand', new Blob([JSON.stringify(dtoPayload)], { type: 'application/json' }));
                
                // Map New Files to the Metadata DTO structure expected by Backend
                const metadata = newFiles.map(item => ({
                    documentName: item.docName,
                    description: item.description
                }));
            
                // Append fileMetadata as a JSON blob
                data.append('fileMetadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

                // Append actual binary files
                newFiles.forEach(item => data.append('files', item.file));
                // Append removed IDs (ensure your service handles this)
                data.append('removedFileIds', new Blob([JSON.stringify(removedFileIds)], { type: 'application/json' }));
                
                await demandApi.UPDATE_DEMAND(id, data);
            } else {
                const reviewPayload = { status: formData.status, reviewerRemark: formData.reviewerRemark };
                await demandApi.REVIEW_DEMAND(id, reviewPayload);
            }
            setAlert({ show: true, type: 'success', message: 'Record Updated Successfully.' });
            setTimeout(() => navigate('/demands'), 1500);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Operation Failed.' });
        } finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse text-xs">SYNCHRONIZING PMS HUB...</div>;

    return (
        <div className="w-full space-y-6 pb-20 px-6 bg-[#F8FAFC] animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 border rounded-2xl hover:bg-slate-100 transition-all"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">EDIT DEMAND</h1>
                        <p className="text-[10px] text-sky-600 mt-2 font-bold uppercase tracking-widest">{formData.demandCode || 'Loading...'}</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving || isAlreadyApproved} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    <Save /> {saving ? 'SAVING...' : 'UPDATE DEMAND'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* PART 1 & 2: CLIENT DATA (IDENTIFICATION & PARTNERS) */}
                <div className={`lg:col-span-8 space-y-6 ${isReviewer ? 'opacity-80 pointer-events-none' : ''}`}>
                    
                    {/* Identity Box */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-[11px] tracking-widest"><Info size={18}/> Project Profile</div>
                            {isReviewer && <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase"><Lock size={14}/> Registry Locked</div>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} disabled={clientDisabled} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                    <option value="GOVERNMENT">Government</option><option value="NON_GOVERNMENT">Non-Gov</option>
                                </select>
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Type</label>
                                <select name="demandType" value={formData.demandType} onChange={handleInputChange} disabled={clientDisabled} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                    <option value="BUILDING">Building</option><option value="WATER_AND_IRRIGATION">Water & Irrigation</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Title *</label>
                            <input name="title" value={formData.title} onChange={handleInputChange} disabled={clientDisabled} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-sky-500" />
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope Narrative</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} disabled={clientDisabled} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium resize-none outline-none focus:border-sky-500" />
                        </div>
                    </div>

                    {/* Stakeholders (STRICT SELECTION LOGIC) */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 border-b pb-4 text-slate-500 font-black uppercase text-[11px] tracking-widest"><User size={18}/> Proposed Partnerships</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Contractor Section */}
                            <div className="space-y-3" ref={contractorRef}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contractor</label>
                                {!formData.contractorId ? (
                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input type="text" disabled={clientDisabled} className="w-full pl-12 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Search contractor list..." value={contractorSearch} onFocus={() => setIsContractorDropdownOpen(true)} onChange={(e) => setContractorSearch(e.target.value)} />
                                        {isContractorDropdownOpen && (
                                            <div className="absolute z-50 w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                                {contractorOptions.length > 0 ? contractorOptions.map(c => (
                                                    <div key={c.id} onClick={() => { setFormData(p => ({ ...p, contractorId: String(c.id) })); setContractorSearch(''); setIsContractorDropdownOpen(false); }} className="px-5 py-3 hover:bg-sky-50 cursor-pointer flex justify-between items-center border-b last:border-none">
                                                        <span className="text-xs font-bold text-slate-700">{c.contractorName}</span><Add size={16} className="text-sky-500" />
                                                    </div>
                                                )) : <div className="p-5 text-center text-[10px] font-bold text-rose-500 uppercase">Not registered</div>}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-sky-900 text-white p-4 rounded-2xl animate-scaleIn shadow-lg border-b-4 border-sky-700">
                                        <div className="flex items-center gap-3"><Building2 size={18} className="text-sky-400" /><div><p className="text-[10px] font-black uppercase leading-tight text-sky-300">Verified Partner</p><p className="text-xs font-bold uppercase">{lookups.contractors.find(x => String(x.id) === String(formData.contractorId))?.contractorName || 'Unknown Contractor'}</p></div></div>
                                        {!clientDisabled && <button onClick={() => setFormData(p => ({ ...p, contractorId: '' }))} className="p-1 hover:bg-white/10 rounded-lg transition-all"><Close style={{ fontSize: 18 }} /></button>}
                                    </div>
                                )}
                            </div>

                            {/* Consultant Section */}
                            <div className="space-y-3" ref={consultantRef}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultant</label>
                                {!formData.consultancyId ? (
                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input type="text" disabled={clientDisabled} className="w-full pl-12 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Search consultancy list..." value={consultantSearch} onFocus={() => setIsConsultantDropdownOpen(true)} onChange={(e) => setConsultantSearch(e.target.value)} />
                                        {isConsultantDropdownOpen && (
                                            <div className="absolute z-40 w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                                {consultantOptions.length > 0 ? consultantOptions.map(c => (
                                                    <div key={c.id} onClick={() => { setFormData(p => ({ ...p, consultancyId: String(c.id) })); setConsultantSearch(''); setIsConsultantDropdownOpen(false); }} className="px-5 py-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center border-b last:border-none">
                                                        <span className="text-xs font-bold text-slate-700">{c.consultantName}</span><Add size={16} className="text-emerald-500" />
                                                    </div>
                                                )) : <div className="p-5 text-center text-[10px] font-bold text-rose-500 uppercase">Not registered</div>}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-emerald-900 text-white p-4 rounded-2xl animate-scaleIn shadow-lg border-b-4 border-emerald-700">
                                        <div className="flex items-center gap-3"><Briefcase size={18} className="text-emerald-400" /><div><p className="text-[10px] font-black uppercase leading-tight text-emerald-300">Verified Firm</p><p className="text-xs font-bold uppercase">{lookups.consultancies.find(x => String(x.id) === String(formData.consultancyId))?.consultantName || 'Unknown Consultant'}</p></div></div>
                                        {!clientDisabled && <button onClick={() => setFormData(p => ({ ...p, consultancyId: '' }))} className="p-1 hover:bg-white/10 rounded-lg transition-all"><Close style={{ fontSize: 18 }} /></button>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PART 4: DOCUMENTS (FILES) */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between border-b pb-4 text-slate-500 font-black uppercase text-[11px] tracking-widest">
                            <span>Attached Documents</span>
                            {!clientDisabled && (
                                <label className="cursor-pointer text-sky-600 flex items-center gap-2 hover:underline">
                                    <CloudUpload size={16} /> Upload New
                                    <input type="file" multiple className="hidden" 
                                        onChange={(e) => setNewFiles([...newFiles, ...Array.from(e.target.files).map(f => ({
                                            file: f, docName: f.name.split('.').slice(0,-1).join('.'), description: ''
                                        }))])} 
                                    />
                                </label>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* EXISTING FILES: Marked for removal logic */}
                            {existingDocs.filter(doc => !removedFileIds.includes(doc.id)).map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div className="flex items-center gap-3">
                                        <Map size={14} className="text-slate-300"/> 
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-600">{doc.documentName || doc.fileName}</p>
                                            <p className="text-[8px] text-slate-400 uppercase">Existing File</p>
                                        </div>
                                    </div>
                                    {!clientDisabled && (
                                        <button 
                                            onClick={() => setRemovedFileIds([...removedFileIds, doc.id])}
                                            className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <Delete size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* NEW FILES: Metadata inputs */}
                            {newFiles.map((item, i) => (
                                <div key={i} className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CloudUpload size={14} className="text-sky-500"/> 
                                            <span className="text-[11px] font-bold text-sky-800 truncate max-w-[200px]">{item.file.name}</span>
                                        </div>
                                        <Close className="text-sky-400 cursor-pointer" size={16} onClick={() => setNewFiles(newFiles.filter((_, idx) => idx !== i))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input 
                                            className="bg-white border rounded-xl px-3 py-2 text-[10px] outline-none"
                                            placeholder="Document Label" value={item.docName}
                                            onChange={(e) => { const up = [...newFiles]; up[i].docName = e.target.value; setNewFiles(up); }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        
                                        <textarea 
                                            className="bg-white border rounded-xl px-3 py-2 text-[10px] outline-none"
                                            placeholder="Description" value={item.description}
                                            onChange={(e) => { const up = [...newFiles]; up[i].description = e.target.value; setNewFiles(up); }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: REVIEWER CONTENT & HUB ASSIGNMENT */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Management Review (LOCKED FOR CLIENT) */}
                    <div className={`bg-white rounded-[40px] border-2 shadow-xl p-8 space-y-6 transition-all ${isReviewer ? 'border-amber-200' : 'border-slate-100 opacity-60 pointer-events-none'}`}>
                        <div className="flex items-center gap-3 border-b pb-4 text-amber-600 font-black uppercase text-[11px] tracking-widest"><ShieldCheck size={20} /> Management Review & Decision</div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Set Decision</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} disabled={reviewerDisabled} 
                                className={`w-full rounded-2xl px-5 py-4 text-[11px] font-black uppercase outline-none border transition-all
                                    ${
                                        formData.status === "APPROVED"
                                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                            : formData.status === "REJECTED"
                                            ? "bg-red-50 text-red-800 border-red-300"
                                            : "bg-amber-50 text-amber-800 border-amber-300"
                                    }
                                `}>
                                    <option value="PENDING">Pending Review</option>
                                    <option value="APPROVED">Approve & Promote</option>
                                    <option value="REJECTED">Reject Demand</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Reviewer Remark</label>
                                <textarea name="reviewerRemark" value={formData.reviewerRemark} onChange={handleInputChange} disabled={reviewerDisabled} rows="6" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-medium outline-none focus:border-amber-500 resize-none" placeholder="Provide decision justification..." />
                            </div>
                        </div>
                    </div>

                    {/* Site / Hub Assignment (CLIENT EDITABLE UNLESS APPROVED) */}
                    <div className={`bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm ${isReviewer ? 'opacity-80 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-3 border-b pb-4 text-slate-500 font-black uppercase text-[11px] tracking-widest"><LocationOn size={18} /> Hub Assignment</div>
                        <div className="p-1 space-y-6">
                            {/* Hub Level */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Demand Level</label>
                                <select name="demandLevel" value={formData.demandLevel} onChange={handleInputChange} disabled={clientDisabled} className="w-full text-sm font-bold bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-sky-500">
                                    <option value="CITY">City Hub (HQ)</option>
                                    <option value="SUB_CITY">Sub-City Hub (Region)</option>
                                </select>
                            </div>
                            {/* Sub-City */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sub-City {formData.demandLevel === 'SUB_CITY' ? '*' : '(Optional)'}</label>
                                <select name="subCityId" value={String(formData.subCityId || '')} onChange={handleInputChange} disabled={clientDisabled} className="w-full text-sm font-bold bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none appearance-none">
                                    <option value="">-- Choose Sub-City --</option>
                                    {lookups.subCities.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                                </select>
                            </div>
                            {/* Woreda */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Woreda</label>
                                <div className="relative">
                                    <PinDrop className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <select name="woredaId" value={String(formData.woredaId || '')} onChange={handleInputChange} disabled={!formData.subCityId || clientDisabled} className="w-full pl-12 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-2xl appearance-none outline-none disabled:opacity-50">
                                        <option value="">-- Choose Woreda --</option>
                                        {filteredWoredas.map(w => <option key={w.id} value={String(w.id)}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Plot Detail */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Site Registry (Plot)</label>
                                <select name="locationId" value={String(formData.locationId || '')} onChange={handleInputChange} disabled={!formData.woredaId || clientDisabled} className="w-full px-5 py-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-2xl outline-none">
                                    <option value="">-- Select Site Location --</option>
                                    {lookups.locations.filter(l => String(l.woredaId) === String(formData.woredaId)).map(l => <option key={l.id} value={String(l.id)}>{l.name}</option>)}
                                </select>
                            </div>
                            {/* Free Text */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Specific Site Location</label>
                                <input name="siteLocation" value={formData.siteLocation} onChange={handleInputChange} disabled={clientDisabled} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-sky-500" placeholder="e.g. Near the West Square" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}