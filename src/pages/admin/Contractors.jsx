import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Delete, Search, Add,
    HelpOutline, CorporateFare,
    ChevronLeft, ChevronRight,
    Description
} from '@mui/icons-material';

import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Contractors() {

    const navigate = useNavigate();
    const { can } = useAuth();

    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [deleteConfig, setDeleteConfig] = useState({
        show: false,
        id: null,
        contractorName: ''
    });

    useEffect(() => {
        fetchContractors();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') {
            setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
        }
    };

    const fetchContractors = async () => {
        try {

            const res = await adminApi.GET_CONTRACTORS();
            setContractors(res.data || res);

        } catch (err) {

            showAlert('error', 'Failed to load contractors');

        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (contractor) => {

        setDeleteConfig({
            show: true,
            id: contractor.id,
            contractorName: contractor.contractorName
        });

    };

    const executeDelete = async () => {

        const { id, contractorName } = deleteConfig;

        setDeleteConfig({ show: false, id: null, contractorName: '' });

        try {

            await adminApi.DELETE_CONTRACTOR(id);

            showAlert('success', `Contractor "${contractorName}" removed`);

            fetchContractors();

        } catch (err) {

            const msg =
                err.response?.data?.message ||
                "Failed to delete contractor";

            showAlert('error', msg);
        }
    };

    const filteredContractors = useMemo(() => {

        return contractors.filter(c =>
            (c.contractorName || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );

    }, [contractors, searchTerm]);

    const totalPages = Math.ceil(filteredContractors.length / itemsPerPage);

    const paginatedContractors = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredContractors.slice(start, end);

    }, [filteredContractors, currentPage, itemsPerPage]);

    return (
        <div className="w-full space-y-4 animate-fadeIn px-2 pb-10 relative">

            {/* DELETE MODAL */}
            {deleteConfig.show && (

                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">

                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">

                        <HelpOutline className="text-red-500 mb-4" style={{ fontSize: 40 }} />

                        <h3 className="text-lg font-bold text-slate-800">
                            Delete Contractor
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            Permanently remove <b>{deleteConfig.contractorName}</b> ?
                        </p>

                        <div className="flex gap-3 mt-8">

                            <button
                                onClick={() => setDeleteConfig({ show: false })}
                                className="flex-1 px-4 py-2 border rounded-xl"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={executeDelete}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl"
                            >
                                Delete
                            </button>

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

            {/* HEADER */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">

                <div>
                    <h1 className="text-base font-bold text-slate-900">
                        Contractors
                    </h1>
                    <p className="text-xs text-slate-400">
                        Contractor Management
                    </p>
                </div>

                {can('CAN_MANAGE_MODULES') && (

                    <button
                        onClick={() => navigate('/admin/contractors/create')}
                        className="bg-[#FBAF1E] text-white px-5 py-2 rounded-lg flex items-center gap-2 text-xs font-bold"
                    >
                        <Add /> Create Contractor
                    </button>

                )}

            </div>

            {/* SEARCH */}
            <div className="bg-white p-3 rounded-xl border shadow-sm flex items-center">

                <div className="relative max-w-sm w-full">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                        type="text"
                        placeholder="Search contractor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-xs"
                    />

                </div>

            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

                <table className="w-full text-left">

                    <thead className="bg-slate-50 text-xs uppercase text-slate-400">

                        <tr>
                            <th className="px-6 py-3">Contractor</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Document</th>
                            <th className="px-6 py-3">Created Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td colSpan="4" className="p-6 text-center">
                                    Loading contractors...
                                </td>
                            </tr>

                        ) : paginatedContractors.map(c => (
                            

                            <tr key={c.id} className="border-t">

                                <td className="px-6 py-3 flex items-center gap-3">

                                    <CorporateFare className="text-[#0284C7]" />

                                    {c.contractorName}

                                </td>

                                <td className="px-6 py-3 text-xs font-semibold">

                                    {c.status}

                                </td>

                                <td className="px-6 py-3">

                                    {c.document ? (

                                        <a
                                            href={`http://localhost:8080/api/admin/contractors/download/${c.document}`}
                                            // href={`http://localhost:8080/uploads/${c.document}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 flex items-center gap-1"
                                        >
                                            <Description fontSize="small" />
                                            View
                                        </a>

                                    ) : (
                                        <span className="text-xs text-slate-400">
                                            No file
                                        </span>
                                    )}

                                </td>
                                <td className="px-6 py-3 text-xs font-semibold">

                                    {c.createdDate}

                                </td>

                                <td className="px-6 py-3 text-right">

                                    {can('CAN_MANAGE_MODULES') && (

                                        <div className="flex justify-end gap-2">

                                            <button
                                                onClick={() => navigate(`/admin/contractors/edit/${c.id}`)}
                                            >
                                                <Edit fontSize="small" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(c)}
                                            >
                                                <Delete fontSize="small" />
                                            </button>

                                        </div>

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

                {/* PAGINATION */}

                <div className="flex justify-between items-center p-4 border-t">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        <ChevronLeft />
                    </button>

                    <span className="text-xs">
                        Page {currentPage} / {totalPages || 1}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        <ChevronRight />
                    </button>

                </div>

            </div>

        </div>
    );
}