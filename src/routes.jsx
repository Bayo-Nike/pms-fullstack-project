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
import Employees from './pages/admin/Employees';
import CreateEmployee from './pages/admin/CreateEmployee';

export default function AppRoutes() {

  // Helper to wrap components in a PermissionRoute
  const protect = (comp, perm) => (
    <PermissionRoute permission={perm}>{comp}</PermissionRoute>
  );

  // Helper for placeholders
  const placeholder = (title, perm) => (
    <PermissionRoute permission={perm}><Placeholder title={title} /></PermissionRoute>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 1. Dashboard */}
        <Route path="dashboard" element={protect(<Dashboard />, "CAN_VIEW_DASHBOARD")} />
        <Route path="dashboard/gis" element={placeholder("GIS Map View", "CAN_VIEW_GIS_MAP")} />
        <Route path="dashboard/alerts" element={placeholder("Alerts & Issues", "CAN_MANAGE_ALERTS")} />

        {/* 2. Projects */}
        <Route path="projects" element={protect(<Projects />, "CAN_VIEW_PROJECTS")} />
        <Route path="projects/:id" element={protect(<ProjectDetails />, "CAN_VIEW_PROJECTS")} />
        <Route path="projects/progress" element={placeholder("Physical Progress", "CAN_VIEW_PROJECTS")} />
        <Route path="projects/milestones" element={placeholder("Milestones", "CAN_VIEW_PROJECTS")} />
        <Route path="projects/gantt" element={placeholder("Gantt Schedule", "CAN_MANAGE_GANTT")} />

        {/* 3. Contracts & Contractors */}
        <Route path="admin/contractors" element={protect(<Contractors />, "CAN_VIEW_USERS")} />
        <Route path="admin/contractors/create" element={protect(<CreateContractor />, "CAN_VIEW_USERS")} />

        {/* 4. Finance */}
        <Route path="finance/ipc" element={placeholder("IPC Management", "CAN_VIEW_FINANCE")} />
        <Route path="finance/advance" element={placeholder("Advance Tracking", "CAN_TRACK_ADVANCE")} />
        <Route path="finance/escalation" element={placeholder("Price Adjustment", "CAN_MANAGE_ESCALATION")} />
        <Route path="finance/history" element={placeholder("Payment History", "CAN_VIEW_FINANCE")} />

        {/* 5. Field Operations */}
        <Route path="field/diary" element={placeholder("Daily Site Diary", "CAN_WRITE_DIARY")} />
        <Route path="field/photos" element={placeholder("Geo-Tagged Photos", "CAN_UPLOAD_PHOTOS")} />
        <Route path="field/sync" element={placeholder("Offline Sync", "CAN_FORCE_SYNC")} />

        {/* 6. Documents */}
        <Route path="docs/drawings" element={placeholder("Drawings", "CAN_MANAGE_DRAWINGS")} />
        <Route path="docs/letters" element={placeholder("Letters", "CAN_MANAGE_LETTERS")} />
        <Route path="docs/archive" element={placeholder("Archive", "CAN_ARCHIVE_DOCS")} />

        {/* 7. Resources */}
        <Route path="resources/equipment" element={placeholder("Equipment", "CAN_MANAGE_EQUIPMENT")} />
        <Route path="resources/materials" element={placeholder("Inventory", "CAN_MANAGE_INVENTORY")} />

        {/* 8. Sys Admin */}
        <Route path="admin/sub-cities" element={protect(<SubCities />, "CAN_VIEW_USERS")} />
        <Route path="admin/sub-cities/create" element={protect(<CreateSubCity />, "CAN_VIEW_USERS")} />
        <Route path="admin/sub-cities/edit/:id" element={protect(<CreateSubCity />, "CAN_VIEW_USERS")} />

        <Route path="admin/divisions" element={protect(<Divisions />, "CAN_VIEW_USERS")} />
        <Route path="admin/divisions/create" element={protect(<CreateDivision />, "CAN_VIEW_USERS")} />
        <Route path="admin/divisions/edit/:id" element={protect(<CreateDivision />, "CAN_VIEW_USERS")} />

        <Route path="admin/positions" element={protect(<Positions />, "CAN_VIEW_USERS")} />
        <Route path="admin/positions/create" element={protect(<CreatePosition />, "CAN_VIEW_USERS")} />
        <Route path="admin/positions/edit/:id" element={protect(<CreatePosition />, "CAN_VIEW_USERS")} />

        <Route path="admin/users" element={protect(<Users />, "CAN_VIEW_USERS")} />
        <Route path="admin/users/create" element={protect(<CreateUser />, "CAN_MANAGE_USERS")} />
        <Route path="admin/users/edit/:id" element={protect(<CreateUser />, "CAN_MANAGE_USERS")} />

        <Route path="admin/employees" element={protect(<Employees />, "CAN_MANAGE_USERS")} />
        <Route path="admin/employees/create" element={protect(<CreateEmployee />, "CAN_MANAGE_USERS")} />
        <Route path="admin/employees/edit/:id" element={protect(<CreateEmployee />, "CAN_MANAGE_USERS")} />

        <Route path="admin/roles" element={protect(<Roles />, "CAN_MANAGE_ROLES")} />
        <Route path="admin/roles/create" element={protect(<CreateRole />, "CAN_MANAGE_ROLES")} />
        <Route path="admin/roles/edit/:id" element={protect(<CreateRole />, "CAN_MANAGE_ROLES")} />
        <Route path="admin/logs" element={placeholder("Audit Logs", "CAN_VIEW_LOGS")} />

        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Route>
    </Routes>
  );
}

const Placeholder = ({ title }) => (
  <div className="p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-fadeIn">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <div className="h-1 w-20 bg-[#FBAF1E] mt-2 mb-4 rounded-full"></div>
    <p className="text-slate-400">Under development for SCCO PMS.</p>
  </div>
);