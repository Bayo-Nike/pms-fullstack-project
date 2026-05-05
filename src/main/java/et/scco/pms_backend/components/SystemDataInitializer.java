package et.scco.pms_backend.components;


import et.scco.pms_backend.enums.DivisionGroup;
import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.modules.admin.model.*;
import et.scco.pms_backend.modules.admin.model.Module;
import et.scco.pms_backend.modules.admin.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Transactional
@Component
@RequiredArgsConstructor
public class SystemDataInitializer implements ApplicationRunner {

    private final ModuleRepository moduleRepository;
    private final PermissionRepository permissionRepository;
    private final DivisionRepository divisionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SuperAdminProperties superAdminProperties;
    private final CityRepository cityRepository;
    private final SubCityRepository subCityRepository;
    private final PositionRepository positionRepository;

    @Override
    public void run(@NonNull ApplicationArguments args) {

        initCity();
        initSubCities();
        initDivisions();
        initPositions();
        initModulesAndPermissions();
        initSuperAdmin();
    }

    private void initCity() {

        cityRepository.findById(1L)
                .orElseGet(() ->
                        cityRepository.save(new City(1L, "Shaggar City"))
                );
    }

    private void initSubCities() {

        City city = cityRepository.findById(1L)
                .orElseThrow();

        List<String> names = List.of(
                "Kura Jida",
                "Laga Tafo",
                "Burayu",
                "Koye Fache",
                "Galan",
                "Furi",
                "Galan Guda",
                "Sabata",
                "Malka Nono",
                "Gafarsa Guje",
                "Mana Abichu",
                "Sululta"
        );

        List<SubCity> subCities = names.stream()
                .filter(name -> !subCityRepository.existsBySubCityNameIgnoreCase(name))
                .map(name -> {
                    SubCity sub = new SubCity();
                    sub.setSubCityName(name);
                    sub.setCity(city);
                    return sub;
                })
                .toList();

        subCityRepository.saveAll(subCities);
    }

    private void initDivisions() {
        if (divisionRepository.count() > 2){
            return;
        }
        createDivision("Mayor Office", DivisionGroup.BTH, null);

        createDivision("City Office", DivisionGroup.BTH, "Mayor Office");

        createDivision("City Record Office", DivisionGroup.BTH, "City Office");
        createDivision("City Building Director Office", DivisionGroup.BLD, "City Office");
        createDivision("City Water and Road Director Office", DivisionGroup.WAR, "City Office");
        createDivision("City Industry Construction Director Office", DivisionGroup.BTH, "City Office");
        createDivision("Sub-City Office", DivisionGroup.BTH, "City Office");
        createDivision("City Finance Office", DivisionGroup.BTH, "City Office");

        createDivision("City Design Team Leader Office", DivisionGroup.BLD, "City Building Director Office");
        createDivision("City Monitoring Team Leader Office", DivisionGroup.BLD, "City Building Director Office");

        createDivision("City Road Design Approval Team Leader Office", DivisionGroup.WAR, "City Water and Road Director Office");
        createDivision("City Road Monitoring and Supervision Team Leader Office", DivisionGroup.WAR, "City Water and Road Director Office");
        createDivision("City Water and Irrigation Design Approval Team Leader Office", DivisionGroup.WAR, "City Water and Road Director Office");
        createDivision("City Water and Irrigation Monitoring and Supervision Team Leader Office", DivisionGroup.WAR, "City Water and Road Director Office");

        createDivision("Sub-City Building Team Leader Office", DivisionGroup.BLD, "Sub-City Office");
        createDivision("Sub-City Water and Road Team Leader Office", DivisionGroup.WAR, "Sub-City Office");
        createDivision("Sub-City Record Office", DivisionGroup.BTH, "Sub-City Office");
        createDivision("Sub-City Finance Office", DivisionGroup.BTH, "Sub-City Office");
    }

