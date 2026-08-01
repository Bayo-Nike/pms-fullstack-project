// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowBack, Add, Save, History, AccountBalanceWallet, Close, Construction, Person, AccessTime, Edit, Delete, HelpOutline } from '@mui/icons-material';
// import projectApi from '../../api/modules/project';
// import AlertMessage from '../../components/Reusable/AlertMessage';
// import { useAuth } from '../../context/AuthContext';

// export default function ManageProjectCosts() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { user: currentUser } = useAuth();
//     const { can } = useAuth();

//     const [project, setProject] = useState(null);
//     const [tasks, setTasks] = useState([]);
//     const [costHistory, setCostHistory] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Modal & Edit State
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingRecord, setEditingRecord] = useState(null);
//     const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null });

//     const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
//     const [form, setForm] = useState({ phase: '', taskId: '', amount: '' });

//     useEffect(() => {
//         const init = async () => {
//             try {
//                 const [pRes, tRes, cRes] = await Promise.all([
//                     projectApi.GET_PROJECT(id),
//                     projectApi.GET_TASKS_BY_PROJECT(id),
//                     projectApi.GET_PROJECT_COST_HISTORY(id)
//                 ]);
//                 setProject(pRes.data.data);
//                 setTasks(tRes.data.data || []);
//                 setCostHistory(cRes.data.data || []);
//             } catch (err) { console.error(err); } finally { setLoading(false); }
//         };
//         init();
//     }, [id]);

//     const totalSpent = useMemo(() => costHistory.reduce((sum, item) => sum + item.amount, 0), [costHistory]);

//     const handleSaveCost = async (e) => {
//         e.preventDefault();
//         try {
//             const payload = {
//                 projectId: id,
//                 taskId: form.taskId || null,
//                 phase: form.phase,
//                 amount: parseFloat(form.amount),
//                 updatedBy: currentUser.username
//             };

//             if (editingRecord) {
//                 await projectApi.UPDATE_PROJECT_COST(editingRecord.id, payload);
//             } else {
//                 await projectApi.ADD_PROJECT_COST(payload);
//             }

//             const refresh = await projectApi.GET_PROJECT_COST_HISTORY(id);
//             setCostHistory(refresh.data.data || []);
//             setIsModalOpen(false);
//             setEditingRecord(null);
//             setForm({ phase: '', taskId: '', amount: '' });
//             setAlert({ show: true, type: 'success', message: 'Financial record synchronized.' });
//         } catch (err) { setAlert({ show: true, type: 'error', message: 'Transaction failed.' }); }
//     };

//     const handleDelete = async () => {
//         try {
//             await projectApi.DELETE_PROJECT_COST(deleteConfig.id);
//             const refresh = await projectApi.GET_PROJECT_COST_HISTORY(id);
//             setCostHistory(refresh.data.data || []);
//             setDeleteConfig({ show: false, id: null });
//             setAlert({ show: true, type: 'success', message: 'Record removed and budget adjusted.' });
//         } catch (err) { setAlert({ show: true, type: 'error', message: 'Delete failed.' }); }
//     };

//     if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-400 uppercase tracking-widest">Generating Ledger...</div>;

//     return (
//         <div className="w-full space-y-6 pb-12 px-4 animate-fadeIn">
//             {/* Delete Modal */}
//             {deleteConfig.show && (
//                 <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
//                         <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 56 }} />
//                         <h3 className="text-lg font-bold text-slate-800 uppercase">Confirm Deletion</h3>
//                         <p className="text-sm text-slate-500 mt-2">Permanently remove this financial entry? This will reverse the budget utilization.</p>
//                         <div className="flex gap-4 mt-8">
//                             <button onClick={() => setDeleteConfig({ show: false, id: null })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest">Cancel</button>
//                             <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Delete</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

