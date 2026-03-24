import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, AccountTree,
    HelpOutline, Work, ChevronLeft, ChevronRight,
    CorporateFare, Groups
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Positions() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => { fetchPositions(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const fetchPositions = async () => {
        try {
            const res = await adminApi.GET_POSITIONS();
            setPositions(res.data || res);
        } catch (err) {
            showAlert('error', 'Failed to synchronize position registry.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (pos) => {
        setDeleteConfig({ show: true, id: pos.id, name: pos.name });
    };

    const executeDelete = async () => {
        const { id, name } = deleteConfig;
        setDeleteConfig({ show: false, id: null, name: '' });
        try {
            await adminApi.DELETE_POSITION(id);
            showAlert('success', `Position "${name}" removed successfully.`);
            fetchPositions();
        } catch (err) {
            showAlert('error', "Deletion failed: Position might be assigned to active staff.");
        }
    };

    const filteredPositions = useMemo(() => {
        return positions.filter(p =>
            (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.divisionName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.parentName || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [positions, searchTerm]);

    const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
    const paginatedPositions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPositions.slice(start, start + itemsPerPage);
    }, [filteredPositions, currentPage, itemsPerPage]);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">

            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 text-center">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2">Remove <b>{deleteConfig.name}</b> from positions?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false, id: null, name: '' })} className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase tracking-widest">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-xl uppercase tracking-widest shadow-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900">Positions</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Human Resource Hierarchy</p>
                </div>
                {can('CAN_SEE_SYS_ADMIN') && (
                    <button onClick={() => navigate('/admin/positions/create')} className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Create Position
                    </button>
                )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search by name, division, or parent..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="ml-auto flex items-center gap-2 px-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Show:</span>
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded px-2 py-1 outline-none text-slate-600">
                        {[5, 10, 20].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-3">Designation</th>
                            <th className="px-6 py-3">Division</th>
                            <th className="px-6 py-3">Reports To</th>
                            <th className="px-6 py-3">Subordinates</th>
                            <th className="px-6 py-3 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-xs italic">Loading...</td></tr>
                        ) : paginatedPositions.length > 0 ? (
                            paginatedPositions.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-sky-50 text-[#0284C7] rounded-lg flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-all"><Work style={{ fontSize: 16 }} /></div>
                                        <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                                    </td>
                                    <td className="px-6 py-3.5"><div className="flex items-center gap-2 text-slate-500"><CorporateFare style={{ fontSize: 14 }} /><span className="text-xs uppercase font-medium">{p.divisionName}</span></div></td>
                                    <td className="px-6 py-3.5">
                                        {p.parentName ? <div className="flex items-center gap-2 text-slate-400"><AccountTree style={{ fontSize: 14 }} /><span className="text-xs">{p.parentName}</span></div> : <span className="text-[10px] text-slate-300 italic uppercase">Top Level</span>}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${p.children?.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400'}`}>
                                            {p.children?.length || 0} DIRECT REPORTS
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {can('CAN_SEE_SYS_ADMIN') && (
                                                <>
                                                    <button onClick={() => navigate(`/admin/positions/edit/${p.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md"><Edit style={{ fontSize: 16 }} /></button>
                                                    <button onClick={() => handleDeleteClick(p)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Delete style={{ fontSize: 16 }} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400 text-xs italic">No positions found.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border bg-white text-slate-400 disabled:opacity-30"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border bg-white text-slate-400 disabled:opacity-30"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}