    private void createDivision(String name, DivisionGroup divisionGroup, String parentName) {

        if (divisionRepository.existsByNameIgnoreCase(name)) {
            return;
        }

        Division division = new Division();
        division.setName(name);
        division.setDivisionGroup(divisionGroup);

        if (parentName != null) {
            divisionRepository.findByNameIgnoreCase(parentName)
                    .ifPresent(division::setParent);
        }

        divisionRepository.save(division);
    }

    private void initPositions() {
        if (positionRepository.count() > 2){
            return;
        }
        createPosition("Mayor", null, "Mayor Office");

        createPosition("City Office Head", "Mayor", "City Office");

        createPosition("City Building Director", "City Office Head", "City Building Director Office");
        createPosition("City Water and Road Director", "City Office Head", "City Water and Road Director Office");
        createPosition("City Industry Construction Director", "City Office Head", "City Industry Construction Director Office");
        createPosition("Sub-City Office Head", "City Office Head", "Sub-City Office");
        createPosition("Finance Officer", "City Office Head", "City Finance Office");
        createPosition("City Record Office Head", "City Office Head", "City Record Office");

        createPosition("City Design Team Leader", "City Building Director", "City Design Team Leader Office");
        createPosition("City Monitoring Team Leader", "City Building Director", "City Monitoring Team Leader Office");

        createPosition("City Road Design Approval Team Leader", "City Water and Road Director", "City Road Design Approval Team Leader Office");
        createPosition("City Road Monitoring and Supervision Team Leader", "City Water and Road Director", "City Road Monitoring and Supervision Team Leader Office");
        createPosition("City Water and Irrigation Design Approval Team Leader", "City Water and Road Director", "City Water and Irrigation Design Approval Team Leader Office");
        createPosition("City Water and Irrigation Monitoring and Supervision Team Leader", "City Water and Road Director", "City Water and Irrigation Monitoring and Supervision Team Leader Office");

        createPosition("City Design Site Engineer", "City Design Team Leader", "City Design Team Leader Office");
        createPosition("City Monitoring Site Engineer", "City Monitoring Team Leader", "City Monitoring Team Leader Office");

        createPosition("Sub-City Building Team Leader", "Sub-City Office Head", "Sub-City Building Team Leader Office");
        createPosition("Sub-City Water and Road Team Leader", "Sub-City Office Head", "Sub-City Water and Road Team Leader Office");
        createPosition("Sub-City Record Office Head", "Sub-City Office Head", "Sub-City Record Office");

        createPosition("Sub-City Building Site Engineer", "Sub-City Building Team Leader", "Sub-City Building Team Leader Office");
        createPosition("Sub-City Water and Road Site Engineer", "Sub-City Water and Road Team Leader", "Sub-City Water and Road Team Leader Office");
        
    }


    private void createPosition(String name,
                                String parentName,
                                String divisionName) {

        if (positionRepository.existsByNameIgnoreCase(name)) {
            return;
        }

        Division division = divisionRepository.findByNameIgnoreCase(divisionName)
                .orElseThrow(() -> new RuntimeException("Division not found: " + divisionName));

        Position position = new Position();
        position.setName(name);
        position.setDivision(division);

        if (parentName != null) {
            positionRepository.findByNameIgnoreCase(parentName)
                    .ifPresent(position::setParent);
        }

        positionRepository.save(position);
    }


