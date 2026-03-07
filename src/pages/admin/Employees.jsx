import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, Badge,
    HelpOutline, Mail, Work, LocationOn,
    ChevronLeft, ChevronRight, Business
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Employees() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => { fetchEmployees(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const fetchEmployees = async () => {
        try {
            const res = await adminApi.GET_EMPLOYEES();
            setEmployees(res.data || res);
        } catch (err) {
            showAlert('error', 'Failed to fetch employee records.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (emp) => {
        setDeleteConfig({ show: true, id: emp.id, name: emp.fullName });
    };

    const executeDelete = async () => {
        const { id, name } = deleteConfig;
        setDeleteConfig({ show: false, id: null, name: '' });
        try {
            await adminApi.DELETE_EMPLOYEE(id);
            showAlert('success', `Employee "${name}" has been removed.`);
            fetchEmployees();
        } catch (err) {
            showAlert('error', "Deletion failed: Record is currently protected.");
        }
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(e =>
            (e.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.divisionName || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedItems = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 mt-2">Remove <b>{deleteConfig.name}</b> from the system?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase hover:bg-slate-50">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-xl uppercase hover:bg-red-600 shadow-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900">Employee Directory</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">HR & Resource Management</p>
                </div>
                {can('CAN_MANAGE_USERS') && (
                    <button onClick={() => navigate('/admin/employees/create')} className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Add Employee
                    </button>
                )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search by name, email or division..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-3">Full Name</th>
                            <th className="px-6 py-3">Position & Division</th>
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-xs italic">Syncing records...</td></tr>
                        ) : paginatedItems.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-sky-50 text-[#0284C7] rounded-lg flex items-center justify-center"><Badge style={{ fontSize: 16 }} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700">{emp.fullName}</span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Mail style={{ fontSize: 10 }} /> {emp.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 text-slate-600"><Work style={{ fontSize: 12 }} /><span className="text-xs font-bold">{emp.positionName}</span></div>
                                        <div className="flex items-center gap-1.5 text-slate-400"><Business style={{ fontSize: 12 }} /><span className="text-[10px] uppercase font-medium">{emp.divisionName}</span></div>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <LocationOn style={{ fontSize: 14, color: '#94a3b8' }} />
                                        <span className="text-xs">{emp.subCityName}, {emp.cityName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${emp.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {can('CAN_MANAGE_USERS') && (
                                            <>
                                                <button onClick={() => navigate(`/admin/employees/edit/${emp.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"><Edit style={{ fontSize: 16 }} /></button>
                                                <button onClick={() => handleDeleteClick(emp)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Delete style={{ fontSize: 16 }} /></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination (Simplified) */}
                <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}