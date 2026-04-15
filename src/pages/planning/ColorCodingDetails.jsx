import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack, LocationCity, Description, InsertDriveFile, Search,
  GridView, List, Download, OpenInNew, Visibility,
  ChevronLeft, ChevronRight, FilterList,
  PushPin, History as HistoryIcon,
  Edit
} from '@mui/icons-material';

import AlertMessage from '../../components/Reusable/AlertMessage';
import colorCodingApi from '../../api/modules/colorCoding';
import adminApi from '../../api/modules/admin';
import { useAuth } from '../../context/AuthContext';

export default function ViewTarget() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { can } = useAuth();

  const [data, setData] = useState(null);
  const [parentCityName, setParentCityName] = useState('...');
  const [loading, setLoading] = useState(true);
  
  // State renamed to avoid window.history conflict
  const [achievementLogs, setAchievementLogs] = useState([]); 
  const [editingLogId, setEditingLogId] = useState(null); // NEW: Tracks if we are editing
   
  const [viewMode, setViewMode] = useState('list');
  const [docSearch, setDocSearch] = useState('');
  const [docPage, setDocPage] = useState(1);
  const docsPerPage = 10;

  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);

  const canSendColorCodingAchievement = can('CAN_SEND_COLOR_CODING_ACHIEVEMENT');
  const canReviewColorCodingAchievement = can('CAN_REVEW_COLOR_CODING_ACHIEVEMENT');

  // BEGIND ACHIEVEMENT PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = achievementLogs.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(achievementLogs.length / rowsPerPage);
  // END ACHIEVEMENT PAGINATION


  const [achievementForm, setAchievementForm] = useState({
    achieved: 1,
    senderFeedback: '',
    reviewerFeedback: '',
    locations: [{ latitude: '', longitude: '' }]
  });

  const loadData = async () => {
    try {
      const [cityRes, res, historyRes] = await Promise.all([
        adminApi.GET_CITY(),
        colorCodingApi.GET_COLOR_CODING(id),
        colorCodingApi.GET_ACHIEVEMENT_HISTORY(id)
      ]);
  
      setParentCityName(cityRes.data || cityRes || "Main Municipality");
      setData(res.data?.data || res.data || res);
  
      const historyData = historyRes.data?.data || historyRes.data || historyRes;
  
      if (Array.isArray(historyData)) {
        setAchievementLogs(historyData);
      } else {
        setAchievementLogs([]);
      }
    } catch (err) {
      console.error("Load Error:", err);
      setAlert({ show: true, type: 'error', message: 'Failed to load details.' });
      setAchievementLogs([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const addLocation = () => {
    setAchievementForm(prev => ({
      ...prev,
      locations: [...prev.locations, { latitude: '', longitude: '' }],
      achieved: prev.locations.length + 1
    }));
  };
  
  const removeLocation = (index) => {
    if (achievementForm.locations.length === 1) return;
    setAchievementForm(prev => {
      const updated = prev.locations.filter((_, i) => i !== index);
      return { ...prev, locations: updated, achieved: updated.length };
    });
  };
  
  const updateLocation = (index, field, value) => {
    const updated = [...achievementForm.locations];
    updated[index][field] = value;
    setAchievementForm(prev => ({ ...prev, locations: updated }));
  };

  const filteredDocs = useMemo(() => {
    if (!data?.performanceDocuments) return [];
    return data.performanceDocuments.filter(doc => 
      doc.fileName.toLowerCase().includes(docSearch.toLowerCase())
    );
  }, [data?.performanceDocuments, docSearch]);

  const paginatedDocs = useMemo(() => {
    const start = (docPage - 1) * docsPerPage;
    return filteredDocs.slice(start, start + docsPerPage);
  }, [filteredDocs, docPage]);

  const totalDocPages = Math.ceil(filteredDocs.length / docsPerPage);

  const getFileUrl = (fileName) => `http://localhost:8080/api/colorCodes/download/${fileName}`;

  // NEW: Function to open modal in EDIT mode
  const handleEditAchievement = (row) => {
    setEditingLogId(row.id);
    setAchievementForm({
      achieved: row.locations?.length || 0,
      senderFeedback: row.senderFeedback || '',
      reviewerFeedback: row.reviewerFeedback || '',
      locations: row.locations?.map(loc => ({
        latitude: loc.latitude.toString(),
        longitude: loc.longitude.toString()
      })) || [{ latitude: '', longitude: '' }]
    });
    setIsAchievementModalOpen(true);
  };

  // NEW: Function to close modal and reset state
  const closeModal = () => {
    setIsAchievementModalOpen(false);
    setEditingLogId(null);
    setAchievementForm({ achieved: 1, senderFeedback: '', reviewerFeedback:'', locations: [{ latitude: '', longitude: '' }] });
  };

  const handleSubmitAchievement = async () => {
    try {
      const invalid = achievementForm.locations.some(loc => !loc.latitude || !loc.longitude);
      if (invalid) {
        return setAlert({ show: true, type: 'warning', message: 'All locations must have coordinates' });
      }
  
      const payload = {
        colorCodingId: id,
        achieved: achievementForm.locations.length,
        locations: achievementForm.locations.map(loc => ({
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude)
        })),
        senderFeedback: achievementForm.senderFeedback,
        reviewerFeedback:achievementForm.reviewerFeedback,
      };
  
      if (editingLogId) {
        // CALL UPDATE API
        await colorCodingApi.UPDATE_ACHIEVEMENT(editingLogId, payload);
      } else {
        // CALL CREATE API
        await colorCodingApi.SUBMIT_ACHIEVEMENT(payload);
      }

      closeModal();
      setAlert({ show: true, type: 'success', message: editingLogId ? 'Achievement updated!' : 'Achievement submitted!' });
      loadData(); 
    } catch (err) {
      setAlert({ show: true, type: 'error', message: 'Operation failed' });
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-400">Loading Registry Data...</div>;
  if (!data) return null;

  return (
    <div className="w-full space-y-4 pb-6 px-4 animate-fadeIn h-screen overflow-hidden flex flex-col bg-slate-50/50">
      <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

      {/* GLOBAL HEADER */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/planning/ColorCodings')} className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-slate-600">
            <ArrowBack fontSize="small" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">Registry Detailed View</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Ref ID: #{id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: SUMMARY */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto pr-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-8">
             <SectionTitle icon={<LocationCity fontSize="inherit"/>} title="Geography" />
             <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">Municipality</p>
                <p className="text-sm font-bold text-slate-800">{parentCityName}</p>
                <p className="text-[11px] font-black text-sky-600 mt-2 bg-sky-100/50 px-3 py-1.5 rounded-full inline-block uppercase">{data.subCity?.subCityName}</p>
             </div>

             <SectionTitle icon={<FilterList fontSize="inherit"/>} title="Classification" />
             <div className="grid grid-cols-1 gap-4">
                <DataBlock label="Fiscal Year" value={data.fiscalYear} />
                <DataBlock label="Building Category" value={data.buildingType} />
                <DataBlock label="Planning Cycle" value={data.planType} />
                {data.planType === 'QUARTERLY' && <DataBlock label="Target Quarter" value={data.quarter} color="text-amber-600" />}
             </div>

             <SectionTitle icon={<Visibility fontSize="inherit"/>} title="Performance" />
             <div className="relative p-5 bg-slate-900 rounded-[2rem] text-white overflow-hidden shadow-xl">
                <div className="relative z-10 flex justify-between items-center">
                  <div><p className="text-[9px] font-bold text-slate-400 uppercase">Target</p><p className="text-3xl font-black">{data.target}</p></div>
                  <div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Achieved</p>
                    <p className={`text-3xl font-black ${Number(data.achieved) >= Number(data.target) ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {data.achieved || 0}
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DATA TABLES */}
        <div className="lg:col-span-9 flex flex-col gap-6 overflow-y-auto pb-10 pr-2">
          
          {/* ARTIFACT VAULT */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0 min-h-[350px]">
            <div className="p-5 border-b bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-sky-500 p-2 rounded-xl text-white"><Description fontSize="small" /></div>
                <h3 className="text-sm font-black text-slate-800 uppercase">Artifact Vault ({data.performanceDocuments?.length || 0})</h3>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                  <input 
                    type="text" placeholder="Search files..." 
                    className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-2 ring-sky-100 w-full sm:w-64"
                    value={docSearch} onChange={(e) => setDocSearch(e.target.value)}
                  />
                </div>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}><GridView style={{ fontSize: 18 }} /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}><List style={{ fontSize: 18 }} /></button>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1">
              {paginatedDocs.length === 0 ? (
                <div className="py-12 text-center text-slate-300 italic font-bold uppercase">No records found</div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedDocs.map((doc, idx) => <GridItem key={doc.id || idx} doc={doc} url={getFileUrl(doc.fileName)} />)}
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50">
                  {paginatedDocs.map((doc, idx) => (
                    <ListItem key={doc.id || idx} doc={doc} url={getFileUrl(doc.fileName)} index={(docPage-1)*docsPerPage + idx + 1} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50/50 flex justify-between items-center shrink-0">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {docPage} of {totalDocPages || 1}</p>
               <div className="flex items-center gap-2">
                  <button disabled={docPage === 1} onClick={() => setDocPage(p => p - 1)} className="p-1.5 bg-white border rounded-lg disabled:opacity-30"><ChevronLeft fontSize="small" /></button>
                  <button disabled={docPage === totalDocPages || totalDocPages === 0} onClick={() => setDocPage(p => p + 1)} className="p-1.5 bg-white border rounded-lg disabled:opacity-30"><ChevronRight fontSize="small" /></button>
               </div>
            </div>
          </div>

          {/* ACHIEVEMENT LOGS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0 min-h-[350px]">
            <div className="p-5 border-b bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-md shadow-emerald-100"><HistoryIcon fontSize="small" /></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Achievement Logs History</h3>
              </div>
 
              {(canSendColorCodingAchievement) && (
                <button
                  onClick={() => setIsAchievementModalOpen(true)}
                  className="bg-[#0284C7] hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-[11px] font-black shadow-lg shadow-sky-100 transition-all flex items-center gap-2 shrink-0"
                >
                  <PushPin style={{ fontSize: 16 }} /> Submit New Achievement
                </button>
                )}
            </div>

            <div className="w-full overflow-x-auto">
              <table className="min-w-max text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase">
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Sender Feedback</th>
                    <th className="px-6 py-4 text-center">Batch Volume</th>
                    <th className="px-6 py-4">Location Coordinates</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!achievementLogs || achievementLogs.length === 0 ? (
                    <tr><td colSpan="5" className="py-20 text-center text-slate-300 italic text-xs font-bold uppercase tracking-widest">No logs available</td></tr>
                  ) : (
                    achievementLogs.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors text-xs">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-slate-700">{new Date(row.submittedDate).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-400">{new Date(row.submittedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600 italic max-w-xs truncate" title={row.senderFeedback}>{row.senderFeedback || 'No feedback'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black text-[10px]">+{row.locations?.length || 0}</span>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="max-h-[110px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="flex gap-2 overflow-x-auto">
                              {row.locations?.map((loc, idx) => (
                                <a 
                                  key={idx}
                                  href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 pl-2 pr-1 py-1 bg-slate-50 border border-slate-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-all group shrink-0"
                                >
                                  <span className="text-[10px] font-mono text-slate-600">
                                    {Number(loc.latitude).toFixed(5)}, {Number(loc.longitude).toFixed(5)}
                                  </span>
                                  <div className="bg-white p-0.5 rounded border border-slate-200 text-sky-600 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 transition-colors">
                                    <Visibility style={{ fontSize: 10 }} />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleEditAchievement(row)}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Edit style={{ fontSize: 16 }} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* PAGINATION */}
            {achievementLogs.length > 0 && (
              <div className="flex justify-between items-center mt-4 text-xs">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(p - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(p + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-black text-slate-800">
                {editingLogId ? 'Update Achievement Result' : 'New Achievement Entry'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Current Batch Quantity</label>
                <input type="number" value={achievementForm.achieved} readOnly className="w-full bg-slate-50 rounded-2xl px-5 py-3 mt-1 font-bold border-none" />
              </div>
              <div className="col-span-2 space-y-3">
              
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase">GPS Location Logs</h3>
              {canSendColorCodingAchievement && (
              <button onClick={addLocation} className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px]">+ Add Coordinate</button>
              )}
            </div>
                              
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {achievementForm.locations.map((loc, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl">
                      <input placeholder="Lat" value={loc.latitude} onChange={(e) => updateLocation(index, 'latitude', e.target.value)} className="bg-white rounded-xl px-3 py-2 text-xs w-full border-none" />
                      <input placeholder="Lng" value={loc.longitude} onChange={(e) => updateLocation(index, 'longitude', e.target.value)} className="bg-white rounded-xl px-3 py-2 text-xs w-full border-none" />
                      {canSendColorCodingAchievement && (
                      <button onClick={() => removeLocation(index)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* SENDER FEEDBACK */}
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Sender Feedback {!canSendColorCodingAchievement && <span className="text-amber-500 font-bold">(Read Only)</span>}
                </label>
                <textarea 
                  rows={3} 
                  value={achievementForm.senderFeedback} 
                  onChange={(e) => setAchievementForm({ ...achievementForm, senderFeedback: e.target.value })} 
                  readOnly={!canSendColorCodingAchievement} // LOCKING LOGIC
                  className={`w-full rounded-2xl px-5 py-3 mt-1 text-xs outline-none border-none transition-colors ${
                    !canSendColorCodingAchievement ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'
                  }`} 
                  placeholder={canSendColorCodingAchievement ? "Enter Sender notes..." : "No sender notes provided."} 
                />
              </div>

              {/* REVIEWER FEEDBACK (Visible only during Edit) */}
              {editingLogId && (
                <div className="col-span-2 animate-fadeIn">
                  <label className="text-[10px] font-black text-emerald-600 uppercase ml-1">
                    Reviewer Feedback {!canReviewColorCodingAchievement && <span className="text-amber-500 font-bold">(Read Only)</span>}
                  </label>
                  <textarea 
                    rows={3} 
                    value={achievementForm.reviewerFeedback} 
                    onChange={(e) => setAchievementForm({ ...achievementForm, reviewerFeedback: e.target.value })} 
                    readOnly={!canReviewColorCodingAchievement} // LOCKING LOGIC
                    className={`w-full rounded-2xl px-5 py-3 mt-1 text-xs outline-none transition-colors ${
                      !canReviewColorCodingAchievement 
                        ? 'bg-slate-100 text-slate-500 border-none cursor-not-allowed' 
                        : 'bg-emerald-50/50 border border-emerald-100 focus:ring-2 ring-emerald-200'
                    }`} 
                    placeholder={canReviewColorCodingAchievement ? "Enter Reviewer notes..." : "Waiting for review..."} 
                  />
                </div>
              )}

            </div>
            <button onClick={handleSubmitAchievement} className="w-full bg-[#0284C7] text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-sky-700 transition-all">
              {editingLogId ? 'Update Result' : 'Submit Registration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers (Remain unchanged)
const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2 border-b border-slate-50 pb-2 mb-2">
    <span className="text-[#0284C7]">{icon}</span>
    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{title}</h3>
  </div>
);

const DataBlock = ({ label, value, color="text-slate-700" }) => (
  <div className="mb-2">
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
        <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">File #{index}</p>
      </div>
    </div>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <a href={url} target="_blank" rel="noreferrer" className="p-2 text-[#0284C7] hover:bg-sky-50 rounded-lg transition-colors"><OpenInNew style={{ fontSize: 18 }} /></a>
      <a href={url} download className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><Download style={{ fontSize: 18 }} /></a>
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
    <div className="p-2 text-center text-[10px] font-bold text-slate-700 truncate">{doc.fileName}</div>
  </div>
);