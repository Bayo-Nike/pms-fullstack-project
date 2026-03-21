import React, { useMemo, useState } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { Search, Table, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utility/exportUtils";

export default function TaskReport({ data = [], loading, onRefresh }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]); // <--- Sorting state

  const columns = useMemo(
    () => [
      { accessorKey: "sno", header: "S/No" },
      { accessorKey: "taskName", header: "Task Name", enableSorting: true },
      { accessorKey: "project", header: "Project", enableSorting: true },
      { accessorKey: "employees", header: "Employees", enableSorting: true },
      { accessorKey: "startDate", header: "Start Date", enableSorting: true },
      { accessorKey: "endDate", header: "End Date", enableSorting: true },
      { accessorKey: "status", header: "Status", enableSorting: true },
      { accessorKey: "priority", header: "Priority", enableSorting: true },
      { accessorKey: "weight", header: "Weight", enableSorting: true },
      { accessorKey: "locations", header: "Locations", enableSorting: true },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },   // include sorting here
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,       // tell table how to update sorting
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),  // sorting support
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
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
    <div className="bg-white rounded-xl border shadow-sm">
      {/* HEADER */}
      <div className="p-5 border-b flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Task Master Report</h1>
          <p className="text-xs text-slate-400">Enterprise Resource Planning</p>
        </div>

        <div className="flex gap-3">
          {/* Global Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Export Buttons */}
          <button
            onClick={() => exportToExcel(columns, data, "Task_Report")}
            className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm"
          >
            <Table size={16} /> Excel
          </button>
          <button
            onClick={() => exportToPDF(columns, data, "Task_Report")}
            className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-md text-sm"
          >
            <FileText size={16} /> PDF
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
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 border rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
