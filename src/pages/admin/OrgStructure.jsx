// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import {
//     LocationCity, Apartment, AccountTree, Work, PinDrop,
//     ExpandMore, ZoomIn, ZoomOut, RestartAlt, Groups,
//     Business, Assignment, Add, Hub, Map, Schema
// } from '@mui/icons-material';
// import adminApi from '../../api/modules/admin';
// import projectApi from '../../api/modules/project';

// // --- Micro Node Component ---
// const TreeNode = ({ label, empCount, projCount, type, children, color, icon: Icon }) => {
//     const [isOpen, setIsOpen] = useState(true);
//     const hasChildren = children && children.length > 0;

//     return (
//         <div className="flex flex-col items-center">
//             <div className={`relative flex flex-col items-center p-2 rounded-xl border bg-white shadow-sm transition-all w-36 z-10 ${isOpen ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
//                 <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 shadow-sm ${color}`}>
//                     <Icon style={{ fontSize: 14, color: '#fff' }} />
//                 </div>
//                 <p className="text-[6px] font-black uppercase tracking-tighter text-slate-400 leading-none mb-0.5">{type}</p>
//                 <p className="text-[9px] font-bold text-slate-800 text-center leading-tight truncate w-full px-1 mb-1">{label}</p>

//                 <div className="flex gap-1">
//                     <div className="flex items-center gap-0.5 bg-sky-50 px-1 rounded border border-sky-100" title="Employees">
//                         <Groups style={{ fontSize: 10 }} className="text-[#0284C7]" />
//                         <span className="text-[9px] font-black text-[#0284C7]">{empCount}</span>
//                     </div>
//                     {projCount !== undefined && (
//                         <div className="flex items-center gap-0.5 bg-amber-50 px-1 rounded border border-amber-100" title="Projects">
//                             <Assignment style={{ fontSize: 10 }} className="text-[#FBAF1E]" />
//                             <span className="text-[9px] font-black text-[#FBAF1E]">{projCount}</span>
//                         </div>
//                     )}
//                 </div>

