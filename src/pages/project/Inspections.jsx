import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Add, FactCheck, Person,
    ChevronLeft, ChevronRight, Edit, Delete, HelpOutline,
    Visibility, Close, Description, Assignment, Layers, EventNote,
    MyLocation, WbSunny, Engineering, AttachFile, OpenInNew, Apartment,
    CloudDone
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Inspections() {
    const navigate = useNavigate();
    const { can } = useAuth();

    // Data States
    const [logs, setLogs] = useState([]);
    const [subCities, setSubCities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Pagination States (Mirrored from Projects logic)
    const [searchTerm, setSearchTerm] = useState('');
    const [subCityFilter, setSubCityFilter] = useState('');
    const [pageInfo, setPageInfo] = useState({ current: 0, total: 0, size: 8, totalElements: 0 });

    // UI States
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, typeName: '' });
    const [viewModal, setViewModal] = useState({ show: false, log: null });
    const [showPreview, setShowPreview] = useState(false);

    // Load Sub-Cities for filter
    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const res = await adminApi.GET_SUB_CITIES();
                setSubCities(res.data?.data || res.data || []);
            } catch (err) { console.error("Lookup fetch failed", err); }
        };
        fetchLookups();
    }, []);

    // Fetch logic updated for Server-Side matching Projects approach
    const fetchLogs = useCallback(async (page = 0) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: pageInfo.size,
                search: searchTerm.trim() || null,
                subCityId: subCityFilter && subCityFilter !== "" ? subCityFilter : null
            };

            const res = await projectApi.GET_INSPECTION_LOGS(params);
            const pageData = res.data.data;

            setLogs(pageData.content || []);
            setPageInfo(prev => ({
                ...prev,
                current: pageData.number,
                total: pageData.totalPages,
                totalElements: pageData.totalElements
            }));
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to synchronize with registry.' });
        } finally {
            setLoading(false);
        }
    }, [pageInfo.size, searchTerm, subCityFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchLogs(0), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, subCityFilter, fetchLogs]);

    const executeDelete = async () => {
        const { id } = deleteConfig;
        setDeleteConfig({ show: false, id: null, typeName: '' });
        try {
            await projectApi.DELETE_INSPECTION_LOG(id);
            setAlert({ show: true, type: 'success', message: 'Inspection log permanently removed.' });
            fetchLogs(pageInfo.current);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Forbidden: Deletion rejected by server.' });
        }
    };

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative text-slate-700">

            {/* VIEW DETAIL MODAL */}
            {viewModal.show && viewModal.log && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-lg"><FactCheck /></div>
                                <div>
                                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Record Detail</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry ID: #{viewModal.log.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewModal({ show: false, log: null })} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all"><Close /></button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><WbSunny className="text-amber-500" /></div>
                                        <div><p className="text-[9px] font-bold text-slate-400 uppercase">Weather</p><p className="text-xs font-black text-slate-700 uppercase">{viewModal.log.weatherCondition}</p></div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><Engineering className="text-slate-500" /></div>
                                        <div><p className="text-[9px] font-bold text-slate-400 uppercase">Personnel</p><p className="text-xs font-black text-slate-700">{viewModal.log.activeWorkers} Workers</p></div>
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-900 rounded-[28px] text-white flex flex-col justify-center gap-3">
                                    <div className="flex items-center gap-2 text-sky-400"><MyLocation style={{ fontSize: 16 }} /><span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Localization</span></div>
                                    <p className="text-xs font-mono font-bold">{viewModal.log.latitude || '0.000'}, {viewModal.log.longitude || '0.000'}</p>
                                </div>
                            </div>

                            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Hub</p><p className="text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{viewModal.log.projectTitle}</p></div>

                            {viewModal.log.taskName && (
                                <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Component</p><p className="text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{viewModal.log.taskName}</p></div>
                            )}

                            <div className="space-y-2"><p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-widest"><Description fontSize="small" /> Inspection Results</p>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[100px]"><p className="text-sm text-slate-600 italic leading-relaxed">{viewModal.log.inspectionResult}</p></div>
                            </div>

                            {viewModal.log.inspectionDocumentUrl && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Evidence</p>
                                    <button onClick={() => setShowPreview(true)} className="w-full flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-100 group transition-all hover:bg-sky-100">
                                        <div className="flex items-center gap-3"><div className="p-2 bg-white rounded-lg shadow-sm text-sky-500"><Description /></div><p className="text-[10px] font-black text-sky-700 uppercase">Attached Registry File</p></div>
                                        <OpenInNew className="text-sky-300 group-hover:text-sky-600" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-slate-400"><span className="text-xs font-bold flex items-center gap-2 uppercase tracking-tighter"><Person style={{ fontSize: 16 }} /> {viewModal.log.employeeName}</span><span className="text-[10px] font-bold uppercase">{viewModal.log.inspectionDate}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {showPreview && (
                <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fadeIn p-6">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden animate-scaleUp">
                        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Document Registry Preview</h3>
                            <button onClick={() => setShowPreview(false)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"><Close /></button>
                        </div>
                        <iframe src={viewModal.log?.inspectionDocumentUrl} title="Document Preview" className="flex-1 w-full border-none" />
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION (Mirrored from Projects style) */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border border-slate-100">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 48 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Remove Record</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Permanently remove the <b>{deleteConfig.typeName}</b> log from registry?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false, id: null, typeName: '' })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header Area */}
            <div className="flex items-center justify-between bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-2xl flex items-center justify-center shadow-inner"><FactCheck /></div>
                    <div><h1 className="text-xl font-bold text-slate-900 leading-none">Quality Assurance</h1><p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Inspection Registry</p></div>
                </div>
                {can('CAN_LOG_INSPECTION') && (
                    <button onClick={() => navigate('/inspections/create')} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <Add /> Log Inspection
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search registry..." className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-[#0284C7] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                    <Apartment className="text-slate-400" style={{ fontSize: 14 }} />
                    <select value={subCityFilter} onChange={(e) => setSubCityFilter(e.target.value)} className="bg-transparent text-[10px] font-bold uppercase text-slate-600 outline-none cursor-pointer">
                        <option value="">All Regions</option>
                        {subCities.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                </div>
                <div className="ml-auto px-4 py-2 bg-sky-50 rounded-xl border border-sky-100 text-[10px] font-black text-[#0284C7] uppercase tracking-widest">Total: {pageInfo.totalElements}</div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Context & Scope</th>
                            <th className="px-8 py-5">Template Type</th>
                            <th className="px-8 py-5">Environment</th>
                            <th className="px-8 py-5 text-right">Date</th>
                            <th className="px-8 py-5 text-right">File</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic animate-pulse font-medium">Synchronizing PMS Registry...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic font-medium">No records found.</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className={`w-fit text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${log.inspectionLevel === 'TASK' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                            {log.inspectionLevel}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-700 mt-1 truncate max-w-[180px]">{log.taskName || log.projectTitle}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5"><span className="text-sm font-bold text-slate-700">{log.inspectionTypeName}</span></td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center"><WbSunny className="text-amber-400" style={{ fontSize: 16 }} /><span className="text-[8px] font-black text-slate-400 uppercase">{log.weatherCondition?.substring(0, 3)}</span></div>
                                        <div className="flex flex-col items-center"><Engineering className="text-slate-400" style={{ fontSize: 16 }} /><span className="text-[8px] font-black text-slate-400 uppercase">{log.activeWorkers}</span></div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right text-[11px] font-bold text-slate-400">{log.inspectionDate}</td>
                                <td className="px-6 py-4">
                                    {log.inspectionDocumentUrl ? (
                                        <a href={`http://localhost:8080/api/admin/contractors/download/${log.inspectionDocumentUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#0284C7] hover:text-[#016da3] transition-colors">
                                            <CloudDone style={{ fontSize: 16 }} />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter border-b border-sky-200">View File</span>
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">No Artifact</span>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {can('CAN_VIEW_INSPECTION') && <button onClick={() => setViewModal({ show: true, log })} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all" title="View Details"><Visibility style={{ fontSize: 20 }} /></button>}
                                        {can('CAN_EDIT_INSPECTION') && <button onClick={() => navigate(`/inspections/edit/${log.id}`)} className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-all" title="Edit Entry"><Edit style={{ fontSize: 20 }} /></button>}
                                        {can('CAN_DELETE_INSPECTION') && <button onClick={() => setDeleteConfig({ show: true, id: log.id, typeName: log.inspectionTypeName })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete Log"><Delete style={{ fontSize: 20 }} /></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {pageInfo.current + 1} of {pageInfo.total || 1}</span>
                    <div className="flex gap-2">
                        <button disabled={pageInfo.current === 0 || loading} onClick={() => fetchLogs(pageInfo.current - 1)} className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all shadow-sm active:scale-90"><ChevronLeft fontSize="small" /></button>
                        <button disabled={(pageInfo.current + 1) >= pageInfo.total || loading} onClick={() => fetchLogs(pageInfo.current + 1)} className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all shadow-sm active:scale-90"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}