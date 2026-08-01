import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowBack, Save, Info, LocationOn, 
    Close, Search, Add, CloudUpload, Delete
} from '@mui/icons-material';
import { 
    Building2, Briefcase, Map, 
    AlertCircle, CheckCircle2, 
    User
} from 'lucide-react';
import demandApi from '../../api/modules/demand';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateDemandInitiation() {
    const navigate = useNavigate();

    // 1. Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'GOVERNMENT',
        demandType: 'BUILDING', // or 'WATER_AND_ROAD'
        // demandLevel: 'CITY',
        // subCityId: '',
        // woredaId: '',
        // siteLocation: '',
        demandLevel: 'CITY', // Mapped from your snippet's projectLevel
        subCityId: '',
        woredaId: '',        // Single ID for Demand Table
        locationId: '',
        locationIds: [],     // Multi-select for dynamic site registry
        siteLocation: '',    // Free text for specific address
        contractorId: '',
        consultancyId: '',
        clientId: 1,      
        phase: 'INITIATION'
    });

    // 2. Lookups & Files
    const [files, setFiles] = useState([]);
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

    const contractorRef = useRef(null);
    const consultantRef = useRef(null);

    // 4. Load Data
    useEffect(() => {
        const init = async () => {
            try {
                const [subRes, woredaRes, contRes, consRes,locRes] = await Promise.all([
                    adminApi.GET_SUB_CITIES(),
                    adminApi.GET_WOREDAS(),
                    adminApi.GET_CONTRACTORS(),
                    adminApi.GET_CONSULTANTS(),
                    adminApi.GET_LOCATIONS()
                ]);
                setLookups({
                    subCities: subRes.data?.data || subRes.data || [],
                    woredas: woredaRes.data?.data || woredaRes.data || [],
                    contractors: contRes.data?.data || contRes.data || [],
                    consultancies: consRes.data?.data || consRes.data || [],
                    locations: locRes.data?.data || locRes.data || [] 
                });
            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Registry sync failed.' });
            } finally { setLoading(false); }
        };
        init();
    }, []);

    // 5. Close dropdowns on outside click
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

    // const filteredWoredas = useMemo(() => 
    //     lookups.woredas.filter(w => String(w.subCityId) === String(formData.subCityId)), 
    // [formData.subCityId, lookups.woredas]);

    // 1. Filter Woredas by selected Sub-City
    const filteredWoredas = useMemo(() => {
        if (!formData.subCityId) return [];
        return lookups.woredas.filter(w => String(w.subCityId) === String(formData.subCityId));
    }, [formData.subCityId, lookups.woredas]);

    // 2. Filter Registered Sites by selected Woreda
    const filteredLocations = useMemo(() => {
        if (!formData.woredaId) return [];
        return lookups.locations.filter(loc => String(loc.woredaId) === String(formData.woredaId));
    }, [formData.woredaId, lookups.locations]);

    // 7. Actions
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value, ...(name === 'subCityId' && { woredaId: '' }) }));
    };

    const updateFileMeta = (index, key, value) => {
        setFiles(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
    };

    const executeSave = async () => {
        // STRICT VALIDATION
        if (!formData.title || !formData.demandLevel) {
            return setAlert({ show: true, type: 'error', message: 'Project Title and Demand Level are required.' });
        }
        if (!formData.contractorId || !formData.consultancyId) {
            return setAlert({ show: true, type: 'error', message: 'Strict Selection Required: Please select a Contractor and Consultant from the system list.' });
        }

        setSaving(true);
        try {
            const data = new FormData();
            // data.append('demand', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
            // files.forEach(file => data.append('files', file));
            // 1. Append the main Demand JSON
            data.append('demand', new Blob([JSON.stringify(formData)], { type: 'application/json' }));

            // 2. Append the actual raw files
            files.forEach(item => data.append('files', item.file));

            // 3. Append the Metadata (Names and Descriptions) matching the file order
            const documentInfo = files.map(item => ({
                documentName: item.documentName,
                description: item.description
            }));
            data.append('fileMetadata', new Blob([JSON.stringify(documentInfo)], { type: 'application/json' }));

            console.log(data);
            await demandApi.CREATE_DEMAND(data);
            setAlert({ show: true, type: 'success', message: 'Demand successfully submitted.' });
            setTimeout(() => navigate('/demands'), 2000);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Transaction failed.' });
        } finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase text-xs">Loading PMS Registries...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-6 bg-[#F8FAFC] animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 border rounded-[20px] hover:bg-slate-100"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">DEMAND INITIATION</h1>
                        <p className="text-[10px] text-sky-600 mt-2 font-bold uppercase tracking-[0.2em]">Registry Intake Form</p>
                    </div>
                </div>
                <button onClick={executeSave} disabled={saving} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    <Save /> {saving ? 'SUBMITTING...' : 'SUBMIT DEMAND'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* PART 1: IDENTITY */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4"><Info className="text-slate-400" size={18} /><span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Identification</span></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Category</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                <option value="GOVERNMENT">Government</option><option value="NON_GOVERNMENT">Non-Government</option>
                            </select>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Type</label>
                            <select name="demandType" value={formData.demandType} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                <option value="BUILDING">Building</option><option value="WATER_AND_ROAD">Water & Road</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Demand Title *</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-sky-500" />
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange}  rows="4" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#0284C7] resize-none"></textarea>
                    </div>
                
                </div>

                {/* PART 2: STRICT SELECTION (PARTNERS) */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-8">
                    <div className="flex items-center gap-3 border-b pb-4"><User className="text-slate-400" size={18} /><span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Stakeholders Selection</span></div>
                    
                    {/* STRICT CONTRACTOR */}
                    <div className="space-y-3" ref={contractorRef}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contractor *</label>
                        {!formData.contractorId ? (
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input type="text" placeholder="Type to search contractor..." className="w-full pl-12 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={contractorSearch} onFocus={() => setIsContractorDropdownOpen(true)} onChange={(e) => setContractorSearch(e.target.value)} />
                                {isContractorDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                        {contractorOptions.length > 0 ? contractorOptions.map(c => (
                                            <div key={c.id} onClick={() => { setFormData(p => ({ ...p, contractorId: String(c.id) })); setContractorSearch(''); setIsContractorDropdownOpen(false); }} className="px-5 py-3 hover:bg-sky-50 cursor-pointer flex justify-between items-center border-b last:border-none">
                                                <span className="text-xs font-bold text-slate-700">{c.contractorName}</span><Add size={16} className="text-sky-500" />
                                            </div>
                                        )) : <div className="p-5 text-center text-[10px] font-bold text-rose-500 uppercase">Contractor Not found in registry</div>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-sky-900 text-white p-4 rounded-2xl animate-scaleIn">
                                <div className="flex items-center gap-3"><Building2 size={18} className="text-sky-400" /><div><p className="text-[10px] font-black uppercase leading-tight text-sky-300">Verified Partner</p><p className="text-xs font-bold uppercase">{lookups.contractors.find(x => String(x.id) === String(formData.contractorId))?.contractorName}</p></div></div>
                                <button onClick={() => setFormData(p => ({ ...p, contractorId: '' }))} className="p-2 hover:bg-white/10 rounded-lg"><Close style={{ fontSize: 18 }} /></button>
                            </div>
                        )}
                    </div>

                    {/* STRICT CONSULTANT */}
                    <div className="space-y-3" ref={consultantRef}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultant *</label>
                        {!formData.consultancyId ? (
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input type="text" placeholder="Type to search consultancy..." className="w-full pl-12 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={consultantSearch} onFocus={() => setIsConsultantDropdownOpen(true)} onChange={(e) => setConsultantSearch(e.target.value)} />
                                {isConsultantDropdownOpen && (
                                    <div className="absolute z-40 w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                        {consultantOptions.length > 0 ? consultantOptions.map(c => (
                                            <div key={c.id} onClick={() => { setFormData(p => ({ ...p, consultancyId: String(c.id) })); setConsultantSearch(''); setIsConsultantDropdownOpen(false); }} className="px-5 py-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center border-b last:border-none">
                                                <span className="text-xs font-bold text-slate-700">{c.consultantName}</span><Add size={16} className="text-emerald-500" />
                                            </div>
                                        )) : <div className="p-5 text-center text-[10px] font-bold text-rose-500 uppercase">Consultant not registered</div>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-emerald-900 text-white p-4 rounded-2xl animate-scaleIn">
                                <div className="flex items-center gap-3"><Briefcase size={18} className="text-emerald-400" /><div><p className="text-[10px] font-black uppercase leading-tight text-emerald-300">Verified Firm</p><p className="text-xs font-bold uppercase">{lookups.consultancies.find(x => String(x.id) === String(formData.consultancyId))?.consultantName}</p></div></div>
                                <button onClick={() => setFormData(p => ({ ...p, consultancyId: '' }))} className="p-2 hover:bg-white/10 rounded-lg"><Close style={{ fontSize: 18 }} /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* PART 3: LOCATION */}
                {/* <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4"><LocationOn className="text-slate-400" size={18} /><span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Site Assignment</span></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-City</label>
                            <select name="subCityId" value={formData.subCityId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                <option value="">-- Choose --</option>{lookups.subCities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Woreda</label>
                            <select name="woredaId" value={formData.woredaId} onChange={handleInputChange} disabled={!formData.subCityId} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none disabled:opacity-50">
                                <option value="">-- Choose --</option>{filteredWoredas.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specific Location</label>
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl mt-1"><Map className="ml-5 text-slate-300" size={20} /><input name="siteLocation" value={formData.siteLocation} onChange={handleInputChange} className="w-full p-5 bg-transparent text-sm font-bold outline-none" placeholder="e.g. Near Arat Kilo" /></div>
                    </div>
                </div> */}

                {/* PART 3: HUB / SITE ASSIGNMENT */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b bg-slate-50/40 flex items-center gap-3">
                        <LocationOn className="text-slate-400" size={18} />
                        <span className="text-[12px] font-black uppercase text-slate-500 tracking-widest">Hub Assignment</span>
                    </div>

                    <div className="p-8 space-y-6 flex-1">
                        {/* Demand Level */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Demand Level</label>
                            <select 
                                name="demandLevel" 
                                value={formData.demandLevel} 
                                onChange={handleInputChange} 
                                className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 transition-all"
                            >
                                <option value="CITY">City Hub (HQ)</option>
                                <option value="SUB_CITY">Sub-City Hub (Region)</option>
                            </select>
                        </div>

                        {/* Sub-City Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                                Sub-City {formData.demandLevel === 'SUB_CITY' ? '*' : '(Optional)'}
                            </label>
                            <select
                                name="subCityId" 
                                value={formData.subCityId} 
                                onChange={handleInputChange}
                                className={`w-full text-sm font-bold bg-slate-50 border rounded-2xl px-5 py-4 outline-none appearance-none cursor-pointer transition-all ${formData.demandLevel === 'SUB_CITY' && !formData.subCityId ? 'border-amber-300 ring-2 ring-amber-50' : 'border-slate-200'}`}
                            >
                                <option value="">-- Select Sub-City --</option>
                                {lookups.subCities.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* Woreda Selection (Single ID mapping to Badge UI) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase ml-1 text-slate-400 tracking-widest">Woreda</label>
                            <div className="relative">
                                <Map className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <select
                                    disabled={!formData.subCityId}
                                    value={formData.woredaId}
                                    onChange={(e) => setFormData(p => ({ ...p, woredaId: e.target.value, locationIds: [] }))}
                                    className="w-full pl-12 pr-6 py-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl appearance-none outline-none disabled:opacity-50 transition-all"
                                >
                                    <option value="">{formData.subCityId ? '-- Select Woreda --' : 'Select Sub-City First'}</option>
                                    {filteredWoredas.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Woreda Badge */}
                            {formData.woredaId && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {(() => {
                                        const wor = lookups.woredas.find(w => String(w.id) === String(formData.woredaId));
                                        return wor ? (
                                            <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-scaleIn">
                                                {wor.name}
                                                <Close 
                                                    onClick={() => setFormData(p => ({ ...p, woredaId: '', locationIds: [] }))} 
                                                    className="cursor-pointer hover:text-rose-400 transition-colors" 
                                                    style={{ fontSize: 14 }} 
                                                />
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Sites / Locations Multi-select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase ml-1 text-slate-400 tracking-widest">Site Registry (Multiple)</label>
                            <div className="relative">
                                <LocationOn className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <select
                                    name="locationId"
                                    value={formData.locationId}
                                    disabled={!formData.woredaId}
                                    onChange={(e) => { 
                                        const v = e.target.value; 
                                        if (v) {
                                            setFormData(p => ({ 
                                                ...p, 
                                                locationId: v, // This saves the value to the singular field
                                                locationIds: [v] // This updates your Badge UI (keeping it to 1 selection)
                                            })); 
                                        }
                                    }}
                                    // ...
                                >
                                    <option value="">{formData.woredaId ? '-- Select Registered Site --' : '-- Select Woreda First --'}</option>
                                    {lookups.locations?.filter(l => String(l.woredaId) === String(formData.woredaId) && !formData.locationIds.includes(l.id)).map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Location Badges */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.locationIds.map(locId => {
                                    const loc = lookups.locations?.find(l => l.id === locId);
                                    return loc ? (
                                        <div key={locId} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-scaleIn shadow-sm">
                                            {loc.name}
                                            <Close 
                                                onClick={() => setFormData(p => ({ ...p, locationIds: p.locationIds.filter(i => i !== locId) }))} 
                                                className="cursor-pointer hover:text-rose-200 transition-colors" 
                                                style={{ fontSize: 14 }} 
                                            />
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        {/* Specific Site Location (Free Text) */}
                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Detailed Site Location</label>
                            <input 
                                name="siteLocation" 
                                value={formData.siteLocation} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-sky-500 placeholder:text-slate-300" 
                                placeholder="e.g. 50m behind the main station" 
                            />
                        </div>
                    </div>
                </div>

                {/* PART 4: FILES */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3 text-slate-400"><CloudUpload size={18} /><span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Attachments</span></div>
                        <label className="bg-sky-50 text-sky-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-sky-100 transition-all shadow-sm">
                        Add Files
                           {/* <input type="file" multiple onChange={(e) => setFiles(p => [...p, ...Array.from(e.target.files)])} className="hidden" /> */}
                            <input 
                                type="file" 
                                multiple 
                                onChange={(e) => setFiles(p => [
                                    ...p, 
                                    ...Array.from(e.target.files).map(f => ({
                                        file: f,
                                        documentName: f.name.split('.').slice(0, -1).join('.'), // Default to filename without extension
                                        description: ''
                                    }))
                                ])} 
                                className="hidden" 
                            />
                        </label>
                    </div>
                    <div className="space-y-3">
                        {files.length === 0 ? <div className="py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] italic">No documents attached</div> :
                            // files.map((file, idx) => (
                            //     <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-slideUp">
                            //         <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[10px] font-black text-sky-600 border shadow-sm uppercase">{file.name.split('.').pop()}</div><div className="overflow-hidden"><p className="text-xs font-black text-slate-700 truncate max-w-[150px]">{file.name}</p><p className="text-[9px] text-slate-400 font-bold">{(file.size / 1024).toFixed(1)} KB</p></div></div>
                            //         <button onClick={() => setFiles(p => p.filter((_, i) => i !== idx))} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><Delete size={18} /></button>
                            //     </div>
                            // ))
                            files.map((item, idx) => (
                                <div key={idx} className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 animate-slideUp space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[10px] font-black text-sky-600 border shadow-sm uppercase" title='File Type'>
                                                {item.file.name.split('.').pop()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-[180px]" title='File Name'>
                                                    {item.file.name}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => setFiles(p => p.filter((_, i) => i !== idx))} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all">
                                            <Delete size={18} />
                                        </button>
                                    </div>
                                    
                                    {/* New Input Fields for Metadata */}
                                    <div className="space-y-3">
                                        <div className="space-y-3">
                                            <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Document Name</label>
                                            <input 
                                                placeholder="e.g. Design Approval Document"  title='Please Enter Correct File Name'
                                                value={item.documentName}
                                                onChange={(e) => updateFileMeta(idx, 'documentName', e.target.value)}
                                                className="w-full bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none focus:border-sky-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        
                                        <div className="space-y-3">
                                            <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Brief Description</label>
                                            <textarea 
                                                placeholder="Provide details..."  title='Enter Brief Description about a file'
                                                value={item.description}
                                                onChange={(e) => updateFileMeta(idx, 'description', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-sky-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

            </div>
        </div>
    );
}