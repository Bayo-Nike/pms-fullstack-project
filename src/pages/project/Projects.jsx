import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowForwardIos,
    NavigateBefore,
    NavigateNext,
    Search,
    FilterList
} from '@mui/icons-material';

// Expanded Mock Data
const allProjects = Array.from({ length: 22 }, (_, i) => ({
    id: `${i + 1}`,
    name: i % 3 === 0 ? `Adama Expressway Sec ${i + 1}` : i % 3 === 1 ? `Jimma Hospital Wing ${i + 1}` : `Ambo Water Project ${i + 1}`,
    zone: ['East Shewa', 'Jimma', 'West Shewa', 'Arsi'][i % 4],
    status: ['In Progress', 'Completed', 'Planning', 'At Risk'][i % 4],
    progress: Math.floor(Math.random() * 100),
    budget: `${(Math.random() * 500 + 100).toFixed(1)}M ETB`
}));

export default function Projects() {
    const navigate = useNavigate();

    // States for Filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [zoneFilter, setZoneFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // States for Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // 1. Logic: Filter the data first
    const filteredProjects = useMemo(() => {
        return allProjects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesZone = zoneFilter === 'All' || p.zone === zoneFilter;
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchesSearch && matchesZone && matchesStatus;
        });
    }, [searchQuery, zoneFilter, statusFilter]);

    // 2. Logic: Paginate the filtered results
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const currentData = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
                    <p className="text-slate-500 text-sm">Oromia Construction Office active project registry.</p>
                </div>
                <button className="bg-[#FBAF1E] text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-orange-100">+ New Project</button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 scale-90" />
                    <input
                        type="text"
                        placeholder="Search project name..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0284C7]"
                        value={searchQuery}
                        onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-600 outline-none"
                        onChange={(e) => handleFilterChange(setZoneFilter, e.target.value)}
                    >
                        <option value="All">All Zones</option>
                        <option value="East Shewa">East Shewa</option>
                        <option value="Jimma">Jimma</option>
                        <option value="West Shewa">West Shewa</option>
                        <option value="Arsi">Arsi</option>
                    </select>

                    <select
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-600 outline-none"
                        onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="At Risk">At Risk</option>
                    </select>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 gap-4 min-h-[400px]">
                {currentData.length > 0 ? currentData.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:border-[#0284C7] transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-xl flex items-center justify-center font-black text-lg group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                                {p.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-[#0284C7] transition-colors">{p.name}</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{p.zone} Zone</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {p.status}
                            </span>
                            <div className="w-32 hidden sm:block">
                                <div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-[#0284C7]">{p.progress}%</span></div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-[#0284C7] h-full transition-all" style={{ width: `${p.progress}%` }} />
                                </div>
                            </div>
                            <ArrowForwardIos className="text-slate-200 group-hover:text-[#0284C7] scale-75" />
                        </div>
                    </div>
                )) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 italic">No projects match your filters.</div>
                )}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Page {currentPage} of {totalPages}</p>
                    <div className="flex items-center gap-1">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-20"><NavigateBefore /></button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#0284C7] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-20"><NavigateNext /></button>
                    </div>
                </div>
            )}
        </div>
    );
}