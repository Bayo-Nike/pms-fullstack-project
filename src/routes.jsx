// import { Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Layout';
// import ProtectedRoute from './components/ProtectedRoute';
// import { PermissionRoute } from './components/PermissionRoute';

// // Page Imports
// import Dashboard from './pages/Dashboard';
// import Projects from './pages/project/Projects';
// import ProjectDetails from './pages/project/ProjectDetails';
// import Roles from './pages/admin/Roles';
// import CreateRole from './pages/admin/CreateRole';
// import Users from './pages/admin/Users';
// import CreateUser from './pages/admin/CreateUser';
// import Login from './pages/Login';
// import SubCities from './pages/admin/SubCities';
// import CreateSubCity from './pages/admin/CreateSubCity';
// import Divisions from './pages/admin/Divisions';
// import CreateDivision from './pages/admin/CreateDivision';
// import Positions from './pages/admin/Positions';
// import CreatePosition from './pages/admin/CreatePosition';
// import Contractors from './pages/admin/Contractors';
// import CreateContractor from './pages/admin/CreateContractor';
// import EditContractor from './pages/admin/EditContractor';
// import Employees from './pages/admin/Employees';
// import CreateEmployee from './pages/admin/CreateEmployee';
// import Locations from './pages/admin/Locations';
// import CreateLocation from './pages/admin/CreateLocation';
// import AuditLog from './pages/admin/AuditLog';
// import CreateProject from './pages/project/CreateProject';


// export default function AppRoutes() {

//   // Helper to wrap components in a PermissionRoute
//   const protect = (comp, perm) => (
//     <PermissionRoute permission={perm}>{comp}</PermissionRoute>
//   );

//   // Helper for placeholders
//   const placeholder = (title, perm) => (
//     <PermissionRoute permission={perm}><Placeholder title={title} /></PermissionRoute>
//   );

//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />

//       <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//         <Route index element={<Navigate to="/dashboard" replace />} />

//         {/* 1. Dashboard */}
//         <Route path="dashboard" element={protect(<Dashboard />, "CAN_VIEW_DASHBOARD")} />
//         <Route path="dashboard/gis" element={placeholder("GIS Map View", "CAN_VIEW_GIS_MAP")} />
//         <Route path="dashboard/alerts" element={placeholder("Alerts & Issues", "CAN_MANAGE_ALERTS")} />

//         {/* 2. Projects */}
//         <Route path="projects" element={protect(<Projects />, "CAN_VIEW_PROJECTS")} />
//         <Route path="projects/create" element={protect(<CreateProject />, "CAN_CREATE_PROJECTS")} />
//         <Route path="projects/:id" element={protect(<ProjectDetails />, "CAN_VIEW_PROJECTS")} />
//         <Route path="projects/edit/:id" element={protect(<CreateProject />, "CAN_EDIT_PROJECTS")} />
//         <Route path="projects/milestones" element={placeholder("Milestones", "CAN_VIEW_PROJECTS")} />
//         <Route path="projects/gantt" element={placeholder("Gantt Schedule", "CAN_MANAGE_GANTT")} />

//         {/* 3. Contracts & Contractors */}
//         <Route path="admin/contractors" element={protect(<Contractors />, "CAN_VIEW_USERS")} />
//         <Route path="admin/contractors/create" element={protect(<CreateContractor />, "CAN_VIEW_USERS")} />
//         <Route path="admin/contractors/edit/:id" element={protect(<EditContractor />, "CAN_VIEW_USERS")} />
//         <Route path="admin/contractors/details/:id" element={protect(<EditContractor />, "CAN_VIEW_USERS")} />

