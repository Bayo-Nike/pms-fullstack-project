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
import CreateColorCoding from './pages/planning/CreateColorCoding';
import Employees from './pages/admin/Employees';
import CreateEmployee from './pages/admin/CreateEmployee';
import Locations from './pages/admin/Locations';
import CreateLocation from './pages/admin/CreateLocation';
import AuditLog from './pages/admin/AuditLog';
import CreateProject from './pages/project/CreateProject';
import ColorCodings from './pages/planning/ColorCodings';
import InspectionTypes from './pages/admin/InspectionTypes';
import CreateInspectionType from './pages/admin/CreateInspectionType';
import Inspections from './pages/project/Inspections';
import CreateInspection from './pages/project/CreateInspection';
import OrgStructure from './pages/admin/OrgStructure';
import ProjectReport from './pages/reports/ProjectReport';
import ProjectReportPage from './pages/reports/ProjectReportPage';
import TaskReportPage from './pages/reports/TaskReportPage';
import Mobile from './pages/admin/Mobile';
import ProjectCosts from './pages/project/ProjectCosts';
import ManageProjectCosts from './pages/project/ManageProjectCosts';

// Placeholder Component
const Placeholder = ({ title }) => (
  <div className="p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-fadeIn">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <div className="h-1 w-20 bg-[#FBAF1E] mt-2 mb-4 rounded-full"></div>
    <p className="text-slate-400">Under development for SCCO PMS.</p>
  </div>
);

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
        <Route path="dashboard/org-structure" element={protect(<OrgStructure />, "CAN_VIEW_ORG_STRUCTURE")} />
        <Route path="dashboard/gis" element={placeholder("GIS Map View", "CAN_VIEW_GIS_MAP")} />
        <Route path="dashboard/alerts" element={placeholder("Alerts & Issues", "CAN_MANAGE_ALERTS")} />

        {/* 2. Projects */}
        <Route path="projects" element={protect(<Projects />, "CAN_VIEW_PROJECTS")} />
        <Route path="projects/create" element={protect(<CreateProject />, "CAN_CREATE_PROJECTS")} />
        <Route path="projects/:id" element={protect(<ProjectDetails />, "CAN_VIEW_PROJECTS")} />
        <Route path="projects/edit/:id" element={protect(<CreateProject />, "CAN_EDIT_PROJECTS")} />
        <Route path="projects/milestones" element={placeholder("Milestones", "CAN_VIEW_PROJECTS")} />
        <Route path="projects/gantt" element={placeholder("Gantt Schedule", "CAN_MANAGE_GANTT")} />

        {/* 2.5. Inspection Logs */}
        <Route path="projects/inspections" element={protect(<Inspections />, "CAN_VIEW_PROJECTS")} />
        <Route path="projects/inspections/create" element={protect(<CreateInspection />, "CAN_VIEW_PROJECTS")} />
        <Route path="projects/inspections/edit/:id" element={protect(<CreateInspection />, "CAN_VIEW_PROJECTS")} />


        {/* 3. Contracts & Contractors */}
        <Route path="admin/contractors" element={protect(<Contractors />, "CAN_VIEW_USERS")} />
        <Route path="admin/contractors/create" element={protect(<CreateContractor />, "CAN_VIEW_USERS")} />
        <Route path="admin/contractors/edit/:id" element={protect(<CreateContractor />, "CAN_VIEW_USERS")} />

        {/* 4. Color & Coding */}
        <Route path="planning/ColorCodings" element={protect(<ColorCodings />, "CAN_VIEW_USERS")} />
        <Route path="planning/CreateColorCoding/create" element={protect(<CreateColorCoding />, "CAN_VIEW_USERS")} />
        <Route path="planning/ColorCodings/edit/:id" element={protect(<CreateColorCoding />, "CAN_VIEW_USERS")} />

        {/* 4. Finance */}
        <Route path="finance/project-costs" element={protect(<ProjectCosts />, "CAN_VIEW_FINANCE")} />
        <Route path='finance/project-costs/:id' element={protect(<ManageProjectCosts />, "CAN_MANAGE_PROJECT_COSTS")} />


        {/* 4. reports */}
        <Route path="reports/project" element={protect(<ProjectReportPage />, "CAN_VIEW_FINANCE")} />
        <Route path="reports/task" element={protect(<TaskReportPage />, "CAN_VIEW_FINANCE")} />
        <Route path="finance/advance" element={placeholder("Advance Tracking", "CAN_TRACK_ADVANCE")} />
        <Route path="finance/escalation" element={placeholder("Price Adjustment", "CAN_MANAGE_ESCALATION")} />
        <Route path="finance/history" element={placeholder("Payment History", "CAN_VIEW_FINANCE")} />

        {/* 3. CONTRACTS MODULE */}
        <Route path="admin/contracts" element={placeholder("Contracts Management", "CAN_VIEW_CONTRACTS")} />
        <Route path="admin/contracts/create" element={placeholder("Create Contract", "CAN_VIEW_CONTRACTS")} />
        <Route path="admin/contracts/edit/:id" element={placeholder("Edit Contract", "CAN_VIEW_CONTRACTS")} />

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

        <Route path='admin/mobile' element={protect(<Mobile />, "CAN_MANAGE_USERS")} />

        <Route path="admin/locations" element={protect(<Locations />, "CAN_VIEW_USERS")} />
        <Route path="admin/locations/create" element={protect(<CreateLocation />, "CAN_VIEW_USERS")} />
        <Route path="admin/locations/edit/:id" element={protect(<CreateLocation />, "CAN_VIEW_USERS")} />

        <Route path="admin/audit-log" element={protect(<AuditLog />, "CAN_VIEW_LOGS")} />

        {/* Extra routes missing in the old commented version */}
        <Route path="projects/milestones" element={placeholder("Milestones", "CAN_VIEW_PROJECTS")} />
        <Route path="projects/gantt" element={placeholder("Gantt Schedule", "CAN_MANAGE_GANTT")} />
        <Route path="finance/escalation" element={placeholder("Price Adjustment", "CAN_MANAGE_ESCALATION")} />
        <Route path="resources/materials" element={placeholder("Inventory", "CAN_MANAGE_INVENTORY")} />


        <Route path="admin/inspection-types" element={protect(<InspectionTypes />, "CAN_VIEW_USERS")} />
        <Route path="admin/inspection-types/create" element={protect(<CreateInspectionType />, "CAN_MANAGE_USERS")} />
        <Route path="admin/inspection-types/edit/:id" element={protect(<CreateInspectionType />, "CAN_MANAGE_USERS")} />

        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Route>
    </Routes>
  );
}