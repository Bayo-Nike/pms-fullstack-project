import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Save,
  HelpOutline,
  LocationCity,
  UploadFile,
  Close,
  Description,
  DeleteOutline,
  CloudDone,
  WarningAmber,
  FactCheck
} from '@mui/icons-material';

import AlertMessage from '../../components/Reusable/AlertMessage';
import colorCodingApi from '../../api/modules/colorCoding';
import adminApi from '../../api/modules/admin';
import { useAuth } from '../../context/AuthContext';

export default function CreateTarget() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { can } = useAuth();
  const canUpdateColorCodingImplementation = can('CAN_UPDATE_COLOR_CODING_ACHIEVEMENT');

  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    subCityId: '',
    fiscalYear: '',
    planType: '',
    buildingType: '',
    quarter: '',
    target: '',
    achieved: '',
  });

  // --- CONFIG DATA STATES ---
  const [subCities, setSubCities] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [parentCityName, setParentCityName] = useState('...');
  
  // --- FILE MANAGEMENT STATES ---
  const [newFiles, setNewFiles] = useState([]);        // Files selected from computer
  const [existingFiles, setExistingFiles] = useState([]); // Files already on server {id, fileName}
  const [deletedFileIds, setDeletedFileIds] = useState([]); // IDs to be purged from DB

  // --- UI & MODAL STATES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);       // Save Modal
  const [showFileConfirm, setShowFileConfirm] = useState(false); // File Delete Modal
  const [fileToProcess, setFileToProcess] = useState(null);    // Current file in deletion prompt
  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    if (type === 'success') setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [subRes, cityRes, fyRes] = await Promise.all([
          adminApi.GET_SUB_CITIES(),
          adminApi.GET_CITY(),
          colorCodingApi.GET_FISCAL_YEARS()
        ]);

        setSubCities(subRes.data || subRes);
        setParentCityName(cityRes.data || cityRes || "Main Municipality");
        setFiscalYears(fyRes.data || fyRes);

        if (isEdit) {
          const res = await colorCodingApi.GET_COLOR_CODING(id);
          const data = res.data?.data || res.data || res;

          setFormData({
            subCityId: data.subCity?.id || '',
            fiscalYear: data.fiscalYear || '',
            planType: data.planType || '',
            quarter: data.quarter || '',
            buildingType: data.buildingType || '',
            target: data.target || '',
            achieved: data.achieved || '',
          });
          setExistingFiles(data.performanceDocuments || []);
        }
      } catch {
        showAlert('error', 'Failed loading configuration data.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id, isEdit]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- FILE HANDLING LOGIC ---
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...selectedFiles]);
  };

  const triggerFileDelete = (file, type, index = null) => {
    setFileToProcess({ ...file, type, index });
    setShowFileConfirm(true);
  };

  const confirmFileDeletion = () => {
    if (fileToProcess.type === 'existing') {
      // Mark for DB deletion and remove from UI
      setDeletedFileIds(prev => [...prev, fileToProcess.id]);
      setExistingFiles(prev => prev.filter(f => f.id !== fileToProcess.id));
    } else {
      // Simply remove from local selection
      setNewFiles(prev => prev.filter((_, i) => i !== fileToProcess.index));
    }
    setShowFileConfirm(false);
    setFileToProcess(null);
  };

  // --- SAVE LOGIC ---
  const handleSaveTrigger = () => {
    const { subCityId, fiscalYear, target, planType, quarter, buildingType } = formData;
    if (!subCityId || !fiscalYear || !planType || !buildingType) return showAlert('error', 'Please fill all required fields.');
    if (planType === 'QUARTERLY' && !quarter) return showAlert('error', 'Please select a quarter.');
    if (!target || target <= 0) return showAlert('error', 'Target must be greater than 0.');
    setShowConfirm(true);
  };

  const executeSave = async () => {
    setShowConfirm(false);
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('subCityId', formData.subCityId);
      payload.append('fiscalYear', formData.fiscalYear);
      payload.append('planType', formData.planType);
      payload.append('quarter', formData.planType === 'QUARTERLY' ? formData.quarter : '');
      payload.append('buildingType', formData.buildingType);
      payload.append('target', formData.target);
      
      if (canUpdateColorCodingImplementation && formData.achieved !== '') {
          payload.append('achieved', formData.achieved);
      }

      // 1. Append New Files
      newFiles.forEach((file) => {
        payload.append('performanceDocuments', file); 
      });

      // 2. Append IDs of existing files to be deleted
      deletedFileIds.forEach((fileId) => {
        payload.append('deletedFileIds', fileId);
      });

      if (isEdit) {
        await colorCodingApi.UPDATE_COLOR_CODING(id, payload);
        showAlert('success', 'Changes Updated successfully.');
      } else {
        await colorCodingApi.CREATE_COLOR_CODING(payload);
        showAlert('success', 'New target created successfully.');
      }

      setTimeout(() => navigate('/planning/ColorCodings'), 1500);
    } catch (err) {
      console.error(err);
      showAlert('error', err.response?.data?.message || 'Transaction failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Initializing Data Vault...</div>;

  return (
    <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">
      
      {/* MODAL: FILE DELETION CONFIRMATION */}
      {showFileConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full mx-4 border border-red-50 text-center animate-popIn">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <WarningAmber className="text-red-500" style={{ fontSize: 32 }} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Remove File?</h3>
            <p className="text-xs text-slate-500 mt-2 px-4">
              Delete <span className="font-bold text-slate-700">"{fileToProcess?.fileName || fileToProcess?.name}"</span>? 
              {fileToProcess?.type === 'existing' && " This action is permanent after saving."}
            </p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowFileConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={confirmFileDeletion} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase shadow-lg shadow-red-100 transition-all hover:bg-red-600">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAVE CONFIRMATION */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-100 text-center animate-popIn">
            <HelpOutline className="text-[#0284C7] mb-4 mx-auto" style={{ fontSize: 56 }} />
            <h3 className="text-xl font-bold uppercase tracking-tight">Confirm Save</h3>
            <p className="text-sm text-slate-500 mt-2">Update the target configuration and sync documents?</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={executeSave} className="flex-1 px-4 py-3 rounded-2xl bg-[#0284C7] text-white font-bold text-[10px] uppercase shadow-lg shadow-sky-100 hover:bg-[#016da3] transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/planning/ColorCodings')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowBack fontSize="small" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Update Color Code' : 'Create New Entry'}</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Sub-City level Planning Registry</p>
          </div>
        </div>
        <button
          onClick={handleSaveTrigger}
          disabled={saving}
          className="bg-[#0284C7] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 tracking-widest uppercase"
        >
          <Save style={{ fontSize: 16 }} /> {saving ? 'UPDATING...' : 'UPDATE CHANGES'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LEFT COLUMN: BASIC INFO */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-fit p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Work Location</label>
            <div className="flex gap-2">
              <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black flex items-center gap-2 uppercase whitespace-nowrap">
                <LocationCity style={{ fontSize: 16 }} /> {parentCityName}
              </div>
              <select
                name="subCityId"
                value={formData.subCityId}
                onChange={!canUpdateColorCodingImplementation ? handleInputChange : undefined}
                disabled={canUpdateColorCodingImplementation}
                className={`flex-1 text-sm font-semibold px-4 py-3 border rounded-xl outline-none ${canUpdateColorCodingImplementation ? 'bg-slate-50' : 'bg-white border-slate-200'}`}
              >
                <option value="">-- Select Sub-City --</option>
                {subCities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Fiscal Year</label>
              <select
                name="fiscalYear"
                value={formData.fiscalYear}
                onChange={!canUpdateColorCodingImplementation ? handleInputChange : undefined}
                disabled={canUpdateColorCodingImplementation}
                className="w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none bg-white border-slate-200"
              >
                <option value="">-- Select Year --</option>
                {fiscalYears.map((fy, i) => <option key={i} value={fy}>{fy}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Building Type</label>
              <select
                name="buildingType"
                value={formData.buildingType}
                onChange={!canUpdateColorCodingImplementation ? handleInputChange : undefined}
                disabled={canUpdateColorCodingImplementation}
                className="w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none bg-white border-slate-200"
              >
                <option value="">-- Select Type --</option>
                <option value="FACTORY">FACTORY</option>
                <option value="HOUSEHOLD">HOUSEHOLD</option>
                <option value="FENCE">FENCE</option>
                <option value="COMMERCIAL_CENTER">COMMERCIAL CENTER</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Plan Mode</label>
            <select
              name="planType"
              value={formData.planType}
              onChange={!canUpdateColorCodingImplementation ? handleInputChange : undefined}
              disabled={canUpdateColorCodingImplementation}
              className="w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none bg-white border-slate-200"
            >
              <option value="">-- Select Modal --</option>
              <option value="YEARLY">YEARLY</option>
              <option value="QUARTERLY">QUARTERLY</option>
            </select>
          </div>

          {formData.planType === 'QUARTERLY' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[9px] font-bold uppercase text-amber-500 tracking-[0.2em] ml-1">Active Quarter</label>
              <select
                name="quarter"
                value={formData.quarter}
                onChange={!canUpdateColorCodingImplementation ? handleInputChange : undefined}
                disabled={canUpdateColorCodingImplementation}
                className="w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none bg-amber-50/20 border-amber-200"
              >
                <option value="">-- Select --</option>
                <option value="Q1">Q1</option><option value="Q2">Q2</option>
                <option value="Q3">Q3</option><option value="Q4">Q4</option>
              </select>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PERFORMANCE & UNLIMITED ARTIFACTS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-fit p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Target Value</label>
            <input
              name="target"
              type="number"
              value={formData.target}
              onChange={!canUpdateColorCodingImplementation ? handleInputChange : undefined}
              readOnly={canUpdateColorCodingImplementation}
              className="w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none bg-white border-slate-200 focus:border-[#0284C7]"
              placeholder="Enter numerical target"
            />
          </div>

          {canUpdateColorCodingImplementation && (
            <>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase text-[#0284C7] tracking-[0.2em] ml-1">Achieved Value</label>
                <input
                  name="achieved"
                  type="number"
                  value={formData.achieved}
                  onChange={handleInputChange}
                  placeholder="Current achievement"
                  className="w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none bg-sky-50/20 border-sky-100 focus:border-[#0284C7]"
                />
              </div>

              {/* ARTIFACT SYSTEM */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <FactCheck className="text-slate-400" fontSize="small" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Performance Artifacts</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#0284C7] uppercase bg-sky-50 px-2 py-0.5 rounded-full">Unlimited</span>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-[#0284C7] transition-all relative cursor-pointer bg-slate-50/30 group">
                  <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadFile className="text-slate-300 group-hover:text-[#0284C7] mb-2" style={{ fontSize: 40 }} />
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Click to add documents</p>
                </div>

                <div className="max-h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {/* EXISTING FILES (On Server) */}
                  {existingFiles.map((file) => (
                    <div key={`exist-${file.id}`} className="flex items-center gap-3 p-3 rounded-xl border bg-white border-slate-100 shadow-sm group hover:border-[#0284C7] transition-all">
                      <CloudDone className="text-emerald-500" style={{ fontSize: 18 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{file.fileName}</p>
                        <p className="text-[9px] font-black uppercase text-slate-300">Saved Archive</p>
                      </div>
                      <button type="button" onClick={() => triggerFileDelete(file, 'existing')} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <DeleteOutline style={{ fontSize: 18 }} />
                      </button>
                    </div>
                  ))}

                  {/* NEW FILES (To be Uploaded) */}
                  {newFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="flex items-center gap-3 p-3 rounded-xl border bg-sky-50/30 border-sky-100 animate-slideIn">
                      <Description className="text-[#0284C7]" style={{ fontSize: 18 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[9px] font-black uppercase text-[#0284C7]">Pending Sync</p>
                      </div>
                      <button type="button" onClick={() => triggerFileDelete(file, 'new', idx)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                        <Close style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  ))}

                  {existingFiles.length === 0 && newFiles.length === 0 && (
                    <div className="text-center py-10 border-2 border-dotted border-slate-100 rounded-2xl">
                       <Description className="text-slate-100 mb-2" style={{ fontSize: 48 }} />
                       <p className="text-[10px] font-bold uppercase text-slate-300">No attachments found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}