import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack, LocationCity, Description, InsertDriveFile, Search,
  GridView, List, Download, OpenInNew, Visibility,
  ChevronLeft, ChevronRight, FilterList,
  Assignment
} from '@mui/icons-material';

import AlertMessage from '../../components/Reusable/AlertMessage';
import colorCodingApi from '../../api/modules/colorCoding';
import adminApi from '../../api/modules/admin';

export default function ViewTarget() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [parentCityName, setParentCityName] = useState('...');
  const [loading, setLoading] = useState(true);
  
  // UNLIMITED FILE HANDLING STATES
  const [viewMode, setViewMode] = useState('list');
  const [docSearch, setDocSearch] = useState('');
  const [docPage, setDocPage] = useState(1);
  const docsPerPage = 10; // Controls how many rows render at once to save memory

  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);

  const [achievementForm, setAchievementForm] = useState({
    achieved: 1,
    feedback: '',
    locations: [{ latitude: '', longitude: '' }]
  });

  const addLocation = () => {
    setAchievementForm(prev => ({
      ...prev,
      locations: [...prev.locations, { latitude: '', longitude: '' }]
    }));
  };
  
  
  const removeLocation = (index) => {
    if (achievementForm.locations.length === 1) return;
  
    setAchievementForm(prev => {
      const updated = prev.locations.filter((_, i) => i !== index);
      return {
        ...prev,
        locations: updated,
        achieved: updated.length
      };
    });
  };
  
  const updateLocation = (index, field, value) => {
    const updated = [...achievementForm.locations];
    updated[index][field] = value;
  
    setAchievementForm(prev => ({
      ...prev,
      locations: updated,
      achieved: updated.length
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cityRes, res] = await Promise.all([
          adminApi.GET_CITY(),
          colorCodingApi.GET_COLOR_CODING(id)
        ]);
        setParentCityName(cityRes.data || cityRes || "Main Municipality");
        setData(res.data?.data || res.data || res);
      } catch (err) {
        setAlert({ show: true, type: 'error', message: 'Failed to load details.' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 1. FILTER: Search through the "unlimited" list
  const filteredDocs = useMemo(() => {
    if (!data?.performanceDocuments) return [];
    return data.performanceDocuments.filter(doc => 
      doc.fileName.toLowerCase().includes(docSearch.toLowerCase())
    );
  }, [data?.performanceDocuments, docSearch]);

  // 2. PAGINATE: Only render a slice of the list for performance
  const paginatedDocs = useMemo(() => {
    const start = (docPage - 1) * docsPerPage;
    return filteredDocs.slice(start, start + docsPerPage);
  }, [filteredDocs, docPage]);

  const totalDocPages = Math.ceil(filteredDocs.length / docsPerPage);

  // Reset to page 1 when searching
  useEffect(() => { setDocPage(1); }, [docSearch]);

  const getFileUrl = (fileName) => `http://localhost:8080/api/colorCodes/download/${fileName}`;

  if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-400">Loading High-Volume Data...</div>;
  if (!data) return null;

  const handleSubmitAchievement = async () => {
    try {
      const invalid = achievementForm.locations.some(
        loc => !loc.latitude || !loc.longitude
      );
  
      if (invalid) {
        return setAlert({
          show: true,
          type: 'warning',
          message: 'All locations must have latitude and longitude'
        });
      }
  
      const payload = {
        colorCodingId: id,
        achieved: achievementForm.locations.length,
        locations: achievementForm.locations.map(loc => ({
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude)
        })),
        feedback: achievementForm.feedback,
      };
  
      await colorCodingApi.SUBMIT_ACHIEVEMENT(payload);
  
      setIsAchievementModalOpen(false);
  
      setAlert({
        show: true,
        type: 'success',
        message: 'Achievement submitted successfully'
      });
  
      setAchievementForm({
        achieved: 1,
        feedback: '',
        locations: [{ latitude: '', longitude: '' }]
      });
  
    } catch (err) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Submission failed'
      });
    }
  };

  return (
    <div className="w-full space-y-4 pb-10 px-2 animate-fadeIn h-screen overflow-hidden flex flex-col">
      <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/planning/ColorCodings')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowBack fontSize="small" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">Target Registry Details</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Archive ID: #{id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: Summary Info */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-1 pb-10">
          <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-6">
             <SectionTitle icon={<LocationCity fontSize="inherit"/>} title="Geography" />
             <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Municipality</p>
                <p className="text-sm font-bold text-slate-700">{parentCityName}</p>
                <p className="text-xs font-black text-[#0284C7] bg-sky-50 px-2 py-1 rounded inline-block uppercase mt-1">{data.subCity?.subCityName}</p>
             </div>

             <SectionTitle icon={<FilterList fontSize="inherit"/>} title="Period & Type" />
             <div className="grid grid-cols-2 gap-4">
                <DataBlock label="Fiscal Year" value={data.fiscalYear} />
                <DataBlock label="Building Type" value={data.buildingType} />
                <DataBlock label="Plan Mode" value={data.planType} />
                {data.planType === 'QUARTERLY' && <DataBlock label="Quarter" value={data.quarter} color="text-amber-600" />}
             </div>

             <SectionTitle icon={<Visibility fontSize="inherit"/>} title="Performance" />
             <div className="flex justify-between items-end p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Target</p>
                  <p className="text-2xl font-black text-slate-800">{data.target}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Achieved</p>
                  <p className={`text-2xl font-black ${Number(data.achieved) >= Number(data.target) ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {data.achieved || 0}
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: UNLIMITED DOCUMENT VAULT */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden">
          
          {/* Internal Header: Search & Controls */}
          <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#0284C7] p-1.5 rounded-lg text-white shadow-sm"><Description style={{ fontSize: 18 }} /></div>
              <h3 className="text-xs font-black uppercase text-slate-700">Artifact Vault <span className="text-slate-400">({data.performanceDocuments?.length || 0})</span></h3>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 16 }} />
                <input 
                  type="text" placeholder="Search across all files..." 
                  className="pl-9 pr-4 py-2 border rounded-xl text-[11px] outline-none focus:border-[#0284C7] w-full sm:w-56 bg-white"
                  value={docSearch} onChange={(e) => setDocSearch(e.target.value)}
                />
              </div>
              <div className="flex border rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-[#0284C7] text-white' : 'text-slate-400'}`}><GridView style={{ fontSize: 18 }} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-[#0284C7] text-white' : 'text-slate-400'}`}><List style={{ fontSize: 18 }} /></button>
              </div>
            </div>
          </div>

          {/* Scrollable Container for Documents */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/10">
            {paginatedDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <InsertDriveFile style={{ fontSize: 64 }} className="opacity-10 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest italic">No files found</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedDocs.map((doc, idx) => (
                  <GridItem key={doc.id || idx} doc={doc} url={getFileUrl(doc.fileName)} />
                ))}
              </div>
            ) : (
              <div className="bg-white border rounded-2xl overflow-hidden divide-y divide-slate-50">
                {paginatedDocs.map((doc, idx) => (
                  <ListItem key={doc.id || idx} doc={doc} url={getFileUrl(doc.fileName)} index={(docPage-1)*docsPerPage + idx + 1} />
                ))}
              </div>
            )}
          </div>

          {/* INTERNAL PAGINATION FOOTER (The key to unlimited files) */}
          <div className="px-6 py-3 border-t bg-white flex justify-between items-center shrink-0">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing {Math.min(filteredDocs.length, (docPage-1)*docsPerPage + 1)}-{Math.min(filteredDocs.length, docPage*docsPerPage)} of {filteredDocs.length}
             </p>
             <div className="flex items-center gap-2">
                <button 
                  disabled={docPage === 1} onClick={() => setDocPage(p => p - 1)}
                  className="p-1 border rounded-lg disabled:opacity-30 hover:bg-slate-50"
                ><ChevronLeft fontSize="small" /></button>
                <span className="text-[10px] font-black text-slate-600">{docPage} / {totalDocPages || 1}</span>
                <button 
                  disabled={docPage === totalDocPages || totalDocPages === 0} onClick={() => setDocPage(p => p + 1)}
                  className="p-1 border rounded-lg disabled:opacity-30 hover:bg-slate-50"
                ><ChevronRight fontSize="small" /></button>
             </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAchievementModalOpen(true)}
          className="bg-[#0284C7] text-white px-4 py-2 rounded-xl text-xs font-bold"
        >
          + Add Achievement
        </button>
      </div>

      {/* MODAL */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-6 shadow-xl">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Submit Achievement</h2>
              <button
                onClick={() => setIsAchievementModalOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* Achieved */}
            <div>
              <label className="text-xs font-bold text-slate-500">Total Achieved</label>
              <input
                type="number"
                value={achievementForm.achieved}
                readOnly
                className="w-full bg-slate-100 border rounded-xl px-4 py-2 mt-1"
              />
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700">Locations</h3>
                <button
                  onClick={addLocation}
                  className="bg-[#0284C7] text-white px-3 py-1 rounded-lg text-xs"
                >
                  + Add
                </button>
              </div>

              {achievementForm.locations.map((loc, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 items-center">
                  <input
                    placeholder="Latitude"
                    value={loc.latitude}
                    onChange={(e) => updateLocation(index, 'latitude', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-xs"
                  />

                  <input
                    placeholder="Longitude"
                    value={loc.longitude}
                    onChange={(e) => updateLocation(index, 'longitude', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-xs"
                  />

                  <button
                    onClick={() => removeLocation(index)}
                    className="text-red-500 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div>
              <label className="text-xs font-bold text-slate-500">Feedback</label>
              <textarea
                value={achievementForm.feedback}
                onChange={(e) =>
                  setAchievementForm({ ...achievementForm, feedback: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2 mt-1"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitAchievement}
              disabled={achievementForm.locations.length === 0}
              className="w-full bg-[#0284C7] text-white py-3 rounded-xl font-bold"
            >
              Submit Achievement
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2 border-b border-slate-50 pb-2 mb-2">
    <span className="text-[#0284C7]">{icon}</span>
    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{title}</h3>
  </div>
);

const DataBlock = ({ label, value, color="text-slate-700" }) => (
  <div>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
    <p className={`text-xs font-bold uppercase ${color}`}>{value || '-'}</p>
  </div>
);

const ListItem = ({ doc, url, index }) => (
  <div className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors group">
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0284C7] group-hover:text-white transition-all">
        {/\.pdf$/i.test(doc.fileName) ? <Description fontSize="small" /> : <InsertDriveFile fontSize="small" />}
      </div>
      <div className="truncate">
        <p className="text-[11px] font-bold text-slate-700 truncate">{doc.fileName}</p>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Vault #{index}</p>
      </div>
    </div>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <a href={url} target="_blank" rel="noreferrer" className="p-2 text-[#0284C7] hover:bg-sky-50 rounded-lg"><OpenInNew style={{ fontSize: 18 }} /></a>
      <a href={url} download className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><Download style={{ fontSize: 18 }} /></a>
    </div>
  </div>
);

const GridItem = ({ doc, url }) => (
  <div className="bg-white border rounded-2xl overflow-hidden hover:shadow-md hover:border-[#0284C7] transition-all group">
    <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
      {/\.(jpg|jpeg|png|webp)$/i.test(doc.fileName) ? (
        <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      ) : ( <Description className="text-slate-300" style={{ fontSize: 40 }} /> )}
      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <a href={url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-[#0284C7] hover:scale-110 transition-transform"><OpenInNew fontSize="small" /></a>
      </div>
    </div>
    <div className="p-2 text-center">
      <p className="text-[10px] font-bold text-slate-700 truncate">{doc.fileName}</p>
    </div>
  </div>
);
