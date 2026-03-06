import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Search, NavigateBefore, NavigateNext, MoreVert } from '@mui/icons-material';

// Expanded Mock Task Data
const generateTasks = () => Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: i === 0 ? 'Foundation Excavation' : i === 1 ? 'Material Mobilization' : `Site Work Phase ${i + 1}`,
    status: ['In Progress', 'Completed', 'Pending'][i % 3],
    priority: ['High', 'Medium', 'Low'][i % 3],
    weight: [5, 10, 15, 20][i % 4],
    deadline: '2024-10-12'
}));

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const tasks = useMemo(() => generateTasks(), []);

    // Filter States
    const [taskSearch, setTaskSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 5;

    // Filter Logic
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(taskSearch.toLowerCase());
            const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [taskSearch, statusFilter, tasks]);

    // Paginate Logic
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const currentTasks = filteredTasks.slice(
        (currentPage - 1) * tasksPerPage,
        currentPage * tasksPerPage
    );

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header (Same as before) */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/projects')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><ArrowBack /></button>
                <h1 className="text-2xl font-bold text-slate-900">Project Detail #{id}</h1>
            </div>

            {/* Task Table Card */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800">Task Breakdown</h2>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 scale-75" />
                            <input
                                type="text"
                                placeholder="Find task..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-[#0284C7]"
                                value={taskSearch}
                                onChange={(e) => { setTaskSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <select
                            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none"
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Status</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Task</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Weight</th>
                                <th className="px-8 py-4">Deadline</th>
                                <th className="px-8 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {currentTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50/50">
                                    <td className="px-8 py-4 font-bold text-slate-700">{task.name}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 font-black text-[#0284C7]">{task.weight}%</td>
                                    <td className="px-8 py-4 text-slate-400">{task.deadline}</td>
                                    <td className="px-8 py-4 text-right"><MoreVert className="text-slate-200" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination inside Table Card */}
                <div className="p-4 border-t border-slate-50 flex justify-center items-center gap-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-1 rounded-full hover:bg-slate-50 disabled:opacity-20"
                    >
                        <NavigateBefore />
                    </button>
                    <span className="text-xs font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-1 rounded-full hover:bg-slate-50 disabled:opacity-20"
                    >
                        <NavigateNext />
                    </button>
                </div>
            </div>
        </div>
    );
}