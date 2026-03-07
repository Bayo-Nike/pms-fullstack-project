import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function EditContractor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contractorName, setContractorName] = useState('');
  const [status, setStatus] = useState('');
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);

  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
  const [loading, setLoading] = useState(true);

  const statusOptions = ['ACTIVE', 'INACTIVE', 'SUSPENDED']; // Customize your statuses

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    if (type === 'success') {
      setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    }
  };

  useEffect(() => {
    fetchContractor();
  }, []);

  const fetchContractor = async () => {
    try {
      const res = await adminApi.GET_CONTRACTOR(id);
      const data = res.data;
      setContractorName(data.contractorName || '');
      setStatus(data.status || '');
      setExistingFile(data.document || null);
    } catch (err) {
      showAlert('error', 'Failed to load contractor');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('contractorName', contractorName);
    formData.append('status', status);
    if (file) formData.append('document', file);

    try {
      await adminApi.UPDATE_CONTRACTOR(id, formData);
      showAlert('success', 'Contractor updated successfully');
      navigate('/admin/contractors'); // redirect after update
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update contractor');
    }
  };

  if (loading) {
    return <div className="p-4">Loading contractor data...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Contractor</h2>

      <AlertMessage
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contractor Name */}
        <div>
          <label className="block text-sm font-semibold mb-1">Contractor Name</label>
          <input
            type="text"
            value={contractorName}
            onChange={(e) => setContractorName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-sm font-semibold mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          >
            <option value="" disabled>Select status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold mb-1">Document</label>
          <input type="file" onChange={handleFileChange} className="text-sm" />
          {existingFile && (
            <div className="mt-2">
              <a
                href={`http://localhost:8080/api/admin/contractors/download/${existingFile}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View existing file
              </a>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-5 py-2 bg-[#FBAF1E] text-white rounded-lg font-semibold"
          >
            Update Contractor
          </button>
        </div>
      </form>
    </div>
  );
}