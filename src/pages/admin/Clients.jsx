import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, HelpOutline, CorporateFare,
    ChevronLeft, ChevronRight, Description, CloudDone, FilePresent
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Clients() {
    const navigate = useNavigate();
    const { can } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => { fetchClients(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const fetchClients = async () => {
        try {
            const res = await adminApi.GET_CLIENTS();
            setClients(res.data?.data || res.data || res);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to load partners.' });
        } finally { setLoading(false); }
    };

    const executeDelete = async () => {
        const { id, name } = deleteConfig;
        setDeleteConfig({ show: false, id: null, name: '' });
        try {
            await adminApi.DELETE_CLIENT(id);
            setAlert({ show: true, type: 'success', message: `Partner "${name}" removed.` });
            fetchClients();
        } catch (err) {
            setAlert({ show: true, type: 'error', message: "Deletion failed." });
        }
    };

    const filteredClients = useMemo(() => {
        return clients.filter(c => (c.contractorName || "").toLowerCase().includes(searchTerm.toLowerCase()));
    }, [clients, searchTerm]);

    const paginatedItems = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-slate-100">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 48 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2">Permanently remove <b>{deleteConfig.name}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase shadow-lg shadow-red-100 transition-all hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900 leading-none">Client Partners</h1>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">External Resource Registry</p>
                </div>
                {can('CAN_MANAGET_CLIENT') && (
                    <button onClick={() => navigate('/client/create')} className="bg-[#FBAF1E] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-100 hover:bg-[#e09a15] transition-all uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Register Client
                    </button>
                )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search client..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Client Name</th>
                            <th className="px-6 py-4">Client Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Verification</th>
                            {(can('CAN_MANAGET_CLIENT')) && (
                                <th className="px-6 py-4 text-right">Operations</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Syncing with partner registry...</td></tr>
                        ) : paginatedItems.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-sky-50 text-[#0284C7] rounded-lg flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-all"><CorporateFare style={{ fontSize: 18 }} /></div>
                                        <span className="text-sm font-semibold text-slate-700">{c.clientName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${c.category === 'GOVERNMENT' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-400'}`}>
                                        {c.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${c.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-400'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {c.document ? (
                                        <a href={`http://localhost:8080/api/admin/client/download/${c.document}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#0284C7] hover:text-[#016da3] transition-colors">
                                            <CloudDone style={{ fontSize: 16 }} />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter border-b border-sky-200">View File</span>
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">No Artifact</span>
                                    )}
                                </td>
                                {can('CAN_MANAGET_CLIENT') && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => navigate(`/client/edit/${c.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"><Edit style={{ fontSize: 18 }} /></button>
                                            <button onClick={() => setDeleteConfig({ show: true, id: c.id, name: c.clientName })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Delete style={{ fontSize: 18 }} /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 rounded-lg border bg-white disabled:opacity-30"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1 rounded-lg border bg-white disabled:opacity-30"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}