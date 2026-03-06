import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Delete, Search, Add, Shield, Lock, HelpOutline } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // UI states
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, userId: null, userName: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await adminApi.GET_USERS();
            setUsers(res.data || res);
        } catch (err) {
            console.error("Error fetching users", err);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (user) => {
        setDeleteConfig({ show: true, userId: user.id, userName: `${user.firstName} ${user.lastName}` });
    };

    const executeDelete = async () => {
        const id = deleteConfig.userId;
        const name = deleteConfig.userName;
        setDeleteConfig({ show: false, userId: null, userName: '' });

        try {
            await adminApi.DELETE_USER(id);
            showAlert('success', `User "${name}" has been removed from the system.`);
            fetchUsers();
        } catch (err) {
            showAlert('error', err.response?.data?.message || "Failed to delete user.");
        }
    };

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            (user.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

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
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Remove User</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to delete <b>{deleteConfig.userName}</b>? This user will lose all system access.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false, userId: null, userName: '' })} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-red-600 transition-colors">Delete</button>
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

            {/* Header Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900 leading-none">System Users</h1>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Account & Access Management</p>
                </div>
                <button
                    onClick={() => navigate('/admin/users/create')}
                    className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest"
                >
                    <Add style={{ fontSize: 18 }} /> Create User
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input
                        type="text"
                        placeholder="Search users..."
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
                            <th className="px-6 py-3">First Name</th>
                            <th className="px-6 py-3">Last Name</th>
                            <th className="px-6 py-3">User Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Assigned Roles</th>
                            <th className="px-6 py-3 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400 text-xs italic">Loading...</td></tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                                // Check if user has SUPER_ADMIN role
                                const isSuperAdmin = user.roles?.some(r => r.roleName === 'SUPER_ADMIN');

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-sky-50 text-[#0284C7] rounded-lg flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                                                    <Shield style={{ fontSize: 16 }} />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">{user.firstName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5"><span className="text-sm font-medium text-slate-600">{user.lastName}</span></td>
                                        <td className="px-6 py-3.5"><span className="text-sm text-slate-600 font-mono">{user.username}</span></td>
                                        <td className="px-6 py-3.5"><span className="text-sm text-slate-600">{user.email}</span></td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map((r, idx) => (
                                                    <span key={idx} className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${r.roleName === 'SUPER_ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
                                                        {r.roleName}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex justify-end gap-1 items-center">
                                                {isSuperAdmin ? (
                                                    <div className="flex items-center gap-1 text-amber-600 opacity-60 px-2">
                                                        <Lock style={{ fontSize: 14 }} />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">System Lock</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                                            className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"
                                                        >
                                                            <Edit style={{ fontSize: 18 }} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                        >
                                                            <Delete style={{ fontSize: 18 }} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400 text-xs italic">No matching users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}