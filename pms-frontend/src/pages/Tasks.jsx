import React from 'react';
import { CheckCircleOutline, MoreVert } from '@mui/icons-material';

const Tasks = () => {
    const tasks = [
        { title: 'Fix CSS bug on Login', priority: 'High', date: 'Today', status: 'Pending' },
        { title: 'API Documentation', priority: 'Medium', date: 'Tomorrow', status: 'Done' },
        { title: 'User Interview Sessions', priority: 'Low', date: 'Aug 28', status: 'Pending' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Task Board</h1>
                <div className="flex gap-2">
                    <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600">Filters</button>
                    <button className="bg-[#0284C7] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">+ New Task</button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                {tasks.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <button className={t.status === 'Done' ? 'text-green-500' : 'text-slate-300'}>
                                <CheckCircleOutline />
                            </button>
                            <div>
                                <p className={`font-bold ${t.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.title}</p>
                                <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest">
                                    <span className={t.priority === 'High' ? 'text-red-500' : 'text-slate-400'}>{t.priority} Priority</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-400">Due {t.date}</span>
                                </div>
                            </div>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600"><MoreVert /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Tasks;