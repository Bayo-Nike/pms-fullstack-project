import React, { useState, useEffect } from 'react';
import {
    Close, FactCheck, WbSunny, Engineering, MyLocation,
    LocationOn, Description, Assignment, OpenInNew, Message, Send, Person,
    CalendarMonth, Badge, CloudDone, VerifiedUser, RateReview, Lock,
    Straighten, CheckCircle
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin'; // Added for Actual location resolution
import taskApi from '../../api/modules/task';   // Added for Task actual location
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

// Helper: Haversine Formula (Compares Recorded Claim vs Admin Actual)
const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper: Proximity Status (Tolerance logic)
const getProximityStatus = (km) => {
    const meters = km * 1000;
    if (meters <= 150) return { label: 'ON-SITE', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (meters <= 500) return { label: 'NEAR-SITE', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { label: 'REMOTE', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100' };
};

export default function InspectionDetail({ show, log, onClose, onSync }) {
    const [currentLog, setCurrentLog] = useState(null);
    const [commentInput, setCommentInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showIframe, setShowIframe] = useState(false);
    const { can } = useAuth();

    // --- Distance Auditing Local States ---
    const [actualCoords, setActualCoords] = useState({ lat: null, lng: null });
    const [proximityKm, setProximityKm] = useState(null);

    const [localAlert, setLocalAlert] = useState({ show: false, type: 'info', message: '' });

    useEffect(() => {
        if (log) {
            setCurrentLog(log);
            resolveActualLocation(log);
        }
    }, [log]);

    /**
     * FEATURE: Resolve the "Actual" Ground Truth set by Admin
     */
    const resolveActualLocation = async (targetLog) => {
        let lat = null, lng = null;

        try {
            // 1. Check Task Registry coordinates if applicable
            if (targetLog.inspectionLevel === 'TASK' && targetLog.taskId) {
                const res = await taskApi.GET_TASK(targetLog.taskId);
                const task = res.data?.data || res.data;
                if (task?.latitude && task?.longitude) {
                    lat = parseFloat(task.latitude);
                    lng = parseFloat(task.longitude);
                }
            }

            // 2. Fallback to Location API (using project location)
            if (!lat || !lng) {
                // We fetch the project to find its location IDs, or use a known locationId if available
                const pRes = await projectApi.GET_PROJECT(targetLog.projectId);
                const project = pRes.data?.data || pRes.data;
                if (project?.locationIds?.length > 0) {
                    const locRes = await adminApi.GET_LOCATION(project.locationIds[0]);
                    const dto = locRes.data?.data || locRes.data;
                    if (dto?.lat && dto?.lng) {
                        lat = parseFloat(dto.lat);
                        lng = parseFloat(dto.lng);
                    }
                }
            }
        } catch (e) {
            console.error("Audit Context Error:", e);
        }
        setActualCoords({ lat, lng });
    };

    // Calculate proximity when either log (recorded) or actual changes
    useEffect(() => {
        if (currentLog?.latitude && currentLog?.longitude && actualCoords.lat && actualCoords.lng) {
            const dist = getDistance(
                parseFloat(currentLog.latitude), parseFloat(currentLog.longitude),
                actualCoords.lat, actualCoords.lng
            );
            setProximityKm(dist);
        } else {
            setProximityKm(null);
        }
    }, [currentLog, actualCoords]);

    if (!show || !currentLog) return null;

    const isFinalized = !!(currentLog.comment1 && currentLog.comment2);
    const proxStatus = proximityKm !== null ? getProximityStatus(proximityKm) : null;

    const showInternalAlert = (type, message) => {
        setLocalAlert({ show: true, type, message });
        setTimeout(() => setLocalAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleAddComment = async () => {
        if (!commentInput.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await projectApi.COMMENT_INSPECTION(currentLog.id, commentInput.trim());
            const updatedLog = res.data?.data || res.data;
            console.log(updatedLog)
            setCurrentLog(updatedLog);
            onSync(updatedLog);
            setCommentInput('');
            showInternalAlert('success', 'Official comment recorded in registry.');
        } catch (err) {
            showInternalAlert('error', 'Transaction failed. Please verify connectivity.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fadeIn p-4">
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1300] w-full max-w-md">
                <AlertMessage
                    show={localAlert.show}
                    type={localAlert.type}
                    message={localAlert.message}
                    onClose={() => setLocalAlert({ ...localAlert, show: false })}
                />
            </div>

            <div className="bg-white rounded-[48px] shadow-2xl border w-full max-w-6xl h-[92vh] overflow-hidden flex flex-col animate-slideUp relative">

                {/* --- HEADER SECTION --- */}
                <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-3xl bg-[#0284C7] text-white flex items-center justify-center shadow-xl">
                            <FactCheck fontSize="large" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Inspection Hub</h3>
                                <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-[10px] font-black uppercase">ID: #{currentLog.id}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{currentLog.inspectionTypeName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-white border border-slate-200 hover:bg-red-500 hover:text-white rounded-[24px] transition-all">
                        <Close />
                    </button>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">

                    {/* METRICS STRIP */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { icon: <WbSunny />, color: 'text-amber-500', label: 'Weather', value: currentLog.weatherCondition },
                            { icon: <Engineering />, color: 'text-sky-500', label: 'Active Workers', value: `${currentLog.activeWorkers} Workers` },
                            { icon: <CalendarMonth />, color: 'text-indigo-500', label: 'Date', value: currentLog.inspectionDate },
                            { icon: <Person />, color: 'text-emerald-500', label: 'Inspector', value: currentLog.employeeName }
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-lg" style={{ color: 'inherit' }}>
                                    <span className={item.color}>{item.icon}</span>
                                </div>
                                <div><p className="text-[10px] font-black text-slate-400 uppercase leading-none">{item.label}</p><p className="text-sm font-black text-slate-800 mt-1 truncate">{item.value}</p></div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* LEFT WING: SCOPE, GPS & DOCUMENTS */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Badge fontSize="inherit" /> Context Scope</label>
                                <div className="p-6 bg-sky-50 rounded-[32px] border border-sky-100">
                                    <span className="text-[9px] font-black bg-sky-600 text-white px-2 py-0.5 rounded uppercase">{currentLog.inspectionLevel}</span>
                                    <h4 className="text-sm font-black text-slate-800 mt-2 leading-tight uppercase">{currentLog.projectTitle}</h4>
                                    {currentLog.taskName && <p className="text-xs text-sky-600 font-bold mt-1 italic">Component: {currentLog.taskName}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MyLocation fontSize="inherit" /> Localization Audit</label>

                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-[#0284C7]"><LocationOn style={{ fontSize: 18 }} /><span className="text-[10px] font-black uppercase tracking-widest">Recorded Coordinates</span></div>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${currentLog.latitude},${currentLog.longitude}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-[#0284C7] hover:text-white transition-all text-[9px] font-black uppercase flex items-center gap-2">Map</a>
                                    </div>
                                    <p className="text-sm font-mono font-bold text-slate-700 tracking-tighter">{currentLog.latitude}, {currentLog.longitude}</p>
                                </div>

                                {/* AUDIT CARD: PROXIMITY FROM ADMIN ACTUAL */}
                                {proximityKm !== null && proxStatus && (
                                    <div className={`p-6 rounded-[32px] border animate-fadeIn ${proxStatus.bg} ${proxStatus.border}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`flex items-center gap-2 ${proxStatus.color}`}>
                                                <Straighten style={{ fontSize: 18 }} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Proximity Audit</span>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-white ${proxStatus.color} ${proxStatus.border}`}>{proxStatus.label}</span>
                                        </div>
                                        <p className={`text-sm font-black ${proxStatus.color}`}>
                                            Inspector was {proximityKm < 1 ? `${(proximityKm * 1000).toFixed(0)} Meters` : `${proximityKm.toFixed(2)} KM`} from actual site.
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-dashed border-current opacity-20 flex items-center gap-2">
                                            <CheckCircle style={{ fontSize: 14 }} />
                                            <span className="text-[9px] font-bold uppercase">Compared with Admin technical Registry</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* DOCUMENTS SECTION */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Documentation</label>
                                {currentLog.inspectionDocumentUrl ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setShowIframe(true)}
                                            className="w-full flex items-center justify-between p-4 bg-white rounded-[24px] border border-slate-200 hover:border-[#0284C7] transition-all group shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-sky-500 transition-all"><Description /></div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black text-slate-700 uppercase leading-none">Primary Artifact</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-1 truncate max-w-[150px]">{currentLog.inspectionDocumentUrl}</p>
                                                </div>
                                            </div>
                                            <OpenInNew className="text-slate-300 group-hover:text-sky-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-6 border-2 border-dashed border-slate-100 rounded-[32px] text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase italic">No artifacts attached</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT WING: FINDINGS & REMARKS */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Description fontSize="inherit" /> Technical Findings</label>
                                <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100">
                                    <p className="text-sm text-slate-600 italic leading-relaxed font-medium">"{currentLog.inspectionResult}"</p>
                                </div>
                            </div>

                            {/* FEEDBACK HUB */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Message fontSize="inherit" /> Official Review Remarks</label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Primary Review', comment: currentLog.comment1, user: currentLog.commentedBy1, icon: <VerifiedUser />, color: 'text-sky-600' },
                                        { label: 'Secondary Review', comment: currentLog.comment2, user: currentLog.commentedBy2, icon: <RateReview />, color: 'text-indigo-600' }
                                    ].map((rem, i) => (
                                        <div key={i} className={`p-6 rounded-[32px] border transition-all ${rem.comment ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`flex items-center gap-2 ${rem.color}`}><span style={{ fontSize: 16 }}>{rem.icon}</span><span className="text-[10px] font-black uppercase">{rem.label}</span></div>
                                                {rem.user && <span className="text-[9px] font-bold text-slate-400 uppercase">By: {rem.user}</span>}
                                            </div>
                                            <p className="text-xs text-slate-600 font-bold italic">{rem.comment}</p>
                                        </div>
                                    ))}
                                </div>

                                {!isFinalized && can('CAN_COMMENT_INSPECTION') && (
                                    <div className="bg-slate-50 rounded-[40px] p-2 flex gap-4 border border-slate-200">
                                        <textarea
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            placeholder="Enter your remark..."
                                            className="flex-1 bg-white border border-slate-100 rounded-[32px] px-8 py-5 text-xs font-bold outline-none text-slate-700 focus:border-[#0284C7] transition-all resize-none h-20"
                                        />
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!commentInput.trim() || isSubmitting}
                                            className="w-20 bg-slate-900 text-white rounded-[32px] flex items-center justify-center shadow-lg hover:bg-black disabled:bg-slate-200 transition-all"
                                        >
                                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FULL PREVIEW LAYER */}
                {showIframe && (
                    <div className="absolute inset-0 z-[1400] bg-white flex flex-col animate-fadeIn">
                        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-3"><Description className="text-sky-600" /><span className="text-xs font-black uppercase tracking-widest text-slate-700 px-4">Registry Artifact Preview</span></div>
                            <button onClick={() => setShowIframe(false)} className="p-3 bg-slate-200 text-slate-600 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Close /></button>
                        </div>
                        <iframe src={currentLog.inspectionDocumentUrl} title="Doc" className="flex-1 w-full border-none" />
                    </div>
                )}
            </div>
        </div>
    );
}