import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, LocationCity,
    HelpOutline, Apartment, ChevronLeft, ChevronRight
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Woredas() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [woredas, setWoredas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination States - CHANGED DEFAULT TO 5
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // UI States
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => {
        fetchWoredas();
    }, []);

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchWoredas = async () => {
        try {
            const res = await adminApi.GET_WOREDAS();
            setWoredas(res.data || res);
        } catch (err) {
            showAlert('error', 'Failed to synchronize woreda data.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (woreda) => {
        setDeleteConfig({ show: true, id: woreda.id, name: woreda.name });
    };

    const executeDelete = async () => {
        const { id, name } = deleteConfig;
        setDeleteConfig({ show: false, id: null, name: '' });
        try {
            await adminApi.DELETE_WOREDA(id);
            showAlert('success', `Woreda "${name}" removed.`);
            fetchWoredas();
        } catch (err) {
            showAlert('error', "Deletion failed: Woreda may be in use.");
        }
    };

    // 1. Filter Logic
    const filteredSubCities = useMemo(() => {
        return woredas.filter(sc =>
            (sc.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sc.cityName || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [woredas, searchTerm]);

    // 2. Pagination Calculation
    const totalPages = Math.ceil(filteredSubCities.length / itemsPerPage);
    const paginatedSubCities = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        const lastPageIndex = firstPageIndex + itemsPerPage;
        return filteredSubCities.slice(firstPageIndex, lastPageIndex);
    }, [filteredSubCities, currentPage, itemsPerPage]);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">

            {/* Confirmation Dialog remains the same */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 text-center">
                        <HelpOutline className="text-red-500 mb-4" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2">Permanently remove <b>{deleteConfig.name}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false, id: null, name: '' })} className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-xl uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900 leading-none">Woredas</h1>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Woreda Level Settings</p>
                </div>
                {can('CAN_SEE_SYS_ADMIN') && (
                    <button onClick={() => navigate('/admin/woredas/create')} className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Add Woreda
                    </button>
                )}
            </div>

            {/* Filter & Page Size Selector */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                {/* Page Size Selector */}
                <div className="ml-auto flex items-center gap-2 px-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Per Page:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to page 1 on change
                        }}
                        className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-md px-2 py-1 outline-none text-slate-600 focus:border-[#0284C7]"
                    >
                        {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-3">Woreda Name</th>
                            <th className="px-6 py-3">Sub-City</th>
                            <th className="px-6 py-3 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-xs italic">Syncing Woreda Registry...</td></tr>
                        ) : paginatedSubCities.length > 0 ? (
                            paginatedSubCities.map((woreda) => (
                                <tr key={woreda.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-sky-50 text-[#0284C7] rounded-lg flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-all"><Apartment style={{ fontSize: 16 }} /></div>
                                            <span className="text-sm font-semibold text-slate-700">{woreda.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5"><span className="text-xs text-slate-500 font-medium uppercase tracking-tight">{woreda.subCityName}</span></td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {can('CAN_SEE_SYS_ADMIN') && (
                                                <>
                                                    <button onClick={() => navigate(`/admin/woredas/edit/${woreda.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"><Edit style={{ fontSize: 16 }} /></button>
                                                    <button onClick={() => handleDeleteClick(woreda)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Delete style={{ fontSize: 16 }} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="px-6 py-20 text-center text-slate-400 text-xs italic">No woreda data found matching "{searchTerm}"</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSubCities.length)} of {filteredSubCities.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:text-[#0284C7] hover:border-[#0284C7] transition-all"><ChevronLeft fontSize="small" /></button>

                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                if (totalPages > 5 && (page > 1 && page < totalPages && Math.abs(page - currentPage) > 1)) {
                                    if (page === 2 || page === totalPages - 1) return <span key={page} className="text-slate-300">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 text-[10px] font-bold rounded-lg transition-all ${currentPage === page ? 'bg-[#0284C7] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:text-[#0284C7] hover:border-[#0284C7]'}`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:text-[#0284C7] hover:border-[#0284C7] transition-all"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}