//             {/* Header */}
//             <div className="flex flex-wrap items-center justify-between bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm gap-6">
//                 <div className="flex items-center gap-5">
//                     <button onClick={() => navigate('/project-costs')} className="p-3 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-all"><ArrowBack fontSize="small" /></button>
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-2 py-1 rounded-lg border border-sky-100 uppercase">{project.projectCode}</span>
//                             <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h1>
//                         </div>
//                         <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Cost Ledger & Verification</p>
//                     </div>
//                 </div>
//                 <div className="bg-slate-900 text-white px-8 py-4 rounded-[24px] shadow-xl text-center">
//                     <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Project Ceiling</p>
//                     <p className="text-xl font-black">{project.currencyType} {project.budget?.toLocaleString()}</p>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//                 {/* Left Metrics */}
//                 <div className="lg:col-span-4 space-y-6">
//                     <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
//                         <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#FBAF1E] flex items-center justify-center shadow-inner"><AccountBalanceWallet /></div>
//                             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Budget Remaining</h3>
//                         </div>
//                         <div className="space-y-2">
//                             <p className="text-3xl font-black text-slate-900">{project.currencyType} {(project.budget - totalSpent).toLocaleString()}</p>
//                         </div>
//                         <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
//                             <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.max(0, 100 - (totalSpent / project.budget) * 100)}%` }}></div>
//                         </div>
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Calculated from {costHistory.length} total entries</p>
//                     </div>
//                 </div>

//                 {/* Right Ledger Table */}
//                 <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
//                     <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><History /></div>
//                             <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Update History</span>
//                         </div>
//                         {
//                             can('CAN_RECORD_COST') && (
//                                 <button onClick={() => { setEditingRecord(null); setForm({ phase: '', taskId: '', amount: '' }); setIsModalOpen(true); }} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2">
//                                     <Add style={{ fontSize: 18 }} /> Record Cost
//                                 </button>
//                             )
//                         }
//                     </div>

//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left">
//                             <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//                                 <tr>
//                                     <th className="px-8 py-5">Phase / Task</th>
//                                     <th className="px-6 py-5 text-right">Amount</th>
//                                     <th className="px-6 py-5">Updated By</th>
//                                     <th className="px-8 py-5 text-right">Operations</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-50">
//                                 {costHistory.length === 0 ? (
//                                     <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-300 italic font-medium">No financial entries.</td></tr>
//                                 ) : costHistory.map((item) => (
//                                     <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
//                                         <td className="px-8 py-5">
//                                             <div className="flex flex-col">
//                                                 <span className="text-sm font-bold text-slate-700">{item.phase}</span>
//                                                 {item.taskName && <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.taskName}</span>}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-5 text-right text-sm font-black text-[#0284C7]">
//                                             {item.amount?.toLocaleString()}
//                                         </td>
//                                         <td className="px-6 py-5">
//                                             <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-tighter">
//                                                 <Person className="text-slate-300" style={{ fontSize: 16 }} /> @{item.updatedBy}
//                                             </div>
//                                         </td>
//                                         <td className="px-8 py-5 text-right">
//                                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                                 {
//                                                     can('CAN_EDIT_RECORD') && (
//                                                         <button onClick={() => { setEditingRecord(item); setForm({ phase: item.phase, taskId: item.taskId || '', amount: item.amount }); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-[#0284C7] transition-all"><Edit style={{ fontSize: 18 }} /></button>
//                                                     )
//                                                 }
//                                                 {
//                                                     can('CAN_DELETE_RECORD') && (
//                                                         <button onClick={() => setDeleteConfig({ show: true, id: item.id })} className="p-1.5 text-slate-400 hover:text-red-500 transition-all"><Delete style={{ fontSize: 18 }} /></button>
//                                                     )
//                                                 }
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>

//             {/* Entry Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
//                     <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
//                         <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
//                             <h3 className="font-black text-slate-800 uppercase tracking-tight">{editingRecord ? 'Edit Record' : 'Record Cost'}</h3>
//                             <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400"><Close /></button>
//                         </div>
//                         <form onSubmit={handleSaveCost} className="p-8 space-y-6">
//                             <div className="space-y-1.5">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Phase *</label>
//                                 <input value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#0284C7] text-sm font-bold" required />
//                             </div>
//                             <div className="space-y-1.5">
//                             <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
//                                 Associated Task
//                             </label>

