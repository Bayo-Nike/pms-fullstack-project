import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Search, FileText, Table, ChevronLeft, ChevronRight } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utility/exportUtils";

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
      header: "Location"
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
      accessorKey: "endDate",
      header: "End Date"
    },
    {
      accessorKey: "timelineStatus",
      header: "Timeline Status",
      cell: (info) => {
        const row = info.row.original;
        const status = info.getValue();
        // If project is completed, show a neutral color
        if (row.status === "COMPLETED" || row.status === "FINISHED") {
           return <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-md border border-slate-100">Closed</span>
        }
        const isOverdue = row.isOverdue;
        const isDueToday = status === "Due today";
        return (
          <span className={`font-bold text-[11px] uppercase tracking-tight px-2 py-1 rounded-md border ${
            isOverdue 
              ? "bg-red-50 text-red-600 border-red-100" 
              : isDueToday 
              ? "bg-amber-50 text-amber-600 border-amber-100"
              : status === "N/A"
              ? "bg-slate-50 text-slate-400 border-slate-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          }`}>
            {status}
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
      header: "Status"
    },
    {
      accessorKey: "projectProgress",
      header: "Project Progress"
    },
    
    {
      accessorKey: "budget",
      header: "Used Budget / Total Budget"
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