//         {/* 4. Finance */}
//         <Route path="finance/ipc" element={placeholder("IPC Management", "CAN_VIEW_FINANCE")} />
//         <Route path="finance/advance" element={placeholder("Advance Tracking", "CAN_TRACK_ADVANCE")} />
//         <Route path="finance/escalation" element={placeholder("Price Adjustment", "CAN_MANAGE_ESCALATION")} />
//         <Route path="finance/history" element={placeholder("Payment History", "CAN_VIEW_FINANCE")} />
//         {/* 3. CONTRACTS MODULE */}
//         <Route path="admin/contracts" element={placeholder("Contracts Management", "CAN_VIEW_CONTRACTS")} />
//         <Route path="admin/contracts/create" element={placeholder("Create Contract", "CAN_VIEW_CONTRACTS")} />
//         <Route path="admin/contracts/edit/:id" element={placeholder("Edit Contract", "CAN_VIEW_CONTRACTS")} />

//         {/* 5. Field Operations */}
//         <Route path="field/diary" element={placeholder("Daily Site Diary", "CAN_WRITE_DIARY")} />
//         <Route path="field/photos" element={placeholder("Geo-Tagged Photos", "CAN_UPLOAD_PHOTOS")} />
//         <Route path="field/sync" element={placeholder("Offline Sync", "CAN_FORCE_SYNC")} />

//         {/* 6. Documents */}
//         <Route path="docs/drawings" element={placeholder("Drawings", "CAN_MANAGE_DRAWINGS")} />
//         <Route path="docs/letters" element={placeholder("Letters", "CAN_MANAGE_LETTERS")} />
//         <Route path="docs/archive" element={placeholder("Archive", "CAN_ARCHIVE_DOCS")} />

//         {/* 7. Resources */}
//         <Route path="resources/equipment" element={placeholder("Equipment", "CAN_MANAGE_EQUIPMENT")} />
//         <Route path="resources/materials" element={placeholder("Inventory", "CAN_MANAGE_INVENTORY")} />

//         {/* 8. Sys Admin */}
//         <Route path="admin/sub-cities" element={protect(<SubCities />, "CAN_VIEW_USERS")} />
//         <Route path="admin/sub-cities/create" element={protect(<CreateSubCity />, "CAN_VIEW_USERS")} />
//         <Route path="admin/sub-cities/edit/:id" element={protect(<CreateSubCity />, "CAN_VIEW_USERS")} />

//         <Route path="admin/divisions" element={protect(<Divisions />, "CAN_VIEW_USERS")} />
//         <Route path="admin/divisions/create" element={protect(<CreateDivision />, "CAN_VIEW_USERS")} />
//         <Route path="admin/divisions/edit/:id" element={protect(<CreateDivision />, "CAN_VIEW_USERS")} />

//         <Route path="admin/positions" element={protect(<Positions />, "CAN_VIEW_USERS")} />
//         <Route path="admin/positions/create" element={protect(<CreatePosition />, "CAN_VIEW_USERS")} />
//         <Route path="admin/positions/edit/:id" element={protect(<CreatePosition />, "CAN_VIEW_USERS")} />

//         <Route path="admin/users" element={protect(<Users />, "CAN_VIEW_USERS")} />
//         <Route path="admin/users/create" element={protect(<CreateUser />, "CAN_MANAGE_USERS")} />
//         <Route path="admin/users/edit/:id" element={protect(<CreateUser />, "CAN_MANAGE_USERS")} />

//         <Route path="admin/employees" element={protect(<Employees />, "CAN_MANAGE_USERS")} />
//         <Route path="admin/employees/create" element={protect(<CreateEmployee />, "CAN_MANAGE_USERS")} />
//         <Route path="admin/employees/edit/:id" element={protect(<CreateEmployee />, "CAN_MANAGE_USERS")} />

//         <Route path="admin/roles" element={protect(<Roles />, "CAN_MANAGE_ROLES")} />
//         <Route path="admin/roles/create" element={protect(<CreateRole />, "CAN_MANAGE_ROLES")} />
//         <Route path="admin/roles/edit/:id" element={protect(<CreateRole />, "CAN_MANAGE_ROLES")} />
//         <Route path="admin/logs" element={placeholder("Audit Logs", "CAN_VIEW_LOGS")} />


