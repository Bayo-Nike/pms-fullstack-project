import React, { useState, useEffect, useMemo } from 'react';
import {
    History, Search, Person, AccessTime,
    ChevronLeft, ChevronRight, InfoOutlined, FilterList,
    Visibility, Close, Description, Terminal
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function AuditLog() {
    const { can } = useAuth();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Detail Modal State
    const [detailModal, setDetailModal] = useState({ show: false, log: null });
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await adminApi.GET_AUDIT_LOGS();
            if (res.data && res.data.success && res.data.data?.content) {
                setLogs(res.data.data.content);
            } else if (res.data && Array.isArray(res.data.data)) {
                setLogs(res.data.data);
            }
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to load audit trails.' });
        } finally {
            setLoading(false);
        }
    };

    const uniqueActions = useMemo(() => {
        if (!Array.isArray(logs)) return ['ALL'];
        const actions = logs.map(log => log.action).filter(Boolean);
        return ['ALL', ...new Set(actions)];
    }, [logs]);

    const filteredLogs = useMemo(() => {
        if (!Array.isArray(logs)) return [];
        return logs.filter(log => {
            const matchesSearch =
                (log.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.performedBy || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.details || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
            return matchesSearch && matchesAction;
        });
    }, [logs, searchTerm, actionFilter]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getActionStyle = (action) => {
        const act = (action || "").toUpperCase();
        if (act.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-100';
        if (act.includes('CREATED') || act.includes('CREATE')) return 'bg-green-50 text-green-700 border-green-100';
        if (act.includes('UPDATE') || act.includes('EDIT')) return 'bg-amber-50 text-amber-700 border-amber-100';
        return 'bg-sky-50 text-sky-700 border-sky-100';
    };

    const formatTimestamp = (ts) => {
        if (!ts) return '---,---';
        const date = new Date(ts);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">

            {/* --- DETAIL DIALOG OVERLAY --- */}
            {detailModal.show && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-lg shadow-sky-100">
                                    <Terminal style={{ fontSize: 20 }} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Event Details</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{detailModal.log?.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailModal({ show: false, log: null })}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-slate-400 transition-all"
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</p>
                                    <span className={`inline-block text-[10px] font-black px-2.5 py-1 rounded border uppercase ${getActionStyle(detailModal.log?.action)}`}>
                                        {detailModal.log?.action}
                                    </span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performed By</p>
                                    <p className="text-sm font-bold text-slate-700">{detailModal.log?.performedBy}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Description style={{ fontSize: 12 }} /> Technical Details
                                </p>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[100px]">
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        {detailModal.log?.details}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400 border-t border-slate-50 pt-4">
                                <AccessTime style={{ fontSize: 14 }} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    Recorded: {formatTimestamp(detailModal.log?.timestamp)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                        <History />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">System Audit Trail</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Operation History</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <FilterList className="text-slate-400" style={{ fontSize: 16 }} />
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-md px-2 py-1.5 outline-none text-slate-600 focus:border-[#0284C7]"
                    >
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Performed By</th>
                            <th className="px-6 py-4 text-right">Time</th>
                            <th className="px-6 py-4 text-right">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs italic animate-pulse">Syncing audit registry...</td></tr>
                        ) : paginatedLogs.length > 0 ? (
                            paginatedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${getActionStyle(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{log.performedBy}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-semibold text-slate-700">{formatTimestamp(log.timestamp).split(',')[0]}</span>
                                            <span className="text-[9px] text-slate-400 font-medium uppercase">{formatTimestamp(log.timestamp).split(',')[1]}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setDetailModal({ show: true, log })}
                                            className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"
                                            title="View Full Details"
                                        >
                                            <Visibility style={{ fontSize: 18 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400 text-xs italic">No matching audit records.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}