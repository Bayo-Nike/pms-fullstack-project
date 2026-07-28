import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Payments, RequestQuote, TrendingUp, ChevronLeft,
    ChevronRight, ReceiptLong, FilterList, LocationOn
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import { useAuth } from '../../context/AuthContext';

export default function ProjectCosts() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [pageInfo, setPageInfo] = useState({ current: 0, total: 0, size: 10 });

    // Trigger fetch when status or type changes
    useEffect(() => {
        fetchProjects(0);
    }, [statusFilter, typeFilter]);

    const fetchProjects = async (page) => {
        setLoading(true);
        try {
            const params = {
                page,
                size: pageInfo.size,
                // Only send specific values to backend, send null for 'ALL'
                projectType: typeFilter !== 'ALL' ? typeFilter : null,
                status: statusFilter !== 'ALL' ? statusFilter : null
            };
            const res = await projectApi.GET_PROJECTS(params);
            const pageData = res.data.data;
            setProjects(pageData.content || []);
            setPageInfo({
                current: pageData.number,
                total: pageData.totalPages,
                size: pageData.size
            });
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // FIXED: Combined Filter Logic (Search + Type + Status)
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.projectCode || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = typeFilter === 'ALL' || p.projectType === typeFilter;

            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [projects, searchTerm, typeFilter, statusFilter]);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-[#FBAF1E] rounded-2xl flex items-center justify-center shadow-inner"><Payments /></div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">Project Financials</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1.5">Capital Expenditure Monitoring</p>
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 20 }} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-[#0284C7] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1">
                        <FilterList className="text-slate-400" style={{ fontSize: 16 }} />
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPageInfo(p => ({ ...p, current: 0 })); }}
                            className="bg-transparent text-[10px] font-bold uppercase text-slate-600 outline-none cursor-pointer"
                        >
                            <option value="ALL">All Types</option>
                            <option value="BUILDING">Building</option>
                            <option value="WATER_AND_ROAD">Water & Road</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPageInfo(p => ({ ...p, current: 0 })); }}
                            className="bg-transparent text-[10px] font-bold uppercase text-slate-600 outline-none cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="ON_GOING">On Going</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                        </select>
                    </div>
                </div>

                <div className="ml-auto text-[10px] font-black text-[#0284C7] bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 uppercase tracking-widest">
                    Showing: {filteredProjects.length}
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-5">Client Name</th>
                            <th className="px-8 py-5">Project Details</th>
                            <th className="px-6 py-5">Total Budget</th>
                            <th className="px-6 py-5">Spent to Date</th>
                            <th className="px-6 py-5">Financial Utilized Progress</th>
                            <th className="px-8 py-5 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="px-8 py-20 text-center animate-pulse italic text-slate-400">Loading Financial Data...</td></tr>
                        ) : filteredProjects.length > 0 ? (
                            filteredProjects.map((proj) => {
                                const usage = (proj.budgetUsed / proj.budget) * 100;
                                return (
                                    <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center font-black text-[10px] uppercase border border-sky-100 shadow-sm">{proj.projectCode.slice(-2)}</div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-none">{proj.clientName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-none">{proj.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 flex items-center gap-1">
                                                        <LocationOn style={{ fontSize: 12 }} /> {proj.subCityName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs font-bold text-slate-600">
                                            {proj.currencyType} {proj.budget?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs font-black text-[#FBAF1E]">
                                            {proj.budgetUsed?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 min-w-[150px]">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[8px] font-black uppercase">
                                                    <span className={usage > 90 ? 'text-red-500' : 'text-slate-400'}>{usage.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-1000 ${usage > 90 ? 'bg-red-500' : 'bg-[#FBAF1E]'}`} style={{ width: `${Math.min(usage, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {
                                                can('CAN_VIEW_RECORD_COST') &&
                                                (<button onClick={() => navigate(`/project-costs/${proj.id}`)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-[#0284C7] hover:text-white transition-all shadow-sm active:scale-90">
                                                    <ReceiptLong style={{ fontSize: 20 }} />
                                                </button>)
                                            }

                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic">No projects found matching the selected filters.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {pageInfo.current + 1} of {pageInfo.total || 1}</span>
                    <div className="flex gap-2">
                        <button disabled={pageInfo.current === 0} onClick={() => fetchProjects(pageInfo.current - 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronLeft fontSize="small" /></button>
                        <button disabled={pageInfo.current + 1 >= pageInfo.total} onClick={() => fetchProjects(pageInfo.current + 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}