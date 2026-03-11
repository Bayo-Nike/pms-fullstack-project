import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, FactCheck,
    HelpOutline, ChevronLeft, ChevronRight, Business, Engineering, InfoOutlined
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Inspections() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => { fetchInspections(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const fetchInspections = async () => {
        try {
            const res = await adminApi.GET_INSPECTIONS();
            setInspections(res.data?.data || res.data || []);
        } catch (err) {
            showAlert('error', 'Failed to synchronize inspection registry.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (item) => {
        setDeleteConfig({ show: true, id: item.id, name: item.name });
    };

    const executeDelete = async () => {
        const { id, name } = deleteConfig;
        setDeleteConfig({ show: false, id: null, name: '' });
        try {
            await adminApi.DELETE_INSPECTION(id);
            showAlert('success', `Inspection definition "${name}" removed.`);
            fetchInspections();
        } catch (err) {
            showAlert('error', "Deletion failed: Template might be in use.");
        }
    };

    const filteredItems = useMemo(() => {
        return inspections.filter(i =>
            (i.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.projectType || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inspections, searchTerm]);

    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            {/* DELETE CONFIRMATION */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center border border-slate-100">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2">Permanently delete <b>{deleteConfig.name}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold uppercase shadow-lg transition-all hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900">Inspection Templates</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Standardized QA Definitions</p>
                </div>
                {can('CAN_MANAGE_MODULES') && (
                    <button onClick={() => navigate('/admin/inspections/create')} className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Create Inspection
                    </button>
                )}
            </div>

            <div className="bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search by name or description..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase italic px-4">
                    Total: {filteredItems.length} Definitions
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Inspection Type & Description</th>
                            <th className="px-6 py-4">Associated Module</th>
                            <th className="px-6 py-4 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-xs italic animate-pulse">Syncing with registry...</td></tr>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-sky-50 text-[#0284C7] rounded-lg flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                                                <FactCheck style={{ fontSize: 16 }} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                                                <span className="text-[10px] text-slate-400 line-clamp-1 italic max-w-xs">{item.description || 'No description provided'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {item.projectType === 'WATER_AND_ROAD' ? <Engineering className="text-slate-300" style={{ fontSize: 14 }} /> : <Business className="text-slate-300" style={{ fontSize: 14 }} />}
                                            <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">
                                                {item.projectType?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => navigate(`/admin/inspections/edit/${item.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"><Edit style={{ fontSize: 18 }} /></button>
                                            <button onClick={() => handleDeleteClick(item)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Delete style={{ fontSize: 18 }} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-xs italic">No matching definitions found.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* FOOTER */}
                <div className="px-6 py-4 bg-slate-50/20 border-t flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 rounded border bg-white disabled:opacity-30 transition-all hover:text-[#0284C7]"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1 rounded border bg-white disabled:opacity-30 transition-all hover:text-[#0284C7]"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}