    private void initModulesAndPermissions() {

        insertModuleWithPermissions(
                "Dashboard",
                List.of(
                        new PermissionData("CAN_SEE_DASHBOARD", "See Dashboard"),
                        new PermissionData("CAN_SEE_ORG_STRUCTURE", "See Organization Structure"),
                        new PermissionData("CAN_SEE_MY_REPORTEES", "Can Se My Reportees")
                )
        );

        insertModuleWithPermissions(
                "Projects",
                List.of(
                        new PermissionData("CAN_SEE_PROJECT_INITIATION", "See Project Initiation"),
                        new PermissionData("CAN_CREATE_PROJECT_INITIATION", "Create Project Initiation"),
                        new PermissionData("CAN_EDIT_PROJECT_INITIATION", "Edit Project Initiation"),
                        new PermissionData("CAN_SEE_PROJECT_INITIATION_DETAILS", "Delete Project Initiation"),
                        new PermissionData("CAN_DELETE_PROJECT_INITIATION", "Delete Project Initiation"),
                        new PermissionData("CAN_SEE_PROJECT_LIST", "See Project List"),
                        new PermissionData("CAN_CREATE_PROJECT", "Create Project"),
                        new PermissionData("CAN_UPDATE_PROJECT", "Update Project"),
                        new PermissionData("CAN_VIEW_PROJECT_DETAIL", "View Project Detail"),
                        new PermissionData("CAN_DELETE_PROJECT", "Delete Project"),
                        new PermissionData("CAN_EDIT_PROJECT", "Edit Project"),
                        new PermissionData("CAN_CREATE_TASK", "Create Task"),
                        new PermissionData("CAN_EDIT_TASK", "Edit Task"),
                        new PermissionData("CAN_UPDATE_TASK", "Update Task"),
                        new PermissionData("CAN_DELETE_TASK", "Delete Task"),
                        new PermissionData("CAN_SEE_INSPECTIONS", "See Inspections"),
                        new PermissionData("CAN_VIEW_INSPECTION", "View Inspection"),
                        new PermissionData("CAN_LOG_INSPECTION", "Log Inspection"),
                        new PermissionData("CAN_EDIT_INSPECTION", "Edit Inspection"),
                        new PermissionData("CAN_DELETE_INSPECTION", "Delete Inspection"),
                        new PermissionData("CAN_UPDATE_INSPECTION", "Can Updated Inspection"),
                        new PermissionData("CAN_COMMENT_INSPECTION", "Can Comment on Inspection")
                )
        );

        insertModuleWithPermissions(
                "Finance",
                List.of(
                        new PermissionData("CAN_SEE_PROJECT_FINANCE", "See Project Finance"),
                        new PermissionData("CAN_VIEW_RECORD_COST", "Can View Record Cost"),
                        new PermissionData("CAN_RECORD_COST", "Record Cost"),
                        new PermissionData("CAN_EDIT_RECORD", "Edit Record"),
                        new PermissionData("CAN_DELETE_RECORD", "Delete Record")
                )
        );

        insertModuleWithPermissions(
                "Contracts",
                List.of(
                        new PermissionData("CAN_SEE_CONTRACT_LIST", "See Contract List"),
                        new PermissionData("CAN_REGISTER_CONTRACTOR", "Register Contractor"),
                        new PermissionData("CAN_EDIT_CONTRACTOR", "Edit Contractor"),
                        new PermissionData("CAN_DELETE_CONTRACTOR", "Delete Contractor"),
                        new PermissionData("CAN_SEE_CONSULTANT_LIST", "See Consultant List"),
                        new PermissionData("CAN_REGISTER_CONSULTANT", "Register Consultant"),
                        new PermissionData("CAN_EDIT_CONSULTANT", "Edit Consultant"),
                        new PermissionData("CAN_DELETE_CONSULTANT", "Delete Consultant"),
                        new PermissionData("CAN_REGISTER_CLIENT", "Register Client"),
                        new PermissionData("CAN_EDIT_CLIENT", "Edit Client"),
                        new PermissionData("CAN_VIEW_CLIENT", "View Client"),
                        new PermissionData("CAN_DELETE_CLIENT", "Delete Client")
                )
        );

        insertModuleWithPermissions(
                "Planning",
                List.of(
                        new PermissionData("CAN_SEE_COLOR_CODING_LIST", "See Color Coding List"),
                        new PermissionData("CAN_REGISTER_COLOR_CODING", "Register Color Coding"),
                        new PermissionData("CAN_EDIT_COLOR_CODING", "Edit Color Coding"),
                        new PermissionData("CAN_DELETE_COLOR_CODING", "Delete Color Coding"),
                        new PermissionData("CAN_VIEW_COLOR_CODING", "View Color Coding"),
                        new PermissionData("CAN_UPDATE_COLOR_CODING_ACHIEVEMENT", "Update Color Implementation"),
                        new PermissionData("CAN_SEND_COLOR_CODING_ACHIEVEMENT", "Send Color coding Achievement"),
                        new PermissionData("CAN_REVEW_COLOR_CODING_ACHIEVEMENT", "Review Color coding Achievement")
                )
        );

        insertModuleWithPermissions(
                "Reports",
                List.of(
                        new PermissionData("CAN_SEE_PROJECT_REPORT", "See Project Report"),
                        new PermissionData("CAN_SEE_TASK_REPORT", "See Task Report"),
                        new PermissionData("CAN_SEE_ROLE_REPORT", "See Role Report"),
                        new PermissionData("CAN_SEE_EMPLOYEE_REPORT", "See Employee Report"),
                        new PermissionData("CAN_SEE_USER_REPORT", "See User Report"),
                        new PermissionData("CAN_SEE_CONTRACTORS_REPORT", "See Contractors Report"),
                        new PermissionData("CAN_SEE_LOCATION_REPORT", "See Location Report"),
                        new PermissionData("CAN_SEE_DIVISION_REPORT", "See Division Report")
                )
        );

        insertModuleWithPermissions(
                "Sys Admin",
                List.of(
                        new PermissionData("CAN_SEE_SYS_ADMIN", "See System Admin")
                )
        );
    }