//                 {hasChildren && (
//                     <button onClick={() => setIsOpen(!isOpen)} className="absolute -bottom-2.5 bg-white border border-slate-200 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-[#0284C7] shadow-sm z-20">
//                         {isOpen ? <ExpandMore style={{ fontSize: 14 }} /> : <Add style={{ fontSize: 12 }} />}
//                     </button>
//                 )}
//             </div>
//             {hasChildren && isOpen && <div className="w-px h-6 bg-slate-200"></div>}
//             {hasChildren && isOpen && (
//                 <div className="relative flex gap-4 px-2">
//                     <div className="absolute top-0 left-0 right-0 h-px bg-slate-200 w-[calc(100%-2rem)] mx-auto"></div>
//                     {children.map((child, index) => (
//                         <div key={index} className="flex flex-col items-center relative">
//                             <div className="w-px h-4 bg-slate-200"></div>
//                             <TreeNode {...child} />
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default function OrgStructure() {
//     const [activeTab, setActiveTab] = useState('GEO');
//     const [loading, setLoading] = useState(true);
//     const [data, setData] = useState({ city: null, subCities: [], divisions: [], positions: [], locations: [], employees: [], projects: [] });
//     const [zoom, setZoom] = useState(0.8);

//     const viewportRef = useRef(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const [pan, setPan] = useState({ left: 0, top: 0, x: 0, y: 0 });

//     const onMouseDown = (e) => {
//         setIsDragging(true);
//         setPan({
//             left: viewportRef.current.scrollLeft,
//             top: viewportRef.current.scrollTop,
//             x: e.clientX,
//             y: e.clientY
//         });
//     };

//     const onMouseMove = (e) => {
//         if (!isDragging) return;
//         const dx = e.clientX - pan.x;
//         const dy = e.clientY - pan.y;
//         viewportRef.current.scrollLeft = pan.left - dx;
//         viewportRef.current.scrollTop = pan.top - dy;
//     };

//     const stopDragging = () => setIsDragging(false);

//     useEffect(() => {
//         const fetchAll = async () => {
//             try {
//                 const [cityRes, subRes, divRes, posRes, locRes, empRes, projRes] = await Promise.all([
//                     adminApi.GET_CITY(), adminApi.GET_SUB_CITIES(), adminApi.GET_DIVISIONS(),
//                     adminApi.GET_POSITIONS(), adminApi.GET_LOCATIONS(), adminApi.GET_EMPLOYEES(),
//                     projectApi.GET_PROJECTS({ size: 5000 })
//                 ]);
//                 setData({
//                     city: cityRes.data?.data || cityRes.data,
//                     subCities: subRes.data?.data || subRes.data || [],
//                     divisions: divRes.data?.data || divRes.data || [],
//                     positions: posRes.data?.data || posRes.data || [],
//                     locations: locRes.data?.data || locRes.data || [],
//                     employees: empRes.data?.data || empRes.data || [],
//                     projects: projRes.data?.data?.content || []
//                 });

//                 // --- INITIAL SCROLL POSITION ---
//                 // Wait for render, then scroll down a bit to allow "Up" dragging
//                 setTimeout(() => {
//                     if (viewportRef.current) {
//                         viewportRef.current.scrollTop = 150;
//                     }
//                 }, 500);

//             } catch (err) { console.error(err); } finally { setLoading(false); }
//         };
//         fetchAll();
//     }, []);

//     // Reset scroll when changing tabs
//     useEffect(() => {
//         if (viewportRef.current) viewportRef.current.scrollTop = 150;
//     }, [activeTab]);

//     const buildTree = (items, parentId, type, icon, color) => {
//         return items
//             .filter(item => item.parentId === parentId)
//             .map(item => ({
//                 label: item.name,
//                 type: type,
//                 icon: icon,
//                 color: color,
//                 empCount: data.employees.filter(e => e.divisionId === item.id || e.positionId === item.id).length,
//                 projCount: type === 'Division' ? data.projects.filter(p => p.divisionId === item.id).length : undefined,
//                 children: buildTree(items, item.id, type, icon, color)
//             }));
//     };

//     const treeData = useMemo(() => {
//         const { city, subCities, divisions, positions, locations, employees, projects } = data;
//         if (!city) return null;

//         switch (activeTab) {
//             case 'GEO':
//                 return {
//                     label: city.name || city, type: "Capital City", icon: LocationCity, color: "bg-slate-900",
//                     empCount: employees.length, projCount: projects.length,
//                     children: subCities.map(s => ({
//                         label: s.name, type: "Sub-City", icon: Apartment, color: "bg-[#FBAF1E]",
//                         empCount: employees.filter(e => e.subCityId === s.id).length,
//                         projCount: projects.filter(p => p.subCityId === s.id).length
//                     }))
//                 };
//             case 'DIV':
//                 return {
//                     label: "Organizational Units", type: "City Admin", icon: Business, color: "bg-purple-900",
//                     empCount: employees.length, projCount: projects.length,
//                     children: buildTree(divisions, null, "Division", Business, "bg-purple-600")
//                 };
//             case 'POS':
//                 return {
//                     label: "Professional Hierarchy", type: "Reporting Line", icon: Hub, color: "bg-blue-900",
//                     empCount: employees.length,
//                     children: buildTree(positions, null, "Position", Work, "bg-blue-600")
//                 };
//             case 'LOC':
//                 return {
//                     label: city.name || city, type: "Jurisdiction", icon: LocationCity, color: "bg-slate-900",
//                     empCount: employees.length, projCount: projects.length,
//                     children: subCities.map(s => ({
//                         label: s.name, type: "Sub-City Hub", icon: Apartment, color: "bg-[#FBAF1E]",
//                         empCount: employees.filter(e => e.subCityId === s.id).length,
//                         projCount: projects.filter(p => p.subCityId === s.id).length,
//                         children: locations.filter(l => l.subCityId === s.id).map(loc => ({
//                             label: loc.name, type: "Project Site", icon: PinDrop, color: "bg-green-600",
//                             empCount: 0,
//                             projCount: projects.filter(p => p.locationIds?.includes(loc.id)).length
//                         }))
//                     }))
//                 };
//             default: return null;
//         }
//     }, [activeTab, data]);

//     if (loading) return <div className="h-[60vh] flex items-center justify-center text-slate-400 italic animate-pulse">Establishing Hierarchical Context...</div>;

//     return (
//         <div className="w-full h-[calc(100vh-140px)] flex flex-col relative overflow-hidden bg-white rounded-[40px] border border-slate-200">

//             <div className="absolute top-6 left-6 z-[100] flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-xl">
//                 {[
//                     { id: 'GEO', label: 'Regional', icon: Apartment },
//                     { id: 'DIV', label: 'Divisions', icon: Business },
//                     { id: 'POS', label: 'Roles', icon: Schema },
//                     { id: 'LOC', label: 'Sites', icon: Map },
//                 ].map(tab => (
//                     <button
//                         key={tab.id}
//                         onClick={() => { setActiveTab(tab.id); setZoom(0.8); }}
//                         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === tab.id ? 'bg-[#0284C7] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
//                     >
//                         <tab.icon style={{ fontSize: 16 }} /> {tab.label}
//                     </button>
//                 ))}
//             </div>

//             <div className="absolute top-6 right-6 z-[100] flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border shadow-xl">
//                 <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50"><ZoomIn fontSize="small" /></button>
//                 <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50"><ZoomOut fontSize="small" /></button>
//                 <button onClick={() => setZoom(0.8)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50"><RestartAlt fontSize="small" /></button>
//             </div>

//             <div
//                 ref={viewportRef}
//                 onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stopDragging} onMouseLeave={stopDragging}
//                 className={`flex-1 overflow-auto no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
//             >
//                 {/* --- THE FIX: Large Vertical Padding (py-80) creates space to drag UP --- */}
//                 <div
//                     style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
//                     className="flex justify-center min-w-max transition-transform duration-200 py-80 px-96"
//                 >
//                     {treeData && <TreeNode {...treeData} />}
//                 </div>
//             </div>

//             <div className="p-3 bg-white border-t border-slate-200 flex justify-center gap-10">
//                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0284C7]"></div><span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Staff</span></div>
//                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FBAF1E]"></div><span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Projects</span></div>
//             </div>
//         </div>
//     );
// }










import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    LocationCity, Apartment, AccountTree, Work, PinDrop,
    ExpandMore, ZoomIn, ZoomOut, RestartAlt, Groups,
    Business, Assignment, Add, Hub, Map, Schema
} from '@mui/icons-material';
import adminApi from '../../api/modules/admin';
import projectApi from '../../api/modules/project';

