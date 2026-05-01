import React, { useState, useEffect } from 'react';
import {
    AccountTree,
    Person,
    VerifiedUser,
    Circle
} from '@mui/icons-material';
import dashboardApi from '../../api/modules/dashboard';
import AlertMessage from '../../components/Reusable/AlertMessage';
import { useAuth } from "../../context/AuthContext";

const Reportees = () => {
    const { user } = useAuth();
    const [reportees, setReportees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    // LIGHT BRAND PALETTE
    const brandStyles = [
        { border: 'border-blue-100', text: 'text-blue-600', dot: 'text-blue-400', accent: 'bg-blue-500' },
        { border: 'border-green-100', text: 'text-green-600', dot: 'text-green-400', accent: 'bg-green-500' },
        { border: 'border-orange-100', text: 'text-orange-600', dot: 'text-orange-400', accent: 'bg-orange-500' },
    ];

    useEffect(() => {
        const fetchReportees = async () => {
            try {
                const res = await dashboardApi.getMyReportees();
                setReportees(res.data.data || []);
            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Sync failed.' });
            } finally {
                setLoading(false);
            }
        };
        fetchReportees();
    }, []);

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Mapping Team...</p>
        </div>
    );

    return (
        <div className="w-full space-y-12 pb-20 px-4 animate-fadeIn">
            <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

            {/* Header */}
            <div className="flex items-center justify-center pt-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
                        <AccountTree fontSize="small" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Level</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Hierarchy</p>
                    </div>
                </div>
            </div>

            {/* Tree Structure */}
            <div className="flex flex-col items-center">
                {/* SUPERVISOR (Current User) */}
                <div className="relative flex flex-col items-center">
                    <div className="bg-white px-8 py-4 rounded-[24px] shadow-xl shadow-slate-200/50 flex items-center gap-4 z-10 border border-slate-100 group">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Person />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[2px] mb-0.5">Primary Supervisor</p>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                {user?.fullName || "Administrative Lead"}
                            </p>
                        </div>
                        <VerifiedUser className="text-emerald-500 ml-2" style={{ fontSize: 18 }} />
                    </div>

                    {/* Vertical Stem */}
                    <div className="w-px h-16 bg-slate-200"></div>
                </div>

                {/* Reportee Grid */}
                <div className="w-full relative">
                    {/* Horizontal Connector bar */}
                    {reportees.length > 1 && (
                        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-slate-200"></div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0 max-w-7xl mx-auto">
                        {reportees.map((reportee, index) => {
                            const brand = brandStyles[index % brandStyles.length];
                            return (
                                <div key={reportee.employeeId} className="flex flex-col items-center group">
                                    {/* Connector Line */}
                                    <div className="w-px h-10 bg-slate-200 group-hover:bg-slate-300"></div>

                                    {/* Light Node Card */}
                                    <div className={`w-full bg-white p-4 rounded-2xl border ${brand.border} shadow-sm hover:shadow-md transition-all flex items-center gap-3.5 relative overflow-hidden`}>

                                        {/* Colored Side Accent */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${brand.accent}`}></div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[11px] font-black text-slate-800 uppercase truncate leading-none">
                                                {reportee.employeeName}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <Circle className={`${brand.dot}`} style={{ fontSize: 6 }} />
                                                <p className={`text-[9px] font-bold uppercase tracking-tight truncate ${brand.text}`}>
                                                    {reportee.employeePositionName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-10"></div>
                                </div>
                            );
                        })}
                    </div>

                    {reportees.length === 0 && (
                        <div className="text-center py-10 opacity-40 italic text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            No direct reportees found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reportees;