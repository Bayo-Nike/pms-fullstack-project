import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { PermissionRoute } from './components/PermissionRoute';

// Page Imports
import Dashboard from './pages/Dashboard';
import Projects from './pages/project/Projects';
import ProjectDetails from './pages/project/ProjectDetails';
import Roles from './pages/admin/Roles';
import CreateRole from './pages/admin/CreateRole';
import Users from './pages/admin/Users';
import CreateUser from './pages/admin/CreateUser';
import Login from './pages/Login';
import SubCities from './pages/admin/SubCities';
import CreateSubCity from './pages/admin/CreateSubCity';
import Divisions from './pages/admin/Divisions';
import CreateDivision from './pages/admin/CreateDivision';
import Positions from './pages/admin/Positions';
import CreatePosition from './pages/admin/CreatePosition';
import Contractors from './pages/admin/Contractors';
import CreateContractor from './pages/admin/CreateContractor';
import EditContractor from './pages/admin/EditContractor';

export default function AppRoutes() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTE --- */}
      <Route path="/login" element={<Login />} />

      {/* --- PROTECTED & LAYOUT WRAPPED ROUTES --- */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Initial Redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 1. DASHBOARD MODULE */}
        <Route path="dashboard" element={
          <PermissionRoute permission="CAN_VIEW_DASHBOARD">
            <Dashboard />
          </PermissionRoute>
        } />
        <Route path="dashboard/gis" element={
          <PermissionRoute permission="CAN_VIEW_GIS_MAP">
            <Placeholder title="GIS Map View" />
          </PermissionRoute>
        } />
        <Route path="dashboard/alerts" element={
          <PermissionRoute permission="CAN_MANAGE_ALERTS">
            <Placeholder title="Critical Alerts & Issues" />
          </PermissionRoute>
        } />

        {/* 2. PROJECTS MODULE */}
        <Route path="projects" element={
          <PermissionRoute permission="CAN_VIEW_PROJECTS">
            <Projects />
          </PermissionRoute>
        } />
        <Route path="projects/:id" element={
          <PermissionRoute permission="CAN_VIEW_PROJECTS">
            <ProjectDetails />
          </PermissionRoute>
        } />
        <Route path="projects/progress" element={
          <PermissionRoute permission="CAN_VIEW_PROJECTS">
            <Placeholder title="Physical Progress Tracking" />
          </PermissionRoute>
        } />
        <Route path="projects/milestones" element={
          <PermissionRoute permission="CAN_VIEW_PROJECTS">
            <Placeholder title="Milestone Management" />
          </PermissionRoute>
        } />
        <Route path="projects/gantt" element={
          <PermissionRoute permission="CAN_MANAGE_GANTT">
            <Placeholder title="Gantt Schedule Management" />
          </PermissionRoute>
        } />

        {/* 3. CONTRACTS MODULE */}
        <Route path="admin/contractors" element={
          <PermissionRoute permission="CAN_VIEW_CONTRACTS">
            <Contractors />
          </PermissionRoute>
        } />

        <Route path="admin/contractors/create" element={
          <PermissionRoute permission="CAN_VIEW_CONTRACTS">
            <CreateContractor />
          </PermissionRoute>
        } />
        <Route path="admin/contractors/edit/:id" element={
          <PermissionRoute permission="CAN_VIEW_CONTRACTS">
            <EditContractor />
          </PermissionRoute>
        } />
        {/* <Route path="contracts/overview" element={
          <PermissionRoute permission="CAN_VIEW_CONTRACTS">
            <Placeholder title="Contract Overview" />
          </PermissionRoute>
        } />
        <Route path="contracts/vo" element={
          <PermissionRoute permission="CAN_MANAGE_VO">
            <Placeholder title="Variation Orders (VO)" />
          </PermissionRoute>
        } />
        <Route path="contracts/performance" element={
          <PermissionRoute permission="CAN_RATE_CONTRACTORS">
            <Placeholder title="Contractor Performance Rating" />
          </PermissionRoute>
        } />
        <Route path="contracts/retention" element={
          <PermissionRoute permission="CAN_MANAGE_RETENTION">
            <Placeholder title="Retention & Liquidated Damages" />
          </PermissionRoute>
        } />
        <Route path="contracts/repository" element={
          <PermissionRoute permission="CAN_ACCESS_REPOSITORY">
            <Placeholder title="Contract Document Repository" />
          </PermissionRoute>
        } /> */}

        {/* 4. FINANCE MODULE */}
        <Route path="finance/ipc" element={
          <PermissionRoute permission="CAN_VIEW_FINANCE">
            <Placeholder title="IPC Management" />
          </PermissionRoute>
        } />
        <Route path="finance/advance" element={
          <PermissionRoute permission="CAN_TRACK_ADVANCE">
            <Placeholder title="Advance Payment Tracking" />
          </PermissionRoute>
        } />
        <Route path="finance/escalation" element={
          <PermissionRoute permission="CAN_MANAGE_ESCALATION">
            <Placeholder title="Price Adjustment (Escalation)" />
          </PermissionRoute>
        } />
        <Route path="finance/history" element={
          <PermissionRoute permission="CAN_VIEW_FINANCE">
            <Placeholder title="Payment History" />
          </PermissionRoute>
        } />

        {/* 5. FIELD OPERATIONS MODULE */}
        <Route path="field/diary" element={
          <PermissionRoute permission="CAN_WRITE_DIARY">
            <Placeholder title="Daily Site Diary" />
          </PermissionRoute>
        } />
        <Route path="field/photos" element={
          <PermissionRoute permission="CAN_UPLOAD_PHOTOS">
            <Placeholder title="Geo-Tagged Progress Photos" />
          </PermissionRoute>
        } />
        <Route path="field/sync" element={
          <PermissionRoute permission="CAN_FORCE_SYNC">
            <Placeholder title="Offline Data Sync Status" />
          </PermissionRoute>
        } />

        {/* 6. DOCUMENTS MODULE */}
        <Route path="docs/drawings" element={
          <PermissionRoute permission="CAN_MANAGE_DRAWINGS">
            <Placeholder title="Drawing Management" />
          </PermissionRoute>
        } />
        <Route path="docs/letters" element={
          <PermissionRoute permission="CAN_MANAGE_LETTERS">
            <Placeholder title="Correspondence Log" />
          </PermissionRoute>
        } />
        <Route path="docs/archive" element={
          <PermissionRoute permission="CAN_ARCHIVE_DOCS">
            <Placeholder title="Document Archival" />
          </PermissionRoute>
        } />

        {/* 7. RESOURCES MODULE */}
        <Route path="resources/equipment" element={
          <PermissionRoute permission="CAN_MANAGE_EQUIPMENT">
            <Placeholder title="Equipment Utilization" />
          </PermissionRoute>
        } />
        <Route path="resources/materials" element={
          <PermissionRoute permission="CAN_MANAGE_INVENTORY">
            <Placeholder title="Material Inventory" />
          </PermissionRoute>
        } />

        {/* 8. SYS ADMIN MODULE */}

        <Route path="admin/sub-cities" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <SubCities />
          </PermissionRoute>
        } />

        <Route path="admin/sub-cities/create" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <CreateSubCity />
          </PermissionRoute>
        } />

        <Route path="admin/sub-cities/edit/:id" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <CreateSubCity />
          </PermissionRoute>
        } />

        <Route path="admin/divisions" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <Divisions />
          </PermissionRoute>
        } />

        <Route path="admin/divisions/create" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <CreateDivision />
          </PermissionRoute>
        } />

        <Route path="admin/divisions/edit/:id" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <CreateDivision />
          </PermissionRoute>
        } />
        <Route path="admin/positions" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <Positions />
          </PermissionRoute>
        } />

        <Route path="admin/positions/create" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <CreatePosition />
          </PermissionRoute>
        } />
        <Route path="admin/positions/edit/:id" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <CreatePosition />
          </PermissionRoute>
        } />

        


        <Route path="admin/users" element={
          <PermissionRoute permission="CAN_VIEW_USERS">
            <Users />
          </PermissionRoute>
        } />
        <Route path="admin/users/create" element={
          <PermissionRoute permission="CAN_MANAGE_USERS">
            <CreateUser />
          </PermissionRoute>
        } />
        <Route path="admin/users/edit/:id" element={
          <PermissionRoute permission="CAN_MANAGE_USERS">
            <CreateUser />
          </PermissionRoute>
        } />

        <Route path="admin/roles" element={
          <PermissionRoute permission="CAN_MANAGE_ROLES">
            <Roles />
          </PermissionRoute>
        } />
        <Route path="admin/roles/create" element={
          <PermissionRoute permission="CAN_MANAGE_ROLES">
            <CreateRole />
          </PermissionRoute>
        } />
        <Route path="admin/roles/edit/:id" element={
          <PermissionRoute permission="CAN_MANAGE_ROLES">
            <CreateRole />
          </PermissionRoute>
        } />
        <Route path="admin/logs" element={
          <PermissionRoute permission="CAN_VIEW_LOGS">
            <Placeholder title="System Audit Logs" />
          </PermissionRoute>
        } />

        {/* 404 CATCH-ALL */}
        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Route>
    </Routes>
  );
}

// Reusable Placeholder for modules under development
const Placeholder = ({ title }) => (
  <div className="p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-fadeIn">
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <div className="h-1 w-20 bg-[#FBAF1E] mt-2 mb-4 rounded-full"></div>
      <p className="text-slate-400 leading-relaxed">
        The <b>{title}</b> module is currently being synchronized with the SCCO PMS cloud infrastructure.
        Access levels and functional components will appear here once the configuration is finalized.
      </p>
    </div>
  </div>
);