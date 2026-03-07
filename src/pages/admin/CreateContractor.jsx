import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Save, UploadFile, HelpOutline } from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateContractor() {

    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [contractorName, setContractorName] = useState('');
    const [status, setStatus] = useState('');
    const [document, setDocument] = useState(null);
    const [existingFile, setExistingFile] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [alert, setAlert] = useState({
        show: false,
        type: 'info',
        message: ''
    });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        if (type === 'success') {
            setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
        }
    };

    useEffect(() => {

        const loadData = async () => {

            if (!isEdit) {
                setLoading(false);
                return;
            }

            try {

                const res = await adminApi.GET_CONTRACTOR(id);
                const data = res.data || res;

                setContractorName(data.contractorName || '');
                setStatus(data.status || '');
                setExistingFile(data.document || '');

            } catch (err) {
                showAlert('error', 'Failed to load contractor');
            } finally {
                setLoading(false);
            }
        };

        loadData();

    }, [id, isEdit]);

    const handleSaveTrigger = () => {

        if (!contractorName.trim()) {
            showAlert('error', 'Contractor name is required');
            return;
        }

        if (!status.trim()) {
            showAlert('error', 'Status is required');
            return;
        }

        setShowConfirm(true);
    };

    const executeSave = async () => {

        setShowConfirm(false);
        setSaving(true);

        try {

            const formData = new FormData();

            formData.append("contractorName", contractorName);
            formData.append("status", status);

            if (document) {
                formData.append("document", document);
            }
            console.log(formData);

            if (isEdit) {

                await adminApi.UPDATE_CONTRACTOR(id, formData);
                showAlert('success', 'Contractor updated successfully');

            } else {

                await adminApi.CREATE_CONTRACTOR(formData);
                showAlert('success', 'Contractor created successfully');

            }

            setTimeout(() => navigate('/admin/contractors'), 1500);

        } catch (err) {
            console.error(err);
        
            showAlert(
                'error',
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                'Failed to save contractor'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center text-slate-400 italic animate-pulse">
                Loading contractor data...
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

            {/* Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">

                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">

                        <HelpOutline
                            className="text-[#0284C7] mb-4"
                            style={{ fontSize: 48 }}
                        />

                        <h3 className="text-lg font-bold text-slate-800 uppercase">
                            Confirm Save
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            Save contractor <b>{contractorName}</b> ?
                        </p>

                        <div className="flex gap-3 mt-8">

                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 border rounded-xl"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={executeSave}
                                className="flex-1 px-4 py-2 bg-[#0284C7] text-white rounded-xl"
                            >
                                Confirm
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

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        onClick={() => navigate('/admin/contractors')}
                        className="p-2 bg-slate-100 rounded-lg"
                    >
                        <ArrowBack fontSize="small" />
                    </button>

                    <div>
                        <h1 className="text-base font-bold">
                            {isEdit ? 'Edit Contractor' : 'Create Contractor'}
                        </h1>
                        <p className="text-xs text-slate-400">
                            Contractor Management
                        </p>
                    </div>

                </div>

                <button
                    onClick={handleSaveTrigger}
                    disabled={saving}
                    className="bg-[#0284C7] text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                    <Save style={{ fontSize: 16 }} />
                    {saving ? 'PROCESSING...' : 'SAVE'}
                </button>

            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">

                {/* Contractor Name */}
                <div>

                    <label className="text-xs font-bold text-slate-500">
                        Contractor Name
                    </label>

                    <input
                        type="text"
                        value={contractorName}
                        onChange={(e) => setContractorName(e.target.value)}
                        className="w-full mt-1 px-4 py-3 border rounded-xl"
                        placeholder="Enter contractor name"
                    />

                </div>

                {/* Status */}
                <div>

                    <label className="text-xs font-bold text-slate-500">
                        Status
                    </label>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full mt-1 px-4 py-3 border rounded-xl"
                    >

                        <option value="">Select Status</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        

                    </select>

                </div>

                {/* File Upload */}
                <div>

                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                        <UploadFile fontSize="small" />
                        Upload Document
                    </label>

                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={(e) => setDocument(e.target.files[0])}
                        className="mt-2"
                    />

                    {document && (
                        <p className="text-xs text-green-600 mt-2">
                            Selected: {document.name}
                        </p>
                    )}

                    {!document && existingFile && (
                        <p className="text-xs text-slate-500 mt-2">
                            Current File: {existingFile}
                        </p>
                    )}

                </div>

            </div>

        </div>
    );
}