import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Search, Add, Shield, Lock, Delete, HelpOutline } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Roles() {
    const navigate = useNavigate();
    const { can } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // UI states
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, roleId: null, roleName: '' });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await adminApi.GET_ROLES();
            setRoles(res.data || res);
        } catch (err) {
            console.error("Error fetching roles", err);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (role) => {
        setDeleteConfig({ show: true, roleId: role.id, roleName: role.roleName });
    };

    const executeDelete = async () => {
        const id = deleteConfig.roleId;
        setDeleteConfig({ ...deleteConfig, show: false });
        try {
            await adminApi.DELETE_ROLE(id);
            showAlert('success', `Role "${deleteConfig.roleName}" deleted successfully.`);
            fetchRoles(); // Refresh list
        } catch (err) {
            // Backend should return 400 or 409 if associated with users
            const errorMsg = err.response?.status === 409 || err.response?.status === 400
                ? `Cannot delete "${deleteConfig.roleName}": It is currently assigned to active users.`
                : "An error occurred while trying to delete the role.";
            showAlert('error', errorMsg);
        }
    };

    const filteredRoles = useMemo(() => {
        return roles.filter(role =>
            (role.roleName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (role.description || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [roles, searchTerm]);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">

            {/* Delete Confirmation Modal */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <HelpOutline style={{ fontSize: 32 }} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to remove <b>{deleteConfig.roleName}</b>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false, roleId: null, roleName: '' })} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage
                show={alert.show}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(prev => ({ ...prev, show: false }))}
            />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900 leading-none">Roles & Permissions</h1>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Access Control Level Management</p>
                </div>
                {can('CAN_CREATE_ROLE_PERMISSION') && (
                    <button onClick={() => navigate('/admin/roles/create')}
                        className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Create Role
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input
                        type="text"
                        placeholder="Search roles or descriptions..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-3">Role Designation</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Capabilities</th>
                            <th className="px-6 py-3 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-xs italic">Loading roles...</td></tr>
                        ) : filteredRoles.length > 0 ? (
                            filteredRoles.map((role) => (
                                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${role.roleName === 'SUPER_ADMIN' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-[#0284C7]'}`}>
                                                <Shield style={{ fontSize: 16 }} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 uppercase tracking-tight">{role.roleName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="text-xs text-slate-500 italic truncate block max-w-xs">{role.description || 'No description provided'}</span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-200">
                                            {role.permissions?.length || 0} PERMS
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex justify-end gap-1 items-center">
                                            {role.roleName === 'SUPER_ADMIN' ? (
                                                <div className="flex items-center gap-1 text-amber-600 opacity-60 px-2">
                                                    <Lock style={{ fontSize: 14 }} />
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">Protected</span>
                                                </div>
                                            ) : (
                                                <>
                                                {can('CAN_EDIT_ROLE_PERMISSION') && (
                                                    <button
                                                        onClick={() => navigate(`/admin/roles/edit/${role.id}`)}
                                                        className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"
                                                        title="Edit Role"
                                                    >
                                                        <Edit style={{ fontSize: 18 }} />
                                                    </button>
                                                )}
                                                {can('CAN_DELETE_ROLE_PERMISSION') && (
                                                    
                                                        (!(role.roleName === 'ROLE_CITY_OFFICE_HEAD' || role.roleName === 'ROLE_MAYOR')) &&
                                                        (<button
                                                            onClick={() => handleDeleteClick(role)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                            title="Delete Role"
                                                        >
                                                            <Delete style={{ fontSize: 18 }} />
                                                        </button>)
                                                    
                                                )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-xs italic">No roles found matching "{searchTerm}"</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}