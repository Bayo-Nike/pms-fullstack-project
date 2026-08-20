import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, Shield, Lock,
    HelpOutline, ChevronLeft, ChevronRight, InfoOutlined
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Users() {
    const navigate = useNavigate();
    const { can } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userType, setUserType] = useState('ALL');


    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, userId: null, userName: '' });

    // Toggle confirmation state – using mobileAllowed
    const [toggleConfig, setToggleConfig] = useState({
        show: false,
        userId: null,
        userName: '',
        currentMobileAllowed: false,
    });

    useEffect(() => { fetchUsers(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, userType]);

    const fetchUsers = async () => {
        try {
            const res = await adminApi.GET_USERS();
            setUsers(res.data || res);
        } catch (err) {
            showAlert('error', 'Failed to synchronize user registry.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (user) => {
        setDeleteConfig({ show: true, userId: user.id, userName: user.fullName });
    };

    const executeDelete = async () => {
        const { userId, userName } = deleteConfig;
        setDeleteConfig({ show: false, userId: null, userName: '' });
        try {
            await adminApi.DELETE_USER(userId);
            showAlert('success', `Access revoked for ${userName}.`);
            fetchUsers();
        } catch (err) {
            showAlert('error', "Revocation failed: User might have active dependencies.");
        }
    };

    // Toggle handlers
    const handleToggleClick = (user) => {
        setToggleConfig({
            show: true,
            userId: user.id,
            userName: user.fullName,
            currentMobileAllowed: !!user.mobileAllowed,
        });
    };

    const executeToggle = async () => {
        const { userId, userName, currentMobileAllowed } = toggleConfig;
        const newMobileAllowed = !currentMobileAllowed;
        setToggleConfig({ show: false, userId: null, userName: '', currentMobileAllowed: false });

        try {
            await adminApi.TOGGLE_USER_STATUS(userId, newMobileAllowed);
            showAlert('success', `Mobile access for ${userName} turned ${newMobileAllowed ? 'ON' : 'OFF'}.`);
            fetchUsers();
        } catch (err) {
            showAlert('error', 'Failed to update mobile access.');
        }
    };

    // const filteredUsers = useMemo(() => {
    //     return users.filter(user =>
    //         (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
            
    //     );
    // }, [users, searchTerm]);
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const search = searchTerm.toLowerCase();
    
            const matchesSearch =
                (user.fullName || "").toLowerCase().includes(search) ||
                (user.email || "").toLowerCase().includes(search);
    
            const matchesUserType =
                userType === 'ALL' || user.userType === userType;
    
            return matchesSearch && matchesUserType;
        });
    }, [users, searchTerm, userType]);
    

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            {/* Delete confirmation dialog */}
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center border border-slate-100">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Revocation</h3>
                        <p className="text-sm text-slate-500 mt-2">Delete user account for <b>{deleteConfig.userName}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-xl uppercase shadow-lg transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle confirmation dialog */}
            {toggleConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center border border-slate-100">
                        <InfoOutlined className="text-blue-500 mb-4 mx-auto" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Mobile Access Change</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Turn <b>{toggleConfig.currentMobileAllowed ? 'OFF' : 'ON'}</b> mobile access for <b>{toggleConfig.userName}</b>?
                        </p>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setToggleConfig({ show: false, userId: null, userName: '', currentMobileAllowed: false })}
                                className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeToggle}
                                className="flex-1 px-4 py-2 text-xs font-bold bg-[#0284C7] text-white rounded-xl uppercase shadow-lg transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900 leading-none">User Accounts</h1>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Authentication Registry</p>
                </div>
                {can('CAN_CREATE_USER_MGMT') && (
                    <button onClick={() => navigate('/admin/users/create')} className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Create User
                    </button>
                )}
            </div>

            {/* <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Show:</span>
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded px-2 py-1 outline-none">
                        {[5, 10, 20].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div> */}

            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">

            <div className="flex items-center gap-2 w-full">

                {/* User Type */}
                <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] focus:bg-white transition-all"
                >
                    <option value="ALL">All User Types</option>
                    <option value="SYSTEM">System</option>
                    <option value="EMPLOYEE">Employee</option>
                </select>


                {/* Search */}
                <div className="relative max-w-sm w-full">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        style={{ fontSize: 18 }}
                    />

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

            </div>

            <div className="flex items-center gap-2 px-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Show:
                </span>

                <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded px-2 py-1 outline-none"
                >
                    {[5, 10, 20].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
            </div>


            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-3">Full Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Mobile</th>
                            <th className="px-6 py-3">Assigned Roles</th>
                            <th className="px-6 py-3 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-xs italic">Syncing identities...</td></tr>
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => {
                                const isSuperAdmin = user.roles?.some(r => r.roleName === 'SUPER_ADMIN');
                                const mobileAllowed = !!user.mobileAllowed;
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSuperAdmin ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-[#0284C7]'}`}>
                                                    <Shield style={{ fontSize: 16 }} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-700">{user.fullName}</span>
                                                    {user.remark && <span className="text-[9px] text-slate-400 italic">Note: {user.remark}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-sm text-slate-600">{user.email}</td>

                                        {/* Mobile column with phone number and toggle */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-600">
                                                    {user.mobile}
                                                </span>
                                                {!isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleToggleClick(user)}
                                                        className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors ${mobileAllowed ? 'bg-green-500' : 'bg-gray-300'
                                                            }`}
                                                        title={`Turn ${mobileAllowed ? 'OFF' : 'ON'} mobile access`}
                                                    >
                                                        <span
                                                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${mobileAllowed ? 'translate-x-4' : 'translate-x-0.5'
                                                                }`}
                                                        />
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map((r, i) => (
                                                    <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-100 bg-sky-50 text-sky-700 uppercase">{r.roleName}</span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Operations unchanged */}
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex justify-end gap-1 items-center">
                                                {isSuperAdmin ? (
                                                    <div className="flex items-center gap-1 text-amber-600 opacity-60 px-2">
                                                        <Lock style={{ fontSize: 14 }} />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">System Lock</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {can('CAN_EDIT_USER_MGMT') && (
                                                            <button onClick={() => navigate(`/admin/users/edit/${user.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"><Edit style={{ fontSize: 18 }} /></button>
                                                        )}
                                                        {can('CAN_DELETE_USER_MGMT') && (
                                                            <button onClick={() => handleDeleteClick(user)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Delete style={{ fontSize: 18 }} /></button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400 text-xs italic">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}