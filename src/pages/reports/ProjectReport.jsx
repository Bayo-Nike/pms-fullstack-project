import React, { useMemo, useState } from "react";
import {
  flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
} from "@tanstack/react-table";
import {
  Search, FileText, Table, ChevronLeft, ChevronRight,
  Calendar, Clock, ArrowUpDown, RefreshCw, CheckCircle2,
  Users, MapPin, DollarSign, Target, UserCheck
} from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utility/exportUtils";

export default function ProjectReport({ data = [], loading, onRefresh }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    { accessorKey: "sno", header: "S/N" },
    {
      accessorKey: "projectCode",
      header: "Code",
      cell: info => <span className="font-bold text-[#0284C7] bg-sky-50 px-2 py-1 rounded text-[10px] border border-sky-100 uppercase">{info.getValue()}</span>
    },
    {
      accessorKey: "title",
      header: "Project Title",
      cell: info => <div className="min-w-[180px] font-bold text-slate-700 uppercase text-[11px] leading-tight">{info.getValue()}</div>
    },
    {
      accessorKey: "subCityName",
      header: "Location",
      cell: info => <div className="flex items-center gap-1.5 text-slate-500 font-medium"><MapPin size={12} /> {info.getValue()}</div>
    },
    {
      accessorKey: "projectType",
      header: "Type",
      cell: info => <span className="text-[9px] font-black text-slate-400 border px-1.5 py-0.5 rounded uppercase">{info.getValue().replace(/_/g, ' ')}</span>
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: info => <span className="text-slate-500 font-semibold">{info.getValue() || "N/A"}</span>
    },
    {
      // 1. TanStack Table uses this for Excel/PDF and Search
      accessorKey: "projectDeadlineExport",
      header: "Project Deadline",

      // 2. This is ONLY for the browser screen
      cell: ({ row }) => {
        const { originalEndDate, finalEndDate, totalExtendedDays } = row.original;

        if (!originalEndDate) return <span className="text-slate-300 italic text-[10px]">N/A</span>;

        // CASE 1: ADJUSTMENT EXISTS (Show Audit/Registry View)
        if (totalExtendedDays > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-[170px] py-1 animate-fadeIn">
              {/* Original Reference */}
              <div className="flex flex-col leading-none">
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Orig:</span>
                <span className="text-[10px] font-bold line-through text-slate-400">
                  {new Date(originalEndDate).toLocaleDateString()}
                </span>
              </div>

              {/* Revised Primary Date */}
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5 text-[12px] font-black text-amber-600">
                  <Clock size={12} className="opacity-50" />
                  {new Date(finalEndDate).toLocaleDateString()}
                </div>
              </div>

              {/* Extension Badge */}
              <span className="text-[9px] font-black text-amber-500 italic">
                Revised (+{totalExtendedDays} Days)
              </span>
            </div>
          );
        }

        // CASE 2: NO ADJUSTMENT (Show Clean Standard View)
        return (
          <div className="flex items-center gap-2 py-2">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">
              {new Date(originalEndDate).toLocaleDateString()}
            </span>
          </div>
        );
      }
    },
    {
      // 1. for Excel/PDF
      accessorKey: "timelineExport",
      header: "Timeline Status",

      // 2. Visual UI for the browser
      cell: ({ row }) => {
        const { diffDays, status, timelineExport } = row.original;

        if (status === "COMPLETED" || status === "FINISHED") {
          return (
            <span className="text-[10px] font-black text-slate-400 uppercase px-2 py-1 bg-slate-50 rounded border border-slate-100">
              Closed
            </span>
          );
        }

        if (diffDays === null) return <span className="text-slate-300">-</span>;

        const isOverdue = diffDays < 0;
        const isDueToday = diffDays === 0;

        return (
          <span className={`font-black text-[10px] uppercase px-2 py-1 rounded border shadow-sm ${isOverdue
              ? "bg-red-50 text-red-600 border-red-100 animate-pulse"
              : isDueToday
                ? "bg-amber-50 text-amber-600 border-amber-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
            {timelineExport} {/* Use the same string as the export for consistency */}
          </span>
        );
      }
    },
    {
      accessorKey: "projectManagerName",
      header: "Project Manager",
      cell: info => <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px] min-w-[140px]"><UserCheck size={12} className="text-sky-500" /> {info.getValue()}</div>
    },
    {
      accessorKey: "employeeNames",
      header: "Assigned Team",
      cell: info => (
        <div className="max-w-[200px] flex flex-wrap gap-1">
          {info.getValue().slice(0, 2).map((name, i) => (
            <span key={i} className="text-[8px] bg-slate-50 border px-1 py-0.5 rounded font-bold text-slate-500">{name}</span>
          ))}
          {info.getValue().length > 2 && <span className="text-[8px] text-[#0284C7] font-black">+{info.getValue().length - 2} more</span>}
        </div>
      )
    },
    {
      accessorKey: "projectProgress",
      header: "Project Progress",
      cell: info => {
        const val = parseFloat(info.getValue());
        return (
          <div className="min-w-[120px]">
            <div className="flex justify-between text-[9px] font-black text-slate-400 mb-1 uppercase"><span>Progress</span><span>{val}%</span></div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#0284C7] transition-all" style={{ width: `${val}%` }} /></div>
          </div>
        );
      }
    },
    {
      // 1. For Excel compatibility
      accessorKey: "financialSummary",
      header: "Financial Status",

      // 2. Visual UI for the browser screen
      cell: ({ row }) => {
        const { budget, budgetUsed, currency, percentSpent } = row.original;

        return (
          <div className="flex flex-col gap-1.5 min-w-[150px] py-1">
            {/* Top Row: Amounts */}
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-slate-800 tracking-tight">
                  {currency} {budgetUsed.toLocaleString()}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Spent of {budget.toLocaleString()}
                </span>
              </div>
              <span className={`text-[10px] font-black ${percentSpent > 90 ? 'text-red-500' : 'text-[#0284C7]'}`}>
                {percentSpent}%
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${percentSpent > 100 ? 'bg-red-500' :
                    percentSpent > 80 ? 'bg-amber-400' :
                      'bg-[#0284C7]'
                  }`}
                style={{ width: `${Math.min(percentSpent, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => <span className="text-[9px] font-black text-slate-500 uppercase">{info.getValue().replace(/_/g, ' ')}</span>
    }
  ], []);

  const table = useReactTable({
    data, columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  if (loading) return <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4 italic animate-pulse"><RefreshCw className="animate-spin" /> Synchronizing Data Registry...</div>;

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-fadeIn bg-[#F8FAFC]">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden">

        {/* ACTION BAR */}
        <div className="p-8 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-center gap-6 bg-slate-50/50">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Project Master Report</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <Target size={12} className="text-[#0284C7]" /> Comprehensive Enterprise Resource Audit
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={globalFilter ?? ""} onChange={e => setGlobalFilter(e.target.value)} placeholder="Filter registry data..." className="pl-12 pr-6 py-3 border border-slate-200 rounded-2xl text-xs font-bold focus:border-[#0284C7] outline-none transition-all min-w-[300px] shadow-sm" />
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              <button onClick={() => exportToExcel(columns, data, "Project_Audit_Report")} className="flex items-center gap-2 px-5 py-2 hover:bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase transition-colors border-r border-slate-100"><Table size={14} className="text-emerald-500" /> Excel</button>
              <button onClick={() => exportToPDF(columns, data, "Project_Audit_Report")} className="flex items-center gap-2 px-5 py-2 hover:bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase transition-colors"><FileText size={14} className="text-red-500" /> PDF</button>
            </div>
            <button onClick={onRefresh} className="p-3 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all text-slate-400 hover:rotate-180 duration-500"><RefreshCw size={18} /></button>
          </div>
        </div>

        {/* SCROLLABLE TABLE AREA */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[1800px]"> {/* MIN-WIDTH FORCES SCROLLING */}
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-50/80 border-b border-slate-100">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()} className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown size={12} className="opacity-30" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-sky-50/40 transition-all border-b border-slate-50/50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-6 bg-slate-50/30 border-t border-slate-100">
          <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span>Total Registry: {data.length} Records</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-3 border bg-white rounded-xl shadow-sm disabled:opacity-30 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-3 border bg-white rounded-xl shadow-sm disabled:opacity-30 hover:bg-white transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}