// --- Micro Node Component ---
const TreeNode = ({ label, empCount, projCount, type, children, color, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = children && children.length > 0;

    return (
        <div className="flex flex-col items-center">
            <div className={`relative flex flex-col items-center p-2 rounded-xl border bg-white shadow-sm transition-all w-36 z-10 ${isOpen ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 shadow-sm ${color}`}>
                    <Icon style={{ fontSize: 14, color: '#fff' }} />
                </div>
                <p className="text-[6px] font-black uppercase tracking-tighter text-slate-400 leading-none mb-0.5">{type}</p>
                <p className="text-[9px] font-bold text-slate-800 text-center leading-tight truncate w-full px-1 mb-1">{label}</p>

                <div className="flex gap-1">
                    <div className="flex items-center gap-0.5 bg-sky-50 px-1 rounded border border-sky-100" title="Employees">
                        <Groups style={{ fontSize: 10 }} className="text-[#0284C7]" />
                        <span className="text-[9px] font-black text-[#0284C7]">{empCount}</span>
                    </div>
                    {projCount !== undefined && (
                        <div className="flex items-center gap-0.5 bg-amber-50 px-1 rounded border border-amber-100" title="Projects">
                            <Assignment style={{ fontSize: 10 }} className="text-[#FBAF1E]" />
                            <span className="text-[9px] font-black text-[#FBAF1E]">{projCount}</span>
                        </div>
                    )}
                </div>

                {hasChildren && (
                    <button onClick={() => setIsOpen(!isOpen)} className="absolute -bottom-2.5 bg-white border border-slate-200 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-[#0284C7] shadow-sm z-20">
                        {isOpen ? <ExpandMore style={{ fontSize: 14 }} /> : <Add style={{ fontSize: 12 }} />}
                    </button>
                )}
            </div>
            {hasChildren && isOpen && <div className="w-px h-6 bg-slate-200"></div>}
            {hasChildren && isOpen && (
                <div className="relative flex gap-4 px-2">
                    <div className="absolute top-0 left-0 right-0 h-px bg-slate-200 w-[calc(100%-2rem)] mx-auto"></div>
                    {children.map((child, index) => (
                        <div key={index} className="flex flex-col items-center relative">
                            <div className="w-px h-4 bg-slate-200"></div>
                            <TreeNode {...child} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function OrgStructure() {
    const [activeTab, setActiveTab] = useState('GEO');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ city: null, subCities: [], divisions: [], positions: [], locations: [], employees: [], projects: [] });
    const [zoom, setZoom] = useState(0.8);

    const viewportRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [pan, setPan] = useState({ left: 0, top: 0, x: 0, y: 0 });

    const onMouseDown = (e) => {
        setIsDragging(true);
        setPan({
            left: viewportRef.current.scrollLeft,
            top: viewportRef.current.scrollTop,
            x: e.clientX,
            y: e.clientY
        });
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - pan.x;
        const dy = e.clientY - pan.y;
        viewportRef.current.scrollLeft = pan.left - dx;
        viewportRef.current.scrollTop = pan.top - dy;
    };

    const stopDragging = () => setIsDragging(false);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                // 1. Fetch Admin Data (These usually work fine)
                const [cityRes, subRes, divRes, posRes, locRes, empRes] = await Promise.all([
                    adminApi.GET_CITY(), adminApi.GET_SUB_CITIES(), adminApi.GET_DIVISIONS(),
                    adminApi.GET_POSITIONS(), adminApi.GET_LOCATIONS(), adminApi.GET_EMPLOYEES()
                ]);

                // 2. Fetch Projects SEPARATELY with a very small size to test
                let projects = [];
                try {
                    // Try with a very small size first to see if it's a backend limit
                    const projRes = await projectApi.GET_PROJECTS({ size: 100, page: 0 });
                    projects = projRes.data?.data?.content || projRes.data?.content || [];
                } catch (projErr) {
                    console.error("Project fetch failed specifically:", projErr);
                    // If it fails, projects remains an empty array so UI doesn't crash
                }

                setData({
                    city: cityRes.data?.data || cityRes.data,
                    subCities: subRes.data?.data || subRes.data || [],
                    divisions: divRes.data?.data || divRes.data || [],
                    positions: posRes.data?.data || posRes.data || [],
                    locations: locRes.data?.data || locRes.data || [],
                    employees: empRes.data?.data || empRes.data || [],
                    projects: projects
                });

            } catch (err) {
                console.error("Critical Data Fetch Error:", err);
            } finally {
                setLoading(false);
                setTimeout(() => { if (viewportRef.current) viewportRef.current.scrollTop = 150; }, 500);
            }
        };
        fetchAll();
    }, []);

    // Reset scroll when changing tabs
    useEffect(() => {
        if (viewportRef.current) viewportRef.current.scrollTop = 150;
    }, [activeTab]);

    const buildTree = (items, parentId, type, icon, color) => {
        return items
            .filter(item => item.parentId === parentId)
            .map(item => ({
                label: item.name,
                type: type,
                icon: icon,
                color: color,
                empCount: data.employees.filter(e => e.divisionId === item.id || e.positionId === item.id).length,
                projCount: type === 'Division' ? data.projects.filter(p => p.divisionId === item.id).length : undefined,
                children: buildTree(items, item.id, type, icon, color)
            }));
    };

    const treeData = useMemo(() => {
        const { city, subCities, divisions, positions, locations, employees, projects } = data;
        if (!city) return null;

        switch (activeTab) {
            case 'GEO':
                return {
                    label: city.name || city, type: "Capital City", icon: LocationCity, color: "bg-slate-900",
                    empCount: employees.length, projCount: projects.length,
                    children: subCities.map(s => ({
                        label: s.name, type: "Sub-City", icon: Apartment, color: "bg-[#FBAF1E]",
                        empCount: employees.filter(e => e.subCityId === s.id).length,
                        projCount: projects.filter(p => p.subCityId === s.id).length
                    }))
                };
            case 'DIV':
                return {
                    label: "Organizational Units", type: "City Admin", icon: Business, color: "bg-purple-900",
                    empCount: employees.length, projCount: projects.length,
                    children: buildTree(divisions, null, "Division", Business, "bg-purple-600")
                };
            case 'POS':
                return {
                    label: "Professional Hierarchy", type: "Reporting Line", icon: Hub, color: "bg-blue-900",
                    empCount: employees.length,
                    children: buildTree(positions, null, "Position", Work, "bg-blue-600")
                };
            case 'LOC':
                return {
                    label: city.name || city, type: "Jurisdiction", icon: LocationCity, color: "bg-slate-900",
                    empCount: employees.length, projCount: projects.length,
                    children: subCities.map(s => ({
                        label: s.name, type: "Sub-City Hub", icon: Apartment, color: "bg-[#FBAF1E]",
                        empCount: employees.filter(e => e.subCityId === s.id).length,
                        projCount: projects.filter(p => p.subCityId === s.id).length,
                        children: locations.filter(l => l.subCityId === s.id).map(loc => ({
                            label: loc.name, type: "Project Site", icon: PinDrop, color: "bg-green-600",
                            empCount: 0,
                            projCount: projects.filter(p => p.locationIds?.includes(loc.id)).length
                        }))
                    }))
                };
            default: return null;
        }
    }, [activeTab, data]);

    if (loading) return <div className="h-[60vh] flex items-center justify-center text-slate-400 italic animate-pulse">Establishing Hierarchical Context...</div>;

    return (
        <div className="w-full h-[calc(100vh-140px)] flex flex-col relative overflow-hidden bg-white rounded-[40px] border border-slate-200">

            <div className="absolute top-6 left-6 z-[100] flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-xl">
                {[
                    { id: 'GEO', label: 'Regional', icon: Apartment },
                    { id: 'DIV', label: 'Divisions', icon: Business },
                    { id: 'POS', label: 'Roles', icon: Schema },
                    { id: 'LOC', label: 'Sites', icon: Map },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setZoom(0.8); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === tab.id ? 'bg-[#0284C7] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <tab.icon style={{ fontSize: 16 }} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="absolute top-6 right-6 z-[100] flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border shadow-xl">
                <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50"><ZoomIn fontSize="small" /></button>
                <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50"><ZoomOut fontSize="small" /></button>
                <button onClick={() => setZoom(0.8)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50"><RestartAlt fontSize="small" /></button>
            </div>

            <div
                ref={viewportRef}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stopDragging} onMouseLeave={stopDragging}
                className={`flex-1 overflow-auto no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
                <div
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                    className="flex justify-center min-w-max transition-transform duration-200 py-80 px-96"
                >
                    {treeData && <TreeNode {...treeData} />}
                </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-center gap-10">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0284C7]"></div><span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Staff</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FBAF1E]"></div><span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Projects</span></div>
            </div>
        </div>
    );
}