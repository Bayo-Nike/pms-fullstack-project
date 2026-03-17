import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Save,
  HelpOutline,
  LocationCity,
  UploadFile,
  Close,
  Description
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
  const canManageRoles = can('CAN_MANAGE_ROLES');

  const [formData, setFormData] = useState({
    subCityId: '',
    fiscalYear: '',
    planType: '',
    buildingType: '',
    quarter: '',
    target: '',
    achieved: '',
  });

  const [subCities, setSubCities] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [parentCityName, setParentCityName] = useState('...');
  const [performanceDocument, setPerformanceDocument] = useState(null);
  const [existingFile, setExistingFile] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        const cityNameValue = cityRes.data !== undefined ? cityRes.data : cityRes;
        setParentCityName(cityNameValue || "Main Municipality");
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
          setExistingFile(data.performanceDocument || '');
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

  const handleSaveTrigger = () => {
    const { subCityId, fiscalYear, target, achieved, buildingType, planType, quarter } = formData;
    if (!subCityId) return showAlert('error', 'Sub City is required.');
    if (!fiscalYear) return showAlert('error', 'Fiscal Year is required.');
    if (!planType) return showAlert('error', 'Plan Modal is required.');
    if (!buildingType) return showAlert('error', 'Building Type is required.');
    if (planType === 'QUARTERLY' && !quarter) return showAlert('error', 'Please select a Quarter.');
    if (!target || Number(target) <= 0) return showAlert('error', 'Target value must be greater than 0.');
    if (canManageRoles && achieved !== '' && Number(achieved) < 0) return showAlert('error', 'Achieved value cannot be negative.');
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
      if (canManageRoles && formData.achieved !== '') payload.append('achieved', formData.achieved);
      if (performanceDocument) payload.append('performanceDocument', performanceDocument);

      if (isEdit) {
        await colorCodingApi.UPDATE_COLOR_CODING(id, payload);
        showAlert('success', 'Color Code updated successfully.');
      } else {
        await colorCodingApi.CREATE_COLOR_CODING(payload);
        showAlert('success', 'Color Code created successfully.');
      }

      setTimeout(() => navigate('/planning/ColorCodings'), 1500);
    } catch (err) {
      console.error(err);
      showAlert('error', err.response?.data?.message || 'Transaction failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 italic animate-pulse">Initializing Target Configuration...</div>;

  return (
    <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-100 text-center">
            <HelpOutline className="text-[#0284C7] mb-4 mx-auto" style={{ fontSize: 56 }} />
            <h3 className="text-xl font-bold uppercase tracking-tight">Confirm Save</h3>
            <p className="text-sm text-slate-500 mt-2">Are you sure you want to save this target configuration?</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={executeSave} className="flex-1 px-4 py-3 rounded-xl bg-[#0284C7] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100 hover:bg-[#016da3] transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />

      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/planning/ColorCodings')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowBack fontSize="small" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Update Color Code' : 'New Color Code Target'}</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">COLOR CODE Target Registry</p>
          </div>
        </div>
        <button
          onClick={handleSaveTrigger}
          disabled={saving}
          className="bg-[#0284C7] text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 tracking-widest uppercase"
        >
          <Save style={{ fontSize: 16 }} /> {saving ? 'SAVING...' : (isEdit ? 'UPDATE TARGET' : 'SAVE COLOR CODE TARGET')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit p-6 space-y-5">
          {/* SubCity */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Work Location</label>
            <div className="flex gap-2">
              <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black flex items-center gap-2 uppercase whitespace-nowrap shadow-sm">
                <LocationCity style={{ fontSize: 16 }} /> {parentCityName}
              </div>
              <select
                name="subCityId"
                value={formData.subCityId}
                onChange={!canManageRoles ? handleInputChange : undefined}
                disabled={canManageRoles}
                className={`flex-1 text-sm font-semibold px-4 py-3 border rounded-xl outline-none ${canManageRoles ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value="">-- Select Sub-City --</option>
                {subCities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Fiscal Year */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Fiscal Year</label>
            <select
              name="fiscalYear"
              value={formData.fiscalYear}
              onChange={!canManageRoles ? handleInputChange : undefined}
              disabled={canManageRoles}
              className={`w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none ${canManageRoles ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="">-- Select Fiscal Year --</option>
              {fiscalYears.map((fy, i) => <option key={i} value={fy}>{fy}</option>)}
            </select>
          </div>

          {/* Plan Type */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Plan Type</label>
            <select
              name="planType"
              value={formData.planType}
              onChange={!canManageRoles ? handleInputChange : undefined}
              disabled={canManageRoles}
              className={`w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none ${canManageRoles ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="">-- Select Modal --</option>
              <option value="YEARLY">YEARLY</option>
              <option value="QUARTERLY">QUARTERLY</option>
            </select>
          </div>

          {/* Quarter */}
          {formData.planType === 'QUARTERLY' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[9px] font-bold uppercase text-amber-500 tracking-[0.2em] ml-1">Select Quarter</label>
              <select
                name="quarter"
                value={formData.quarter}
                onChange={!canManageRoles ? handleInputChange : undefined}
                disabled={canManageRoles}
                className={`w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none ${canManageRoles ? 'bg-slate-100 cursor-not-allowed' : 'bg-amber-50/50 border-amber-200'}`}
              >
                <option value="">-- Select Quarter --</option>
                <option value="Q1">Quarter 1 (Q1)</option>
                <option value="Q2">Quarter 2 (Q2)</option>
                <option value="Q3">Quarter 3 (Q3)</option>
                <option value="Q4">Quarter 4 (Q4)</option>
              </select>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit p-6 space-y-5">
          {/* Building Type */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Building Type</label>
            <select
              name="buildingType"
              value={formData.buildingType}
              onChange={!canManageRoles ? handleInputChange : undefined}
              disabled={canManageRoles}
              className={`w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none ${canManageRoles ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="">-- Select Type --</option>
              <option value="FACTORY">FACTORY</option>
              <option value="HOUSEHOLD">HOUSEHOLD</option>
              <option value="FENCE">FENCE</option>
            </select>
          </div>

          {/* Target Value */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Target Value</label>
            <input
              name="target"
              type="number"
              min={1}
              value={formData.target}
              onChange={!canManageRoles ? handleInputChange : undefined}
              readOnly={canManageRoles}
              className={`w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none ${canManageRoles ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 border-slate-200'}`}
              placeholder="Enter target value"
            />
          </div>

          {/* Achieved - visible only if canManageRoles */}
          {isEdit && canManageRoles && (
            <>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Achieved Value</label>
              <input
                name="achieved"
                type="number"
                min={0}
                value={formData.achieved}
                onChange={handleInputChange}
                placeholder="Enter achieved value"
                className="w-full text-sm font-semibold px-4 py-3 border rounded-xl outline-none bg-slate-50 border-slate-200"
              />
            </div>

            {/* Performance Document - visible only if canManageRoles */}
          
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-fit">
              <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                <Description className="text-slate-400" fontSize="small" />
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">License & Artifacts</span>
              </div>
              <div className="p-8 space-y-6">
                <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center hover:border-[#0284C7] transition-colors relative cursor-pointer group bg-slate-50/20">
                  <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setPerformanceDocument(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadFile className="text-slate-300 group-hover:text-[#0284C7] mb-3" style={{ fontSize: 48 }} />
                  <p className="text-xs font-bold text-slate-500 group-hover:text-[#0284C7]">Supporting Document</p>
                  <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-tighter">Supported: PDF, Images, Word</p>
                </div>

                {(performanceDocument || existingFile) && (
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${performanceDocument ? 'bg-sky-50 border-sky-100' : 'bg-slate-50 border-slate-100'}`}>
                    <Description className={performanceDocument ? 'text-[#0284C7]' : 'text-slate-400'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{performanceDocument ? performanceDocument.name : existingFile}</p>
                      <p className="text-[9px] font-black uppercase text-[#0284C7]">{performanceDocument ? 'Ready to sync' : 'Stored in cloud'}</p>
                    </div>
                    {performanceDocument && <Close onClick={() => setPerformanceDocument(null)} className="cursor-pointer text-slate-400 hover:text-red-500" style={{ fontSize: 16 }} />}
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