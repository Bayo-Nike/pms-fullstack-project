import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowBack, Save, Security, VerifiedUser,
    HelpOutline, Visibility, VisibilityOff, Shield,
    CheckCircle, Search, PersonAddAlt1, Badge
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateUser() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const dropdownRef = useRef(null);

    // Form States
    const [formData, setFormData] = useState({
        employeeId: '',
        username: '',
        email: '',
        password: '',
        isActive: true
    });

    // Selection & Data States
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [availableEmployees, setAvailableEmployees] = useState([]);

    // UI States
    const [empSearch, setEmpSearch] = useState('');
    const [isEmpListOpen, setIsEmpListOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsEmpListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Load basic lookups
                const [rolesRes, employeesRes] = await Promise.all([
                    adminApi.GET_ROLES(),
                    adminApi.GET_EMPLOYEES()
                ]);

                const allRoles = rolesRes.data || rolesRes;
                setAvailableRoles(allRoles.filter(role => role.roleName !== 'SUPER_ADMIN'));
                const allEmps = employeesRes.data || employeesRes;
                setAvailableEmployees(allEmps);

                // 2. Populate data if in Edit Mode
                if (isEdit) {
                    const userRes = await adminApi.GET_USER(id);
                    const u = userRes.data || userRes;

                    // Critical: Try to find the employeeId if it's not directly in the response
                    let linkedEmployeeId = u.employeeId;
                    if (!linkedEmployeeId) {
                        const match = allEmps.find(e => e.email === u.email || e.fullName === u.fullName);
                        linkedEmployeeId = match?.id || '';
                    }

                    setFormData({
                        employeeId: linkedEmployeeId,
                        username: u.username || '',
                        email: u.email || '',
                        password: '', // Keep empty
                        isActive: u.isActive ?? true
                    });

                    setSelectedRoleIds(u.roles?.map(r => r.id) || []);
                    setEmpSearch(u.fullName || '');
                }
            } catch (err) {
                showAlert('error', 'Initialization failed: Could not synchronize with system registry.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, isEdit]);

    const selectEmployee = (emp) => {
        const names = emp.fullName.toLowerCase().trim().split(/\s+/);
        const suggestedUsername = names.join('');
        const suggestedEmail = names.length >= 2
            ? `${names[0]}${names[1]}@gmail.com`
            : `${names[0]}@gmail.com`;

        setFormData(prev => ({
            ...prev,
            employeeId: emp.id,
            username: isEdit ? prev.username : suggestedUsername,
            email: isEdit ? prev.email : suggestedEmail
        }));

        setEmpSearch(emp.fullName);
        setIsEmpListOpen(false);
    };

    const filteredEmployees = useMemo(() => {
        if (isEdit) return [];
        if (!empSearch.trim()) return availableEmployees.slice(0, 8);
        return availableEmployees.filter(emp =>
            emp.fullName.toLowerCase().includes(empSearch.toLowerCase())
        );
    }, [availableEmployees, empSearch, isEdit]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const toggleRole = (roleId) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? prev.filter(i => i !== roleId) : [...prev, roleId]
        );
    };

    const effectivePermissions = useMemo(() => {
        const allPerms = [];
        const seen = new Set();
        selectedRoleIds.forEach(roleId => {
            const role = availableRoles.find(r => r.id === roleId);
            if (role && role.permissions) {
                role.permissions.forEach(p => {
                    const identifier = p.id || p.slug;
                    if (!seen.has(identifier)) {
                        seen.add(identifier);
                        allPerms.push(p);
                    }
                });
            }
        });
        return allPerms.sort((a, b) => (a.name || a.slug).localeCompare(b.name || b.slug));
    }, [selectedRoleIds, availableRoles]);

    const handleSaveTrigger = () => {
        // Log current state to debug exactly what is "missing"
        console.log("Current Form Data:", formData);

        const { employeeId, username, email, password } = formData;

        // 1. Identity Validation (using String conversion to avoid null.trim errors)
        const isEmployeeMissing = !employeeId;
        const isUsernameMissing = !String(username || '').trim();
        const isEmailMissing = !String(email || '').trim();

        if (isEmployeeMissing || isUsernameMissing || isEmailMissing) {
            showAlert('error', 'Validation Error: Employee selection and account handles are required.');
            return;
        }

        // 2. Password Validation (Required for New, Optional for Edit)
        if (!isEdit && !String(password || '').trim()) {
            showAlert('error', 'Security Error: Initial password is required for new accounts.');
            return;
        }

        // 3. Role Validation
        if (selectedRoleIds.length === 0) {
            showAlert('error', 'Authorization Error: At least one functional role must be assigned.');
            return;
        }

        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const payload = {
                employeeId: formData.employeeId,
                username: formData.username.trim(),
                email: formData.email.trim(),
                roleIds: selectedRoleIds
            };

            // Only add password to payload if it's not empty
            if (formData.password.trim()) {
                payload.password = formData.password.trim();
            }

            if (isEdit) {
                await adminApi.UPDATE_USER(id, payload);
                showAlert('success', 'User profile and permissions updated.');
            } else {
                await adminApi.CREATE_USER(payload);
                showAlert('success', 'User account successfully established.');
            }
            setTimeout(() => navigate('/admin/users'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction failed.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 italic animate-pulse">Synchronizing Identity Matrix...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">
            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-slate-100">
                        <HelpOutline className="text-sky-500 mb-4 mx-auto" style={{ fontSize: 48 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                        <p className="text-sm text-slate-500 mt-2">Commit settings for <b>{formData.username}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-[10px] uppercase shadow-lg transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/users')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"><ArrowBack fontSize="small" /></button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit User' : 'Create User'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Access Mapping Panel</p>
                    </div>
                </div>
                <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 tracking-widest uppercase">
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : isEdit ? 'UPDATE ACCOUNT' : 'SAVE ACCOUNT'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-full pb-5">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                            <PersonAddAlt1 className="text-slate-400" fontSize="small" />
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Account Details</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="relative" ref={dropdownRef}>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Search Employee</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 16 }} />
                                    <input
                                        type="text"
                                        placeholder="Type name to select..."
                                        value={empSearch}
                                        onChange={(e) => { setEmpSearch(e.target.value); setIsEmpListOpen(true); }}
                                        onFocus={() => !isEdit && setIsEmpListOpen(true)}
                                        disabled={isEdit}
                                        className={`w-full pl-10 pr-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0284C7] transition-all ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                {isEmpListOpen && !isEdit && (
                                    <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map(emp => (
                                                <div key={emp.id} onClick={() => selectEmployee(emp)} className="p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                                                    <p className="text-xs font-bold text-slate-700">{emp.fullName}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter">{emp.positionName}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-slate-400 text-xs italic">No matching employees found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Username</label>
                                <input name="username" value={formData.username} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Login Email</label>
                                <input name="email" value={formData.email} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all" />
                            </div>
                            <div className="relative">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Password {isEdit ? '(Leave empty to keep current)' : ''}</label>
                                <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#0284C7] transition-all" placeholder={isEdit ? "••••••••" : "Enter secure password"} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                            <Security className="text-slate-400" fontSize="small" />
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Available Roles</span>
                        </div>
                        <div className="p-4 space-y-2 max-h-[550px] overflow-y-auto no-scrollbar">
                            {availableRoles.map((role) => (
                                <div key={role.id} onClick={() => toggleRole(role.id)} className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedRoleIds.includes(role.id) ? 'border-[#FBAF1E] bg-amber-50/30 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRoleIds.includes(role.id) ? 'bg-[#FBAF1E] text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}><VerifiedUser style={{ fontSize: 16 }} /></div>
                                            <div><p className="text-xs font-bold text-slate-700 uppercase leading-tight">{role.roleName}</p><p className="text-[9px] text-slate-400 truncate max-w-[150px] italic">{role.description}</p></div>
                                        </div>
                                        {selectedRoleIds.includes(role.id) && <CheckCircle className="text-[#FBAF1E]" fontSize="small" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                            <Shield className="text-slate-400" fontSize="small" />
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Effective Privileges</span>
                        </div>
                        <div className="p-4 max-h-[550px] overflow-y-auto no-scrollbar">
                            {effectivePermissions.length === 0 ? (
                                <div className="text-center py-20 opacity-40"><Shield className="text-slate-300 mb-2" fontSize="large" /><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assign roles to review matrix</p></div>
                            ) : (
                                <div className="space-y-2 animate-fadeIn">
                                    {effectivePermissions.map((perm) => (
                                        <div key={perm.id || perm.slug} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2"><div className="w-1.5 h-1.5 bg-sky-400 rounded-full"></div><p className="text-[11px] font-bold text-slate-700 capitalize">{perm.name?.toLowerCase().replace(/_/g, ' ') || perm.slug}</p></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}