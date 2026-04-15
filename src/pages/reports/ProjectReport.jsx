import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Search, FileText, Table, ChevronLeft, ChevronRight, Clock, Calendar, MapPin, AlertCircle, XCircle } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utility/exportUtils";
import { CheckCircle, LocationOn, PauseCircle, TrendingUp } from "@mui/icons-material";

export default function ProjectReport({ data = [], loading, onRefresh }) {

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]); // <--- Sorting state

  const columns = useMemo(() => [
    { accessorKey: "sno", header: "S/No", enableSorting: false },
    {
      accessorKey: "projectCode",
      header: "Code",
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: "Project Title"
    },
    {
      accessorKey: "subCityName",
      header: "Location",
      cell: info => <div className="flex items-center gap-1.5 text-slate-500 font-medium"><LocationOn className="text-[#FBAF1E]" style={{ fontSize: 16 }} /> {info.getValue()}</div>
    },
    {
      accessorKey: "projectType",
      header: "Type"
    },
    {
      accessorKey: "startDate",
      header: "Start Date"
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
      header: "Project Manager"
    },
    
    {
      accessorKey: "employeeNames",
      header: "Employees"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const rawStatus = getValue();
        const status = rawStatus?.toUpperCase();
    
        const statusConfig = {
          NOT_STARTED: {
            label: "Not Started",
            className: "bg-red-100 text-red-700",
            icon: AlertCircle,
          },
          ON_GOING: {
            label: "On Going",
            className: "bg-blue-100 text-blue-700",
            icon: Clock,
          },
          COMPLETED: {
            label: "Completed",
            className: "bg-green-100 text-green-700",
            icon: CheckCircle,
          },
          ON_HOLD: {
            label: "On Hold",
            className: "bg-yellow-100 text-yellow-700",
            icon: PauseCircle,
          },
          CANCELLED: {
            label: "Cancelled",
            className: "bg-slate-200 text-slate-700",
            icon: XCircle,
          },
        };
    
        const current = statusConfig[status] || {
          label: rawStatus || "Unknown",
          className: "bg-slate-100 text-slate-600",
          icon: null,
        };
    
        const Icon = current.icon;
    
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${current.className}`}
          >
            {Icon && <Icon size={14} className="flex-shrink-0" />}
            {current.label}
          </span>
        );
      },
    },
    {
      accessorKey: "projectProgress",
      header: "Project Progress",
      cell: ({ getValue }) => {
        const rawValue = getValue();
        const value =
          typeof rawValue === "number"
            ? rawValue
            : parseFloat(rawValue);
    
        const safeValue = isNaN(value) ? 0 : value;
    
        return (
          <div className="flex flex-col gap-2 min-w-[120px]">
            {/* Top row */}
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp
                className="text-amber-500 flex-shrink-0"
                size={16}
              />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-700 tabular-nums">
                {safeValue.toFixed(2)}%
              </span>
            </div>
    
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 transition-all duration-500 rounded-full"
                style={{ width: `${safeValue}%` }}
              />
            </div>
          </div>
        );
      },
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
    
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange:setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] text-slate-500">
        Synchronizing Report Engine...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-[400px] text-slate-400">
        No report data available
      </div>
    );
  }

  return (

    <div className="p-6 max-w-[1400px] mx-auto">

      <div className="bg-white rounded-xl border shadow-sm">

        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center">

          <div>
            <h1 className="text-lg font-bold">Project Master Report</h1>
            <p className="text-xs text-slate-400">
              Enterprise Resource Planning
            </p>
          </div>

          <div className="flex gap-3">

            <div className="relative">

              <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>

              <input
                value={globalFilter ?? ""}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-2 border rounded-md text-sm"
              />

            </div>

            <button
              onClick={() => exportToExcel(columns, data, "Projects_Report")}
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm"
            >
              <Table size={16}/> Excel
            </button>

            <button
              onClick={() => exportToPDF(columns, data, "Projects_Report")}
              className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-md text-sm"
            >
              <FileText size={16}/> PDF
            </button>

            <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md text-sm"
          >
            Refresh
          </button>

          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-50 text-slate-500">

              {table.getHeaderGroups().map(headerGroup => (

                <tr key={headerGroup.id}>

                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();
  
                    return (
                      <th
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        className="px-4 py-2 text-left font-semibold cursor-pointer select-none"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortState === "asc" ? " 🔼" : sortState === "desc" ? " 🔽" : ""}
                      </th>
                    );
                  })}

                </tr>

              ))}

            </thead>

            <tbody>

              {table.getRowModel().rows.map(row => (

                <tr key={row.id} className="border-t hover:bg-slate-50">

                  {row.getVisibleCells().map(cell => (

                    <td key={cell.id} className="px-5 py-3">

                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}

                    </td>

                  ))}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}

        <div className="flex justify-between items-center p-4 border-t">

          <span className="text-xs text-slate-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <div className="flex gap-2">

            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border rounded"
            >
              <ChevronLeft size={16}/>
            </button>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border rounded"
            >
              <ChevronRight size={16}/>
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}