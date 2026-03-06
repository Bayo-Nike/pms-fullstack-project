import React from 'react';

const Team = () => {
    const members = [
        { name: 'Elias Debelo', role: 'Project Manager', status: 'Active', email: 'elias@company.com' },
        { name: 'Abebe Kebele', role: 'UI/UX Designer', status: 'In Meeting', email: 'abebe@company.com' },
        { name: 'Sara Lemma', role: 'Backend Dev', status: 'Offline', email: 'sara@company.com' },
    ];

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Team Directory</h1>
                <p className="text-slate-500">Manage your workspace members and their roles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((m, i) => (
                    <div key={i} className="p-6 border border-slate-100 rounded-[24px] hover:border-[#0284C7] transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-full border-2 border-white group-hover:border-[#FBAF1E] transition-all" />
                            <div>
                                <p className="font-bold text-slate-800">{m.name}</p>
                                <p className="text-xs text-[#0284C7] font-bold">{m.role}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>{m.email}</span>
                            <span className={`px-2 py-0.5 rounded-md ${m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{m.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Team;