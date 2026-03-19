package et.scco.pms_backend.components;


import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.modules.admin.model.*;
import et.scco.pms_backend.modules.admin.model.Module;
import et.scco.pms_backend.modules.admin.model.User;
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
                "Akaki",
                "Bole Bulbula",
                "Burayu",
                "Dukem",
                "Gelan",
                "Legedadi",
                "Lemi Kura",
                "Nefas Silk",
                "Sebeta",
                "Sululta",
                "Tulu Dimtu"
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

        createDivision("Mayor Office", null);
        createDivision("Manager Office", "Mayor Office");
        createDivision("Director Office", "Manager Office");
        createDivision("Team Leader Office", "Director Office");
    }

    private void createDivision(String name, String parentName) {

        if (divisionRepository.existsByNameIgnoreCase(name)) {
            return;
        }

        Division division = new Division();
        division.setName(name);

        if (parentName != null) {
            divisionRepository.findByNameIgnoreCase(parentName)
                    .ifPresent(division::setParent);
        }

        divisionRepository.save(division);
    }

    private void initPositions() {

        createPosition("Mayor", null, "Mayor Office");
        createPosition("Manager", "Mayor", "Manager Office");
        createPosition("Director", "Manager", "Director Office");
        createPosition("Team Leader", "Director", "Team Leader Office");
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
                        new PermissionData("CAN_SEE_ORG_STRUCTURE", "See Organization Structure")
                )
        );

        insertModuleWithPermissions(
                "Projects",
                List.of(
                        new PermissionData("CAN_SEE_PROJECT", "See Project"),
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
                        new PermissionData("CAN_LOG_INSPECTION", "Log Inspection"),
                        new PermissionData("CAN_EDIT_INSPECTION", "Edit Inspection"),
                        new PermissionData("CAN_DELETE_INSPECTION", "Delete Inspection")
                )
        );

        insertModuleWithPermissions(
                "Finance",
                List.of(
                        new PermissionData("CAN_SEE_FINANCE", "See Finance"),
                        new PermissionData("CAN_SEE_PROJECT_FINANCE", "See Project Finance"),
                        new PermissionData("CAN_RECORD_COST", "Record Cost"),
                        new PermissionData("CAN_EDIT_RECORD", "Edit Record"),
                        new PermissionData("CAN_DELETE_RECORD", "Delete Record")
                )
        );

        insertModuleWithPermissions(
                "Contracts",
                List.of(
                        new PermissionData("CAN_SEE_CONTRACT", "See Contract"),
                        new PermissionData("CAN_SEE_CONTRACT_LIST", "See Contract List"),
                        new PermissionData("CAN_REGISTER_CONTRACTOR", "Register Contractor"),
                        new PermissionData("CAN_EDIT_CONTRACTOR", "Edit Contractor"),
                        new PermissionData("CAN_DELETE_CONTRACTOR", "Delete Contractor")
                )
        );
        insertModuleWithPermissions(
                "Consultants",
                List.of(
                        new PermissionData("CAN_SEE_CONSULTANT", "See Consultant"),
                        new PermissionData("CAN_SEE_CONSULTANT_LIST", "See Consultant List"),
                        new PermissionData("CAN_REGISTER_CONSULTANT", "Register Consultant"),
                        new PermissionData("CAN_EDIT_CONSULTANT", "Edit Consultant"),
                        new PermissionData("CAN_DELETE_CONSULTANT", "Delete Consultant")
                )
        );

        insertModuleWithPermissions(
                "Planning",
                List.of(
                        new PermissionData("CAN_SEE_PLANNING", "See Planning"),
                        new PermissionData("CAN_SEE_COLOR_CODING_LIST", "See Color Coding List"),
                        new PermissionData("CAN_REGISTER_COLOR_CODING", "Register Color Coding"),
                        new PermissionData("CAN_EDIT_COLOR_CODING", "Edit Color Coding"),
                        new PermissionData("CAN_DELETE_COLOR_CODING", "Delete Color Coding"),
                        new PermissionData("CAN_VIEW_COLOR_CODING", "Can View Color Coding"),
                        new PermissionData("CAN_UPDATE_COLOR_CODING_ACHIEVEMENT", "Update Color Implementation")
                )
        );

        insertModuleWithPermissions(
                "Reports",
                List.of(
                        new PermissionData("CAN_SEE_REPORT", "See Report"),
                        new PermissionData("CAN_SEE_PROJECT_REPORT", "See Project Report"),
                        new PermissionData("CAN_SEE_TASK_REPORT", "See Task Report"),
                        new PermissionData("CAN_SEE_ROLE_REPORT", "See Role Report"),
                        new PermissionData("CAN_SEE_EMPLOYEE_REPORT", "See Employee Report"),
                        new PermissionData("CAN_SEE_USER_REPORT", "See User Report"),
                        new PermissionData("CAN_SEE_CONTRACTORS_REPORT", "See Contractors Report"),
                        new PermissionData("CAN_SEE_LOCATION_REPORT", "See Location Report"),
                        new PermissionData("CAN_SEE_DIVISION_REPORT", "See Division Report"),
                        new PermissionData("CAN_SEE_AUDIT_LOG", "See Audit Log")
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

        Roles role = roleRepository.findByRoleName("SUPER_ADMIN")
                .orElseGet(() -> {
                    Roles r = new Roles();
                    r.setRoleName("SUPER_ADMIN");
                    r.setDescription("System Super Administrator");
                    return roleRepository.save(r);
                });

        // Assign all permissions
        role.getPermissions().clear();
        role.getPermissions().addAll(permissionRepository.findAll());
        roleRepository.save(role);
        //

        User user = userRepository.findByUsername(superAdminProperties.getUsername())
                .orElseGet(() -> {

                    User u = new User();
                    u.setUsername(superAdminProperties.getUsername());
                    u.setPassword(passwordEncoder.encode(superAdminProperties.getPassword()));
                    u.setEmail(superAdminProperties.getUserEmail());
                    u.setRoles(new HashSet<>(List.of(role)));
                    u.setUserType(UserType.SYSTEM);
                    u.setEmployee(null);

                    return userRepository.save(u);
                });
        userRepository.save(user);
    }

    private record PermissionData(String slug, String name) {}
}
