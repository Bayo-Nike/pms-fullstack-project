import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Add, Visibility, Edit, Delete,
    HelpOutline, LocationOn, ChevronLeft, ChevronRight,
    Close, NoteAdd, Category, WarningAmber
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function ProjectInitiations() {
    const navigate = useNavigate();

    const [initiations, setInitiations] = useState([]);
    const [subCities, setSubCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [phaseFilter, setPhaseFilter] = useState('');
    const [pageInfo, setPageInfo] = useState({ current: 0, total: 0, size: 8, totalElements: 0 });

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, title: '' });

    const fetchInitiations = useCallback(async (page = 0) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: pageInfo.size,
                search: searchTerm.trim() || null,
                phase: phaseFilter || null
            };
            const res = await projectApi.GET_PROJECT_INITIATIONS(params);
            const pageData = res.data.data;
            setInitiations(pageData.content || []);
            setPageInfo(prev => ({
                ...prev, current: pageData.number, total: pageData.totalPages, totalElements: pageData.totalElements
            }));
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Sync error.' }); }
        finally { setLoading(false); }
    }, [pageInfo.size, searchTerm, phaseFilter]);

    useEffect(() => { fetchInitiations(0); }, [fetchInitiations, phaseFilter]);

    const executeDelete = async () => {
        try {
            await projectApi.DELETE_PROJECT_INITIATION(deleteConfig.id);
            setAlert({ show: true, type: 'success', message: 'Initiation removed from registry.' });
            fetchInitiations(pageInfo.current);
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Deletion rejected by server.' }); }
        finally { setDeleteConfig({ show: false, id: null, title: '' }); }
    };

    const getPhaseStyle = (s) => {
        return s === 'INITIATION'
            ? 'bg-sky-50 text-[#0284C7] border-sky-100'
            : 'bg-emerald-50 text-emerald-700 border-emerald-100';
    };

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">

            {/* Delete Warning Dialog */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full text-center border border-red-50 animate-scaleIn">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <WarningAmber style={{ fontSize: 40 }} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Destructive Action</h3>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                            You are about to delete <b>{deleteConfig.title}</b>. This action is irreversible and will remove all associated initiation data.
                        </p>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-4 rounded-2xl bg-red-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-all">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner"><NoteAdd /></div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Project Initiations</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Regional Proposal Registry</p>
                    </div>
                </div>
                <button onClick={() => navigate('/projects/initiations/create')} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    <Add /> New Initiation
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input
                        type="text" placeholder="Search initiations..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchInitiations(0)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-[#0284C7] transition-all"
                    />
                </div>
                <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className="bg-slate-50 border px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 outline-none cursor-pointer">
                    <option value="">All Phases</option>
                    <option value="INITIATION">Initiation</option>
                    <option value="EXECUTION">Execution</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-5">Initiation ID & Title</th>
                            <th className="px-6 py-5">Category</th>
                            <th className="px-6 py-5">Origin / Hub</th>
                            <th className="px-6 py-5 text-center">Phase</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="px-8 py-20 text-center italic animate-pulse text-slate-400 tracking-widest uppercase text-xs">Syncing Initiation Data...</td></tr>
                        ) : initiations.length === 0 ? (
                            <tr><td colSpan="5" className="px-8 py-20 text-center italic text-slate-400">No project initiations found.</td></tr>
                        ) : initiations.map((init) => (
                            <tr key={init.id} className="hover:bg-slate-50/50 group transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-[10px] border border-slate-200 uppercase">{init.projectCode?.slice(-2) || '??'}</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-none">{init.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">{init.projectType?.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                                        <Category style={{ fontSize: 14 }} /> {init.category?.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-xs font-black text-slate-600 uppercase tracking-tighter">
                                    {init.subCityName || 'City Level (HQ)'}
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-tighter ${getPhaseStyle(init.phase)}`}>
                                        {init.phase}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/projects/initiations/view/${init.id}`)}
                                            className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-all"
                                            title="View Details"
                                        >
                                            <Visibility style={{ fontSize: 20 }} />
                                        </button>
                                        <button onClick={() => navigate(`/projects/initiations/edit/${init.id}`)} className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-all" title="Edit Registry"><Edit fontSize="small" /></button>
                                        <button onClick={() => setDeleteConfig({ show: true, id: init.id, title: init.title })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Delete fontSize="small" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Page {pageInfo.current + 1} of {pageInfo.total}</span>
                    <div className="flex gap-2">
                        <button disabled={pageInfo.current === 0} onClick={() => fetchInitiations(pageInfo.current - 1)} className="p-2 rounded-xl border bg-white disabled:opacity-30 active:scale-90 transition-all"><ChevronLeft fontSize="small" /></button>
                        <button disabled={(pageInfo.current + 1) >= pageInfo.total} onClick={() => fetchInitiations(pageInfo.current + 1)} className="p-2 rounded-xl border bg-white disabled:opacity-30 active:scale-90 transition-all"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}