//         <Route path="admin/locations" element={protect(<Locations />, "CAN_VIEW_USERS")} />
//         <Route path="admin/locations/create" element={protect(<CreateLocation />, "CAN_VIEW_USERS")} />
//         <Route path="admin/locations/edit/:id" element={protect(<CreateLocation />, "CAN_VIEW_USERS")} />

//         <Route path="admin/audit-log" element={protect(<AuditLog />, "CAN_VIEW_LOGS")} />

//         <Route path="*" element={<Placeholder title="Page Not Found" />} />
//       </Route>
//     </Routes>
//   );
// }

// const Placeholder = ({ title }) => (
//   <div className="p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-fadeIn">
//     <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
//     <div className="h-1 w-20 bg-[#FBAF1E] mt-2 mb-4 rounded-full"></div>
//     <p className="text-slate-400">Under development for SCCO PMS.</p>
//   </div>
// );



// AppRoutes.jsx - Optimized version
import { Routes, Route, Navigate } from 'react-router-dom';
import { memo } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { PermissionRoute } from './components/PermissionRoute';

// Page Imports (keep as is)
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
import Employees from './pages/admin/Employees';
import CreateEmployee from './pages/admin/CreateEmployee';
import Locations from './pages/admin/Locations';
import CreateLocation from './pages/admin/CreateLocation';
import AuditLog from './pages/admin/AuditLog';
import CreateProject from './pages/project/CreateProject';

// Memoize Placeholder to prevent unnecessary re-renders
const Placeholder = memo(({ title }) => (
  <div className="p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-fadeIn">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <div className="h-1 w-20 bg-[#FBAF1E] mt-2 mb-4 rounded-full"></div>
    <p className="text-slate-400">Under development for SCCO PMS.</p>
  </div>
));

