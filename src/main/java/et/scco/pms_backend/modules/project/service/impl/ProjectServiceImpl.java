package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.DivisionGroup;
import et.scco.pms_backend.enums.ProjectPriority;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.enums.TaskStatus;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Location;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import et.scco.pms_backend.modules.admin.service.impl.ClientServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.ConsultancyServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.ContractorServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.EmployeeServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.LocationServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.SubCityServiceImpl;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.request.ExtendProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectExtensionDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.project.model.ProjectExtension;
import et.scco.pms_backend.modules.project.repository.ProjectExtensionRepository;
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
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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
    private final NotificationService notificationService;
    private final AuthContext authContext;
    private final ProjectExtensionRepository projectExtensionRepository;

    @Transactional(readOnly = true)
    @Override
    public Page<ProjectResponseDTO> getAllProjects(String search, ProjectStatus status, Long subCityId,
            Pageable pageable) {

        Employee employee = employeeServiceImpl.findEmployeeWithDivision();

        if (employee == null) {
            return projectRepository.findAll(pageable).map(this::mapToDTO);
        }

        SubCity restrictedSubCity = employee.getSubCity();

        Division division = employee.getDivision();

        if (division == null) {
            return Page.empty(pageable);
        }

        DivisionGroup divisionGroup = division.getDivisionGroup();

        Long finalSubCityId = (restrictedSubCity != null)
                ? restrictedSubCity.getId()
                : subCityId;

        ProjectType projectType = null;

        if (divisionGroup.equals(DivisionGroup.BLD)) {
            projectType = ProjectType.BUILDING;
        } else if (!divisionGroup.equals(DivisionGroup.BTH)) {
            projectType = ProjectType.WATER_AND_ROAD;
        }

        Page<Project> projectPage = projectRepository.findWithFilters(
                projectType,
                search,
                status,
                finalSubCityId,
                pageable);

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

        // generate project code
        Long maxId = projectRepository.findMaxId();
        long nextNumber = (maxId != null ? maxId + 1 : 1);
        String projectCode = "SCCO/PC/" + nextNumber;

        Project project = new Project();

        populateProject(project, dto);
        project.setProjectCode(projectCode);

        Project saved = projectRepository.save(project);

        // send notification to the project manager
        if (dto.getProjectManagerId() != null) {
            notificationService.sendNotification(
                    authContext.getEmployee().getId(),
                    dto.getProjectManagerId(),
                    "A new project has been create and assigned to you",
                    "projects/" + saved.getId());
        }

        return mapToDTO(saved);
    }

    @Transactional
    @Override
    public ProjectResponseDTO updateProject(Long id, CreateProjectRequestDTO dto) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        Long currentProjManagerId = project.getProjectManager().getId();

        populateProject(project, dto);

        Project updated = projectRepository.save(project);

        // send notification to the new apponted Project manager
        if ((dto.getProjectManagerId() != null) && (!currentProjManagerId.equals(dto.getProjectManagerId()))) {
            notificationService.sendNotification(
                    authContext.getEmployee().getId(),
                    dto.getProjectManagerId(),
                    project.getTitle() + " Project has been Updated and assigned to you",
                    "projects/" + updated.getId());
        }

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

    // used for inspection only
    @Override
    public Page<ProjectResponseDTO> getMyProjects(Pageable pageable) {

        Employee employee = employeeServiceImpl.findEmployeeWithDivision();

        if (employee == null) {
            return Page.empty(pageable);
        }

        return projectRepository
                .findAllByEmployeesContaining(employee, pageable)
                .map(this::mapToDTO);
    }


    private ProjectResponseDTO mapToDTO(Project project) {
        if (project == null)
            return null;

        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setProjectCode(project.getProjectCode());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setProjectType(project.getProjectType());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        // dto.setExtendedDays(project.getExtendedDays());
        dto.setStatus(project.getStatus());
        dto.setPriority(project.getPriority());
        dto.setCurrencyType(project.getCurrencyType());
        dto.setBudget(project.getBudget());
        dto.setBudgetUsed(project.getBudgetUsed());
        dto.setProjectLevel(project.getProjectLevel());

        // 1. Project EXTENSIONS history list
        if (project.getExtensions() != null && !project.getExtensions().isEmpty()) {
            List<ProjectExtensionDTO> extensionDTOs = project.getExtensions().stream()
                .map(ext -> {
                    ProjectExtensionDTO extDto = new ProjectExtensionDTO();
                    extDto.setId(ext.getId());
                    extDto.setExtendedDays(ext.getExtendedDays());
                    extDto.setReason(ext.getReason());
                    extDto.setPreviousEndDate(ext.getPreviousEndDate());
                    extDto.setNewEndDate(ext.getNewEndDate());
                    return extDto;
                })
                .collect(Collectors.toList());
            dto.setExtensions(extensionDTOs);
        } else {
            dto.setExtensions(new ArrayList<>()); // Return empty list [], not null
        }

        // Project Progress calculation
        int totalTasks = project.getTasks() != null ? project.getTasks().size() : 0;

        long completedTasks = project.getTasks() != null
                ? project.getTasks().stream()
                        .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                        .count()
                : 0;

        double projectProgress = 0.00;
        if (totalTasks > 0) {
            projectProgress = ((double) completedTasks / totalTasks) * 100;
        }

        dto.setProjectProgress(projectProgress);

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

        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setProjectType(dto.getProjectType());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        // project.setExtendedDays(dto.getExtendedDays());

        project.setStatus(dto.getStatus());
        project.setPriority(dto.getPriority());
        project.setCurrencyType(dto.getCurrencyType());
        project.setBudget(dto.getBudget());
        project.setBudgetUsed(dto.getBudgetUsed());
        project.setProjectLevel(dto.getProjectLevel());

        project.setContractor(
                dto.getContractorId() != null ? contractorServiceImpl.getContractorEntityById(dto.getContractorId())
                        : null);

        project.setConsultancy(
                dto.getConsultantId() != null ? consultancyServiceImpl.getConsultantEntityById(dto.getConsultantId())
                        : null);
        project.setClient(dto.getClientId() != null ? clientServiceImpl.getClientEntityById(dto.getClientId()) : null);

        project.setSubCity(dto.getSubCityId() != null ? subCityServiceImpl.getSubCityEntity(dto.getSubCityId()) : null);

        project.setProjectManager(
                dto.getProjectManagerId() != null ? employeeServiceImpl.findEmployee(dto.getProjectManagerId()) : null);

        project.setEmployees(dto.getEmployeeIds() != null && !dto.getEmployeeIds().isEmpty()
                ? employeeServiceImpl.findEmpsByEmployeeIds(dto.getEmployeeIds())
                : new ArrayList<>());

        project.setLocations(dto.getLocationIds() != null && !dto.getLocationIds().isEmpty()
                ? locationServiceImpl.getLocationsByIds(dto.getLocationIds())
                : new ArrayList<>());

        project.setCity(subCityServiceImpl.getCity());
    }

    public ProjectResponseDTO extendProject(Long id, ExtendProjectRequestDTO request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        // Validation
        if (request.getExtendedDays() <= 0) {
            throw new IllegalArgumentException("Extended days must be greater than 0");
        }
        // Get current effective end date
        LocalDate currentEndDate = getFinalEndDate(project);
        // Create extension
        ProjectExtension extension = new ProjectExtension();
        extension.setExtendedDays(request.getExtendedDays());
        extension.setPreviousEndDate(currentEndDate);
        extension.setNewEndDate(currentEndDate.plusDays(request.getExtendedDays()));
        extension.setReason(request.getReason());
        extension.setProject(project);

        projectExtensionRepository.save(extension);
        // Optional: attach to project list (if using bidirectional)
        project.getExtensions().add(extension);
        // Return updated project
        return mapToResponse(project);
    }

    @Transactional
    public void deleteLastExtension(Long projectId, Long extensionId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        // 1. Get the latest extension
        ProjectExtension lastExtension = projectExtensionRepository.findTopByProjectIdOrderByIdDesc(projectId)
            .orElseThrow(() -> new RuntimeException("No extensions found"));
        // 2. Security Check: Only allow deleting the actual last record
        if (!lastExtension.getId().equals(extensionId)) {
            throw new RuntimeException("Only the most recent extension can be reverted for data integrity.");
        }
        // 3. Revert Project End Date to what it was BEFORE this extension
        project.setEndDate(lastExtension.getPreviousEndDate());
        // 4. Delete the record and save project
        projectExtensionRepository.delete(lastExtension);
        projectRepository.save(project);
    }

    private LocalDate getFinalEndDate(Project project) {
        if (project.getExtensions() == null || project.getExtensions().isEmpty()) {
            return project.getEndDate();
        }

        return project.getExtensions()
                .stream()
                .max(Comparator.comparing(ProjectExtension::getExtendedAt))
                .map(ProjectExtension::getNewEndDate)
                .orElse(project.getEndDate());
    }

    private ProjectResponseDTO mapToResponse(Project project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setProjectCode(project.getProjectCode());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());

        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());

        // Extensions mapping
        List<ProjectExtensionDTO> extensionDTOs = project.getExtensions()
                .stream()
                .map(ext -> {
                    ProjectExtensionDTO e = new ProjectExtensionDTO();
                    e.setExtendedDays(ext.getExtendedDays());
                    e.setPreviousEndDate(ext.getPreviousEndDate());
                    e.setNewEndDate(ext.getNewEndDate());
                    e.setReason(ext.getReason());
                    e.setExtendedAt(ext.getExtendedAt());
                    return e;
                })
                .toList();

        dto.setExtensions(extensionDTOs);
        // Total extended days
        int totalDays = extensionDTOs.stream()
                .mapToInt(ProjectExtensionDTO::getExtendedDays)
                .sum();
        dto.setTotalExtendedDays(totalDays);
        // Final end date
        LocalDate finalEndDate = extensionDTOs.isEmpty()
                ? project.getEndDate()
                : extensionDTOs.get(extensionDTOs.size() - 1).getNewEndDate();
        dto.setFinalEndDate(finalEndDate);
        return dto;
    }
}