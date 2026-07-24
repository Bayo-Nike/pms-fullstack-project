import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Add, Visibility, Edit, Delete, RateReview, 
    Category, Apartment, CheckCircle, Cancel, History
} from '@mui/icons-material';
import demandApi from '../../api/modules/demand';
import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from '../../context/AuthContext';
// import ReviewModal from './components/ReviewModal'; // Extracting modal logic

export default function DemandInitiations() {
    const navigate = useNavigate();
    const [initiations, setInitiations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedDemand, setSelectedDemand] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    
    const [pageInfo, setPageInfo] = useState({ current: 0, total: 0, size: 8 });
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const { can } = useAuth();

    const fetchInitiations = useCallback(async (page = 0) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: pageInfo.size,
                search: searchTerm.trim() || null,
                status: statusFilter || null
            };
            const res = await demandApi.GET_DEMANDS(params);
            setInitiations(res.data.content);
            setPageInfo(prev => ({
                ...prev,
                current: res.data.number,
                total: res.data.totalPages
            }));
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to load demands.' });
        } finally { setLoading(false); }
    }, [pageInfo.size, searchTerm, statusFilter]);

    useEffect(() => { fetchInitiations(0); }, [fetchInitiations]);

    const handleReviewSubmit = async (reviewData) => {
        try {
            await demandApi.REVIEW_DEMAND(selectedDemand.id, reviewData);
            setAlert({ show: true, type: 'success', message: `Demand ${reviewData.status} successfully!` });
            setIsReviewOpen(false);
            fetchInitiations(pageInfo.current);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Review submission failed.' });
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    return (
        <div className="w-full space-y-4 px-2 pb-10">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
            
            {/* Review Modal */}
            {isReviewOpen && (
                <ReviewModal 
                    demand={selectedDemand} 
                    onClose={() => setIsReviewOpen(false)} 
                    onSubmit={handleReviewSubmit} 
                />
            )}

            {/* Header Area */}
            <div className="flex items-center justify-between bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-inner"><History /></div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">External Demands</h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Project Intake Queue</p>
                    </div>
                </div>
                {
                    can('CAN_CREATE_DEMAND_INITIATION') && (
                        <button onClick={() => navigate('/demands/create')} className="bg-[#0284C7] text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                            <Add /> New Demand
                        </button>
                    )
                }
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text" placeholder="Search by title or code..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500"
                >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Demand Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b text-[9px] font-black uppercase text-slate-400">
                        <tr>
                            <th className="px-8 py-5">Demand Info</th>
                            <th className="px-6 py-5">Type/Category</th>
                            <th className="px-6 py-5">Location</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {initiations.map((demand) => (
                            <tr key={demand.id} className="hover:bg-slate-50/50 group transition-colors">
                                <td className="px-8 py-5">
                                    <p className="text-sm font-black text-slate-800">{demand.title}</p>
                                    <p className="text-[9px] text-slate-400 mt-1">{demand.demandCode}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                            <Category sx={{ fontSize: 12 }} /> {demand.demandType}
                                        </span>
                                        <span className="text-[9px] text-slate-400 uppercase">{demand.category}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[10px] font-bold text-slate-600">
                                        {demand.subCityName || 'City Level'}
                                    </div>
                                    <div className="text-[9px] text-slate-400 italic">{demand.siteLocation}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${getStatusStyle(demand.status)}`}>
                                        {demand.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    

                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {
                                            can('CAN_VIEW_DEMAND_INITIATION_DETAILS') && (
                                                <button
                                                    onClick={() => navigate(`/demands/view/${demand.id}`)}
                                                    className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-all"
                                                    title="View Details"
                                                >
                                                    <Visibility style={{ fontSize: 20 }} />
                                                </button>
                                            )
                                        }
                                        {
                                            can('CAN_EDIT_DEMAND_INITIATION') && demand.status !== 'APPROVED' &&(
                                                <button onClick={() => navigate(`/demands/edit/${demand.id}`)} className="p-2 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-all" title="Edit Registry"><Edit fontSize="small" /></button>
                                            )
                                        }
                                        {
                                            can('CAN_DELETE_DEMAND_INITIATION') && demand.status == 'PENDING' &&(
                                                <button onClick={() => setDeleteConfig({ show: true, id: demand.id, title: demand.title })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Delete fontSize="small" /></button>
                                            )
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}