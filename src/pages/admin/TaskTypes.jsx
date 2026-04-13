import React, { useState, useEffect, useMemo } from 'react';
import {
    Edit, Delete, Search, Add, Assignment, HelpOutline,
    ChevronLeft, ChevronRight, Business, Engineering,
    Close, Save, Description, Visibility
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function TaskTypes() {
    const { can } = useAuth();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });
    const [dialog, setDialog] = useState({
        show: false,
        mode: 'create', // 'create' | 'edit' | 'view'
        loading: false,
        formData: { id: null, name: '', description: '', projectType: 'BUILDING' }
    });

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await adminApi.GET_TASK_TYPES();
            setTasks(res.data?.data || []);
        } catch (err) {
            showAlert('error', 'Failed to fetch task registry.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleOpenDialog = (mode, item = null) => {
        setDialog({
            show: true,
            mode: mode,
            loading: false,
            formData: item ? { ...item } : { id: null, name: '', description: '', projectType: 'BUILDING' }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (dialog.mode === 'view') return;

        setDialog(prev => ({ ...prev, loading: true }));
        try {
            if (dialog.mode === 'create') {
                await adminApi.CREATE_TASK_TYPE(dialog.formData);
                showAlert('success', 'Task type registered.');
            } else {
                await adminApi.UPDATE_TASK_TYPE(dialog.formData.id, dialog.formData);
                showAlert('success', 'Task type updated.');
            }
            setDialog(prev => ({ ...prev, show: false }));
            fetchTasks();
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Operation failed.');
        } finally {
            setDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const executeDelete = async () => {
        const { id, name } = deleteConfig;
        setDeleteConfig({ show: false, id: null, name: '' });
        try {
            await adminApi.DELETE_TASK_TYPE(id);
            showAlert('success', `Task type "${name}" removed.`);
            fetchTasks();
        } catch (err) {
            showAlert('error', "Deletion failed: Item is in use.");
        }
    };

    const filteredItems = useMemo(() => {
        return tasks.filter(i =>
            (i.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.projectType || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tasks, searchTerm]);

    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const isReadOnly = dialog.mode === 'view';

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Registration/View Dialog */}
            {dialog.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border">
                        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                {dialog.mode === 'create' && <Add className="text-[#FBAF1E]" />}
                                {dialog.mode === 'edit' && <Edit className="text-sky-600" />}
                                {dialog.mode === 'view' && <Visibility className="text-slate-500" />}
                                {dialog.mode === 'view' ? 'Task Type Details' : dialog.mode === 'edit' ? 'Edit Task Type' : 'New Task Type'}
                            </h3>
                            <button onClick={() => setDialog({ ...dialog, show: false })} className="text-slate-400 hover:text-slate-600"><Close fontSize="small" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Name</label>
                                <input required disabled={isReadOnly} value={dialog.formData.name} onChange={(e) => setDialog({ ...dialog, formData: { ...dialog.formData, name: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:border-[#FBAF1E] disabled:opacity-70" />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Type</label>
                                <select disabled={isReadOnly} value={dialog.formData.projectType} onChange={(e) => setDialog({ ...dialog, formData: { ...dialog.formData, projectType: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:border-[#FBAF1E] disabled:opacity-70">
                                    <option value="BUILDING">Building</option>
                                    <option value="WATER_AND_ROAD">Water and Road</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                                <textarea rows="3" disabled={isReadOnly} value={dialog.formData.description} onChange={(e) => setDialog({ ...dialog, formData: { ...dialog.formData, description: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:border-[#FBAF1E] resize-none disabled:opacity-70" />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setDialog({ ...dialog, show: false })} className="flex-1 px-4 py-2.5 text-[10px] font-bold border rounded-xl uppercase hover:bg-slate-50">
                                    {isReadOnly ? 'Close' : 'Cancel'}
                                </button>
                                {!isReadOnly && (
                                    <button type="submit" disabled={dialog.loading} className="flex-1 px-4 py-2.5 text-[10px] font-bold bg-[#FBAF1E] text-white rounded-xl uppercase shadow-lg flex items-center justify-center gap-2">
                                        {dialog.loading ? '...' : <><Save style={{ fontSize: 14 }} /> Save</>}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase">Delete Task Type</h3>
                        <p className="text-sm text-slate-500 mt-2">Delete <b>{deleteConfig.name}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-xl uppercase">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900">Task Type Registry</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Manage operational blueprints</p>
                </div>
                {can('CAN_SEE_SYS_ADMIN') && (
                    <button onClick={() => handleOpenDialog('create')} className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-sm">
                        <Add style={{ fontSize: 18 }} /> Register Type
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search task types..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Task Definition</th>
                            <th className="px-6 py-4">Project Scope</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-xs animate-pulse italic">Synchronizing...</td></tr>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 group transition-colors">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-50 text-[#FBAF1E] rounded-lg flex items-center justify-center group-hover:bg-[#FBAF1E] group-hover:text-white transition-all">
                                                <Assignment style={{ fontSize: 16 }} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                                                <span className="text-[10px] text-slate-400 italic line-clamp-1">{item.description}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {item.projectType === 'WATER_AND_ROAD' ? <Engineering className="text-slate-300" fontSize="small" /> : <Business className="text-slate-300" fontSize="small" />}
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{item.projectType?.replace(/_/g, ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* View Button */}
                                            <button onClick={() => handleOpenDialog('view', item)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all">
                                                <Visibility style={{ fontSize: 18 }} />
                                            </button>

                                            {can('CAN_SEE_SYS_ADMIN') && (
                                                <>
                                                    <button onClick={() => handleOpenDialog('edit', item)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-all">
                                                        <Edit style={{ fontSize: 18 }} />
                                                    </button>
                                                    <button onClick={() => setDeleteConfig({ show: true, id: item.id, name: item.name })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                                                        <Delete style={{ fontSize: 18 }} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-xs italic">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="px-6 py-4 bg-slate-50/20 border-t flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 rounded border bg-white disabled:opacity-30"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1 rounded border bg-white disabled:opacity-30"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}