import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, FactCheck,
    HelpOutline, ChevronLeft, ChevronRight, Business, Engineering, InfoOutlined
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function InspectionTypes() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => { fetchTypes(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const fetchTypes = async () => {
        try {
            const res = await adminApi.GET_INSPECTION_TYPES();
            // Handle wrapper { success, data: [] }
            setTypes(res.data?.data || res.data || []);
        } catch (err) {
            showAlert('error', 'Failed to synchronize inspection template registry.');
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
            await adminApi.DELETE_INSPECTION_TYPE(id);
            showAlert('success', `Template "${name}" has been removed.`);
            fetchTypes();
        } catch (err) {
            showAlert('error', "Deletion failed: This template is currently linked to active project logs.");
        }
    };

    const filteredItems = useMemo(() => {
        return types.filter(i =>
            (i.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.projectType || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [types, searchTerm]);

    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            {/* Delete Modal */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Remove Template</h3>
                        <p className="text-sm text-slate-500 mt-2">Delete <b>{deleteConfig.name}</b>? This will affect future inspection logging.</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-xl uppercase shadow-lg transition-all hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900">Inspection Types</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">QA Standard Definitions</p>
                </div>
                {can('CAN_CREATE_INSPECTION_TYPE') && (
                    <button
                        onClick={() => navigate('/admin/inspection-types/create')}
                        className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest"
                    >
                        <Add style={{ fontSize: 18 }} /> Create Inspection Template
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search templates..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase italic px-4">
                    Total: {filteredItems.length} Blueprints
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Blueprint Name & Description</th>
                            <th className="px-6 py-4">Project Category</th>
                            <th className="px-6 py-4 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-xs italic animate-pulse">Synchronizing with registry...</td></tr>
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
                                                <span className="text-[10px] text-slate-400 italic line-clamp-1 max-w-xs">{item.description || 'No detailed scope defined.'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {item.projectType === 'WATER_AND_IRRIGATION' ? <Engineering className="text-slate-300" style={{ fontSize: 14 }} /> : <Business className="text-slate-300" style={{ fontSize: 14 }} />}
                                            <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">
                                                {item.projectType?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {can('CAN_EDIT_INSPECTION_TYPE') && (
                                                  <button onClick={() => navigate(`/admin/inspection-types/edit/${item.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"><Edit style={{ fontSize: 18 }} /></button>
                                             )}
                                             {can('CAN_DELETE_INSPECTION_TYPE') && (
                                                  <button onClick={() => handleDeleteClick(item)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Delete style={{ fontSize: 18 }} /></button>
                                             )}
                                            
                                            
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-xs italic">No matching templates found.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Footer */}
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