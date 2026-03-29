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
      accessorKey: "projectManagerName",
      header: "project Manager"
    },
    
    {
      accessorKey: "employeeNames",
      header: "Employee"
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
      accessorKey: "budgetUsed",
      header: "Used Budget",
      cell: info =>
        new Intl.NumberFormat("en-US").format(info.getValue())
    },
    {
      accessorKey: "budget",
      header: "Total Budget",
      cell: info =>
        new Intl.NumberFormat("en-US").format(info.getValue())
    }
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
