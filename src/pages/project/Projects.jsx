import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Add, Assignment, Visibility, Edit, Delete,
  HelpOutline, CalendarMonth, LocationOn,
  ChevronLeft, ChevronRight, Close, Person
} from '@mui/icons-material';

import projectApi from '../../api/modules/project';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Projects() {
  const navigate = useNavigate();
  const { can } = useAuth();

  // ================= STATE =================
  const [projects, setProjects] = useState([]);
  const [subCities, setSubCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [subCityFilter, setSubCityFilter] = useState('');

  const [pageInfo, setPageInfo] = useState({
    current: 0,
    total: 0,
    size: 7,
    totalElements: 0
  });

  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
  const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, title: '' });

  // ================= FETCH SUB-CITIES =================
  useEffect(() => {
    const fetchSubCities = async () => {
      try {
        const res = await adminApi.GET_SUB_CITIES();
        setSubCities(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to fetch sub-cities', err);
      }
    };
    fetchSubCities();
  }, []);

  // ================= FETCH PROJECTS =================
  const fetchProjects = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageInfo.size,
        search: searchTerm || null,
        status: statusFilter || null,
        projectType: typeFilter || null,
        subCityId: subCityFilter || null
      };

      const res = await projectApi.GET_PROJECTS(params);
      const data = res.data.data;

      setProjects(data.content || []);
      setPageInfo(prev => ({
        ...prev,
        current: data.number,
        total: data.totalPages,
        totalElements: data.totalElements
      }));

    } catch (err) {
      setAlert({ show: true, type: 'error', message: 'Failed to load projects.' });
    } finally {
      setLoading(false);
    }
  }, [pageInfo.size, searchTerm, statusFilter, typeFilter, subCityFilter]);

  useEffect(() => {
    fetchProjects(0);
  }, [fetchProjects]);

  // ================= ACTIONS =================
  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchProjects(0);
  };

  const handleDelete = async () => {
    const { id, title } = deleteConfig;
    setDeleteConfig({ show: false, id: null, title: '' });

    try {
      await projectApi.DELETE_PROJECT(id);
      setAlert({ show: true, type: 'success', message: `${title} deleted.` });
      fetchProjects(pageInfo.current);
    } catch {
      setAlert({ show: true, type: 'error', message: 'Delete failed.' });
    }
  };

  // ================= HELPERS =================
  const getStatusStyle = (status) => {
    const styles = {
      ACTIVE: 'bg-green-50 text-green-700',
      PLANNING: 'bg-sky-50 text-sky-700',
      ON_HOLD: 'bg-amber-50 text-amber-700',
      NOT_STARTED: 'bg-slate-50 text-slate-500',
      COMPLETED: 'bg-indigo-50 text-indigo-700',
      CANCELLED: 'bg-red-50 text-red-700'
    };
    return styles[status] || styles.NOT_STARTED;
  };

  const getProgress = (used, total) => {
    if (!total || total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  // ================= UI =================
  return (
    <div className="p-4 space-y-4">

      {/* DELETE MODAL */}
      {deleteConfig.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center w-80">
            <HelpOutline className="text-red-500 mx-auto mb-3" />
            <p className="text-sm">Delete <b>{deleteConfig.title}</b>?</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 border p-2 rounded">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white p-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      <AlertMessage {...alert} onClose={() => setAlert({ ...alert, show: false })} />

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow">
        <h2 className="font-bold flex items-center gap-2">
          <Assignment /> Projects
        </h2>
        {can('CAN_CREATE_PROJECTS') && (
          <button onClick={() => navigate('/projects/create')} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-1">
            <Add /> New
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-2">
        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          className="border p-2 rounded text-sm"
        />

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Type</option>
          <option value="BUILDING">Building</option>
          <option value="WATER_AND_ROAD">Water & Road</option>
        </select>

        <select value={subCityFilter} onChange={e => setSubCityFilter(e.target.value)}>
          <option value="">Sub-City</option>
          {subCities.map(sc => (
            <option key={sc.id} value={sc.id}>{sc.name}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs">
            <tr>
              <th className="p-3 text-left">Project</th>
              <th className="p-3">Type</th>
              <th className="p-3">Timeline</th>
              <th className="p-3">Budget</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-6">Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan="6" className="text-center p-6">No data</td></tr>
            ) : projects.map(p => {
              const progress = getProgress(p.budgetUsed, p.budget);

              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="font-bold">{p.title}</div>
                    <div className="text-xs text-gray-400">{p.projectCode}</div>
                  </td>

                  <td className="p-3">{p.projectType}</td>

                  <td className="p-3">
                    {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <div className="text-xs">
                      {p.budgetUsed} / {p.budget}
                    </div>
                    <div className="h-1 bg-gray-200 rounded">
                      <div className="h-1 bg-yellow-400" style={{ width: `${progress}%` }} />
                    </div>
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="p-3 text-right space-x-1">
                    <button onClick={() => navigate(`/projects/${p.id}`)}><Visibility /></button>

                    {can('CAN_EDIT_PROJECTS') && (
                      <button onClick={() => navigate(`/projects/edit/${p.id}`)}><Edit /></button>
                    )}

                    {can('CAN_DELETE_PROJECTS') && (
                      <button onClick={() => setDeleteConfig({ show: true, id: p.id, title: p.title })}>
                        <Delete />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-between p-3">
          <span className="text-xs">
            Page {pageInfo.current + 1} / {pageInfo.total || 1}
          </span>

          <div className="space-x-2">
            <button
              disabled={pageInfo.current === 0}
              onClick={() => fetchProjects(pageInfo.current - 1)}
            >
              <ChevronLeft />
            </button>

            <button
              disabled={pageInfo.current + 1 >= pageInfo.total}
              onClick={() => fetchProjects(pageInfo.current + 1)}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}