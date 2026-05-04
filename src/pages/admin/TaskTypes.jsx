import React, { useState, useEffect, useMemo } from 'react';
import {
    Edit, Delete, Search, Add, Assignment, HelpOutline,
    ChevronLeft, ChevronRight, Business, Engineering,
    Close, Save, Description, Visibility, Biotech, DonutLarge
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
    const [itemsPerPage] = useState(6);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });
    const [dialog, setDialog] = useState({
        show: false,
        mode: 'create',
        loading: false,
        formData: {
            id: null,
            name: '',
            description: '',
            projectType: 'BUILDING',
            taskTypeProjectStatus: 'INITIATION'
        }
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
            formData: item ? { ...item } : {
                id: null,
                name: '',
                description: '',
                projectType: 'BUILDING',
                taskTypeProjectStatus: 'INITIATION'
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (dialog.mode === 'view') return;
        setDialog(prev => ({ ...prev, loading: true }));
        try {
            if (dialog.mode === 'create') {
                await adminApi.CREATE_TASK_TYPE(dialog.formData);
                showAlert('success', 'Task blueprint registered.');
            } else {
                await adminApi.UPDATE_TASK_TYPE(dialog.formData.id, dialog.formData);
                showAlert('success', 'Task blueprint updated.');
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
            showAlert('success', `Blueprint "${name}" removed.`);
            fetchTasks();
        } catch (err) {
            showAlert('error', "Deletion failed: Item is in use.");
        }
    };

    const filteredItems = useMemo(() => {
        return tasks.filter(i =>
            (i.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.projectType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.taskTypeProjectStatus || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tasks, searchTerm]);

    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const isReadOnly = dialog.mode === 'view';

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Dialog - Create/Edit/View */}
            {dialog.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border">
                        <div className="bg-slate-50 px-8 py-6 border-b flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                {dialog.mode === 'view' ? 'Blueprint Dossier' : dialog.mode === 'edit' ? 'Modify Blueprint' : 'New Blueprint'}
                            </h3>
                            <button onClick={() => setDialog({ ...dialog, show: false })} className="text-slate-400 hover:text-slate-600 transition-all"><Close fontSize="small" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Blueprint Name</label>
                                <input required disabled={isReadOnly} value={dialog.formData.name} onChange={(e) => setDialog({ ...dialog, formData: { ...dialog.formData, name: e.target.value } })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-[#FBAF1E] disabled:opacity-70 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Domain</label>
                                    <select disabled={isReadOnly} value={dialog.formData.projectType} onChange={(e) => setDialog({ ...dialog, formData: { ...dialog.formData, projectType: e.target.value } })}
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase outline-none">
                                        <option value="BUILDING">Building</option>
                                        <option value="WATER_AND_ROAD">Water & Road</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Phase</label>
                                    <select disabled={isReadOnly} value={dialog.formData.taskTypeProjectStatus} onChange={(e) => setDialog({ ...dialog, formData: { ...dialog.formData, taskTypeProjectStatus: e.target.value } })}
                                        className="w-full px-4 py-3.5 bg-sky-50 border-2 border-sky-100 text-[#0284C7] rounded-2xl text-[11px] font-black uppercase outline-none">
                                        <option value="INITIATION">Initiation</option>
                                        <option value="ON_PROGRESS">ON_PROGRESS</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Description</label>
                                <textarea rows="3" disabled={isReadOnly} value={dialog.formData.description} onChange={(e) => setDialog({ ...dialog, formData: { ...dialog.formData, description: e.target.value } })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-medium outline-none focus:border-[#FBAF1E] resize-none disabled:opacity-70" />
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setDialog({ ...dialog, show: false })} className="flex-1 px-4 py-3.5 text-[10px] font-black border-2 rounded-2xl uppercase hover:bg-slate-50 tracking-widest">
                                    {isReadOnly ? 'Close View' : 'Cancel'}
                                </button>
                                {!isReadOnly && (
                                    <button type="submit" disabled={dialog.loading} className="flex-1 px-4 py-3.5 text-[10px] font-black bg-[#FBAF1E] text-white rounded-2xl uppercase shadow-xl hover:bg-amber-600 transition-all">
                                        {dialog.loading ? 'SYNCING...' : 'Save Blueprint'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-[#FBAF1E] rounded-2xl flex items-center justify-center shadow-inner"><Biotech /></div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none">Blueprint Registry</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Operational Task Standardization</p>
                    </div>
                </div>
                {can('CAN_SEE_SYS_ADMIN') && (
                    <button onClick={() => handleOpenDialog('create')} className="bg-[#FBAF1E] text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        <Add /> Register Blueprint
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search standard components..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-[#FBAF1E] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-5">Blueprint Definition</th>
                            <th className="px-6 py-5">Domain</th>
                            <th className="px-6 py-5 text-center">Lifecycle Phase</th>
                            <th className="px-8 py-5 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 text-[11px] font-black animate-pulse uppercase tracking-widest italic">Synchronizing Registry...</td></tr>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 group transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-[#FBAF1E] group-hover:text-white transition-all shadow-sm">
                                                <Assignment style={{ fontSize: 18 }} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 leading-none">{item.name}</span>
                                                <span className="text-[10px] text-slate-400 italic mt-1.5 line-clamp-1">{item.description || 'No documentation.'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                            {item.projectType?.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-tighter ${item.taskTypeProjectStatus === 'INITIATION' ? 'bg-sky-50 text-[#0284C7] border-sky-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {item.taskTypeProjectStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenDialog('view', item)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="View Dossier"><Visibility style={{ fontSize: 20 }} /></button>
                                            {can('CAN_SEE_SYS_ADMIN') && (
                                                <>
                                                    <button onClick={() => handleOpenDialog('edit', item)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all" title="Edit Blueprint"><Edit style={{ fontSize: 20 }} /></button>
                                                    <button onClick={() => setDeleteConfig({ show: true, id: item.id, name: item.name })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Delete style={{ fontSize: 20 }} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 text-xs italic">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="px-8 py-5 bg-slate-50/20 border-t flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl border-2 bg-white disabled:opacity-30 hover:text-[#FBAF1E] transition-all"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl border-2 bg-white disabled:opacity-30 hover:text-[#FBAF1E] transition-all"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}