// Pre-define route components to avoid recreation
const routeComponents = {
  // Dashboard
  dashboard: <Dashboard />,
  gisMap: <Placeholder title="GIS Map View" />,
  alerts: <Placeholder title="Alerts & Issues" />,

  // Projects
  projects: <Projects />,
  createProject: <CreateProject />,
  projectDetails: <ProjectDetails />,
  editProject: <CreateProject />,
  milestones: <Placeholder title="Milestones" />,
  gantt: <Placeholder title="Gantt Schedule" />,

  // Contractors
  contractors: <Contractors />,
  createContractor: <CreateContractor />,
  editContractor: <EditContractor />,
  contractorDetails: <EditContractor />,

  // Finance
  ipc: <Placeholder title="IPC Management" />,
  advance: <Placeholder title="Advance Tracking" />,
  escalation: <Placeholder title="Price Adjustment" />,
  paymentHistory: <Placeholder title="Payment History" />,

  // Contracts
  contracts: <Placeholder title="Contracts Management" />,
  createContract: <Placeholder title="Create Contract" />,
  editContract: <Placeholder title="Edit Contract" />,

  // Field Operations
  diary: <Placeholder title="Daily Site Diary" />,
  photos: <Placeholder title="Geo-Tagged Photos" />,
  sync: <Placeholder title="Offline Sync" />,

  // Documents
  drawings: <Placeholder title="Drawings" />,
  letters: <Placeholder title="Letters" />,
  archive: <Placeholder title="Archive" />,

  // Resources
  equipment: <Placeholder title="Equipment" />,
  inventory: <Placeholder title="Inventory" />,

  // Admin
  subCities: <SubCities />,
  createSubCity: <CreateSubCity />,
  editSubCity: <CreateSubCity />,
  divisions: <Divisions />,
  createDivision: <CreateDivision />,
  editDivision: <CreateDivision />,
  positions: <Positions />,
  createPosition: <CreatePosition />,
  editPosition: <CreatePosition />,
  users: <Users />,
  createUser: <CreateUser />,
  editUser: <CreateUser />,
  employees: <Employees />,
  createEmployee: <CreateEmployee />,
  editEmployee: <CreateEmployee />,
  roles: <Roles />,
  createRole: <CreateRole />,
  editRole: <CreateRole />,
  locations: <Locations />,
  createLocation: <CreateLocation />,
  editLocation: <CreateLocation />,
  auditLog: <AuditLog />,
  logs: <Placeholder title="Audit Logs" />,
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 1. Dashboard */}
        <Route path="dashboard" element={<PermissionRoute permission="CAN_VIEW_DASHBOARD">{routeComponents.dashboard}</PermissionRoute>} />
        <Route path="dashboard/gis" element={<PermissionRoute permission="CAN_VIEW_GIS_MAP">{routeComponents.gisMap}</PermissionRoute>} />
        <Route path="dashboard/alerts" element={<PermissionRoute permission="CAN_MANAGE_ALERTS">{routeComponents.alerts}</PermissionRoute>} />

        {/* 2. Projects */}
        <Route path="projects" element={<PermissionRoute permission="CAN_VIEW_PROJECTS">{routeComponents.projects}</PermissionRoute>} />
        <Route path="projects/create" element={<PermissionRoute permission="CAN_CREATE_PROJECTS">{routeComponents.createProject}</PermissionRoute>} />
        <Route path="projects/:id" element={<PermissionRoute permission="CAN_VIEW_PROJECTS">{routeComponents.projectDetails}</PermissionRoute>} />
        <Route path="projects/edit/:id" element={<PermissionRoute permission="CAN_EDIT_PROJECTS">{routeComponents.editProject}</PermissionRoute>} />
        <Route path="projects/milestones" element={<PermissionRoute permission="CAN_VIEW_PROJECTS">{routeComponents.milestones}</PermissionRoute>} />
        <Route path="projects/gantt" element={<PermissionRoute permission="CAN_MANAGE_GANTT">{routeComponents.gantt}</PermissionRoute>} />

        {/* 3. Contracts & Contractors */}
        <Route path="admin/contractors" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.contractors}</PermissionRoute>} />
        <Route path="admin/contractors/create" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.createContractor}</PermissionRoute>} />
        <Route path="admin/contractors/edit/:id" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.editContractor}</PermissionRoute>} />
        <Route path="admin/contractors/details/:id" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.contractorDetails}</PermissionRoute>} />

        {/* 4. Finance */}
        <Route path="finance/ipc" element={<PermissionRoute permission="CAN_VIEW_FINANCE">{routeComponents.ipc}</PermissionRoute>} />
        <Route path="finance/advance" element={<PermissionRoute permission="CAN_TRACK_ADVANCE">{routeComponents.advance}</PermissionRoute>} />
        <Route path="finance/escalation" element={<PermissionRoute permission="CAN_MANAGE_ESCALATION">{routeComponents.escalation}</PermissionRoute>} />
        <Route path="finance/history" element={<PermissionRoute permission="CAN_VIEW_FINANCE">{routeComponents.paymentHistory}</PermissionRoute>} />

        {/* 3. CONTRACTS MODULE */}
        <Route path="admin/contracts" element={<PermissionRoute permission="CAN_VIEW_CONTRACTS">{routeComponents.contracts}</PermissionRoute>} />
        <Route path="admin/contracts/create" element={<PermissionRoute permission="CAN_VIEW_CONTRACTS">{routeComponents.createContract}</PermissionRoute>} />
        <Route path="admin/contracts/edit/:id" element={<PermissionRoute permission="CAN_VIEW_CONTRACTS">{routeComponents.editContract}</PermissionRoute>} />

        {/* 5. Field Operations */}
        <Route path="field/diary" element={<PermissionRoute permission="CAN_WRITE_DIARY">{routeComponents.diary}</PermissionRoute>} />
        <Route path="field/photos" element={<PermissionRoute permission="CAN_UPLOAD_PHOTOS">{routeComponents.photos}</PermissionRoute>} />
        <Route path="field/sync" element={<PermissionRoute permission="CAN_FORCE_SYNC">{routeComponents.sync}</PermissionRoute>} />

        {/* 6. Documents */}
        <Route path="docs/drawings" element={<PermissionRoute permission="CAN_MANAGE_DRAWINGS">{routeComponents.drawings}</PermissionRoute>} />
        <Route path="docs/letters" element={<PermissionRoute permission="CAN_MANAGE_LETTERS">{routeComponents.letters}</PermissionRoute>} />
        <Route path="docs/archive" element={<PermissionRoute permission="CAN_ARCHIVE_DOCS">{routeComponents.archive}</PermissionRoute>} />

        {/* 7. Resources */}
        <Route path="resources/equipment" element={<PermissionRoute permission="CAN_MANAGE_EQUIPMENT">{routeComponents.equipment}</PermissionRoute>} />
        <Route path="resources/materials" element={<PermissionRoute permission="CAN_MANAGE_INVENTORY">{routeComponents.inventory}</PermissionRoute>} />

        {/* 8. Sys Admin */}
        <Route path="admin/sub-cities" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.subCities}</PermissionRoute>} />
        <Route path="admin/sub-cities/create" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.createSubCity}</PermissionRoute>} />
        <Route path="admin/sub-cities/edit/:id" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.editSubCity}</PermissionRoute>} />

        <Route path="admin/divisions" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.divisions}</PermissionRoute>} />
        <Route path="admin/divisions/create" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.createDivision}</PermissionRoute>} />
        <Route path="admin/divisions/edit/:id" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.editDivision}</PermissionRoute>} />

        <Route path="admin/positions" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.positions}</PermissionRoute>} />
        <Route path="admin/positions/create" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.createPosition}</PermissionRoute>} />
        <Route path="admin/positions/edit/:id" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.editPosition}</PermissionRoute>} />

        <Route path="admin/users" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.users}</PermissionRoute>} />
        <Route path="admin/users/create" element={<PermissionRoute permission="CAN_MANAGE_USERS">{routeComponents.createUser}</PermissionRoute>} />
        <Route path="admin/users/edit/:id" element={<PermissionRoute permission="CAN_MANAGE_USERS">{routeComponents.editUser}</PermissionRoute>} />

        <Route path="admin/employees" element={<PermissionRoute permission="CAN_MANAGE_USERS">{routeComponents.employees}</PermissionRoute>} />
        <Route path="admin/employees/create" element={<PermissionRoute permission="CAN_MANAGE_USERS">{routeComponents.createEmployee}</PermissionRoute>} />
        <Route path="admin/employees/edit/:id" element={<PermissionRoute permission="CAN_MANAGE_USERS">{routeComponents.editEmployee}</PermissionRoute>} />

        <Route path="admin/roles" element={<PermissionRoute permission="CAN_MANAGE_ROLES">{routeComponents.roles}</PermissionRoute>} />
        <Route path="admin/roles/create" element={<PermissionRoute permission="CAN_MANAGE_ROLES">{routeComponents.createRole}</PermissionRoute>} />
        <Route path="admin/roles/edit/:id" element={<PermissionRoute permission="CAN_MANAGE_ROLES">{routeComponents.editRole}</PermissionRoute>} />
        <Route path="admin/logs" element={<PermissionRoute permission="CAN_VIEW_LOGS">{routeComponents.logs}</PermissionRoute>} />

        <Route path="admin/locations" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.locations}</PermissionRoute>} />
        <Route path="admin/locations/create" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.createLocation}</PermissionRoute>} />
        <Route path="admin/locations/edit/:id" element={<PermissionRoute permission="CAN_VIEW_USERS">{routeComponents.editLocation}</PermissionRoute>} />

        <Route path="admin/audit-log" element={<PermissionRoute permission="CAN_VIEW_LOGS">{routeComponents.auditLog}</PermissionRoute>} />

        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Route>
    </Routes>
  );
}