//                             <select
//                                 value={form.taskId}
//                                 onChange={e => {
//                                 const selectedTaskId = e.target.value;

//                                 const selectedTask = tasks.find(
//                                     t => t.id.toString() === selectedTaskId
//                                 );

//                                 setForm({
//                                     ...form,
//                                     taskId: selectedTaskId,
//                                     amount: selectedTask
//                                     ? parseFloat(selectedTask.taskCost)
//                                     : ''
//                                 });
//                                 }}
//                                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none"
//                             >
//                                 <option value="">No task association</option>
//                                 {tasks.map(t => (
//                                 <option key={t.id} value={t.id}>
//                                     {t.taskName}
//                                 </option>
//                                 ))}
//                             </select>
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Amount *</label>
//                                 <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-black text-lg text-[#0284C7]" placeholder="0.00" required />
//                             </div>
//                             <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-[#0284C7] transition-all">Commit Changes</button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowBack, Add, History, AccountBalanceWallet, Close, 
    Person, Edit, Delete, HelpOutline, CheckCircle, 
    HowToReg, InfoOutlined, CloudUpload, Description,
    Cancel,
    FileDownload
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

// Helper Component for Status Styling
const StatusBadge = ({ status }) => {
    const configs = {
        PENDING: "bg-slate-50 text-slate-500 border-slate-100",
        REQUESTED: "bg-amber-50 text-amber-600 border-amber-100",
        ACKNOWLEDGED: "bg-blue-50 text-blue-600 border-blue-100",
        APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        REJECTED: "bg-red-50 text-red-600 border-red-100"
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${configs[status] || configs.PENDING}`}>
            {status || 'PENDING'}
        </span>
    );
};

export default function ManageProjectCosts() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, can } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [costHistory, setCostHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Action States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null });
    const [workflowAction, setWorkflowAction] = useState({ show: false, id: null, type: '', remark: '' });

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    
    // Enhanced Form State
    const [form, setForm] = useState({ 
        phase: '', 
        taskId: '', 
        amount: '', 
        paymentName: '', 
        milestone: '', 
        file: null 
    });

    const fetchAllData = async () => {
        try {
            const [pRes, tRes, cRes] = await Promise.all([
                projectApi.GET_PROJECT(id),
                projectApi.GET_TASKS_BY_PROJECT(id),
                projectApi.GET_PROJECT_COST_HISTORY(id)
            ]);
            setProject(pRes.data.data);
            setTasks(tRes.data.data || []);
            setCostHistory(cRes.data.data || []);
        } catch (err) { 
            console.error(err); 
            setAlert({ show: true, type: 'error', message: 'Failed to sync financial data.' });
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const approvedSpent = useMemo(() => 
        costHistory
            .filter(item => item.status === 'APPROVED')
            .reduce((sum, item) => sum + item.amount, 0), 
    [costHistory]);

    // Handle File Change
    const handleFileChange = (e) => {
        setForm({ ...form, file: e.target.files[0] });
    };

    const handleSaveCost = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            
            const payload = {
                projectId: id,
                taskId: form.taskId || null,
                phase: form.phase,
                amount: parseFloat(form.amount),
                paymentName: form.paymentName,
                milestone: form.milestone
            };

            // Wrap metadata in a Blob to specify Content-Type for @RequestPart
            if (editingRecord) {
                formData.append('data', JSON.stringify(payload));
            }else{
                formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

            }
        
            if (form.file) {
                formData.append('file', form.file);
            }

            if (editingRecord) {
                await projectApi.UPDATE_PROJECT_COST(editingRecord.id, formData);
            } else {
                await projectApi.ADD_PROJECT_COST(formData);
            }

            await fetchAllData();
            setIsModalOpen(false);
            setEditingRecord(null);
            setForm({ phase: '', taskId: '', amount: '', paymentName: '', milestone: '', file: null });
            setAlert({ show: true, type: 'success', message: 'Financial record synchronized.' });
        } catch (err) { 
            setAlert({ show: true, type: 'error', message: 'Recording failed. Check if data is valid.' }); 
        }
    };

    const handleWorkflowTransition = async () => {
        try {
            const { id: costId, type, remark } = workflowAction;
            if (type === 'acknowledge') await projectApi.ACKNOWLEDGE_PAYMENT(costId, { remark });
            if (type === 'approve') await projectApi.APPROVE_PAYMENT(costId, { remark });
            if (type === 'reject') await projectApi.REJECT_PAYMENT(costId, { remark });

            setAlert({ show: true, type: 'success', message: `Record ${type}d successfully.` });
            setWorkflowAction({ show: false, id: null, type: '', remark: '' });
            fetchAllData();
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Workflow update failed.' });
        }
    };

    const handleDelete = async () => {
        try {
            await projectApi.DELETE_PROJECT_COST(deleteConfig.id);
            await fetchAllData();
            setDeleteConfig({ show: false, id: null });
            setAlert({ show: true, type: 'success', message: 'Record removed.' });
        } catch (err) { setAlert({ show: true, type: 'error', message: 'Delete failed.' }); }
    };

    // Helper function for file download
    const handleDownload = async (fileName) => {
        try {
            const response = await projectApi.DOWNLOAD_COST_DOCUMENT(fileName);
            
            // 1. Convert the binary data to a temporary browser URL
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            
            // 2. Create a hidden link and click it programmatically
            const link = document.createElement('a');
            link.href = url;
            
            // Remove the internal timestamp prefix for the user's view (e.g., 1721_invoice.pdf -> invoice.pdf)
            const cleanName = fileName.includes('_') ? fileName.split('_').slice(1).join('_') : fileName;
            link.setAttribute('download', cleanName);
            
            document.body.appendChild(link);
            link.click();
            
            // 3. Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            setAlert({ show: true, type: 'error', message: 'File download failed. The file may no longer exist.' });
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-400 uppercase tracking-widest">Generating Ledger...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-4 animate-fadeIn">
            
            {/* Workflow Remark Modal */}
            {workflowAction.show && (
                <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center"><InfoOutlined /></div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase leading-none">Confirm {workflowAction.type}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Decision Audit Remark</p>
                            </div>
                        </div>
                        <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-sky-500 min-h-[100px] font-bold"
                            placeholder="Provide a reason or remark (optional)..."
                            value={workflowAction.remark}
                            onChange={(e) => setWorkflowAction({...workflowAction, remark: e.target.value})}
                        />
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setWorkflowAction({show:false})} className="flex-1 px-4 py-3 border rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                            <button onClick={handleWorkflowTransition} className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase shadow-lg hover:bg-sky-700 tracking-widest">Confirm Decision</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full mx-4 text-center border">
                        <HelpOutline className="text-red-500 mb-6 mx-auto" style={{ fontSize: 56 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Permanently remove this financial entry?</p>
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
                    <button onClick={() => navigate('/project-costs')} className="p-3 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-all"><ArrowBack fontSize="small" /></button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#0284C7] bg-sky-50 px-2 py-1 rounded-lg border border-sky-100 uppercase">{project.projectCode}</span>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h1>
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Cost Ledger & Verification Workflow</p>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {/* Client Name in Header */}
                        <p className="text-[11px] text-[#0284C7] font-black uppercase tracking-widest">
                            Client: {project.clientName || "General"}
                        </p>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {/* Contractor Name in Header */}
                        <p className="text-[11px] text-[#0284C7] font-black uppercase tracking-widest">
                            Contractor: {project.contractorName || "General"}
                        </p>
                    </div>
                </div>
                <div className="bg-slate-900 text-white px-8 py-4 rounded-[24px] shadow-xl text-center min-w-[180px]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Total Project Cost</p>
                    <p className="text-xl font-black">{project.currencyType} {project.budget?.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Metrics */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#FBAF1E] flex items-center justify-center shadow-inner"><AccountBalanceWallet /></div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Available Balance</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-3xl font-black text-slate-900">{project.currencyType} {(project.budget - approvedSpent).toLocaleString()}</p>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.max(0, 100 - (approvedSpent / project.budget) * 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic font-bold">Only approved payments are deducted.</p>
                    </div>
                </div>

                {/* Right Ledger Table */}
                <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0284C7] text-white rounded-2xl flex items-center justify-center shadow-lg"><History /></div>
                            <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Project Payment history</span>
                        </div>
                        {
                            can('CAN_INITIATE_PAYMENT_REQUEST') && (
                                <button onClick={() => { setEditingRecord(null); setForm({ phase: '', taskId: '', amount: '', paymentName: '', milestone: '', file: null }); setIsModalOpen(true); }} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2">
                                    <Add style={{ fontSize: 18 }} /> New Request
                                </button>
                            )
                        }
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                                <tr>
                                    <th className="px-8 py-5 text-nowrap">Payment Detail & Status</th>
                                    <th className="px-6 py-5 text-right">Amount</th>
                                    <th className="px-6 py-5">Verification Stage</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {costHistory.length === 0 ? (
                                    <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-300 italic font-medium">No financial entries.</td></tr>
                                ) : costHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-black text-slate-700 tracking-tight">{item.paymentName || item.phase}</span>
                                                {/* Direct Download Button */}
                                                {item.supportingDoc && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDownload(item.supportingDoc)}
                                                        className="p-1.5 bg-sky-50 text-[#0284C7] hover:bg-[#0284C7] hover:text-white rounded-lg transition-all shadow-sm flex items-center justify-center border border-sky-100 active:scale-90"
                                                        title="Download Attachment"
                                                    >
                                                        <FileDownload style={{ fontSize: 16 }} />
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={item.status} />
                                                    {item.milestone && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight bg-slate-50 px-1.5 py-0.5 rounded">@{item.milestone}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-sm font-black text-[#0284C7] block">{item.amount?.toLocaleString()}</span>
                                            <span className="text-[9px] text-slate-400 uppercase font-bold italic tracking-tighter">By: {item.submittedBy}</span>
                                        </td>
                                        
                                        <td className="px-6 py-5">
                                            <div className="space-y-2">
                                                {/* Office Head Stage */}
                                                {item.acknowledgedBy ? (
                                                    <div className="group/note relative">
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                                                            <HowToReg className="text-blue-400" style={{ fontSize: 14 }} /> Ack: {item.acknowledgedBy}
                                                        </div>
                                                        {item.ackRemark && (
                                                            <p className="ml-5 text-[8px] text-slate-400 italic font-medium leading-tight mt-0.5">
                                                                "{item.ackRemark}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : null}

                                                {/* Director Stage */}
                                                {item.approvedBy || item.status === 'REJECTED' ? (
                                                    <div className="group/note relative">
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                                                            {item.status === 'REJECTED' ? (
                                                                <Cancel className="text-red-400" style={{ fontSize: 14 }} />
                                                            ) : (
                                                                <CheckCircle className="text-emerald-400" style={{ fontSize: 14 }} />
                                                            )}
                                                            {item.status === 'REJECTED' ? 'Rejected' : 'Appr'}: {item.approvedBy || 'Director'}
                                                        </div>
                                                        {item.deciderRemark && (
                                                            <p 
                                                                title={item.deciderRemark}
                                                                className="ml-5 text-[8px] text-slate-400 italic font-medium leading-tight mt-0.5 truncate max-w-[150px]"
                                                            >
                                                                "{item.deciderRemark}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : null}

                                                    {/* Empty State */}
                                                    {!item.acknowledgedBy && !item.approvedBy && item.status !== 'REJECTED' && (
                                                        <span className="text-[9px] text-slate-300 italic uppercase font-bold tracking-tighter">
                                                            Awaiting verification...
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Role: Office Head Actions */}
                                                {item.status === 'REQUESTED' && can('CAN_ACKNOWLEDGE_PAYMENT') && (
                                                    <button 
                                                        onClick={() => setWorkflowAction({ show: true, id: item.id, type: 'acknowledge', remark: '' })}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase shadow-sm hover:bg-blue-700 transition-all tracking-widest"
                                                    >
                                                        Acknowledge
                                                    </button>
                                                )}

                                                {/* Role: Director Actions */}
                                                {item.status === 'ACKNOWLEDGED' && can('CAN_DECIDE_PAYMENT') && (
                                                    <div className="flex gap-1">
                                                        <button 
                                                            onClick={() => setWorkflowAction({ show: true, id: item.id, type: 'approve', remark: '' })}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase shadow-sm hover:bg-emerald-700 transition-all tracking-widest"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => setWorkflowAction({ show: true, id: item.id, type: 'reject', remark: '' })}
                                                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase shadow-sm hover:bg-red-600 transition-all tracking-widest"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {/* EDIT/DELETE LOGIC: Only allow if NOT Acknowledged and NOT Approved */}
                                                {item.status !== 'ACKNOWLEDGED' && item.status !== 'APPROVED' && item.status !== 'REJECTED' && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {can('CAN_EDIT_RECORD') && (
                                                            <button 
                                                                onClick={() => { 
                                                                    setEditingRecord(item); 
                                                                    setForm({ 
                                                                        phase: item.phase, 
                                                                        taskId: item.taskId || '', 
                                                                        amount: item.amount,
                                                                        paymentName: item.paymentName || '',
                                                                        milestone: item.milestone || '',
                                                                        file: null
                                                                    }); 
                                                                    setIsModalOpen(true); 
                                                                }} 
                                                                className="p-1.5 text-slate-400 hover:text-[#0284C7]"
                                                            >
                                                                <Edit style={{ fontSize: 18 }} />
                                                            </button>
                                                        )}
                                                        {can('CAN_DELETE_RECORD') && (
                                                            <button onClick={() => setDeleteConfig({ show: true, id: item.id })} className="p-1.5 text-slate-400 hover:text-red-500">
                                                                <Delete style={{ fontSize: 18 }} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">{editingRecord ? 'Edit Record' : 'Request Payment'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400 transition-all"><Close /></button>
                        </div>
                        <form onSubmit={handleSaveCost} className="p-8 space-y-5 overflow-y-auto max-h-[85vh]">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Payment Name *</label>
                                    <input value={form.paymentName} onChange={e => setForm({ ...form, paymentName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:border-[#0284C7] text-sm font-bold" placeholder="e.g. Advance" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Project Phase *</label>
                                    <input value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:border-[#0284C7] text-sm font-bold" placeholder="e.g. Initiation" required />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Expected Milestone</label>
                                <textarea value={form.milestone} onChange={e => setForm({ ...form, milestone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:border-[#0284C7] text-sm font-bold" placeholder="e.g. Site Clearance Completed" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Link to Task</label>
                                <select
                                    value={form.taskId}
                                    onChange={e => {
                                        const selectedTask = tasks.find(t => t.id.toString() === e.target.value);
                                        setForm({ ...form, taskId: e.target.value, amount: selectedTask ? parseFloat(selectedTask.taskCost) : form.amount });
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">No task association</option>
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.taskName}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Amount *</label>
                                <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-black text-xl text-[#0284C7]" placeholder="0.00" required />
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Supporting Document</label>
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                        {form.file ? (
                                            <div className="flex items-center gap-2 text-sky-600">
                                                <Description fontSize="small" />
                                                <span className="text-[10px] font-bold truncate max-w-[200px]">{form.file.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <CloudUpload className="text-slate-400 mb-1" style={{fontSize: 24}} />
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">Click to upload doc</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-[#0284C7] transition-all mt-4">
                                {editingRecord ? 'Update Payment Request' : 'Submit for Confirmation'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}