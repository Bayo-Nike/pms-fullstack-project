export const SYSTEM_MODULES = [
    {
        id: 1, name: "Dashboard", slug: "dashboard",
        permissions: [
            { id: 101, name: "View Dashboard", slug: "can_view_dashboard" },
            { id: 102, name: "View GIS Map", slug: "can_view_gis_map" },
            { id: 103, name: "View KPIs", slug: "can_view_kpis" },
            { id: 104, name: "Manage Alerts", slug: "can_manage_alerts" },
        ],
    },
    {
        id: 2, name: "Projects", slug: "projects",
        permissions: [
            { id: 201, name: "View Projects", slug: "can_view_projects" },
            { id: 202, name: "Create Projects", slug: "can_create_projects" },
            { id: 203, name: "Edit Projects", slug: "can_edit_projects" },
            { id: 204, name: "Manage Schedule", slug: "can_manage_gantt" },
            { id: 205, name: "Delete Projects", slug: "can_delete_projects" },
        ],
    },
    {
        id: 3, name: "Contracts", slug: "contracts",
        permissions: [
            { id: 301, name: "View Contracts", slug: "can_view_contracts" },
            { id: 302, name: "Manage VO", slug: "can_manage_vo" },
            { id: 303, name: "Rate Performance", slug: "can_rate_contractors" },
            { id: 304, name: "Manage Retention", slug: "can_manage_retention" },
            { id: 305, name: "Access Repository", slug: "can_access_repository" },
        ],
    },
    {
        id: 4, name: "Finance", slug: "finance",
        permissions: [
            { id: 401, name: "View Finance", slug: "can_view_finance" },
            { id: 402, name: "Submit IPC", slug: "can_submit_ipc" },
            { id: 403, name: "Verify IPC", slug: "can_verify_ipc" },
            { id: 404, name: "Track Advances", slug: "can_track_advance" },
            { id: 405, name: "Manage Escalation", slug: "can_manage_escalation" },
        ],
    },
    {
        id: 5, name: "Field Ops", slug: "field",
        permissions: [
            { id: 501, name: "Write Diary", slug: "can_write_diary" },
            { id: 502, name: "Upload Photos", slug: "can_upload_photos" },
            { id: 503, name: "View Reports", slug: "can_view_field_reports" },
            { id: 504, name: "Force Sync", slug: "can_force_sync" },
        ],
    },
    {
        id: 6, name: "Documents", slug: "documents",
        permissions: [
            { id: 601, name: "View Docs", slug: "can_view_docs" },
            { id: 602, name: "Manage Drawings", slug: "can_manage_drawings" },
            { id: 603, name: "Manage Letters", slug: "can_manage_letters" },
            { id: 604, name: "Archive Records", slug: "can_archive_docs" },
        ],
    },
    {
        id: 7, name: "Resources", slug: "resources",
        permissions: [
            { id: 701, name: "View Resources", slug: "can_view_resources" },
            { id: 702, name: "Manage Equipment", slug: "can_manage_equipment" },
            { id: 703, name: "Manage Inventory", slug: "can_manage_inventory" },
        ],
    },
    {
        id: 8, name: "Sys Admin", slug: "admin",
        permissions: [
            { id: 801, name: "View Users", slug: "can_view_users" },
            { id: 802, name: "Manage Users", slug: "can_manage_users" },
            { id: 803, name: "Manage Roles", slug: "can_manage_roles" },
            { id: 804, name: "Manage Modules", slug: "can_manage_modules" },
            { id: 805, name: "View Logs", slug: "can_view_logs" },
        ],
    },
];