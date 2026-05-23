package et.scco.pms_backend.config;

import et.scco.pms_backend.enums.AccessType;
import et.scco.pms_backend.utility.EndpointPermission;

import java.util.List;

public class EndpointPermissionConfig {

    public static final List<EndpointPermission> MAPPINGS = List.of(

            // =========================
            // AUTH / PUBLIC
            // =========================
            new EndpointPermission("POST", "/api/auth/login", AccessType.PUBLIC, null),
            new EndpointPermission("GET", "/api/auth/profile", AccessType.AUTHENTICATED, null),
            new EndpointPermission("POST", "/api/auth/logout", AccessType.AUTHENTICATED, null),
            new EndpointPermission("PUT", "/api/auth/change-password", AccessType.AUTHENTICATED, null),
            new EndpointPermission("GET", "/api/jurisdiction/*", AccessType.AUTHENTICATED, null),

            // =========================
            // GET REQUESTS
            // =========================
            new EndpointPermission("GET", "/api/admin/logs/**", AccessType.PERMISSION,"CAN_SEE_SYS_ADMIN"),
            new EndpointPermission("GET", "/api/admin/client/{id}", AccessType.PERMISSION, "CAN_SEE_CLIENT_LIST"),
            new EndpointPermission("GET", "/api/admin/client", AccessType.PERMISSION, "CAN_SEE_CLIENT_LIST"),
            new EndpointPermission("GET", "/api/admin/client/download/**", AccessType.PERMISSION, "CAN_SEE_CLIENT_LIST"),
            new EndpointPermission("GET", "/api/admin/consultancy/*", AccessType.PERMISSION, "CAN_SEE_CONSULTANT_LIST"),
            new EndpointPermission("GET", "/api/admin/consultancy", AccessType.PERMISSION, "CAN_SEE_CONSULTANT_LIST"),
            new EndpointPermission("GET", "/api/admin/consultancy/download/**", AccessType.PERMISSION, "CAN_SEE_CONSULTANT_LIST"),
            new EndpointPermission("GET", "/api/admin/contractors/*", AccessType.PERMISSION, "CAN_SEE_CONTRACTOR_LIST"),
            new EndpointPermission("GET", "/api/admin/contractors", AccessType.PERMISSION, "CAN_SEE_CONTRACTOR_LIST"),
            new EndpointPermission("GET", "/api/admin/contractors/download/**", AccessType.PERMISSION, "CAN_SEE_CONTRACTOR_LIST"),
            new EndpointPermission("GET", "/api/admin/divisions", AccessType.PERMISSION, "CAN_SEE_DIVISION_REPORT"),
            new EndpointPermission("GET", "/api/admin/divisions/*", AccessType.PERMISSION, "CAN_SEE_DIVISION_REPORT"),
            new EndpointPermission("GET", "/api/admin/employees", AccessType.PERMISSION, "CAN_SEE_EMPLOYEE_REPORT"),
            new EndpointPermission("GET", "/api/admin/employees/*", AccessType.PERMISSION, "CAN_SEE_EMPLOYEE_REPORT"),
            new EndpointPermission("GET", "/api/admin/employees/no-user", AccessType.PERMISSION, "CAN_SEE_EMPLOYEE_REPORT"),
            new EndpointPermission("GET", "/api/admin/inspection-types", AccessType.PERMISSION, "CAN_SEE_INSPECTION_TYPE"),
            new EndpointPermission("GET", "/api/admin/inspection-types/*", AccessType.PERMISSION, "CAN_SEE_INSPECTION_TYPE"),
            new EndpointPermission("GET", "/api/admin/locations", AccessType.PERMISSION, "CAN_SEE_LOCATION_REPORT"),
            new EndpointPermission("GET", "/api/admin/locations/*", AccessType.PERMISSION, "CAN_SEE_LOCATION_REPORT"),
            new EndpointPermission("GET", "/api/admin/mobile", AccessType.PERMISSION, "CAN_SEE_MOBILE_USER"),
            new EndpointPermission("GET", "/api/admin/mobile/profile", AccessType.AUTHENTICATED, null),
            new EndpointPermission("GET", "/api/notifications", AccessType.AUTHENTICATED, null),
            new EndpointPermission("GET", "/api/admin/permissions", AccessType.PERMISSION, "CAN_SEE_SYS_ADMIN"),
            new EndpointPermission("GET", "/api/admin/positions", AccessType.PERMISSION, "CAN_SEE_POSITION"),
            new EndpointPermission("GET", "/api/admin/positions/*", AccessType.PERMISSION, "CAN_SEE_POSITION"),
            new EndpointPermission("GET", "/api/admin/roles/*", AccessType.PERMISSION, "CAN_SEE_ROLE"),
            new EndpointPermission("GET", "/api/admin/roles", AccessType.PERMISSION, "CAN_SEE_ROLE"),
            new EndpointPermission("GET", "/api/admin/cities/city", AccessType.PERMISSION, "CAN_SEE_CITY"),
            new EndpointPermission("GET", "/api/admin/cities/sub", AccessType.PERMISSION, "CAN_SEE_SUBCITY"),
            new EndpointPermission("GET", "/api/admin/cities/sub/*", AccessType.PERMISSION, "CAN_SEE_SUBCITY"),
            new EndpointPermission("GET", "/api/admin/task-types", AccessType.PERMISSION, "CAN_SEE_TASK_TYPE"),
            new EndpointPermission("GET", "/api/admin/task-types/*", AccessType.PERMISSION, "CAN_SEE_TASK_TYPE"),
            new EndpointPermission("GET", "/api/admin/users/*", AccessType.PERMISSION, "CAN_SEE_USER"),
            new EndpointPermission("GET", "/api/admin/users", AccessType.PERMISSION, "CAN_SEE_USER"),
            new EndpointPermission("GET", "/api/colorCodes/fiscal-years", AccessType.AUTHENTICATED, null),
            new EndpointPermission("GET", "/api/colorCodes/*", AccessType.PERMISSION, "CAN_VIEW_COLOR_CODING"),
            new EndpointPermission("GET", "/api/colorCodes/details/*", AccessType.PERMISSION, "CAN_VIEW_COLOR_CODING"),
            new EndpointPermission("GET", "/api/colorCodes", AccessType.PERMISSION, "CAN_SEE_COLOR_CODING_LIST"),
            new EndpointPermission("GET", "/api/colorCodes/download/**", AccessType.PERMISSION, "CAN_VIEW_COLOR_CODING"),
            new EndpointPermission("GET", "/api/colorCodes/*/achievements", AccessType.PERMISSION, "CAN_VIEW_COLOR_CODING"),
            new EndpointPermission("GET", "/api/admin/inspections", AccessType.PERMISSION, "CAN_SEE_INSPECTIONS"),
            new EndpointPermission("GET", "/api/admin/inspections/*", AccessType.PERMISSION, "CAN_VIEW_INSPECTION"),
            new EndpointPermission("GET", "/api/admin/inspections/project/*", AccessType.PERMISSION, "CAN_SEE_INSPECTIONS"),
            new EndpointPermission("GET", "/api/projects", AccessType.PERMISSION, "CAN_SEE_PROJECT_LIST"),
            new EndpointPermission("GET", "/api/projects/my", AccessType.PERMISSION, "CAN_SEE_MY_REPORTEES"),
            new EndpointPermission("GET", "/api/projects/*", AccessType.PERMISSION, "CAN_VIEW_PROJECT_DETAIL"),
            new EndpointPermission("GET", "/api/projects/*/costs", AccessType.PERMISSION, "CAN_SEE_PROJECT_FINANCE"),
            new EndpointPermission("GET", "/api/projects/initiations", AccessType.PERMISSION, "CAN_SEE_PROJECT_INITIATION"),
            new EndpointPermission("GET", "/api/projects/initiations/*", AccessType.PERMISSION, "CAN_VIEW_PROJECT_INITIATION_DETAILS"),
            new EndpointPermission("GET", "/api/tasks", AccessType.PERMISSION, "CAN_SEE_TASK_REPORT"),
            new EndpointPermission("GET", "/api/tasks/download/**", AccessType.PERMISSION, "CAN_VIEW_TASK"),
            new EndpointPermission("GET", "/api/tasks/my", AccessType.PERMISSION, "CAN_SEE_MY_REPORTEES"),
            new EndpointPermission("GET", "/api/tasks/*", AccessType.PERMISSION, "CAN_VIEW_TASK"),
            new EndpointPermission("GET", "/api/tasks/project/*", AccessType.PERMISSION, "CAN_SEE_TASK_REPORT"),

            // =========================
            // POST REQUESTS
            // =========================
            new EndpointPermission("POST", "/api/admin/client", AccessType.PERMISSION, "CAN_MANAGE_CLIENT"),
            new EndpointPermission("POST", "/api/admin/consultancy", AccessType.PERMISSION, "CAN_MANAGE_CONSULTANT"),
            new EndpointPermission("POST", "/api/admin/contractors", AccessType.PERMISSION, "CAN_MANAGE_CONTRACTOR"),
            new EndpointPermission("POST", "/api/admin/divisions", AccessType.PERMISSION, "CAN_REGISTER_DIVISION"),
            new EndpointPermission("POST", "/api/admin/employees", AccessType.PERMISSION, "CAN_CREATE_EMPLOYEE"),
            new EndpointPermission("POST", "/api/admin/inspection-types", AccessType.PERMISSION, "CAN_REGISTER_INSPECTION_TYPE"),
            new EndpointPermission("POST", "/api/admin/locations", AccessType.PERMISSION, "CAN_REGISTER_LOCATION"),
            new EndpointPermission("POST", "/api/admin/mobile", AccessType.PERMISSION, "CAN_REGISTER_MOBILE_USER"),
            new EndpointPermission("POST", "/api/admin/mobile/verify", AccessType.PERMISSION, "CAN_REGISTER_MOBILE_USER"),
            new EndpointPermission("POST", "/api/admin/positions", AccessType.PERMISSION, "CAN_CREATE_POSITION"),
            new EndpointPermission("POST", "/api/admin/roles", AccessType.PERMISSION, "CAN_CREATE_ROLE"),
            new EndpointPermission("POST", "/api/admin/cities/sub", AccessType.PERMISSION, "CAN_CREATE_SUBCITY"),
            new EndpointPermission("POST", "/api/admin/task-types", AccessType.PERMISSION, "CAN_CREATE_TASK_TYPE"),
            new EndpointPermission("POST", "/api/admin/users", AccessType.PERMISSION, "CAN_CREATE_USER"),
            new EndpointPermission("POST", "/api/colorCodes", AccessType.PERMISSION, "CAN_REGISTER_COLOR_CODING"),
            new EndpointPermission("POST", "/api/colorCodes/submit-achievement", AccessType.PERMISSION, "CAN_SEND_COLOR_CODING_ACHIEVEMENT"),
            new EndpointPermission("POST", "/api/admin/inspections", AccessType.PERMISSION, "CAN_LOG_INSPECTION"),
            new EndpointPermission("POST", "/api/projects/*/extend", AccessType.PERMISSION, "CAN_EDIT_PROJECT"),
            new EndpointPermission("POST", "/api/projects/costs", AccessType.PERMISSION, "CAN_RECORD_COST"),
            new EndpointPermission("POST", "/api/projects/initiations", AccessType.PERMISSION, "CAN_CREATE_PROJECT_INITIATION"),
            new EndpointPermission("POST", "/api/tasks", AccessType.PERMISSION, "CAN_CREATE_TASK"),

            // =========================
            // PUT / PATCH REQUESTS
            // =========================
            new EndpointPermission("PUT", "/api/admin/client/{id}", AccessType.PERMISSION, "CAN_MANAGE_CLIENT"),
            new EndpointPermission("PUT", "/api/admin/consultancy/*", AccessType.PERMISSION, "CAN_MANAGE_CONSULTANT"),
            new EndpointPermission("PUT", "/api/admin/contractors/*", AccessType.PERMISSION, "CAN_MANAGE_CONTRACTOR"),
            new EndpointPermission("PUT", "/api/admin/divisions/*", AccessType.PERMISSION, "CAN_EDIT_DIVISION"),
            new EndpointPermission("PUT", "/api/admin/employees/*", AccessType.PERMISSION, "CAN_EDIT_EMPLOYEE"),
            new EndpointPermission("PUT", "/api/admin/inspection-types/*", AccessType.PERMISSION, "CAN_EDIT_INSPECTION_TYPE"),
            new EndpointPermission("PUT", "/api/admin/locations/*", AccessType.PERMISSION, "CAN_EDIT_LOCATION"),
            new EndpointPermission("PATCH", "/api/admin/mobile/*/status", AccessType.PERMISSION, "CAN_UPDATE_MOBILE_USER_STATUS"),
            new EndpointPermission("PUT", "/api/admin/positions/*", AccessType.PERMISSION, "CAN_EDIT_POSITION"),
            new EndpointPermission("PUT", "/api/admin/roles/*", AccessType.PERMISSION, "CAN_EDIT_ROLE"),
            new EndpointPermission("PUT", "/api/admin/cities/sub/*", AccessType.PERMISSION, "CAN_EDIT_SUBCITY"),
            new EndpointPermission("PUT", "/api/admin/task-types/*", AccessType.PERMISSION, "CAN_EDIT_TASK_TYPE"),
            new EndpointPermission("PUT", "/api/admin/users/*", AccessType.PERMISSION, "CAN_EDIT_USER"),
            new EndpointPermission("PUT", "/api/colorCodes/*", AccessType.PERMISSION, "CAN_EDIT_COLOR_CODING"),
            new EndpointPermission("PUT", "/api/colorCodes/achievement/*", AccessType.PERMISSION, "CAN_REVEW_COLOR_CODING_ACHIEVEMENT"),
            new EndpointPermission("PUT", "/api/admin/inspections/*", AccessType.PERMISSION, "CAN_EDIT_INSPECTION"),
            new EndpointPermission("PUT", "/api/admin/inspections/comment/*", AccessType.PERMISSION, "CAN_COMMENT_INSPECTION"),
            new EndpointPermission("PUT", "/api/projects/*", AccessType.PERMISSION, "CAN_EDIT_PROJECT"),
            new EndpointPermission("PUT", "/api/projects/costs/*", AccessType.PERMISSION, "CAN_EDIT_RECORD"),
            new EndpointPermission("PUT", "/api/projects/initiations/*", AccessType.PERMISSION, "CAN_EDIT_PROJECT_INITIATION"),
            new EndpointPermission("PUT", "/api/tasks/*", AccessType.PERMISSION, "CAN_EDIT_TASK"),

            // =========================
            // DELETE REQUESTS
            // =========================
            new EndpointPermission("DELETE", "/api/admin/client/{id}", AccessType.PERMISSION, "CAN_MANAGE_CLIENT"),
            new EndpointPermission("DELETE", "/api/admin/consultancy/*", AccessType.PERMISSION, "CAN_MANAGE_CONSULTANT"),
            new EndpointPermission("DELETE", "/api/admin/contractors/*", AccessType.PERMISSION, "CAN_MANAGE_CONTRACTOR"),
            new EndpointPermission("DELETE", "/api/admin/divisions/*", AccessType.PERMISSION, "CAN_DELETE_DIVISION"),
            new EndpointPermission("DELETE", "/api/admin/employees/*", AccessType.PERMISSION, "CAN_DELETE_EMPLOYEE"),
            new EndpointPermission("DELETE", "/api/admin/inspection-types/*", AccessType.PERMISSION, "CAN_DELETE_INSPECTION_TYPE"),
            new EndpointPermission("DELETE", "/api/admin/locations/*", AccessType.PERMISSION, "CAN_DELETE_LOCATION"),
            new EndpointPermission("DELETE", "/api/admin/mobile/*", AccessType.PERMISSION, "CAN_DELETE_MOBILE_USER"),
            new EndpointPermission("DELETE", "/api/admin/positions/*", AccessType.PERMISSION, "CAN_DELETE_POSITION"),
            new EndpointPermission("DELETE", "/api/admin/roles/*", AccessType.PERMISSION, "CAN_DELETE_ROLE"),
            new EndpointPermission("DELETE", "/api/admin/cities/sub/*", AccessType.PERMISSION, "CAN_DELETE_SUBCITY"),
            new EndpointPermission("DELETE", "/api/admin/task-types/*", AccessType.PERMISSION, "CAN_DELETE_TASK_TYPE"),
            new EndpointPermission("DELETE", "/api/admin/users/*", AccessType.PERMISSION, "CAN_DELETE_USER"),
            new EndpointPermission("DELETE", "/api/colorCodes/*", AccessType.PERMISSION, "CAN_DELETE_COLOR_CODING"),
            new EndpointPermission("DELETE", "/api/admin/inspections/*", AccessType.PERMISSION, "CAN_DELETE_INSPECTION"),
            new EndpointPermission("DELETE", "/api/projects/*", AccessType.PERMISSION, "CAN_DELETE_PROJECT"),
            new EndpointPermission("DELETE", "/api/projects/*/extensions/*", AccessType.PERMISSION, "CAN_EDIT_PROJECT"),
            new EndpointPermission("DELETE", "/api/projects/costs/*", AccessType.PERMISSION, "CAN_DELETE_RECORD"),
            new EndpointPermission("DELETE", "/api/projects/initiations/*", AccessType.PERMISSION, "CAN_DELETE_PROJECT_INITIATION"),
            new EndpointPermission("DELETE", "/api/tasks/*", AccessType.PERMISSION, "CAN_DELETE_TASK")
    );
}