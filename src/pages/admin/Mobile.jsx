import React, { useState, useEffect, useMemo } from 'react';
import {
    PhonelinkSetup, Search, Add, Person, QrCode,
    Delete, HelpOutline, PhonelinkLock, CheckCircle,
    Cancel, CalendarMonth, FilterList, Smartphone
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Mobile() {
    const { can } = useAuth();
    const [mobileUsers, setMobileUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmpId, setSelectedEmpId] = useState('');
    const [saving, setSaving] = useState(false);

    // UI States
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [mRes, eRes] = await Promise.all([
                adminApi.GET_MOBILE_USERS(),
                adminApi.GET_EMPLOYEES()
            ]);
            setMobileUsers(mRes.data?.data || mRes.data || []);
            setEmployees((eRes.data?.data || eRes.data || []).filter(emp => emp.status === 'ACTIVE'));
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to sync mobile registry.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!selectedEmpId) return;

        setSaving(true);
        try {
            // Backend generates the UserCode using Employee ID as salt
            await adminApi.REGISTER_MOBILE_USER({ employeeId: selectedEmpId });
            setAlert({ show: true, type: 'success', message: 'Mobile access granted and unique ID generated.' });
            setIsModalOpen(false);
            setSelectedEmpId('');
            fetchData();
        } catch (err) {
            setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Registration failed.' });
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
        try {
            await adminApi.UPDATE_MOBILE_STATUS(id, newStatus);
            fetchData();
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Status update failed.' });
        }
    };

    const filteredUsers = useMemo(() => {
        return mobileUsers.filter(u =>
            (u.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.userCode || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [mobileUsers, searchTerm]);

    if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse italic">Connecting Device Registry...</div>;

    return (
        <div className="w-full space-y-6 pb-12 px-4 animate-fadeIn relative">

            {/* Modal: New Registration */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="text-[#0284C7]" />
                                <h3 className="font-black text-slate-800 uppercase tracking-tight">Register Mobile User</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Close /></button>
                        </div>
                        <form onSubmit={handleRegister} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Employee</label>
                                <select
                                    value={selectedEmpId}
                                    onChange={(e) => setSelectedEmpId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-[#0284C7] appearance-none"
                                    required
                                >
                                    <option value="">-- Choose active staff member --</option>
                                    {employees
                                        .filter(emp => !mobileUsers.some(mu => mu.employeeId === emp.id))
                                        .map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)
                                    }
                                </select>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">
                                    Note: A unique 8-character alphanumeric UserCode will be generated using the Employee ID as a salt. This code is required for initial mobile app pairing.
                                </p>
                            </div>
                            <button type="submit" disabled={saving} className="w-full bg-[#0284C7] text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-sky-100 hover:bg-[#016da3] transition-all">
                                {saving ? 'Generating...' : 'Authorize Mobile Access'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-2xl flex items-center justify-center shadow-inner"><PhonelinkSetup /></div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Mobile App Access</h1>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Device Token & UserCode Registry</p>
                    </div>
                </div>
                {can('CAN_MANAGE_USERS') && (
                    <button onClick={() => setIsModalOpen(true)} className="bg-[#0284C7] text-white px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-sky-100 active:scale-95 transition-all">
                        <Add /> Register Device
                    </button>
                )}
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 20 }} />
                        <input type="text" placeholder="Search by name or UserCode..." className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#0284C7]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Authorized Employee</th>
                                <th className="px-8 py-5">Unique UserCode</th>
                                <th className="px-8 py-5">Registration Date</th>
                                <th className="px-8 py-5">Auth Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((mu) => (
                                <tr key={mu.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Person style={{ fontSize: 18 }} /></div>
                                            <span className="text-sm font-bold text-slate-700">{mu.employeeName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-mono text-sm font-black text-[#0284C7] tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <QrCode style={{ fontSize: 16 }} className="text-slate-300" />
                                            {mu.userCode}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                                        <div className="flex items-center gap-2"><CalendarMonth style={{ fontSize: 14 }} className="text-slate-300" /> {mu.registrationDate}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded border uppercase ${mu.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                            {mu.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => toggleStatus(mu.id, mu.status)}
                                                className={`p-2 rounded-xl border transition-all ${mu.status === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-50 border-amber-100' : 'text-green-500 hover:bg-green-50 border-green-100'}`}
                                                title={mu.status === 'ACTIVE' ? 'Revoke Access' : 'Re-activate'}
                                            >
                                                <PhonelinkLock style={{ fontSize: 18 }} />
                                            </button>
                                            <button
                                                onClick={() => { if (window.confirm('Delete registration?')) adminApi.DELETE_MOBILE_USER(mu.id).then(() => fetchData()) }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Delete style={{ fontSize: 18 }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const Close = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);