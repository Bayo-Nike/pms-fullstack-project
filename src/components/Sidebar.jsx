import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Dashboard, Assignment, Handshake, ReceiptLong,
  ExpandMore, KeyboardBackspace, Settings, Report
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



  const fullMenuGroups = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <Dashboard />,
      children: [
        { path: '/dashboard', name: 'Executive Overview', permission: 'CAN_SEE_DASHBOARD' },
        { path: '/org-structure', name: 'Organization Structure', permission: 'CAN_SEE_ORG_STRUCTURE' },
        { path: '/my-reportees', name: 'My Reportees', permission: 'CAN_SEE_MY_REPORTEES' }
      ]
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: <Assignment />,
      children: [
        { path: '/initiations', name: 'Project Initiation', permission: 'CAN_SEE_PROJECT_INITIATION' },
        { path: '/projects', name: 'Project List', permission: 'CAN_SEE_PROJECT_LIST' },
        { path: '/inspections', name: 'Inspections', permission: 'CAN_SEE_INSPECTIONS' },
      ]
    },
    {
      id: 'contracts-consultancies',
      name: 'Contracts & Consultancies',
      icon: <Handshake />,
      children: [
        { path: '/contractors', name: 'Contractor List', permission: 'CAN_SEE_CONTRACT_LIST' },
        { path: '/consultancy', name: 'Consultancy List', permission: 'CAN_SEE_CONSULTANT_LIST' },
        { path: '/client', name: 'Client List', permission: 'CAN_SEE_CONSULTANT_LIST' },
      ]
    },
    {
      id: 'planning',
      name: 'Planning',
      icon: <ReceiptLong />,
      children: [
        { path: '/planning/ColorCodings', name: 'Color Codings', permission: 'CAN_SEE_COLOR_CODING_LIST' },
      ]
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: <ReceiptLong />,
      children: [
        { path: '/project-costs', name: 'Project Costs', permission: 'CAN_SEE_PROJECT_FINANCE' },
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: <Report />,
      children: [
        { path: '/reports/project', name: 'Project Report', permission: 'CAN_SEE_PROJECT_REPORT' },
        { path: '/reports/task', name: 'Task Report', permission: 'CAN_SEE_TASK_REPORT' },
        { path: '/reports/role', name: 'Role Report', permission: 'CAN_SEE_ROLE_REPORT' },
        { path: '/reports/employee', name: 'Employee Report', permission: 'CAN_SEE_EMPLOYEE_REPORT' },
        { path: '/reports/user', name: 'User Report', permission: 'CAN_SEE_USER_REPORT' },
        { path: '/reports/contractor', name: 'Contractor Report', permission: 'CAN_SEE_CONTRACTORS_REPORT' },
        { path: '/reports/location', name: 'Site Report', permission: 'CAN_SEE_LOCATION_REPORT' },
        { path: '/reports/division', name: 'Division Report', permission: 'CAN_SEE_DIVISION_REPORT' },
      ]
    },
    {
      id: 'admin',
      name: 'Sys Admin',
      icon: <Settings />,
      children: [
        { path: '/admin/sub-cities', name: 'Cities & Sub-Cities', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/divisions', name: 'Divisions', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/positions', name: 'Positions', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/locations', name: 'Sites', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/inspection-types', name: 'Inspection Types', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/task-types', name: 'Task Types', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/employees', name: 'Employees', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/roles', name: 'Roles & Permissions', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/users', name: 'User Management', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/mobile', name: 'Mobile App', permission: 'CAN_SEE_SYS_ADMIN' },
        { path: '/admin/audit-log', name: 'Audit Logs', permission: 'CAN_SEE_SYS_ADMIN' },
      ]
    }
  ];

  // ===========================
  // FILTER MODULES & CHILDREN BY PERMISSION
  // ===========================
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
                <div className="mt-1 ml-6 border-l-2 border-slate-100 space-y-1">
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
            <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
              <KeyboardBackspace />
            </div>
            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Collapse Sidebar</span>}
          </button>
        </div>
      )}
    </aside>
  );
}