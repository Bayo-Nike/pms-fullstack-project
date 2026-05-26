// import React, { useState, useEffect } from 'react';
// import {
//     AccountTree,
//     Person,
//     VerifiedUser,
//     Circle
// } from '@mui/icons-material';
// import dashboardApi from '../../api/modules/dashboard';
// import AlertMessage from '../../components/Reusable/AlertMessage';
// import { useAuth } from "../../context/AuthContext";

// const Reportees = () => {
//     const { user } = useAuth();
//     const [reportees, setReportees] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

//     // LIGHT BRAND PALETTE
//     const brandStyles = [
//         { border: 'border-blue-100', text: 'text-blue-600', dot: 'text-blue-400', accent: 'bg-blue-500' },
//         { border: 'border-green-100', text: 'text-green-600', dot: 'text-green-400', accent: 'bg-green-500' },
//         { border: 'border-orange-100', text: 'text-orange-600', dot: 'text-orange-400', accent: 'bg-orange-500' },
//     ];

//     useEffect(() => {
//         const fetchReportees = async () => {
//             try {
//                 const res = await dashboardApi.getMyReportees();
//                 setReportees(res.data.data || []);
//             } catch (err) {
//                 setAlert({ show: true, type: 'error', message: 'Sync failed.' });
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchReportees();
//     }, []);

//     if (loading) return (
//         <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
//             <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
//             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Mapping Team...</p>
//         </div>
//     );

//     return (
//         <div className="w-full space-y-12 pb-20 px-4 animate-fadeIn">
//             <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

//             {/* Header */}
//             <div className="flex items-center justify-center pt-10">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
//                         <AccountTree fontSize="small" />
//                     </div>
//                     <div>
//                         <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Level</h1>
//                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Hierarchy</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Tree Structure */}
//             <div className="flex flex-col items-center">
//                 {/* SUPERVISOR (Current User) */}
//                 <div className="relative flex flex-col items-center">
//                     <div className="bg-white px-8 py-4 rounded-[24px] shadow-xl shadow-slate-200/50 flex items-center gap-4 z-10 border border-slate-100 group">
//                         <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
//                             <Person />
//                         </div>
//                         <div>
//                             <p className="text-[8px] font-black text-blue-500 uppercase tracking-[2px] mb-0.5">Primary Supervisor</p>
//                             <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
//                                 {user?.fullName || "Administrative Lead"}
//                             </p>
//                         </div>
//                         <VerifiedUser className="text-emerald-500 ml-2" style={{ fontSize: 18 }} />
//                     </div>

//                     {/* Vertical Stem */}
//                     <div className="w-px h-16 bg-slate-200"></div>
//                 </div>

//                 {/* Reportee Grid */}
//                 <div className="w-full relative">
//                     {/* Horizontal Connector bar */}
//                     {reportees.length > 1 && (
//                         <div className="absolute top-0 left-[15%] right-[15%] h-px bg-slate-200"></div>
//                     )}

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0 max-w-7xl mx-auto">
//                         {reportees.map((reportee, index) => {
//                             const brand = brandStyles[index % brandStyles.length];
//                             return (
//                                 <div key={reportee.employeeId} className="flex flex-col items-center group">
//                                     {/* Connector Line */}
//                                     <div className="w-px h-10 bg-slate-200 group-hover:bg-slate-300"></div>

//                                     {/* Light Node Card */}
//                                     <div className={`w-full bg-white p-4 rounded-2xl border ${brand.border} shadow-sm hover:shadow-md transition-all flex items-center gap-3.5 relative overflow-hidden`}>

//                                         {/* Colored Side Accent */}
//                                         <div className={`absolute left-0 top-0 bottom-0 w-1 ${brand.accent}`}></div>

