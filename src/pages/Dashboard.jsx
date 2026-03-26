import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, HardHat, Construction,
  CheckSquare, Wallet, MapPin
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import dashboardApi from '../api/modules/dashboard';

const COLORS = ['#0284C7', '#FBAF1E', '#10B981', '#8B5CF6', '#F43F5E'];

export default function ProfessionalDashboard() {
  return (
    // Responsive horizontal padding: px-4 on mobile, px-8 on large screens
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-[#F8FAFC] min-h-screen animate-fadeIn">

      {/* 1. HEADER SECTION - Responsive Flex */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Real-time SCCO performance analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase">Live Status</span>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID - Highly Responsive Columns */}
      <StatsGrid />

      {/* 3. CHARTS SECTION - Stack on mobile, side-by-side on LG screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BudgetUtilizationSection />
        <ProjectDistributionSection />
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatsGrid() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getSummary()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-24 sm:h-28 bg-white border border-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    // Responsive grid: 1 col (base), 2 col (sm), 3 col (md), 4 col (lg), 7 col (xl)
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      <StatCard icon={<Users size={18} />} label="Employees" value={data?.employeeCount} color="blue" />
      <StatCard icon={<UserCheck size={18} />} label="Users" value={data?.userCount} color="indigo" />
      <StatCard icon={<HardHat size={18} />} label="Contractors" value={data?.contractorCount} color="amber" />
      <StatCard icon={<Construction size={18} />} label="Projects" value={data?.projectCount} color="sky" />
      <StatCard icon={<CheckSquare size={18} />} label="Tasks" value={data?.taskCount} color="purple" />
      <BudgetStatCard icon={<Wallet size={18} />} label="Total Budget" budgets={data?.budgetByCurrency} />
      <StatCard icon={<MapPin size={18} />} label="Sub Cities" value={data?.subCityCount} color="rose" />
    </div>
  );
}

function BudgetUtilizationSection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCurrency, setActiveCurrency] = useState('ETB');

  useEffect(() => {
    dashboardApi.getSummary().then(res => {
      setData(res.data.budgetTrend || []);
      setLoading(false);
    });
  }, []);

  const availableCurrencies = [...new Set(data.map(item => item.currency))];
  const filteredTrend = data.filter(item => item.currency === activeCurrency);

  return (
    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Budget Utilization</h3>
          <p className="text-slate-400 text-xs font-medium">Monthly expenditure trend</p>
        </div>

        {!loading && (
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl">
            {availableCurrencies.map((curr) => (
              <button
                key={curr}
                onClick={() => setActiveCurrency(curr)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeCurrency === curr ? "bg-white text-[#0284C7] shadow-sm" : "text-slate-500"
                  }`}
              >
                {curr}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-[250px] sm:h-[300px] w-full relative">
        {loading ? (
          <div className="absolute inset-0 bg-slate-50 rounded-2xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="amount" stroke="#0284C7" strokeWidth={3} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function ProjectDistributionSection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getSummary().then(res => {
      setData(res.data.projectsBySubCity || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Project Distribution</h3>

      <div className="h-[220px] sm:h-[250px] w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius="65%" outerRadius="85%" paddingAngle={5} dataKey="value">
                {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-auto pt-6 space-y-2">
        {!loading && data.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs sm:text-sm">
            <span className="flex items-center gap-2 text-slate-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
              {item.name}
            </span>
            <span className="font-bold text-slate-700">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ATOMIC UI COMPONENTS ---

const StatCard = ({ icon, label, value, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-blue-200">
      <div className={`p-2 rounded-xl w-fit mb-3 ${colorMap[color]}`}>{icon}</div>
      <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">{value || 0}</p>
    </div>
  );
};

const BudgetStatCard = ({ icon, label, budgets }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
    <div className="p-2 rounded-xl w-fit mb-3 bg-emerald-50 text-emerald-600">{icon}</div>
    <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{label}</p>
    <div className="mt-0.5">
      {budgets?.length > 0 ? (
        <div className="flex flex-col">
          {budgets.slice(0, 2).map((b, i) => (
            <div key={i} className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-slate-800">
                {b.amount >= 1000000 ? `${(b.amount / 1000000).toFixed(1)}M` : b.amount.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">{b.currency}</span>
            </div>
          ))}
        </div>
      ) : <p className="text-lg sm:text-xl font-black text-slate-800">0.0</p>}
    </div>
  </div>
);