import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowBack, LocationOn, Info, Visibility,
    Download, Business, Engineering, Map, 
    Description, History, RateReview, 
    CalendarMonth, Category, Apartment, 
    AssignmentTurnedIn, PendingActions,
    Explore,
    Add
} from '@mui/icons-material';
import demandApi from '../../api/modules/demand';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

const DemandInitiationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can } = useAuth();

    const [demand, setDemand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await demandApi.GET_DEMAND(id);
                setDemand(res.data.data || res.data);
            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Failed to fetch demand dossier.' });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Pending';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleDownload = async (docId, originalFileName) => {
        try {
            // 1. Call the API (includes your JWT Token automatically)
            const response = await demandApi.DOWNLOAD_DEMAND_DOCUMENT(docId);
            
            // 2. Create a Blob from the response data
            const fileBlob = new Blob([response.data], { 
                type: response.headers['content-type'] 
            });
    
            // 3. Create a temporary URL
            const url = window.URL.createObjectURL(fileBlob);
            
            // 4. Create a hidden <a> tag and click it
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalFileName); // The clean name: "Screenshot.png"
            document.body.appendChild(link);
            link.click();
            
            // 5. Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download Error:", err);
            setAlert({ show: true, type: 'error', message: 'Download failed. Access denied.' });
        }
    };

    if (loading) return (
        <div className="p-20 text-center animate-pulse">
            <PendingActions className="text-slate-300 mb-4" sx={{ fontSize: 64 }} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Demand Dossier...</p>
        </div>
    );

    return (
        <div className="w-full space-y-6 pb-20 px-4 animate-fadeIn bg-[#F8FAFC]">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* HEADER: Profile & Identity */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 border rounded-2xl hover:bg-slate-100 transition-all">
                        <ArrowBack />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest" title='Demand Code'>
                                {demand.demandCode}
                            </span>
                            
                            <h6 className="text-2xl font-black text-slate-900 tracking-tight" title='Client Name'>{demand.clientName}</h6>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight" title='Demand Title'>{demand.title}</h1>
                            
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <span className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-tighter ${getStatusStyle(demand.status)}`}>
                                {demand.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                <AssignmentTurnedIn sx={{ fontSize: 14 }} /> {demand.phase} PHASE
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="text-right border-r pr-6 border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Classification</p>
                        <p className="text-xs font-black text-slate-700 mt-0.5">{demand.demandType} / {demand.category}</p>
                    </div>
                    {can('CAN_REVIEW_DEMAND') && demand.status === 'PENDING' && (
                        <button 
                            onClick={() => navigate(`/demands/review/${id}`)}
                            className="bg-[#0284C7] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all flex items-center gap-2"
                        >
                            <RateReview /> Review Demand
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: Main Metadata */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Project Narrative */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-400 border-b pb-4 mb-6">
                            <Description fontSize="small" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Demand Description</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl italic border-l-4 border-slate-200">
                            "{demand.description || 'No detailed description provided by the client.'}"
                        </p>
                    </div>

                    {/* Proposed Stakeholders */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-400 border-b pb-4 mb-6">
                            <Business fontSize="small" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Proposed Partnerships</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 p-6 bg-sky-50 rounded-3xl border border-sky-100">
                                <div className="p-3 bg-white text-sky-600 rounded-2xl shadow-sm"><Engineering /></div>
                                <div>
                                    <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Contractor</p>
                                    <p className="text-sm font-black text-sky-900">{demand.contractorName || 'Not Assigned'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                                <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm"><Business /></div>
                                <div>
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Consultancy</p>
                                    <p className="text-sm font-black text-emerald-900">{demand.consultancyName || 'Not Assigned'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviewer Feedback (Conditional) */}
                    {demand.status !== 'PENDING' && (
                        <div className={`p-8 rounded-[40px] border shadow-sm ${demand.status === 'APPROVED' ? 'bg-emerald-900 text-white border-emerald-800' : 'bg-rose-900 text-white border-rose-800'}`}>
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                                <RateReview fontSize="small" className="text-white/50" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Reviewer Remak</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                                {demand.reviewerRemark || 'No specific remark recorded for this decision.'}
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Decision Date</span>
                                <span className="text-xs font-black">{formatDate(demand.respondedDate)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Sidebar Metadata */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Site & Hub Assignment */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <LocationOn className="text-slate-400" />
                            <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Hub Assignment</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Apartment className="text-slate-300" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Sub-City Hub</p>
                                    <p className="text-xs font-bold text-slate-800">{demand.subCityName || 'City Level'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Explore className="text-slate-300" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Woreda / Sector</p>
                                    <p className="text-xs font-bold text-slate-800">{demand.woredaName || 'General Hub'}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                                <Map className="text-sky-500 mt-1" size={18} />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Exact Site Location</p>
                                    <p className="text-xs font-medium text-slate-600 mt-1">{demand.siteLocation || 'Registered Hub Location'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 border-b pb-4 mb-6">
                            <CalendarMonth className="text-slate-400" />
                            <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Submission Timeline</span>
                        </div>
                        <div className="space-y-6 relative">
                            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                            <div className="relative flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 z-10 border-4 border-white shadow-sm">
                                    <Add sx={{ fontSize: 14 }} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-800 uppercase leading-none">Initiated</p>
                                    <p className="text-[9px] text-slate-400 mt-1 font-bold">{formatDate(demand.requestedDate)}</p>
                                </div>
                            </div>
                            <div className="relative flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm ${demand.respondedDate ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                                    <History sx={{ fontSize: 14 }} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-800 uppercase leading-none">Final Resolution</p>
                                    <p className="text-[9px] text-slate-400 mt-1 font-bold">{formatDate(demand.respondedDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attached Documents: Dynamic Document List */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Description />
                                <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Attached Documents</span>
                            </div>
                            <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-500 border border-slate-100">
                                {demand.documents?.length || 0} Files
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            {demand.documents?.length === 0 ? (
                                <div className="text-center py-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    No Attachments Found
                                </div>
                            ) : (
                                demand.documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] border border-slate-100 hover:bg-sky-50 transition-all group shadow-sm hover:shadow-md">
                                        <div className="flex items-center gap-4">
                                            {/* Dynamic File Extension Icon Box */}
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-sky-600 shadow-sm border border-slate-100 group-hover:border-sky-200 text-[10px] font-black uppercase tracking-widest">
                                                {doc.fileName?.split('.').pop() || 'DOC'}
                                            </div>
                                            <div className="overflow-hidden">
                                                {/* Meaningful Document Name (Fallback to fileName) */}
                                                <p className="text-[11px] font-black text-slate-800 truncate max-w-[160px]" title="Document Name">
                                                    {doc.documentName || doc.fileName}
                                                </p>
                                                {/* Source File Name */}
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[160px] mt-0.5" title='Unique File Name in folder'>
                                                    Source: {doc.uniqueFileName || doc.fileName}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Replaced <a href> with Secure Button */}
                                        <button 
                                            type="button"
                                            onClick={() => handleDownload(doc.id, doc.fileName)} 
                                            className="p-2.5 bg-white text-slate-400 hover:text-sky-600 hover:bg-sky-100 border border-slate-100 hover:border-sky-200 rounded-xl transition-all shadow-sm active:scale-95"
                                            title="Download Document"
                                        >
                                            <Download fontSize="small" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DemandInitiationDetails;