//                                         <div className="flex-1 min-w-0">
//                                             <h3 className="text-[11px] font-black text-slate-800 uppercase truncate leading-none">
//                                                 {reportee.employeeName}
//                                             </h3>
//                                             <div className="flex items-center gap-1.5 mt-2">
//                                                 <Circle className={`${brand.dot}`} style={{ fontSize: 6 }} />
//                                                 <p className={`text-[9px] font-bold uppercase tracking-tight truncate ${brand.text}`}>
//                                                     {reportee.employeePositionName}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <div className="h-10"></div>
//                                 </div>
//                             );
//                         })}
//                     </div>

//                     {reportees.length === 0 && (
//                         <div className="text-center py-10 opacity-40 italic text-[10px] font-bold uppercase tracking-widest text-slate-400">
//                             No direct reportees found
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Reportees;


import React, { useState, useEffect } from 'react';
import { 
    AccountTree, 
    Person, 
    ExpandMore, 
    ChevronRight, 
    Circle 
} from '@mui/icons-material';
import dashboardApi from '../../api/modules/dashboard';
import AlertMessage from '../../components/Reusable/AlertMessage';

const COLORS = [
    { text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'text-blue-400' },
    { text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'text-emerald-400' },
    { text: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', dot: 'text-orange-400' },
    { text: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', dot: 'text-purple-400' },
    { text: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', dot: 'text-rose-400' },
    { text: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100', dot: 'text-cyan-400' },
];

const TreeNode = ({ node, level = 0, siblingIndex = 0 }) => {
    const [isOpen, setIsOpen] = useState(level === 0);
    const hasChildren = node.children && node.children.length > 0;
    const theme = COLORS[siblingIndex % COLORS.length];

    return (
        <div className="flex flex-col ml-6 md:ml-12 border-l border-slate-200">
            <div className="relative flex items-center py-2">
                <div className="absolute left-0 w-6 md:w-12 h-px bg-slate-200"></div>
                
                <div className={`
                    ml-6 md:ml-12 flex items-center gap-3 p-3 rounded-xl border bg-white transition-all w-full max-w-md
                    ${level === 0 ? 'border-blue-200 shadow-md ring-4 ring-blue-50/50' : `${theme.border} shadow-sm`}
                    hover:border-slate-400
                `}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${level === 0 ? 'bg-blue-600 text-white' : `${theme.bg} ${theme.text}`}`}>
                        <Person fontSize="small" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-800 uppercase truncate">
                            {node.employeeName}
                        </p>
                        <div className="flex items-center gap-1">
                            <Circle className={level === 0 ? 'text-blue-400' : theme.dot} style={{ fontSize: 6 }} />
                            <p className={`text-[9px] font-bold uppercase tracking-tight truncate ${level === 0 ? 'text-blue-500' : theme.text}`}>
                                {node.employeePositionName}
                            </p>
                        </div>
                    </div>

                    {hasChildren && (
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
                        >
                            {isOpen ? <ExpandMore /> : <ChevronRight />}
                        </button>
                    )}
                </div>
            </div>

            {hasChildren && isOpen && (
                <div className="flex flex-col">
                    {node.children.map((child, index) => (
                        <TreeNode 
                            key={child.employeePositionId} 
                            node={child} 
                            level={level + 1} 
                            siblingIndex={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Reportees = () => {
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const res = await dashboardApi.getMyReportees();
                setTreeData(res.data.data);
            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Failed to map hierarchy' });
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, []);

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Loading Hierarchy...</p>
        </div>
    );

    return (
        <div className="w-full space-y-8 pb-20 px-4 animate-fadeIn">
            <AlertMessage 
                show={alert.show} 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert({ ...alert, show: false })} 
            />

            <div className="flex items-center justify-center pt-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 shadow-sm text-slate-900 rounded-2xl flex items-center justify-center">
                        <AccountTree fontSize="medium" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Structure</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[2px]">Organizational Hierarchy</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-slate-50/30 p-6 md:p-10 rounded-[40px] border border-slate-100/50">
                {treeData ? (
                    <div className="-ml-6 md:-ml-12">
                        <TreeNode node={treeData} level={0} siblingIndex={0} />
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-40 italic text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        No reportees found in your chain
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reportees;