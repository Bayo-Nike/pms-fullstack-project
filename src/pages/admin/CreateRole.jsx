import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, ExpandMore, Save, Security, CheckCircle, RadioButtonUnchecked, HelpOutline } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateRole() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Form States (Matches RoleRequestDto)
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]); // Array of Long IDs

    // UI States
    const [systemModules, setSystemModules] = useState([]);
    const [expandedModule, setExpandedModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Fetch all permissions to build matrix
                const permRes = await adminApi.GET_PERMISSIONS();
                const allPerms = permRes.data || permRes;
                formatPermissions(allPerms);

                // Default permissions for new roles
                if (!isEdit) {
                    const defaultSlugs = [
                        'CAN_SEE_DASHBOARD',
                        'CAN_SEE_PROJECT',
                        'CAN_SEE_FINANCE',
                        'CAN_SEE_CONTRACT',
                        'CAN_SEE_PLANNING',
                        'CAN_SEE_REPORT'
                    ];
                    const defaultIds = allPerms
                        .filter(p => defaultSlugs.includes(p.slug))
                        .map(p => p.id);
                    setSelectedPermissionIds(defaultIds);
                }

                // 2. Fetch role for edit
                if (isEdit) {
                    const roleRes = await adminApi.GET_ROLE(id);
                    const roleData = roleRes.data || roleRes;
                    setRoleName(roleData.roleName || '');
                    setDescription(roleData.description || '');
                    // Map Permission objects to IDs for selection logic
                    const ids = roleData.permissions?.map(p => p.id || p) || [];
                    setSelectedPermissionIds(ids);
                }
            } catch (err) {
                showAlert('error', 'Error: System could not load permission data.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, isEdit]);

    const formatPermissions = (perms) => {
        const groups = {};
        perms.forEach(p => {
            const moduleName = p.moduleName || p.slug.split('_')[0];
            if (!groups[moduleName]) groups[moduleName] = { name: moduleName, permissions: [] };
            groups[moduleName].permissions.push(p);
        });
        setSystemModules(Object.values(groups));
    };

    const togglePermission = (permId) => {
        setSelectedPermissionIds(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
    };

    const toggleModule = (e, module) => {
        e.stopPropagation();
        const moduleIds = module.permissions.map(p => p.id);
        const allSelected = moduleIds.every(id => selectedPermissionIds.includes(id));
        setSelectedPermissionIds(prev => allSelected ? prev.filter(id => !moduleIds.includes(id)) : [...new Set([...prev, ...moduleIds])]);
    };

    const handleSaveTrigger = () => {
        if (!roleName.trim()) {
            showAlert('error', 'Validation Error: Role Name is mandatory.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (selectedPermissionIds.length === 0) {
            showAlert('error', 'Validation Error: Assign at least one permission.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setShowConfirm(true);
    };

    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const payload = {
                roleName: roleName.trim(),
                description: description.trim(),
                permissions: selectedPermissionIds
            };

            if (isEdit) {
                await adminApi.UPDATE_ROLE(id, payload);
                showAlert('success', 'Configuration updated successfully.');
            } else {
                await adminApi.CREATE_ROLE(payload);
                showAlert('success', 'Role established successfully.');
            }
            setTimeout(() => navigate('/admin/roles'), 1500);
        } catch (err) {
            showAlert('error', err.response?.data?.message || 'The server rejected the request.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 italic">Synchronizing Permissions Matrix...</div>;

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative">

            {/* Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-full flex items-center justify-center mb-4">
                                <HelpOutline style={{ fontSize: 32 }} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Save Configuration</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Confirm changes to <b>{roleName}</b> with {selectedPermissionIds.length} capabilities assigned?
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
                    <button onClick={() => navigate('/admin/roles')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowBack fontSize="small" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Update Role' : 'Create Role'}</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Configuration Panel</p>
                    </div>
                </div>
                <button onClick={handleSaveTrigger} disabled={saving} className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all disabled:opacity-50 shadow-md">
                    <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : isEdit ? 'UPDATE ROLE' : 'SAVE ROLE'}
                </button>
            </div>

            {/* Permissions Matrix */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block mb-2 ml-1">Internal Role Name (roleName)</label>
                        <input className="w-full text-sm font-semibold bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-[#0284C7] transition-all" placeholder="e.g. FINANCE_DIRECTOR"
                            value={roleName} onChange={(e) => setRoleName(e.target.value)}
                            disabled={roleName === "ROLE_CITY_OFFICE_HEAD" || roleName === "ROLE_MAYOR"  || roleName === "ROLE_API_CLIENT"}
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block mb-2 ml-1">System Description</label>
                        <input className="w-full text-sm font-semibold bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-[#0284C7] transition-all" placeholder="e.g. Executive role for budgeting"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            disabled={roleName === "ROLE_CITY_OFFICE_HEAD" || roleName === "ROLE_MAYOR"  || roleName === "ROLE_API_CLIENT"}
                        />
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1 block mb-3">Permissions Hierarchy Matrix</label>
                    {systemModules.map((module) => {
                        const selectedInModule = module.permissions.filter(p => selectedPermissionIds.includes(p.id)).length;
                        const isAll = selectedInModule === module.permissions.length;

                        return (
                            <div key={module.name} className={`border rounded-xl transition-all ${expandedModule === module.name ? 'border-[#0284C7]' : 'border-slate-100'}`}>
                                <div onClick={() => setExpandedModule(expandedModule === module.name ? null : module.name)} className="flex items-center justify-between p-4 cursor-pointer bg-white rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${selectedInModule > 0 ? 'bg-[#FBAF1E] text-white shadow-sm' : 'bg-slate-50 text-slate-300'}`}>
                                            <Security style={{ fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-xs uppercase tracking-tight">{module.name}</p>
                                            <p className="text-[10px] text-slate-400">{selectedInModule} of {module.permissions.length} active</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={(e) => toggleModule(e, module)} className={`hidden sm:flex px-3 py-1 rounded text-[9px] font-bold uppercase border transition-all ${isAll ? 'bg-[#0284C7] text-white border-[#0284C7]' : 'text-slate-400 border-slate-200 hover:border-[#0284C7]'}`}>
                                            {isAll ? <CheckCircle style={{ fontSize: 12, marginRight: 4 }} /> : <RadioButtonUnchecked style={{ fontSize: 12, marginRight: 4 }} />}
                                            {isAll ? 'Full Access' : 'Select All'}
                                        </button>
                                        <ExpandMore fontSize="small" className={`transition-transform duration-300 ${expandedModule === module.name ? 'rotate-180 text-[#0284C7]' : 'text-slate-300'}`} />
                                    </div>
                                </div>
                                {expandedModule === module.name && (
                                    <div className="p-4 bg-slate-50/30 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
                                        {module.permissions.map((perm) => (
                                            <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer bg-white ${selectedPermissionIds.includes(perm.id) ? 'border-[#FBAF1E] ring-1 ring-[#FBAF1E]/10' : 'border-slate-200 hover:border-slate-300'}`}>
                                                <input type="checkbox" className="mt-1 w-4 h-4 accent-[#0284C7]" checked={selectedPermissionIds.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 capitalize leading-tight">{perm.name?.toLowerCase().replace(/_/g, ' ') || perm.slug?.toLowerCase().replace(/_/g, ' ')}</p>
                                                    <code className="text-[9px] font-mono text-[#0284C7] mt-1 block uppercase">{perm.slug}</code>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}