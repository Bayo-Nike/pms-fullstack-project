package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.ProjectPriority;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Location;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.service.impl.ClientServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.ConsultancyServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.ContractorServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.EmployeeServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.LocationServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.SubCityServiceImpl;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.project.repository.ProjectRepository;
import et.scco.pms_backend.modules.project.service.ProjectService;
import et.scco.pms_backend.utility.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final SubCityServiceImpl subCityServiceImpl;
    private final LocationServiceImpl locationServiceImpl;
    private final ContractorServiceImpl contractorServiceImpl;
    private final ConsultancyServiceImpl consultancyServiceImpl;
    private final ClientServiceImpl clientServiceImpl;
    private final EmployeeServiceImpl employeeServiceImpl;
    private final AuthContext authContext;

//    @Override
//    public Page<ProjectResponseDTO> getAllProjects(Pageable pageable) {
//
//        SubCity userSubCity = subCityServiceImpl.getCurrentUserSubCity();
//
//        Page<Project> projectPage;
//
//        if (userSubCity != null) {
//            projectPage = projectRepository.findBySubCity(userSubCity, pageable);
//        } else {
//            projectPage = projectRepository.findAll(pageable);
//        }
//
//        return projectPage.map(this::mapToDTO);
//    }

    @Override
    public Page<ProjectResponseDTO> getAllProjects(String search, ProjectStatus status, Long subCityId, Pageable pageable) {

        // 1. Get the sub-city restriction for the current user
        SubCity restrictedSubCity = subCityServiceImpl.getCurrentUserSubCity();

        Long finalSubCityId;

        if (restrictedSubCity != null) {
            // 2. User is restricted (e.g., Regional Manager).
            // Force the filter to THEIR sub-city only.
            finalSubCityId = restrictedSubCity.getId();
        } else {
            // 3. User is Super Admin. Use the filter from the dropdown.
            // If they chose "All Regions", subCityId will be null.
            finalSubCityId = subCityId;
        }

        Page<Project> projectPage = projectRepository.findWithFilters(
                search,
                status,
                finalSubCityId,
                pageable
        );

        return projectPage.map(this::mapToDTO);
    }

    @Override
    public ProjectResponseDTO getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return mapToDTO(project);
    }

    @Transactional
    @Override
    public ProjectResponseDTO createProject(CreateProjectRequestDTO dto) {

        if (projectRepository.existsByTitleAndSubCityId(dto.getTitle(), dto.getSubCityId())) {
            throw new RuntimeException("Project already exists in this sub-city");
        }

        if (projectRepository.existsByProjectCode(dto.getProjectCode())){
            throw new RuntimeException("Project code exists");
        }

        Project project = new Project();

        populateProject(project, dto);

        Project saved = projectRepository.save(project);

        return mapToDTO(saved);
    }


    @Transactional
    @Override
    public ProjectResponseDTO updateProject(Long id, CreateProjectRequestDTO dto) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        populateProject(project, dto);

        Project updated = projectRepository.save(project);

        return mapToDTO(updated);
    }


    @Transactional
    @Override
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    @Transactional
    @Override
    public ProjectResponseDTO updateStatus(Long id, String status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        project.setStatus(ProjectStatus.valueOf(status));
        return mapToDTO(project);
    }

    @Transactional
    @Override
    public ProjectResponseDTO updatePriority(Long id, String priority) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        project.setPriority(ProjectPriority.valueOf(priority));
        return mapToDTO(project);
    }


    @Transactional
    @Override
    public ProjectResponseDTO updateBudget(Long projectId, Double budget, Double budgetUsed) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        project.setBudget(budget);
        project.setBudgetUsed(budgetUsed);
        return mapToDTO(project);
    }

    @Transactional
    @Override
    public ProjectResponseDTO updateTimeline(Long projectId, LocalDate startDate, LocalDate endDate) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        project.setStartDate(startDate);
        project.setEndDate(endDate);
        return mapToDTO(project);
    }

    @Override
    public Project getProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
    }
    @Override
    public Page<ProjectResponseDTO> getMyProjects(Pageable pageable) {

        if (authContext.isSuperAdmin() || authContext.isMayor()) {
            return projectRepository
                    .findAll(pageable)
                    .map(this::mapToDTO);
        }

        Employee employee = authContext.getEmployee();

        if (employee == null) {
            return Page.empty(pageable);
        }


        return projectRepository
                .findAllByEmployeesContaining(employee, pageable)
                .map(this::mapToDTO);
    }


    private ProjectResponseDTO mapToDTO(Project project) {
        if (project == null) return null;

        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setProjectCode(project.getProjectCode());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setProjectType(project.getProjectType());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setStatus(project.getStatus());
        dto.setPriority(project.getPriority());
        dto.setCurrencyType(project.getCurrencyType());
        dto.setBudget(project.getBudget());
        dto.setBudgetUsed(project.getBudgetUsed());

        if (project.getCity() != null) {
            dto.setCityId(project.getCity().getId());
            dto.setCityName(project.getCity().getName());
        }

        if (project.getSubCity() != null) {
            dto.setSubCityId(project.getSubCity().getId());
            dto.setSubCityName(project.getSubCity().getSubCityName());
        }

        List<Location> locations = project.getLocations();
        if (locations != null && !locations.isEmpty()) {
            dto.setLocationIds(locations.stream().map(Location::getId).toList());
            dto.setLocationNames(locations.stream().map(Location::getName).toList());
        }

        if (project.getContractor() != null) {
            dto.setContractorId(project.getContractor().getId());
            dto.setContractorName(project.getContractor().getContractorName());
        }

        if (project.getConsultancy() != null) {
            dto.setConsultantId(project.getConsultancy().getId());
            dto.setConsultantName(project.getConsultancy().getConsultantName());
        }

        if (project.getClient() != null) {
            dto.setClientId(project.getClient().getId());
            dto.setClientName(project.getClient().getClientName());
        }

        if (project.getProjectManager() != null) {
            dto.setProjectManagerId(project.getProjectManager().getId());
            dto.setProjectManagerName(project.getProjectManager().getFullName());
        }

        List<Employee> employees = project.getEmployees();
        if (employees != null && !employees.isEmpty()) {
            dto.setEmployeeIds(employees.stream().map(Employee::getId).toList());
            dto.setEmployeeNames(employees.stream().map(Employee::getFullName).toList());
        }

        return dto;
    }

    private void populateProject(Project project, CreateProjectRequestDTO dto) {
        project.setProjectCode(dto.getProjectCode());
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setProjectType(dto.getProjectType());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setStatus(dto.getStatus());
        project.setPriority(dto.getPriority());
        project.setCurrencyType(dto.getCurrencyType());
        project.setBudget(dto.getBudget());
        project.setBudgetUsed(dto.getBudgetUsed());

        project.setContractor(dto.getContractorId() != null ?
                contractorServiceImpl.getContractorEntityById(dto.getContractorId()) : null);

        project.setConsultancy(dto.getConsultantId() != null ?
                consultancyServiceImpl.getConsultantEntityById(dto.getConsultantId()) : null);
        project.setClient(dto.getClientId() != null ?
                clientServiceImpl.getClientEntityById(dto.getClientId()) : null);

        project.setSubCity(dto.getSubCityId() != null ?
                subCityServiceImpl.getSubCityEntity(dto.getSubCityId()) : null);

        project.setProjectManager(dto.getProjectManagerId() != null ?
                employeeServiceImpl.findEmployee(dto.getProjectManagerId()) : null);

        project.setEmployees(dto.getEmployeeIds() != null && !dto.getEmployeeIds().isEmpty() ?
                employeeServiceImpl.findEmpsByEmployeeIds(dto.getEmployeeIds()) : new ArrayList<>());

        project.setLocations(dto.getLocationIds() != null && !dto.getLocationIds().isEmpty() ?
                locationServiceImpl.getLocationsByIds(dto.getLocationIds()) : new ArrayList<>());

        project.setCity(subCityServiceImpl.getCity());
    }
}