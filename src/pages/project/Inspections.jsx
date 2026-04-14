import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Add, FactCheck, Person,
    ChevronLeft, ChevronRight, Edit, Delete, HelpOutline,
    Visibility, Close, Description, Assignment, Layers, EventNote,
    MyLocation, WbSunny, Engineering, AttachFile, OpenInNew
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Inspections() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null });

    // View Modal State
    const [viewModal, setViewModal] = useState({ show: false, log: null });
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            const res = await projectApi.GET_INSPECTION_LOGS();
            const data = res.data?.data?.content || res.data?.data || [];
            setLogs(data);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Access Denied or Connection Failure.' });
        } finally {
            setLoading(false);
        }
    };

    const executeDelete = async () => {
        try {
            await projectApi.DELETE_INSPECTION_LOG(deleteConfig.id);
            setAlert({ show: true, type: 'success', message: 'Record removed.' });
            fetchLogs();
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Forbidden: You cannot delete this record.' });
        } finally { setDeleteConfig({ show: false, id: null }); }
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log =>
            (log.inspectionTypeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.projectTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [logs, searchTerm]);

    const paginatedItems = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    return (
        <div className="w-full space-y-6 pb-12 px-4 animate-fadeIn relative">

            {/* VIEW DETAIL MODAL */}
            {viewModal.show && viewModal.log && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center">
                                    <FactCheck />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Inspection Record</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry ID: #{viewModal.log.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewModal({ show: false, log: null })} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all"><Close /></button>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* METRICS GRID */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><WbSunny className="text-amber-500" /></div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Weather</p>
                                            <p className="text-xs font-black text-slate-700 uppercase">{viewModal.log.weatherCondition}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><Engineering className="text-slate-500" /></div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Active Workers</p>
                                            <p className="text-xs font-black text-slate-700">{viewModal.log.activeWorkers} Personnel</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SPATIAL DATA */}
                                <div className="p-5 bg-slate-900 rounded-[28px] text-white flex flex-col justify-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <MyLocation style={{ fontSize: 16 }} className="text-sky-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">GPS Localization</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Coordinates</p>
                                        <p className="text-xs font-mono font-bold tracking-tighter">
                                            {viewModal.log.latitude || '0.000'}, {viewModal.log.longitude || '0.000'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context Level</p>
                                    <span className={`inline-block text-[10px] font-black px-2 py-1 rounded border uppercase ${viewModal.log.inspectionLevel === 'TASK' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                        {viewModal.log.inspectionLevel}
                                    </span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Type</p>
                                    <p className="text-sm font-bold text-slate-700">{viewModal.log.inspectionTypeName}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Assignment fontSize="small" /> Project Association</p>
                                <p className="text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{viewModal.log.projectTitle}</p>
                            </div>

                            {viewModal.log.taskName && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers fontSize="small" /> Task Component</p>
                                    <p className="text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{viewModal.log.taskName}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Description fontSize="small" /> Results & Observations</p>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[100px]">
                                    <p className="text-sm text-slate-600 leading-relaxed italic">{viewModal.log.inspectionResult}</p>
                                </div>
                            </div>

                            {/* DOCUMENT ATTACHMENT */}
                            {viewModal.log.inspectionDocumentUrl && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><AttachFile fontSize="small" /> Evidence Registry</p>
                                    <button
                                        onClick={() => setShowPreview(true)}
                                        className="w-full flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-100 group transition-all hover:bg-sky-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sky-500 shadow-sm"><Description /></div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-sky-700 uppercase">Attached Evidence</p>
                                                <p className="text-[10px] text-sky-500 font-bold uppercase tracking-tighter">Internal Registry File</p>
                                            </div>
                                        </div>
                                        <OpenInNew className="text-sky-300 group-hover:text-sky-600 transition-colors" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Person style={{ fontSize: 16 }} />
                                    <span className="text-xs font-bold">{viewModal.log.employeeName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <EventNote style={{ fontSize: 16 }} />
                                    <span className="text-[10px] font-bold uppercase">{viewModal.log.inspectionDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {showPreview && viewModal.log?.inspectionDocumentUrl && (
                <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fadeIn p-4 md:p-10">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden relative border animate-scaleUp">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Document Registry Preview</h3>
                            <button onClick={() => setShowPreview(false)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Close /></button>
                        </div>
                        <iframe src={viewModal.log.inspectionDocumentUrl} title="Document Preview" className="flex-1 w-full border-none" />
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Permanently remove this inspection log?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header Area */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-2xl flex items-center justify-center shadow-inner"><FactCheck /></div>
                    <div><h1 className="text-xl font-bold text-slate-900">Quality Assurance</h1><p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Inspection Registry</p></div>
                </div>

                {
                    can('CAN_LOG_INSPECTION') &&
                    (<button onClick={() => navigate('/inspections/create')} className="bg-[#0284C7] text-white px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-sky-100 transition-all active:scale-95">
                        <Add /> Log Inspection
                    </button>)
                }


            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 20 }} />
                        <input type="text" placeholder="Search logs..." className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#0284C7] transition-all" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Context</th>
                                <th className="px-8 py-5">Template Type</th>
                                <th className="px-8 py-5">Environment</th>
                                <th className="px-8 py-5 text-right">Date</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-16 text-center text-slate-400 italic">Connecting to registry...</td></tr>
                            ) : paginatedItems.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className={`w-fit text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${log.inspectionLevel === 'TASK' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                {log.inspectionLevel}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-700 mt-1 truncate max-w-[150px]">{log.taskName || log.projectTitle}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{log.inspectionTypeName}</span>
                                            <span className="text-[10px] text-slate-400 truncate max-w-xs italic mt-0.5">{log.inspectionResult}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center">
                                                <WbSunny className="text-amber-400" style={{ fontSize: 16 }} />
                                                <span className="text-[8px] font-black text-slate-400 uppercase">{log.weatherCondition?.substring(0, 3)}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Engineering className="text-slate-400" style={{ fontSize: 16 }} />
                                                <span className="text-[8px] font-black text-slate-400 uppercase">{log.activeWorkers}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right text-[11px] font-bold text-slate-400">{log.inspectionDate}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {
                                                can('CAN_VIEW_INSPECTION') &&
                                                (<button onClick={() => setViewModal({ show: true, log })} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all" title="View Full Log"><Visibility style={{ fontSize: 20 }} /></button>
                                                )}
                                            {can('CAN_EDIT_INSPECTION') &&
                                                (
                                                    <button onClick={() => navigate(`/inspections/edit/${log.id}`)} className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-all" title="Edit Entry"><Edit style={{ fontSize: 20 }} /></button>
                                                )}
                                            {can('CAN_DELETE_INSPECTION') &&
                                                (
                                                    <button onClick={() => setDeleteConfig({ show: true, id: log.id })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete Log"><Delete style={{ fontSize: 20 }} /></button>
                                                )}

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:text-[#0284C7]"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:text-[#0284C7]"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}