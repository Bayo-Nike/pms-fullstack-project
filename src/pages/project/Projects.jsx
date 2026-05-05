import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Assignment, Visibility, Edit, Delete,
  HelpOutline, LocationOn, ChevronLeft, ChevronRight,
  FilterList, Apartment, Close, Layers, DateRange,
  ConfirmationNumber,
  Category
} from '@mui/icons-material';
import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Projects() {
  const navigate = useNavigate();

  // Data States
  const [projects, setProjects] = useState([]);
  const [subCities, setSubCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subCityFilter, setSubCityFilter] = useState('');
  const [pageInfo, setPageInfo] = useState({ current: 0, total: 0, size: 7, totalElements: 0 });

  // UI States
  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
  const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, title: '' });
  const { can } = useAuth();

  // Load Sub-Cities for filter
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const res = await adminApi.GET_SUB_CITIES();
        setSubCities(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Sub-city fetch failed", err);
      }
    };
    fetchLookups();
  }, []);

  const fetchProjects = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: pageInfo.size,
        search: searchTerm.trim() || null,
        status: statusFilter || null,
        subCityId: subCityFilter && subCityFilter !== "" ? subCityFilter : null
      };

      const res = await projectApi.GET_PROJECTS(params);
      const pageData = res.data.data;

      setProjects(pageData.content || []);
      setPageInfo(prev => ({
        ...prev,
        current: pageData.number,
        total: pageData.totalPages,
        totalElements: pageData.totalElements
      }));
    } catch (err) {
      setAlert({ show: true, type: 'error', message: 'Failed to load initiation registry.' });
    } finally {
      setLoading(false);
    }
  }, [pageInfo.size, searchTerm, statusFilter, subCityFilter]);

  useEffect(() => {
    fetchProjects(0);
  }, [statusFilter, subCityFilter, fetchProjects]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') fetchProjects(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchProjects(0);
  };

  const executeDelete = async () => {
    const { id, title } = deleteConfig;
    setDeleteConfig({ show: false, id: null, title: '' });
    try {
      await projectApi.DELETE_PROJECT(id);
      setAlert({ show: true, type: 'success', message: `Entry ${title} removed.` });
      fetchProjects(pageInfo.current);
    } catch (err) {
      setAlert({ show: true, type: 'error', message: 'Deletion rejected.' });
    }
  };

  const getStatusStyle = (s) => {
    const styles = {
      'ON_GOING': 'bg-sky-50 text-sky-700 border-sky-100',
      'NOT_STARTED': 'bg-slate-50 text-slate-500 border-slate-200',
      'COMPLETED': 'bg-green-50 text-green-700 border-green-100',
      'ON_HOLD': 'bg-amber-50 text-amber-700 border-amber-100',
      'CANCELLED': 'bg-red-50 text-red-700 border-red-100'
    };
    return styles[s] || styles.NOT_STARTED;
  };

  return (
    <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">

      {/* Delete Confirmation */}
      {deleteConfig.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-10 max-w-sm w-full mx-4 text-center border">
            <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 48 }} />
            <h3 className="text-lg font-bold text-slate-800 uppercase">Remove Initiation Record</h3>
            <p className="text-sm text-slate-500 mt-2">Permanently delete <b>{deleteConfig.title}</b> from registry?</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase hover:bg-slate-50">Cancel</button>
              <button onClick={executeDelete} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase shadow-lg">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

      {/* Header Area - Removed Create Button */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center shadow-inner"><Assignment /></div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">Project Initiation Registry</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Registry Management & Classification</p>
          </div>
        </div>
        <div className="px-5 py-2.5 bg-slate-50 border rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {pageInfo.totalElements} Total Entries
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
          <input
            type="text"
            placeholder="Search by Code or Title..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-[#0284C7]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          {searchTerm && <Close onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer" style={{ fontSize: 16 }} />}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
            <FilterList className="text-slate-400" style={{ fontSize: 14 }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-[10px] font-black uppercase text-slate-600 outline-none">
              <option value="">All Status</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="ON_GOING">On Going</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
            <Apartment className="text-slate-400" style={{ fontSize: 14 }} />
            <select value={subCityFilter} onChange={(e) => setSubCityFilter(e.target.value)} className="bg-transparent text-[10px] font-black uppercase text-slate-600 outline-none">
              <option value="">Global/All Sub-Cities</option>
              {subCities.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Initiation List Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Project Identification</th>
              <th className="px-6 py-5">Classification</th>
              <th className="px-6 py-5">Level & Jurisdiction</th>
              <th className="px-6 py-5">Project Timeline</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 italic animate-pulse">Syncing Registry...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 italic">No Project records found.</td></tr>
            ) : projects.map((proj) => (
              <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                {/* Identification */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[10px] border border-slate-200">
                      <ConfirmationNumber style={{ fontSize: 16 }} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none">{proj.title}</p>
                      <p className="text-[10px] text-sky-600 font-bold uppercase mt-2 tracking-tighter">
                        {proj.projectCode}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Classification (Type & Category) */}
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Layers style={{ fontSize: 14 }} className="text-slate-400" />
                      <span className="text-[11px] font-bold uppercase">{proj.projectType?.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase italic pl-5">{proj.category || 'Standard'}</span>
                  </div>
                </td>

                {/* Level & SubCity */}
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-700">
                      <LocationOn className="text-[#0284C7]" style={{ fontSize: 16 }} />
                      <span className="text-xs font-black uppercase">{proj.subCityName || 'City Level'}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase pl-6 tracking-widest">{proj.projectLevel}</span>
                  </div>
                </td>

                {/* Timeline */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg"><DateRange style={{ fontSize: 16 }} className="text-slate-400" /></div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-700">{proj.startDate || 'TBD'}</span>
                      <span className="text-[9px] text-slate-400 font-medium italic">to {proj.endDate || 'TBD'}</span>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-5 text-center">
                  <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-tighter ${getStatusStyle(proj.status)}`}>
                    {proj.status?.replace(/_/g, ' ')}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {
                      can("CAN_VIEW_PROJECT_DETAIL") && (
                        <button onClick={() => navigate(`/projects/${proj.id}`)} className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl" title="View"><Visibility style={{ fontSize: 20 }} /></button>
                      )
                    }
                    {
                      can("CAN_EDIT_PROJECT") && (
                        <button onClick={() => navigate(`/projects/edit/${proj.id}`)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl" title="Update Initiation"><Edit style={{ fontSize: 20 }} /></button>
                      )
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Registry Page {pageInfo.current + 1} of {pageInfo.total || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pageInfo.current === 0 || loading}
              onClick={() => fetchProjects(pageInfo.current - 1)}
              className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:bg-slate-50 shadow-sm"
            >
              <ChevronLeft fontSize="small" />
            </button>
            <button
              disabled={(pageInfo.current + 1) >= pageInfo.total || loading}
              onClick={() => fetchProjects(pageInfo.current + 1)}
              className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:bg-slate-50 shadow-sm"
            >
              <ChevronRight fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}