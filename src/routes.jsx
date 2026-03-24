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
import ColorCodingDetails from './pages/planning/ColorCodingDetails';
import InspectionTypes from './pages/admin/InspectionTypes';
import CreateInspectionType from './pages/admin/CreateInspectionType';
import Inspections from './pages/project/Inspections';
import CreateInspection from './pages/project/CreateInspection';
import OrgStructure from './pages/admin/OrgStructure';
import ProjectReportPage from './pages/reports/ProjectReportPage';
import TaskReportPage from './pages/reports/TaskReportPage';
import Mobile from './pages/admin/Mobile';
import ProjectCosts from './pages/project/ProjectCosts';
import ManageProjectCosts from './pages/project/ManageProjectCosts';
import RoleReportPage from './pages/reports/RoleReportPage';
import EmployeeReportPage from './pages/reports/EmployeeReportPage';
import UserReportPage from './pages/reports/UserReportPage';
import LocationReportPage from './pages/reports/LocationReportPage';
import DivisionReportPage from './pages/reports/DivisionReportPage';
import ContractorReportPage from './pages/reports/ContractorReportPage';
import Consultancies from './pages/admin/Consultancies';
import CreateConsultant from './pages/admin/CreateConsultancies';
import Clients from './pages/admin/Clients';
import CreateClient from './pages/admin/CreateClient';
import Reportees from './pages/admin/Reportees';


