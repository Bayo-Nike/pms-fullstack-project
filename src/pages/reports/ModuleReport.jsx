import React, { useMemo, useState } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel
} from "@tanstack/react-table";

import { Search, Table, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utility/exportUtils";

export default function ModuleReport({ data = [], loading, onRefresh }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    { accessorKey: "sno", header: "S/No" },
    { accessorKey: "moduleName", header: "Module Name" },
    {
      accessorKey: "permissionCount",
      header: "Permission Count",
      cell: ({ getValue }) => (
        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
          {getValue()}
        </span>
      )
    },
    { accessorKey: "permissions", header: "Permission List" }
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] text-slate-500">
        Synchronizing Module Report Engine...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-[400px] text-slate-400">
        No modules available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm">

      {/* HEADER */}
      <div className="p-5 border-b flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Module Master Report</h1>
          <p className="text-xs text-slate-400">Enterprise Access Management</p>
        </div>

        <div className="flex gap-3">

          {/* Global Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search module..."
              className="pl-8 pr-3 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Export */}
          <button
            onClick={() => exportToExcel(columns, data, "Module_Report")}
            className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm"
          >
            <Table size={16} /> Excel
          </button>

          <button
            onClick={() => exportToPDF(columns, data, "Module_Report")}
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
          <thead className="bg-purple-600 text-white">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t hover:bg-slate-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
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