import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Save,
  HelpOutline,
  LocationCity,
  Assessment
} from '@mui/icons-material';

import AlertMessage from '../../components/Reusable/AlertMessage';
import colorCodingApi from '../../api/modules/colorCoding';
import adminApi from '../../api/modules/admin';

export default function CreateTarget() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    subCityId: '',
    fiscalYear: '',
    planType: 'YEARLY',
    buildingType: 'FACTORY',
    target: '',
    achieved: ''
  });

  const [subCities, setSubCities] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [parentCityName, setParentCityName] = useState('...');

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
            planType: data.planType || 'YEARLY',
            buildingType: data.buildingType || 'FACTORY',
            target: data.target || '',
            achieved: data.achieved || ''
          });
        }
      } catch {
        showAlert('error', 'Failed loading configuration data.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveTrigger = () => {
    const { subCityId, fiscalYear, target, achieved } = formData;
    if (!subCityId) return showAlert('error', 'Sub City is required.');
    if (!fiscalYear) return showAlert('error', 'Fiscal Year is required.');
    if (!target || Number(target) <= 0) return showAlert('error', 'Target value must be greater than 0.');
    if (achieved !== '' && Number(achieved) < 0) return showAlert('error', 'Achieved value cannot be negative.');
    setShowConfirm(true);
  };

  const executeSave = async () => {
    setShowConfirm(false);
    setSaving(true);
  
    try {
      const payload = {
        // CHANGE THIS: Send subCityId directly as a number
        subCityId: Number(formData.subCityId), 
        
        fiscalYear: formData.fiscalYear,
        planType: formData.planType,
        buildingType: formData.buildingType,
        target: Number(formData.target),
        ...(isEdit && { achieved: Number(formData.achieved) })
      };
  
      if (isEdit) {
        await colorCodingApi.UPDATE_COLOR_CODING(id, payload);
        showAlert('success', 'Color Code updated successfully.');
      } else {
        await colorCodingApi.CREATE_COLOR_CODING(payload);
        showAlert('success', 'Color Code created successfully.');
      }
  
      setTimeout(() => navigate('/colorCode/ColorCodings'), 1500); // Note: check your route path
  
    } catch (err) {
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
          <button onClick={() => navigate('/colorCode/ColorCodings')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowBack fontSize="small" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">{isEdit ? 'Update Target' : 'New Color Code Target'}</h1>
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

      {/* -------- FORM -------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Work Location</label>
            <div className="flex gap-2">
              <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black flex items-center gap-2 uppercase whitespace-nowrap shadow-sm">
                <LocationCity style={{ fontSize: 16 }} /> {parentCityName}
              </div>
              <select
                name="subCityId"
                value={formData.subCityId}
                onChange={handleInputChange}
                className="flex-1 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer shadow-sm"
              >
                <option value="">-- Select Sub-City --</option>
                {subCities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Fiscal Year</label>
            <select
              name="fiscalYear"
              value={formData.fiscalYear}
              onChange={handleInputChange}
              className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer shadow-sm"
            >
              <option value="">-- Select Fiscal Year --</option>
              {fiscalYears.map((fy, i) => <option key={i} value={fy}>{fy}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Plan Type</label>
            <select
              name="planType"
              value={formData.planType}
              onChange={handleInputChange}
              className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer shadow-sm"
            >
              <option value="YEARLY">YEARLY</option>
              <option value="QUARTERLY">QUARTERLY</option>
            </select>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-fit p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Building Type</label>
            <select
              name="buildingType"
              value={formData.buildingType}
              onChange={handleInputChange}
              className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] appearance-none cursor-pointer shadow-sm"
            >
              <option value="FACTORY">FACTORY</option>
              <option value="HOUSEHOLD">HOUSEHOLD</option>
              <option value="FINCE">FINCE</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Target Value</label>
            <input
              name="target"
              type="number"
              min={1}
              value={formData.target}
              onChange={handleInputChange}
              placeholder="Enter target value"
              className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] shadow-sm"
            />
          </div>

          {/* ACHIEVED - only show during edit */}
        {isEdit && (
            <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Achieved Value</label>
            <input
                name="achieved"
                type="number"
                min={0}
                value={formData.achieved}
                onChange={handleInputChange}
                placeholder="Enter achieved value"
                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0284C7] shadow-sm"
            />
            </div>
        )}
        </div>
      </div>
    </div>
  );
}