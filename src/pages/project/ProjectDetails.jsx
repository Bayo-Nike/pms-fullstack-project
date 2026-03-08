import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowBack, Edit, Payments, CalendarMonth, LocationOn,
    Work, Badge, TrendingUp, Engineering, History, PriorityHigh
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await projectApi.GET_PROJECT(id);
                setProject(res.data.data);
            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Project record not found.' });
            } finally { setLoading(false); }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse">Retrieving project dossier...</div>;
    if (!project) return <div className="p-20 text-center">Record Unavailable.</div>;

    const budgetPercent = (project.budgetUsed / project.budget) * 100;

    return (
        <div className="w-full space-y-6 pb-20 px-2 animate-fadeIn">
            {/* Header / Summary stats */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/projects')} className="p-2 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"><ArrowBack /></button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#0284C7] bg-sky-50 px-2 py-1 rounded-lg border border-sky-100 uppercase">{project.projectCode}</span>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h1>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest flex items-center gap-1">
                            <LocationOn style={{ fontSize: 14 }} /> {project.cityName} &bull; {project.subCityName} &bull; {project.locationName}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <span className="text-xs font-black text-[#0284C7] uppercase">{project.status}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</p>
                        <span className="text-xs font-black text-amber-500 uppercase">{project.priority}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Column 1: Core Info & Budget */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Finance Card */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><Payments className="text-[#FBAF1E]" /><span className="text-sm font-bold text-slate-800 uppercase tracking-widest">Financial Health</span></div>
                            <span className="text-xs font-bold text-slate-400">Utilization: {budgetPercent.toFixed(1)}%</span>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Allocated Budget</p>
                                <p className="text-2xl font-black text-slate-900">{project.currencyType} {project.budget.toLocaleString()}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Spent to Date</p>
                                <p className="text-2xl font-black text-[#0284C7]">{project.currencyType} {project.budgetUsed.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${budgetPercent > 90 ? 'bg-red-500' : 'bg-[#FBAF1E]'}`} style={{ width: `${Math.min(budgetPercent, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Timeline & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <CalendarMonth className="text-sky-500" fontSize="large" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                                <p className="text-sm font-bold text-slate-700">{new Date(project.startDate).toLocaleDateString()} — {new Date(project.endDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <TrendingUp className="text-green-500" fontSize="large" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Physical Progress</p>
                                <p className="text-sm font-bold text-slate-700">Under Synchronization</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Stakeholders & Team */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2"><Engineering className="text-slate-400" /><span className="text-sm font-bold text-slate-800 uppercase tracking-widest">Key Assignments</span></div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-500 shadow-sm"><Badge /></div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Project Manager</p>
                                    <p className="text-sm font-bold text-slate-700">{project.projectManagerName || 'Unassigned'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm"><Work /></div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Lead Contractor</p>
                                    <p className="text-sm font-bold text-slate-700">{project.contractorName || 'TBD'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}