    private void insertModuleWithPermissions(String moduleName,
                                             List<PermissionData> permissions) {

        Module module = moduleRepository.findByNameIgnoreCase(moduleName)
                .orElseGet(() -> moduleRepository.save(new Module(moduleName)));

        for (PermissionData data : permissions) {

            if (!permissionRepository.existsBySlug(data.slug())) {

                Permission permission = new Permission();
                permission.setSlug(data.slug());
                permission.setName(data.name());
                permission.setModule(module);

                permissionRepository.save(permission);
            }
        }
    }

    private void initSuperAdmin() {

        Roles admin = getOrCreateRole("SUPER_ADMIN", "System Super Administrator");
        getOrCreateRole("ROLE_MAYOR", "City Mayor Role");
        getOrCreateRole("ROLE_CITY_OFFICE_HEAD", "City Office Head Role");

        List<String> requiredPermissions = List.of(
                "CAN_SEE_DASHBOARD",
                "CAN_SEE_ORG_STRUCTURE",
                "CAN_SEE_MY_REPORTEES",
                "CAN_SEE_SYS_ADMIN",
                "CAN_SEE_ROLE_REPORT",
                "CAN_SEE_EMPLOYEE_REPORT",
                "CAN_SEE_USER_REPORT",
                "CAN_SEE_DIVISION_REPORT",
                "CAN_SEE_LOCATION_REPORT"
        );

        List<Permission> permissions =
                permissionRepository.findAllBySlugIn(requiredPermissions);

        if (permissions.size() != requiredPermissions.size()) {
            throw new RuntimeException("Missing required permissions for SUPER_ADMIN");
        }

        admin.setPermissions(new HashSet<>(permissions));
        roleRepository.save(admin);

        User user = userRepository.findByUsername(superAdminProperties.getUsername())
                .orElseGet(User::new);

        user.setUsername(superAdminProperties.getUsername());
        user.setEmail(superAdminProperties.getUserEmail());
        user.setRoles(new HashSet<>(List.of(admin)));
        user.setUserType(UserType.SYSTEM);
        user.setEmployee(null);

        if (user.getId() == null) {
            user.setPassword(passwordEncoder.encode(superAdminProperties.getPassword()));
        }

        userRepository.save(user);
    }

    private Roles getOrCreateRole(String name, String description) {
        return roleRepository.findByRoleName(name)
                .orElseGet(() -> {
                    Roles r = new Roles();
                    r.setRoleName(name);
                    r.setDescription(description);
                    return roleRepository.save(r);
                });
    }

    private record PermissionData(String slug, String name) {}
}
