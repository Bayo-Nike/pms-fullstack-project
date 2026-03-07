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
                        new PermissionData("CAN_VIEW_DASHBOARD", "View Dashboard"),
                        new PermissionData("CAN_VIEW_GIS_MAP", "View GIS Map"),
                        new PermissionData("CAN_VIEW_KPIS", "View KPIs"),
                        new PermissionData("CAN_MANAGE_ALERTS", "Manage Alerts")
                )
        );

        insertModuleWithPermissions(
                "Projects",
                List.of(
                        new PermissionData("CAN_VIEW_PROJECTS", "View Projects"),
                        new PermissionData("CAN_CREATE_PROJECTS", "Create Projects"),
                        new PermissionData("CAN_EDIT_PROJECTS", "Edit Projects"),
                        new PermissionData("CAN_MANAGE_GANTT", "Manage Schedule"),
                        new PermissionData("CAN_DELETE_PROJECTS", "Delete Projects")
                )
        );

        insertModuleWithPermissions(
                "Contracts",
                List.of(
                        new PermissionData("CAN_VIEW_CONTRACTS", "View Contracts"),
                        new PermissionData("CAN_MANAGE_VO", "Manage VO"),
                        new PermissionData("CAN_RATE_CONTRACTORS", "Rate Performance"),
                        new PermissionData("CAN_MANAGE_RETENTION", "Manage Retention"),
                        new PermissionData("CAN_ACCESS_REPOSITORY", "Access Repository")
                )
        );

        insertModuleWithPermissions(
                "Finance",
                List.of(
                        new PermissionData("CAN_VIEW_FINANCE", "View Finance"),
                        new PermissionData("CAN_SUBMIT_IPC", "Submit IPC"),
                        new PermissionData("CAN_VERIFY_IPC", "Verify IPC"),
                        new PermissionData("CAN_TRACK_ADVANCE", "Track Advances"),
                        new PermissionData("CAN_MANAGE_ESCALATION", "Manage Escalation")
                )
        );

        insertModuleWithPermissions(
                "Field Ops",
                List.of(
                        new PermissionData("CAN_WRITE_DIARY", "Write Diary"),
                        new PermissionData("CAN_UPLOAD_PHOTOS", "Upload Photos"),
                        new PermissionData("CAN_VIEW_FIELD_REPORTS", "View Reports"),
                        new PermissionData("CAN_FORCE_SYNC", "Force Sync")
                )
        );

        insertModuleWithPermissions(
                "Documents",
                List.of(
                        new PermissionData("CAN_VIEW_DOCS", "View Docs"),
                        new PermissionData("CAN_MANAGE_DRAWINGS", "Manage Drawings"),
                        new PermissionData("CAN_MANAGE_LETTERS", "Manage Letters"),
                        new PermissionData("CAN_ARCHIVE_DOCS", "Archive Records")
                )
        );

        insertModuleWithPermissions(
                "Resources",
                List.of(
                        new PermissionData("CAN_VIEW_RESOURCES", "View Resources"),
                        new PermissionData("CAN_MANAGE_EQUIPMENT", "Manage Equipment"),
                        new PermissionData("CAN_MANAGE_INVENTORY", "Manage Inventory")
                )
        );

        insertModuleWithPermissions(
                "Sys Admin",
                List.of(
                        new PermissionData("CAN_VIEW_USERS", "View Users"),
                        new PermissionData("CAN_MANAGE_USERS", "Manage Users"),
                        new PermissionData("CAN_MANAGE_ROLES", "Manage Roles"),
                        new PermissionData("CAN_MANAGE_MODULES", "Manage Modules"),
                        new PermissionData("CAN_VIEW_LOGS", "View Logs")
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
                    u.setRoles(List.of(role));
                    u.setUserType(UserType.SYSTEM);
                    u.setEmployee(null);

                    return userRepository.save(u);
                });
        userRepository.save(user);
    }

    private record PermissionData(String slug, String name) {}
}
