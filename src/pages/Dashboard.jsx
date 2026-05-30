import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, UserCheck, HardHat, Construction,
  CheckSquare, Wallet, MapPin, BarChart3
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';
import dashboardApi from '../api/modules/dashboard';
import { useAuth } from '../context/AuthContext';
import { Start } from '@mui/icons-material';

const COLORS = ['#0284C7', '#FBAF1E', '#10B981', '#8B5CF6', '#F43F5E'];

const PROJECT_STATUS_COLORS = {
  'NOT_STARTED': '#FBAF1E',   // Amber
  'ON_GOING': '#0284C7',   // Blue
  'COMPLETED': '#10B981', // Green
  'CANCELLED': '#F43F5E', // Red
  'ON_HOLD': '#8B5CF6',   // Purple
  'DEFAULT': '#94a3b8'    // Slate
};

const TASK_STATUS_COLORS = {
  'TO_DO': '#FBAF1E',       // Amber (Attention needed)
  'IN_PROGRESS': '#0284C7', // Sky Blue
  'IN_REVIEW': '#6366F1',   // Indigo (Sophisticated Review color)
  'COMPLETED': '#10B981',   // Emerald
  'DEFAULT': '#94A3B8'
};

export default function ProfessionalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { can } = useAuth();

  useEffect(() => {
    dashboardApi.getSummary()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-[#F8FAFC] min-h-screen animate-fadeIn">

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Real-time SCCO System Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase">Live System Status</span>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID (8 CARDS)*/}
      <StatsGrid data={data} loading={loading} can={can}/>

      {/* 3. SUBCITY COLORCODING PERFORMANCE (Target vs Achieved) */}
      <PerformanceAnalysisSection data={data?.colorCodePerformanceMetrics} loading={loading} />

      {/* 4. BUDGET & PROJECT DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BudgetUtilizationSection trendData={data?.budgetTrend} loading={loading} />
        <ProjectDistributionSection pieData={data?.projectsBySubCity} loading={loading} />
      </div>

      {/* PROJECT STATUS & TASK PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectStatusSection data={data?.projectsByStatus} loading={loading} />
        <TaskOverviewSection data={data?.tasksByStatus} loading={loading} />
      </div>
    </div>
  );
}

// ---TARGET VS ACHIEVED BAR CHART ---
function PerformanceAnalysisSection({ data = [], loading }) {
  // 1. FILTER STATES
  const [filters, setFilters] = useState({
    fiscalYear: 'All',
    buildingType: 'All',
    planType: 'All'
  });

  // 2. DYNAMICALLY GENERATE DROPDOWN OPTIONS
  const uniqueYears = ['All', ...new Set(data.map(item => item.fiscalYear))];
  const uniqueBuildingTypes = ['All', ...new Set(data.map(item => item.buildingType))];
  const uniquePlanTypes = ['All', ...new Set(data.map(item => item.planType))];

  // 3. FILTER & AGGREGATE DATA
  const filteredData = React.useMemo(() => {
    // A. Filter raw data based on dropdowns
    const filtered = data.filter(item => {
      return (filters.fiscalYear === 'All' || item.fiscalYear === filters.fiscalYear) &&
        (filters.buildingType === 'All' || item.buildingType === filters.buildingType) &&
        (filters.planType === 'All' || item.planType === filters.planType);
    });

    // B. Re-aggregate by Sub-City name (since one subcity might have multiple rows after filtering)
    const aggregated = filtered.reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.name);
      if (existing) {
        existing.target += (curr.target || 0);
        existing.achieved += (curr.achieved || 0);
      } else {
        acc.push({
          name: curr.name,
          target: curr.target || 0,
          achieved: curr.achieved || 0
        });
      }
      return acc;
    }, []);

    return aggregated;
  }, [data, filters]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const target = payload.find(p => p.dataKey === 'target')?.value || 0;
      const achieved = payload.find(p => p.dataKey === 'achieved')?.value || 0;
      const efficiency = target > 0 ? ((achieved / target) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white p-4 shadow-2xl border border-slate-100 rounded-2xl">
          <p className="font-bold text-slate-800 mb-2 border-b pb-1">{label}</p>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between gap-6 text-slate-500">Target: <span className="font-bold text-slate-900">{target?.toLocaleString()}</span></p>
            <p className="flex justify-between gap-6 text-blue-600">Achieved: <span className="font-bold">{achieved?.toLocaleString()}</span></p>
            <div className={`mt-2 py-1 px-2 rounded-lg text-center font-black uppercase ${efficiency >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              Efficiency: {efficiency}%
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Performance Analysis</h3>
            <p className="text-slate-500 text-xs font-medium uppercase">Drill down by FiscalYear, Building Type and Plan Mode</p>
          </div>

          <div className="flex gap-4 bg-slate-50 p-2 rounded-xl">
            <div className="flex items-center gap-2 px-2 border-r border-slate-200">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Target</span>
            </div>
            <div className="flex items-center gap-2 px-2">
              <div className="w-3 h-3 rounded-full bg-[#0284C7]"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Achieved</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <FilterSelect
            label="Fiscal Year"
            options={uniqueYears}
            value={filters.fiscalYear}
            onChange={(v) => setFilters(f => ({ ...f, fiscalYear: v }))}
          />
          <FilterSelect
            label="Building Type"
            options={uniqueBuildingTypes}
            value={filters.buildingType}
            onChange={(v) => setFilters(f => ({ ...f, buildingType: v }))}
          />
          <FilterSelect
            label="Plan Type"
            options={uniquePlanTypes}
            value={filters.planType}
            onChange={(v) => setFilters(f => ({ ...f, planType: v }))}
          />
        </div>
      </div>

      {/* CHART */}
      <div className="h-[400px] w-full">
        {loading ? (
          <div className="w-full h-full bg-slate-50 animate-pulse rounded-3xl" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="target" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={filteredData.length > 5 ? 25 : 45} />
              <Bar dataKey="achieved" fill="#0284C7" radius={[4, 4, 0, 0]} barSize={filteredData.length > 5 ? 25 : 45} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ATOMIC FILTER COMPONENT
const FilterSelect = ({ label, options, value, onChange }) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all outline-none"
    > 

      {options.map((opt, index) => (
        <option key={`${opt}-${index}`} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// --- UPDATED STATS GRID (receiving data from parent) ---
function StatsGrid({ data, loading, can }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 sm:h-28 bg-white border border-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
      <StatCard icon={<Users size={18} />} label="Employees" value={data?.employeeCount ?? 0} color="blue" />
      <StatCard icon={<UserCheck size={18} />} label="Users" value={data?.userCount ?? 0} color="indigo" />
      {can?.('CAN_SEE_CONTRACTOR_LIST') && (
      <StatCard icon={<HardHat size={18} />} label="Contractors" value={data?.contractorCount ?? 0} color="amber" />
      )}
      {can?.('CAN_SEE_CONSULTANT_LIST') && (
       <StatCard icon={<HardHat size={18} />} label="Consultants" value={data?.consultantCount} color="amber" />
      )}
      {can?.('CAN_SEE_CLIENT_LIST') && (
      <StatCard icon={<HardHat size={18} />} label="Clients" value={data?.clientCount} color="amber" />
      )}
      <StatCard icon={<Start size={18} />} label="Total Initiations" value={data?.initiationCount ?? 0} color="sky" />
      <StatCard icon={<Construction size={18} />} label="Total Projects" value={data?.projectCount ?? 0} color="sky" />
      <StatCard icon={<CheckSquare size={18} />} label="Total Tasks" value={data?.taskCount ?? 0} color="purple" />
      <BudgetStatCard icon={<Wallet size={18} />} label="Total Budget" budgets={data?.budgetByCurrency ?? 0} />
      <StatCard icon={<MapPin size={18} />} label="Sub Cities" value={data?.subCityCount ?? 0} color="rose" />
      <StatCard icon={<BarChart3 size={18} />} label="ColorCodings" value={data?.colorCodingCount ?? 0} color="rose" />
    </div>
  );
}

function BudgetUtilizationSection({ trendData = [], loading }) {
  const [activeCurrency, setActiveCurrency] = useState('');

  useEffect(() => {
    if (trendData.length > 0 && !activeCurrency) {
      setActiveCurrency(trendData[0].currency);
    }
  }, [trendData]);

  const availableCurrencies = [...new Set(trendData.map(item => item.currency))];
  const filteredTrend = trendData.filter(item => item.currency === activeCurrency);

  return (
    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Budget Utilization</h3>
          <p className="text-slate-400 text-xs font-medium">Monthly expenditure trend</p>
        </div>

        {!loading && availableCurrencies.length > 0 && (
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl">
            {availableCurrencies.map((curr) => (
              <button
                key={curr}
                onClick={() => setActiveCurrency(curr)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeCurrency === curr ? "bg-white text-[#0284C7] shadow-sm" : "text-slate-500"}`}
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

function ProjectDistributionSection({ pieData = [], loading }) {
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
              <Pie data={pieData} innerRadius="65%" outerRadius="85%" paddingAngle={5} dataKey="value">
                {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-auto pt-6 space-y-2">
        {!loading && pieData.map((item, i) => (
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

function ProjectStatusSection({ data = [], loading }) {
  const [selectedSubCity, setSelectedSubCity] = useState('All');

  // 1. Calculate Chart Data (SUM everything if 'All' is selected)
  const chartData = useMemo(() => {
    // A. Filter logic
    const filtered = data.filter(item => {
      if (selectedSubCity === 'All') return true;
      return item.subCity === selectedSubCity;
    });

    return filtered.reduce((acc, curr) => {
      const statusName = curr.name;
      const val = Number(curr.value || 0);

      const existing = acc.find(item => item.name === statusName);
      if (existing) {
        existing.value += val;
      } else {
        acc.push({ name: statusName, value: val });
      }
      return acc;
    }, []);
  }, [data, selectedSubCity]);

  // 2. Generate Dropdown Options
  const subCityOptions = useMemo(() => {
    const unique = [...new Set(data.map(item => item.subCity))].filter(Boolean);
    return ['All', ...unique];
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Project Status</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            {selectedSubCity === 'All' ? 'Total Portfolio' : selectedSubCity}
          </p>
        </div>

        {!loading && subCityOptions.length > 0 && (
          <select
            value={selectedSubCity}
            onChange={(e) => setSelectedSubCity(e.target.value)}
            className="text-[10px] font-black bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none uppercase"
          >
            {subCityOptions.map(sc => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        )}
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={chartData} innerRadius="65%" outerRadius="85%" paddingAngle={5} dataKey="value">
              {chartData.map((entry, i) => (
                <Cell key={i} fill={PROJECT_STATUS_COLORS[entry.name] || PROJECT_STATUS_COLORS.DEFAULT} stroke="none" />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2 border-t pt-4">
        {chartData.map((item, i) => (
          <div key={i} className="flex justify-between text-xs font-bold">
            <span className="flex items-center gap-2 text-slate-500 uppercase">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PROJECT_STATUS_COLORS[item.name] }}></div>
              {item.name}
            </span>
            <span className="text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function TaskOverviewSection({ data = [], loading }) {
  const [selectedProject, setSelectedProject] = useState('All Projects');

  // 1. Extract Unique Projects for the dropdown
  const projectOptions = useMemo(() => {
    const unique = [...new Set(data.map(item => item.projectName))].filter(Boolean);
    return ['All Projects', ...unique];
  }, [data]);

  // 2. Filter and Aggregate Data based on selected project
  const aggregatedData = useMemo(() => {
    // A. Filter by project
    const filtered = data.filter(item =>
      selectedProject === 'All Projects' || item.projectName === selectedProject
    );

    // B. Re-aggregate by status (Summing counts from different projects if 'All' is selected)
    return filtered.reduce((acc, curr) => {
      const statusName = curr.status;
      const count = Number(curr.count || 0);

      const existing = acc.find(item => item.name === statusName);
      if (existing) {
        existing.value += count;
      } else {
        acc.push({ name: statusName, value: count });
      }
      return acc;
    }, []);
  }, [data, selectedProject]);

  // 3. Calculate Performance Metrics
  const totalTasks = aggregatedData.reduce((sum, item) => sum + item.value, 0);
  const completed = aggregatedData.find(item => item.name === 'COMPLETED')?.value || 0;
  const rate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-full min-h-[420px]">

      {/* HEADER WITH PROJECT FILTER */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Task Progress</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            {selectedProject === 'All Projects' ? 'Operational Velocity' : 'Project Drill-down'}
          </p>
        </div>

        {!loading && projectOptions.length > 1 && (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-[10px] font-black bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none uppercase cursor-pointer max-w-[150px]"
          >
            {projectOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-center space-y-10">
        {/* Completion Gauge */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {selectedProject === 'All Projects' ? 'Global Completion' : 'Project Status'}
            </span>
            <span className="text-3xl font-black text-slate-800">{rate}%</span>
          </div>

          {/* Multi-color Progress Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {aggregatedData.map((item, i) => (
              <div
                key={i}
                style={{
                  width: `${totalTasks > 0 ? (item.value / totalTasks) * 100 : 0}%`,
                  backgroundColor: TASK_STATUS_COLORS[item.name] || TASK_STATUS_COLORS.DEFAULT
                }}
                className="h-full border-r border-white/20 last:border-0 transition-all duration-500"
              />
            ))}
          </div>
        </div>

        {/* Status Count Grid */}
        <div className="grid grid-cols-2 gap-4">
          {aggregatedData.length > 0 ? aggregatedData.map((item, i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{item.name}</p>
              <p className="text-2xl font-black text-slate-700">{item.value}</p>
              <div className="w-full h-1 mt-2 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS[item.name] }}></div>
            </div>
          )) : (
            <div className="col-span-2 py-10 text-center text-slate-400 text-xs italic">
              No tasks found for this selection
            </div>
          )}
        </div>
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
      <p className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">{value?.toLocaleString() || 0}</p>
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
                {b.amount >= 1000000 ? `${(b.amount / 1000000).toFixed(1)}M` : b.amount?.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">{b.currency}</span>
            </div>
          ))}
        </div>
      ) : <p className="text-lg sm:text-xl font-black text-slate-800">0.0</p>}
    </div>
  </div>
);