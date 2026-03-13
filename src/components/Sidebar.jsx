import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Dashboard, Map, Assignment, Handshake, ReceiptLong,
  Engineering, FolderCopy, Construction, ExpandMore,
  KeyboardBackspace, Settings, VerifiedUser, Timeline,
  Flag, Description, PhotoCamera, Inventory, History,
  NotificationImportant,
  Report
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isCollapsed, isMobileOpen, closeMobile, toggleSidebar }) {
  const location = useLocation();
  const { can } = useAuth();
  const isMobile = window.innerWidth < 768;
  const [openMenu, setOpenMenu] = useState('');

  const handleToggle = (menuName) => {
    if (isCollapsed && !isMobile) toggleSidebar();
    setOpenMenu(openMenu === menuName ? '' : menuName);
  };

  // 1. FULL MENU DEFINITION WITH PERMISSIONS
  const fullMenuGroups = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <Dashboard />,
      children: [
        { path: '/dashboard', name: 'Executive Overview', permission: 'CAN_VIEW_DASHBOARD' },
        { path: '/dashboard/org-structure', name: 'Organization Structure', permission: 'CAN_VIEW_DASHBOARD' },
        // { path: '/dashboard/gis', name: 'GIS Map View', permission: 'CAN_VIEW_GIS_MAP' },
        // { path: '/dashboard/alerts', name: 'Alerts & Issues', permission: 'CAN_MANAGE_ALERTS' },
      ]
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: <Assignment />,
      children: [
        { path: '/projects', name: 'Project List', permission: 'CAN_VIEW_PROJECTS' },
        { path: '/projects/inspections', name: 'Inspections', permission: 'CAN_VIEW_PROJECTS' },
      ]
    },
    {
      id: 'contracts',
      name: 'Contracts',
      icon: <Handshake />,
      children: [
        { path: '/admin/contractors', name: 'Contractor List', permission: 'CAN_VIEW_CONTRACTS' },
      ]
    },
    {
      id: 'plan',
      name: 'Planning',
      icon: <ReceiptLong />,
      children: [
        { path: '/planning/ColorCodings', name: 'Color Codings', permission: 'CAN_VIEW_FINANCE' },
      ]
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: <ReceiptLong />,
      children: [
        { path: '/finance/history', name: 'Payment History', permission: 'CAN_VIEW_FINANCE' },
      ]
    },

    {
      id: 'reports',
      name: 'Reports',
      icon: <Report />,
      children: [
        { path: '/reports/general', name: 'General Reports', permission: 'CAN_VIEW_REPORTS' },
      ]
    },
    {
      id: 'admin',
      name: 'Sys Admin',
      icon: <Settings />,
      children: [
        { path: '/admin/sub-cities', name: 'Cities & Sub-Cities', permission: 'CAN_MANAGE_ROLES' },
        { path: '/admin/divisions', name: 'Divisions', permission: 'CAN_MANAGE_ROLES' },
        { path: '/admin/positions', name: 'Positions', permission: 'CAN_MANAGE_ROLES' },
        { path: '/admin/locations', name: 'Locations', permission: 'CAN_MANAGE_ROLES' },
        { path: '/admin/inspection-types', name: 'Inspections Types', permission: 'CAN_VIEW_LOGS' },
        { path: '/admin/employees', name: 'Employees', permission: 'CAN_MANAGE_ROLES' },
        { path: '/admin/roles', name: 'Roles & Permissions', permission: 'CAN_MANAGE_ROLES' },
        { path: '/admin/users', name: 'User Management', permission: 'CAN_VIEW_USERS' },
        { path: '/admin/mobile', name: 'Mobile App', permission: 'CAN_MANAGE_MODULES' },
        { path: '/admin/audit-log', name: 'Audit Logs', permission: 'CAN_MANAGE_ROLES' },
      ]
    }
  ];

  // 2. PERMISSION FILTER LOGIC
  const menuGroups = useMemo(() => {
    return fullMenuGroups
      .map(group => ({
        ...group,
        children: group.children.filter(child => can(child.permission))
      }))
      .filter(group => group.children.length > 0);
  }, [can]);

  const sidebarWidth = isMobile ? 'w-[280px]' : (isCollapsed ? 'w-[80px]' : 'w-[285px]');

  return (
    <aside className={`fixed left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'} ${sidebarWidth} top-20 h-[calc(100vh-80px)] flex flex-col`}>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

        {menuGroups.map((group) => {
          const isGroupActive = group.children.some(c => location.pathname.startsWith(c.path));
          const isOpen = openMenu === group.id;

          return (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => handleToggle(group.id)}
                className={`flex items-center gap-4 w-full h-[48px] px-4 rounded-xl transition-all ${isGroupActive && !isOpen ? 'bg-sky-50 text-[#0284C7]' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`${isGroupActive ? 'text-[#0284C7]' : ''}`}>{group.icon}</span>
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className={`flex-1 text-left font-semibold text-[13px] whitespace-nowrap ${isGroupActive ? 'text-[#0284C7]' : ''}`}>
                      {group.name}
                    </span>
                    <ExpandMore className={`transition-transform duration-300 scale-75 ${isOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {isOpen && (!isCollapsed || isMobile) && (
                <div className="mt-1 ml-6 border-l-2 border-slate-100 space-y-1 animate-fadeIn">
                  {group.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={() => isMobile && closeMobile()}
                      className={({ isActive }) => `
                        flex items-center h-9 px-4 rounded-r-lg text-[12px] transition-all
                        ${isActive ? 'text-[#0284C7] font-bold bg-sky-50' : 'text-slate-500 hover:text-[#0284C7]'}
                      `}
                    >
                      {child.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!isMobile && (
        <div className="p-4 border-t border-slate-50 flex-shrink-0">
          <button onClick={toggleSidebar} className="flex items-center gap-4 w-full h-10 px-4 text-slate-400 hover:text-[#0284C7] transition-all rounded-xl">
            <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}><KeyboardBackspace /></div>
            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Collapse Sidebar</span>}
          </button>
        </div>
      )}
    </aside>
  );
}