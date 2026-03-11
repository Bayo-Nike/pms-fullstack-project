import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Add, FactCheck, Person, AccessTime,
    ChevronLeft, ChevronRight, Layers, Edit, Delete, HelpOutline
} from '@mui/icons-material';
import projectApi from '../../api/modules/project'; // Corrected Import
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Inspections() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null });

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            const res = await projectApi.GET_INSPECTION_LOGS();
            const data = res.data?.data?.content || res.data?.data || res.data || [];
            setLogs(data);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to synchronize inspection records.' });
        } finally {
            setLoading(false);
        }
    };

    const executeDelete = async () => {
        try {
            await projectApi.DELETE_INSPECTION_LOG(deleteConfig.id);
            setAlert({ show: true, type: 'success', message: 'Record purged from registry.' });
            fetchLogs();
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Deletion rejected by server.' });
        } finally { setDeleteConfig({ show: false, id: null }); }
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log =>
            (log.inspectionTypeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.inspectedBy || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.inspectionResult || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [logs, searchTerm]);

    const paginatedItems = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    return (
        <div className="w-full space-y-6 pb-12 px-4 animate-fadeIn relative">
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 64 }} />
                        <h3 className="text-xl font-bold uppercase tracking-tight">Remove Record</h3>
                        <p className="text-sm text-slate-500 mt-2">Delete this inspection log permanently?</p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-3 rounded-2xl border text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-2xl flex items-center justify-center shadow-inner"><FactCheck /></div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Inspection Registry</h1>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">QA Execution History</p>
                    </div>
                </div>
                <button onClick={() => navigate('/projects/inspections/create')} className="bg-[#0284C7] text-white px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    <Add /> Log Inspection
                </button>
            </div>

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
                                <th className="px-8 py-5">Context Level</th>
                                <th className="px-8 py-5">Inspection Type</th>
                                <th className="px-8 py-5">Inspector</th>
                                <th className="px-8 py-5 text-right">Timestamp</th>
                                <th className="px-8 py-5 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-16 text-center text-slate-400 italic animate-pulse">Syncing logs...</td></tr>
                            ) : paginatedItems.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${log.level === 'PROJECT' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                {log.level}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 font-mono">#{log.projectId || log.taskId}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{log.inspectionTypeName}</span>
                                            <span className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">{log.inspectionResult}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-tighter">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Person style={{ fontSize: 14 }} /></div>
                                            {log.inspectedBy}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right text-[11px] font-bold text-slate-400">
                                        {new Date(log.inspectionDateTime).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => navigate(`/admin/inspections/edit/${log.id}`)} className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-all"><Edit style={{ fontSize: 20 }} /></button>
                                            <button onClick={() => setDeleteConfig({ show: true, id: log.id })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Delete style={{ fontSize: 20 }} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}