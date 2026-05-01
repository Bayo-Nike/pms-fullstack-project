import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add, LocationOn,
    HelpOutline, ChevronLeft, ChevronRight, PinDrop
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Locations() {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [locations, setLocations] = useState([]); // Initialized as array
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, name: '' });

    useEffect(() => { fetchLocations(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const fetchLocations = async () => {
        try {
            const res = await adminApi.GET_LOCATIONS();
            // Critical fix: backend returns { success, message, data: [...] }
            if (res.data && Array.isArray(res.data.data)) {
                setLocations(res.data.data);
            } else if (Array.isArray(res.data)) {
                setLocations(res.data);
            }
        } catch (err) {
            showAlert('error', 'Failed to synchronize spatial registry.');
            setLocations([]);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const handleDeleteClick = (loc) => {
        setDeleteConfig({ show: true, id: loc.id, name: loc.name });
    };

    const executeDelete = async () => {
        const { id, name } = deleteConfig;
        setDeleteConfig({ show: false, id: null, name: '' });
        try {
            await adminApi.DELETE_LOCATION(id);
            showAlert('success', `Location "${name}" removed.`);
            fetchLocations();
        } catch (err) {
            showAlert('error', "Deletion failed: Site is linked to active records.");
        }
    };

    // Filter Logic - Ensures locations is always treated as an array
    const filteredLocations = useMemo(() => {
        if (!Array.isArray(locations)) return [];
        return locations.filter(l =>
            (l.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.subCityName || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [locations, searchTerm]);

    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
    const paginatedItems = filteredLocations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">
            {deleteConfig.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center border border-slate-100">
                        <HelpOutline className="text-red-500 mb-4 mx-auto" style={{ fontSize: 40 }} />
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Remove Site</h3>
                        <p className="text-sm text-slate-500 mt-2">Permanently remove <b>{deleteConfig.name}</b>?</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfig({ show: false })} className="flex-1 px-4 py-2 text-xs font-bold border rounded-xl uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={executeDelete} className="flex-1 px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-xl uppercase shadow-lg transition-all hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-base font-bold text-slate-900">Project Sites</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Geographic Mapping</p>
                </div>
                {can('CAN_SEE_SYS_ADMIN') && (
                    <button onClick={() => navigate('/admin/locations/create')} className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 uppercase tracking-widest">
                        <Add style={{ fontSize: 18 }} /> Add Location
                    </button>
                )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                    <input type="text" placeholder="Search site or sub-city..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0284C7] focus:bg-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase px-4">
                    Total: {filteredLocations.length} Sites
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-3">Site / Area Name</th>
                            <th className="px-6 py-3">Jurisdiction</th>
                            <th className="px-6 py-3">Coordinates (Lat, Lng)</th>
                            <th className="px-6 py-3 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-xs italic">Syncing spatial registry...</td></tr>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map((loc) => (
                                <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-sky-50 text-[#0284C7] rounded-lg flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                                                <PinDrop style={{ fontSize: 16 }} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{loc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <LocationOn style={{ fontSize: 14 }} />
                                            <span className="text-xs font-medium uppercase tracking-tight">{loc.subCityName}</span>
                                        </div>
                                    </td>
                                    {/* Inside the table mapping in Locations.jsx */}
                                    <td className="px-6 py-3.5 font-mono text-[10px] text-slate-400 italic">
                                        {loc.lat != null && loc.lng != null ? (
                                            <span className="not-italic text-slate-500 font-bold">
                                                {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                                            </span>
                                        ) : (
                                            "No GPS Data"
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {can('CAN_SEE_SYS_ADMIN') && (
                                                <>
                                                    <button onClick={() => navigate(`/admin/locations/edit/${loc.id}`)} className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-md transition-all"><Edit style={{ fontSize: 16 }} /></button>
                                                    <button onClick={() => handleDeleteClick(loc)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Delete style={{ fontSize: 16 }} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400 text-xs italic">No sites found.</td></tr>
                        )}
                    </tbody>
                </table>
                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border bg-white text-slate-400 disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronLeft fontSize="small" /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border bg-white text-slate-400 disabled:opacity-30 hover:text-[#0284C7] transition-all"><ChevronRight fontSize="small" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}