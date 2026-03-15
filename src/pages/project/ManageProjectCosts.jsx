import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Add, Save, History, AccountBalanceWallet, Close, Construction, Person, AccessTime, Edit, Delete, HelpOutline } from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function ManageProjectCosts() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [costHistory, setCostHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Edit State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null });

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [form, setForm] = useState({ phase: '', taskId: '', amount: '' });

    useEffect(() => {
        const init = async () => {
            try {
                const [pRes, tRes, cRes] = await Promise.all([
                    projectApi.GET_PROJECT(id),
                    projectApi.GET_TASKS_BY_PROJECT(id),
                    projectApi.GET_PROJECT_COST_HISTORY(id)
                ]);
                setProject(pRes.data.data);
                setTasks(tRes.data.data || []);
                setCostHistory(cRes.data.data || []);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        init();
    }, [id]);

    const totalSpent = useMemo(() => costHistory.reduce((sum, item) => sum + item.amount, 0), [costHistory]);

    const handleSaveCost = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                projectId: id,
                taskId: form.taskId || null,
                phase: form.phase,
                amount: parseFloat(form.amount),
                updatedBy: currentUser.username
            };

            if (editingRecord) {
                await projectApi.UPDATE_PROJECT_COST(editingRecord.id, payload);
            } else {
                await projectApi.ADD_PROJECT_COST(payload);
            }

            const refresh = await projectApi.GET_PROJECT_COST_HISTORY(id);
            setCostHistory(refresh.data.data || []);
            setIsModalOpen(false);
            setEditingRecord(null);
            setForm({ phase: '', taskId: '', amount: '' });
            setAlert({ show: true, type: 'success', message: 'Financial record synchronized.' });
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Transaction failed.' }); }
    };

    const handleDelete = async () => {
        try {
            await projectApi.DELETE_PROJECT_COST(deleteConfig.id);
            const refresh = await projectApi.GET_PROJECT_COST_HISTORY(id);
            setCostHistory(refresh.data.data || []);
            setDeleteConfig({ show: false, id: null });
            setAlert({ show: true, type: 'success', message: 'Record removed and budget adjusted.' });
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Delete failed.' }); }
    };

    if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-400 uppercase tracking-widest">Generating Ledger...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-4 animate-fadeIn">
            {/* Delete Modal */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 56 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2">Permanently remove this financial entry? This will reverse the budget utilization.</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false, id: null })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm gap-6">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/finance/project-costs')} className="p-3 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-all"><ArrowBack fontSize="small" /></button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-2 py-1 rounded-lg border border-sky-100 uppercase">{project.projectCode}</span>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h1>
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Cost Ledger & Verification</p>
                    </div>
                </div>
                <div className="bg-slate-900 text-white px-8 py-4 rounded-[24px] shadow-xl text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Project Ceiling</p>
                    <p className="text-xl font-black">{project.currencyType} {project.budget?.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Metrics */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#FBAF1E] flex items-center justify-center shadow-inner"><AccountBalanceWallet /></div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Budget Remaining</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-3xl font-black text-slate-900">{project.currencyType} {(project.budget - totalSpent).toLocaleString()}</p>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.max(0, 100 - (totalSpent / project.budget) * 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Calculated from {costHistory.length} total entries</p>
                    </div>
                </div>

                {/* Right Ledger Table */}
                <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><History /></div>
                            <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Update History</span>
                        </div>
                        <button onClick={() => { setEditingRecord(null); setForm({ phase: '', taskId: '', amount: '' }); setIsModalOpen(true); }} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2">
                            <Add style={{ fontSize: 18 }} /> Record Cost
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Phase / Task</th>
                                    <th className="px-6 py-5 text-right">Amount</th>
                                    <th className="px-6 py-5">Updated By</th>
                                    <th className="px-8 py-5 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {costHistory.length === 0 ? (
                                    <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-300 italic font-medium">No financial entries.</td></tr>
                                ) : costHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{item.phase}</span>
                                                {item.taskName && <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.taskName}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm font-black text-[#0284C7]">
                                            {item.amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-tighter">
                                                <Person className="text-slate-300" style={{ fontSize: 16 }} /> @{item.updatedBy}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingRecord(item); setForm({ phase: item.phase, taskId: item.taskId || '', amount: item.amount }); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-[#0284C7] transition-all"><Edit style={{ fontSize: 18 }} /></button>
                                                <button onClick={() => setDeleteConfig({ show: true, id: item.id })} className="p-1.5 text-slate-400 hover:text-red-500 transition-all"><Delete style={{ fontSize: 18 }} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">{editingRecord ? 'Edit Record' : 'Record Cost'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button>
                        </div>
                        <form onSubmit={handleSaveCost} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Phase *</label>
                                <input value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0284C7] text-sm font-bold" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Associated Task</label>
                                <select value={form.taskId} onChange={e => setForm({ ...form, taskId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none">
                                    <option value="">No task association</option>
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.taskName}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Update Amount (ETB) *</label>
                                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-black text-lg text-[#0284C7]" placeholder="0.00" required />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-[#0284C7] transition-all">Commit Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}