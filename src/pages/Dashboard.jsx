import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, HardHat, Construction, 
  CheckSquare, Wallet, MapPin, TrendingUp, MoreHorizontal 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import dashboardApi from '../api/modules/dashboard'; // Your API instance

export default function ProfessionalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardApi.getSummary();
      setData(res.data);
    } catch (err) {
      console.error("Dashboard Load Failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 animate-pulse">Loading Analytics...</div>;

  return (
    <div className="p-6 space-y-8 bg-[#F8FAFC] min-h-screen animate-fadeIn">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time SCCO performance analytics</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-xs font-bold text-slate-600 uppercase">Live System Status</span>
            </div>
        </div>
      </div>

      {/* 2. STATS GRID - 7 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard icon={<Users size={20}/>} label="Employees" value={data?.employeeCount} color="blue" />
        <StatCard icon={<UserCheck size={20}/>} label="Users" value={data?.userCount} color="indigo" />
        <StatCard icon={<HardHat size={20}/>} label="Contractors" value={data?.contractorCount} color="amber" />
        <StatCard icon={<Construction size={20}/>} label="Projects" value={data?.projectCount} color="sky" />
        <StatCard icon={<CheckSquare size={20}/>} label="Tasks" value={data?.taskCount} color="purple" />
        <StatCard icon={<Wallet size={20}/>} label="Budget" value={`$${(data?.totalBudget/1000000).toFixed(1)}M`} color="emerald" />
        <StatCard icon={<MapPin size={20}/>} label="Sub Cities" value={data?.subCityCount} color="rose" />
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expenditure Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Budget vs Actual Spend</h3>
            <TrendingUp className="text-emerald-500" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.budgetTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="amount" stroke="#0284C7" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sub-City Distribution (Pie Chart) */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Project Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.projectsBySubCity} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                  {data?.projectsBySubCity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data?.projectsBySubCity.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                  {item.name}
                </span>
                <span className="font-bold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY TABLE */}
      <div className="bg-[#1E293B] rounded-[32px] p-8 text-white shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Priority Construction Tracking</h3>
            <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
              <MoreHorizontal />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                  <th className="pb-4">Contractor</th>
                  <th className="pb-4">Location</th>
                  <th className="pb-4">Compliance</th>
                  <th className="pb-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* Dynamically Map Projects Here */}
                <tr className="group">
                  <td className="py-4 font-bold text-sm">SCCO Auth.</td>
                  <td className="py-4 text-sm text-slate-300">Shaggar City</td>
                  <td className="py-4">
                    <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 w-[80%]"></div>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-[10px] font-black bg-sky-500 hover:bg-sky-400 px-4 py-1.5 rounded-lg transition-all">REVIEWS</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Decorative background circle */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

// Sub-component for clean code
const StatCard = ({ icon, label, value, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className={`p-2.5 rounded-2xl w-fit mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-slate-800 mt-1">{value || 0}</p>
    </div>
  );
};

const COLORS = ['#0284C7', '#FBAF1E', '#10B981', '#8B5CF6', '#F43F5E'];