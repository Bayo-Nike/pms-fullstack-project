import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, AccountTree,
    HelpOutline, CorporateFare, ChevronLeft, ChevronRight,
    Schema
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Divisions() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => {
        fetchDivisions();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchDivisions = async () => {
        try {
            const res = await adminApi.GET_DIVISIONS();
            setDivisions(res.data || res);
        } catch (err) {
            showAlert('error', 'Failed to synchronize organizational data.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (division) => {
        setDeleteConfig({ show: true, id: division.id, name: division.name });
    };

    const executeDelete = async () => {
        const { id, name } = deleteConfig;
        setDeleteConfig({ show: false, id: null, name: '' });
        try {
            await adminApi.DELETE_DIVISION(id);
            showAlert('success', `Division "${name}" has been removed.`);
            fetchDivisions();
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Deletion failed: Ensure this division has no sub-divisions or active users.";
            showAlert('error', errorMsg);
        }
    };

    const filteredDivisions = useMemo(() => {
        return divisions.filter(d =>
            (d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.parentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.divisionGroup || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [divisions, searchTerm]);

    const totalPages = Math.ceil(filteredDivisions.length / itemsPerPage);
    const paginatedDivisions = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        const lastPageIndex = firstPageIndex + itemsPerPage;
        return filteredDivisions.slice(firstPageIndex, lastPageIndex);
    }, [filteredDivisions, currentPage, itemsPerPage]);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">

            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 text-center">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <HelpOutline style={{ fontSize: 32 }} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Delete Division</h3>
                        <p className="text-sm text-slate-500 mt-2">Permanently remove <b>{deleteConfig.name}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false, id: null, name: '' })} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900">Divisions</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Organizational Hierarchy</p>
                </div>
                {can('CAN_CREATE_DIVISION') && (
                    <button onClick={() => navigate('/admin/divisions/create')} className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Create Division
                    </button>
                )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search units..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="ml-auto flex items-center gap-2 px-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Show:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-md px-2 py-1 outline-none text-slate-600 focus:border-[#0284C7]"
                    >
                        {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-3">Division Name</th>
                            <th className="px-6 py-3">Group</th>
                            <th className="px-6 py-3">Parent</th>
                            <th className="px-6 py-3">Sub-Units</th>
                            <th className="px-6 py-3 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-xs italic">Syncing hierarchy...</td></tr>
                        ) : paginatedDivisions.length > 0 ? (
                            paginatedDivisions.map((d) => (
                                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-sky-50 text-[#0284C7] rounded-lg flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                                                <CorporateFare style={{ fontSize: 16 }} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{d.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${d.divisionGroup === 'BTH' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                            d.divisionGroup === 'WAR' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                            {d.divisionGroup || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        {d.parentName ? (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <AccountTree className="text-slate-300" style={{ fontSize: 14 }} />
                                                <span className="text-xs font-medium uppercase">{d.parentName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-bold uppercase italic tracking-tighter">Root Division</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${d.children?.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            {d.children?.length || 0} UNITS
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {can('CAN_EDIT_DIVISION') && (
                                                    <button onClick={() => navigate(`/admin/divisions/edit/${d.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"><Edit style={{ fontSize: 16 }} /></button>
                                                    
                                            )}
                                            {can('CAN_DELETE_DIVISION') && (
                                                    <button onClick={() => handleDeleteClick(d)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Delete style={{ fontSize: 16 }} /></button>
                                                
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400 text-xs italic">No units found matching "{searchTerm}"</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredDivisions.length)} of {filteredDivisions.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronLeft fontSize="small" /></button>
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 text-[10px] font-bold rounded-lg transition-all ${currentPage === i + 1 ? 'bg-[#0284C7] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:border-[#0284C7]'}`}>{i + 1}</button>
                            ))}
                        </div>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}