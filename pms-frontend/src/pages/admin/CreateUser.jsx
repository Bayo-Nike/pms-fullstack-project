import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Save, Person, Security, VerifiedUser, HelpOutline, Visibility, VisibilityOff, Shield, CheckCircle } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateUser() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Form States (Matches UserCreateRequest DTO)
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        username: '',
        email: '',
        password: ''
    });

    // Selection States
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);

    // UI & Data States
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Fetch all roles and FILTER OUT SUPER_ADMIN
                const rolesRes = await adminApi.GET_ROLES();
                const allRoles = rolesRes.data || rolesRes;
                const filteredRoles = allRoles.filter(role => role.roleName !== 'SUPER_ADMIN');
                setAvailableRoles(filteredRoles);

                // 2. Fetch user if editing
                if (isEdit) {
                    const userRes = await adminApi.GET_USER(id);
                    const u = userRes.data || userRes;
                    setFormData({
                        firstName: u.firstName || '',
                        middleName: u.middleName || '',
                        lastName: u.lastName || '',
                        username: u.username || '',
                        email: u.email || '',
                        password: '' // Keep empty on edit to prevent accidental overwriting
                    });
                    setSelectedRoleIds(u.roles?.map(r => r.id) || []);
                }
            } catch (err) {
                showAlert('error', 'Initialization failed: Could not load required system data.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, isEdit]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleRole = (roleId) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? prev.filter(i => i !== roleId) : [...prev, roleId]
        );
    };

    // LOGIC: Generate unique aggregate privileges from all selected roles
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

        return allPerms.sort((a, b) => {
            const nameA = (a.name || a.slug || "").toLowerCase();
            const nameB = (b.name || b.slug || "").toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [selectedRoleIds, availableRoles]);

    const handleSaveTrigger = () => {
        const { firstName, middleName, lastName, email, password, username } = formData;

        // Validation: Identity fields cannot be empty
        if (!firstName.trim() || !middleName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
            showAlert('error', 'Validation Error: All profile identity fields are required.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Validation: Password for new accounts
        if (!isEdit && !password.trim()) {
            showAlert('error', 'Security Error: A password is required for new user registrations.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Validation: At least one role selected
        if (selectedRoleIds.length === 0) {
            showAlert('error', 'Selection Error: You must assign at least one role to this user.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            // Mapping to UserCreateRequest DTO structure
            const payload = {
                ...formData,
                firstName: formData.firstName.trim(),
                middleName: formData.middleName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                roleIds: selectedRoleIds
            };

            if (isEdit) {
                await adminApi.UPDATE_USER(id, payload);
                showAlert('success', 'User profile updated successfully.');
            } else {
                await adminApi.CREATE_USER(payload);
                showAlert('success', 'New user registered successfully.');
            }
            setTimeout(() => navigate('/admin/users'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'Transaction failed: The server rejected the request.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 italic">Synchronizing User Configuration...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

            {/* Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-full flex items-center justify-center mb-4">
                                <HelpOutline style={{ fontSize: 32 }} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Confirm Save</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Register <b>{formData.firstName} {formData.lastName}</b> with {selectedRoleIds.length} active roles?
                            </p>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={executeSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg">Confirm</button>
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
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/users')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Edit Identity Profile' : 'Register System User'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Access Management Panel</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveTrigger}
                    disabled={saving}
                    className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : isEdit ? 'UPDATE PROFILE' : 'COMMIT REGISTRATION'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Column 1: Identity Profile Form */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-full">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                            <Person className="text-slate-400" fontSize="small" />
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">User Profile</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">First Name</label>
                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#0284C7] transition-all" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Middle Name</label>
                                <input name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#0284C7] transition-all" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Last Name</label>
                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#0284C7] transition-all" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">System Username</label>
                                <input name="username" value={formData.username} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#0284C7] transition-all" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Official Email</label>
                                <input name="email" value={formData.email} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#0284C7] transition-all" />
                            </div>
                            <div className="relative">
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Security Password {isEdit ? '(Empty = No Change)' : ''}</label>
                                <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#0284C7] transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Role Assignments */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                            <Security className="text-slate-400" fontSize="small" />
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Role Assignments</span>
                        </div>
                        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                            {availableRoles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => toggleRole(role.id)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedRoleIds.includes(role.id) ? 'border-[#FBAF1E] bg-amber-50/30 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRoleIds.includes(role.id) ? 'bg-[#FBAF1E] text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                                                <VerifiedUser style={{ fontSize: 16 }} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 uppercase leading-tight">{role.roleName}</p>
                                                <p className="text-[9px] text-slate-400 truncate max-w-[180px] mt-0.5 italic">{role.description}</p>
                                            </div>
                                        </div>
                                        {selectedRoleIds.includes(role.id) && <CheckCircle className="text-[#FBAF1E]" fontSize="small" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Effective Capabilities (Aggregated & Scrollable) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                            <Shield className="text-slate-400" fontSize="small" />
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Effective Privileges</span>
                        </div>
                        <div className="p-4 max-h-[600px] overflow-y-auto">
                            {effectivePermissions.length === 0 ? (
                                <div className="text-center py-20 opacity-40">
                                    <Shield className="text-slate-300 mb-2" fontSize="large" />
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select roles to view final privileges</p>
                                </div>
                            ) : (
                                <div className="space-y-2 animate-fadeIn">
                                    <div className="mb-3 px-2 py-1 bg-sky-50 rounded border border-sky-100 text-[10px] font-bold text-sky-700 uppercase text-center tracking-widest">
                                        {effectivePermissions.length} Unique Privileges Granted
                                    </div>
                                    {effectivePermissions.map((perm) => (
                                        <div key={perm.id || perm.slug} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                                            <div className="w-1 h-1 bg-sky-400 rounded-full"></div>
                                            <p className="text-[11px] font-bold text-slate-700 capitalize">
                                                {perm.name?.toLowerCase().replace(/_/g, ' ') || perm.slug?.toLowerCase().replace(/_/g, ' ')}
                                            </p>
                                        </div>
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