export default function AppRoutes() {

  const protect = (comp, perm) => (
    <PermissionRoute permission={perm}>{comp}</PermissionRoute>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 1. Dashboard */}
        <Route path="dashboard" element={protect(<Dashboard />, "CAN_SEE_DASHBOARD")} />
        <Route path="org-structure" element={protect(<OrgStructure />, "CAN_SEE_ORG_STRUCTURE")} />
        <Route path="my-reportees" element={protect(<Reportees />, "CAN_SEE_MY_REPORTEES")} />

        {/* 2. Projects */}
        <Route path="projects" element={protect(<Projects />, "CAN_SEE_PROJECT_LIST")} />
        <Route path="projects/create" element={protect(<CreateProject />, "CAN_CREATE_PROJECT")} />
        <Route path="projects/:id" element={protect(<ProjectDetails />, "CAN_VIEW_PROJECT_DETAIL")} />
        <Route path="projects/edit/:id" element={protect(<CreateProject />, "CAN_EDIT_PROJECT")} />

        {/* Inspections */}
        <Route path="inspections" element={protect(<Inspections />, "CAN_SEE_INSPECTIONS")} />
        <Route path="inspections/create" element={protect(<CreateInspection />, "CAN_LOG_INSPECTION")} />
        <Route path='inspections/:id' element={protect(<CreateInspection />, "CAN_VIEW_INSPECTION")} />
        <Route path="inspections/edit/:id" element={protect(<CreateInspection />, "CAN_EDIT_INSPECTION")} />

        {/* 3. Finance */}
        <Route path="project-costs" element={protect(<ProjectCosts />, "CAN_SEE_PROJECT_FINANCE")} />
        <Route path="project-costs/:id" element={protect(<ManageProjectCosts />, "CAN_RECORD_COST")} />

        {/* 4. Contractors */}
        <Route path="contractors" element={protect(<Contractors />, "CAN_SEE_CONTRACT_LIST")} />
        <Route path="contractors/create" element={protect(<CreateContractor />, "CAN_REGISTER_CONTRACTOR")} />
        <Route path="contractors/edit/:id" element={protect(<CreateContractor />, "CAN_EDIT_CONTRACTOR")} />

        <Route path="consultancy" element={protect(<Consultancies />, "CAN_SEE_CONSULTANT_LIST")} />
        <Route path="consultancy/create" element={protect(<CreateConsultant />, "CAN_REGISTER_CONSULTANT")} />
        <Route path="consultancy/edit/:id" element={protect(<CreateConsultant />, "CAN_EDIT_CONSULTANT")} />

        <Route path="client" element={protect(<Clients />, "CAN_SEE_CONSULTANT_LIST")} />
        <Route path="client/create" element={protect(<CreateClient />, "CAN_REGISTER_CONSULTANT")} />
        <Route path="client/edit/:id" element={protect(<CreateClient />, "CAN_EDIT_CONSULTANT")} />


        {/* 5. Planning */}
        <Route path="planning/ColorCodings" element={protect(<ColorCodings />, "CAN_SEE_COLOR_CODING_LIST")} />
        <Route path="planning/ColorCodings/create" element={protect(<CreateColorCoding />, "CAN_REGISTER_COLOR_CODING")} />
        <Route path="planning/ColorCodings/edit/:id" element={protect(<CreateColorCoding />, "CAN_EDIT_COLOR_CODING")} />
        <Route path="planning/ColorCodings/details/:id" element={protect(<ColorCodingDetails />, "CAN_VIEW_COLOR_CODING")} />

        {/* 6. Reports */}
        <Route path="reports/project" element={protect(<ProjectReportPage />, "CAN_SEE_PROJECT_REPORT")} />
        <Route path="reports/task" element={protect(<TaskReportPage />, "CAN_SEE_TASK_REPORT")} />
        <Route path="reports/role" element={protect(<RoleReportPage />, "CAN_SEE_ROLE_REPORT")} />
        <Route path="reports/employee" element={protect(<EmployeeReportPage />, "CAN_SEE_EMPLOYEE_REPORT")} />
        <Route path="reports/user" element={protect(<UserReportPage />, "CAN_SEE_USER_REPORT")} />
        <Route path="reports/contractor" element={protect(<ContractorReportPage />, "CAN_SEE_CONTRACTORS_REPORT")} />
        <Route path="reports/location" element={protect(<LocationReportPage />, "CAN_SEE_LOCATION_REPORT")} />
        <Route path="reports/division" element={protect(<DivisionReportPage />, "CAN_SEE_DIVISION_REPORT")} />

        {/* 7. Sys Admin */}
        <Route path="admin/sub-cities" element={protect(<SubCities />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/sub-cities/create" element={protect(<CreateSubCity />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/sub-cities/edit/:id" element={protect(<CreateSubCity />, "CAN_SEE_SYS_ADMIN")} />

        <Route path="admin/divisions" element={protect(<Divisions />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/divisions/create" element={protect(<CreateDivision />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/divisions/edit/:id" element={protect(<CreateDivision />, "CAN_SEE_SYS_ADMIN")} />

        <Route path="admin/positions" element={protect(<Positions />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/positions/create" element={protect(<CreatePosition />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/positions/edit/:id" element={protect(<CreatePosition />, "CAN_SEE_SYS_ADMIN")} />

        <Route path="admin/users" element={protect(<Users />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/users/create" element={protect(<CreateUser />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/users/edit/:id" element={protect(<CreateUser />, "CAN_SEE_SYS_ADMIN")} />

        <Route path="admin/employees" element={protect(<Employees />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/employees/create" element={protect(<CreateEmployee />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/employees/edit/:id" element={protect(<CreateEmployee />, "CAN_SEE_SYS_ADMIN")} />

        <Route path="admin/roles" element={protect(<Roles />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/roles/create" element={protect(<CreateRole />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/roles/edit/:id" element={protect(<CreateRole />, "CAN_SEE_SYS_ADMIN")} />

        <Route path="admin/locations" element={protect(<Locations />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/locations/create" element={protect(<CreateLocation />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/locations/edit/:id" element={protect(<CreateLocation />, "CAN_SEE_SYS_ADMIN")} />

        <Route path="admin/audit-log" element={protect(<AuditLog />, "CAN_SEE_SYS_ADMIN")} />
        <Route path='admin/mobile' element={protect(<Mobile />, "CAN_SEE_SYS_ADMIN")} />

        <Route path="admin/inspection-types" element={protect(<InspectionTypes />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/inspection-types/create" element={protect(<CreateInspectionType />, "CAN_SEE_SYS_ADMIN")} />
        <Route path="admin/inspection-types/edit/:id" element={protect(<CreateInspectionType />, "CAN_SEE_SYS_ADMIN")} />

        {/* 404 */}
      </Route>
      <Route path="*" element={<div>Page Not Found</div>} />

    </Routes>
  );
}