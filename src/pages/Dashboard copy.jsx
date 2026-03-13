import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header - Scaled Down */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-xs">Executive summary of Oromia Construction projects.</p>
        </div>
        <button className="w-full md:w-auto bg-[#FBAF1E] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
          + New Project
        </button>
      </div>

      {/* Stats - Compact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Active Projects', v: '12', c: 'text-[#0284C7]' },
          { l: 'Pending Tasks', v: '48', c: 'text-amber-600' },
          { l: 'Team Members', v: '14', c: 'text-purple-600' },
          { l: 'Budget Util.', v: '84.2%', c: 'text-green-600' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{s.l}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Main Table Card - Tighter Padding */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">Priority Projects</h2>
          <button className="text-[#0284C7] text-xs font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { n: 'Adama Highway', s: 'In Progress', d: '12 Oct 2024', p: 65 },
                { n: 'Jimma Hospital', s: 'Planning', d: '20 Nov 2024', p: 12 }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{row.n}</td>
                  <td className="px-6 py-4">
                    <span className="bg-sky-50 text-[#0284C7] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      {row.s}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{row.d}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] font-bold text-slate-600">{row.p}%</span>
                      <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-[#0284C7] h-full" style={{ width: `${row.p}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}