package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.*;
import et.scco.pms_backend.modules.admin.model.*;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import et.scco.pms_backend.modules.admin.service.impl.*;
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
    public Page<ProjectResponseDTO> getAllProjects(String search, ProjectStatus status, Long subCityId, Pageable pageable) {
        Employee employee = employeeServiceImpl.findEmployeeWithDivision();
        if (employee == null) return projectRepository.findAll(pageable).map(this::mapToDTO);

        SubCity restrictedSubCity = employee.getSubCity();
        Division division = employee.getDivision();
        if (division == null) return Page.empty(pageable);

        DivisionGroup divisionGroup = division.getDivisionGroup();
        Long finalSubCityId = (restrictedSubCity != null) ? restrictedSubCity.getId() : subCityId;

        ProjectType projectType = null;
        if (divisionGroup.equals(DivisionGroup.BLD)) projectType = ProjectType.BUILDING;
        else if (!divisionGroup.equals(DivisionGroup.BTH)) projectType = ProjectType.WATER_AND_ROAD;

        return projectRepository.findWithFilters(projectType, search, status, finalSubCityId, pageable).map(this::mapToDTO);
    }

    @Override
    public ProjectResponseDTO getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return mapToDTO(project);
    }

    @Transactional
    @Override
    public ProjectResponseDTO updateProject(Long id, CreateProjectRequestDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        Long currentPMId = project.getProjectManager() != null ? project.getProjectManager().getId() : null;

        // Update ONLY implementation details
        populateImplementationDetails(project, dto);

        Project updated = projectRepository.save(project);

        // Notify new Project Manager if changed
        if (dto.getProjectManagerId() != null && !dto.getProjectManagerId().equals(currentPMId)) {
            notificationService.sendNotification(
                    authContext.getEmployee().getId(),
                    dto.getProjectManagerId(),
                    "Management Update: You have been assigned as Manager for " + project.getTitle(),
                    "projects/" + updated.getId());
        }

        if (dto.getEmployeeIds() != null){
            for (Long team : dto.getEmployeeIds()) {
                notificationService.sendNotification(
                        authContext.getEmployee().getId(),
                        team,
                        "You have been included into project team members for" + project.getTitle(),
                        "projects/" + updated.getId());
            }
        }

        return mapToDTO(updated);
    }

    private void populateImplementationDetails(Project project, CreateProjectRequestDTO dto) {
        // Management & Urgency
        project.setPriority(dto.getPriority());
        project.setProjectManager(dto.getProjectManagerId() != null ? employeeServiceImpl.findEmployee(dto.getProjectManagerId()) : null);

        // Partnerships
        project.setContractor(dto.getContractorId() != null ? contractorServiceImpl.getContractorEntityById(dto.getContractorId()) : null);
        project.setConsultancy(dto.getConsultantId() != null ? consultancyServiceImpl.getConsultantEntityById(dto.getConsultantId()) : null);
        project.setClient(dto.getClientId() != null ? clientServiceImpl.getClientEntityById(dto.getClientId()) : null);

        // Finances
        project.setBudget(dto.getBudget());
        project.setCurrencyType(dto.getCurrencyType());

        // Team Personnel
        project.setEmployees(dto.getEmployeeIds() != null && !dto.getEmployeeIds().isEmpty()
                ? employeeServiceImpl.findEmpsByEmployeeIds(dto.getEmployeeIds())
                : new ArrayList<>());
    }

    @Transactional
    @Override
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }


    public ProjectResponseDTO mapToDTO(Project project) {
        if (project == null) return null;

        ProjectResponseDTO dto = new ProjectResponseDTO();
        // Initiation Fields (Read-Only on UI)
        dto.setId(project.getId());
        dto.setProjectCode(project.getProjectCode());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setProjectType(project.getProjectType());
        dto.setCategory(project.getCategory());
        dto.setProjectLevel(project.getProjectLevel());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setStatus(project.getStatus());
        dto.setAgreementDate(project.getAgreementDate());

        // Implementation Fields (Editable on UI)
        dto.setPriority(project.getPriority());
        dto.setCurrencyType(project.getCurrencyType());
        dto.setBudget(project.getBudget());
        dto.setBudgetUsed(project.getBudgetUsed());

        // 1. Geography
        if (project.getSubCity() != null) {
            dto.setSubCityId(project.getSubCity().getId());
            dto.setSubCityName(project.getSubCity().getSubCityName());
        }
        if (project.getWoreda() != null) {
            dto.setWoredaId(project.getWoreda().getId());
            dto.setWoredaName(project.getWoreda().getWoredaName());
        }
        if (project.getLocations() != null) {
            dto.setLocationIds(project.getLocations().stream().map(Location::getId).toList());
            dto.setLocationNames(project.getLocations().stream().map(Location::getName).toList());
        }

        // 2. Partners & PM
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

        // 3. Team
        if (project.getEmployees() != null) {
            dto.setEmployeeIds(project.getEmployees().stream().map(Employee::getId).toList());
            dto.setEmployeeNames(project.getEmployees().stream().map(Employee::getFullName).toList());
        }

        // 4. Extensions & Computed Dates
        List<ProjectExtensionDTO> extensions = (project.getExtensions() != null) ?
                project.getExtensions().stream().map(this::mapExtensionToDTO).collect(Collectors.toList()) : new ArrayList<>();

        dto.setExtensions(extensions);
        dto.setTotalExtendedDays(extensions.stream().mapToInt(ProjectExtensionDTO::getExtendedDays).sum());
        dto.setFinalEndDate(extensions.isEmpty() ? project.getEndDate() : extensions.get(extensions.size() - 1).getNewEndDate());

        // 5. Progress
        int totalTasks = project.getTasks() != null ? project.getTasks().size() : 0;
        long completed = project.getTasks() != null ? project.getTasks().stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count() : 0;
        dto.setProjectProgress(totalTasks > 0 ? ((double) completed / totalTasks) * 100 : 0.0);

        return dto;
    }

    private ProjectExtensionDTO mapExtensionToDTO(ProjectExtension ext) {
        ProjectExtensionDTO d = new ProjectExtensionDTO();
        d.setId(ext.getId());
        d.setExtendedDays(ext.getExtendedDays());
        d.setReason(ext.getReason());
        d.setPreviousEndDate(ext.getPreviousEndDate());
        d.setNewEndDate(ext.getNewEndDate());
        d.setExtendedAt(ext.getExtendedAt());
        return d;
    }

    // Preserve Existing Extension Methods
    public ProjectResponseDTO extendProject(Long id, ExtendProjectRequestDTO request) {
        Project project = projectRepository.findById(id).orElseThrow();
        LocalDate currentEndDate = getFinalEndDate(project);

        ProjectExtension extension = new ProjectExtension();
        extension.setExtendedDays(request.getExtendedDays());
        extension.setPreviousEndDate(currentEndDate);
        extension.setNewEndDate(currentEndDate.plusDays(request.getExtendedDays()));
        extension.setReason(request.getReason());
        extension.setProject(project);

        projectExtensionRepository.save(extension);
        project.getExtensions().add(extension);
        return mapToDTO(project);
    }

    @Transactional
    public void deleteLastExtension(Long projectId, Long extensionId) {
        ProjectExtension lastExtension = projectExtensionRepository.findTopByProjectIdOrderByIdDesc(projectId)
                .orElseThrow(() -> new RuntimeException("No extensions found"));
        if (!lastExtension.getId().equals(extensionId)) throw new RuntimeException("Data Integrity: Only last record revertible.");

        Project project = projectRepository.findById(projectId).orElseThrow();
        project.setEndDate(lastExtension.getPreviousEndDate());
        projectExtensionRepository.delete(lastExtension);
        projectRepository.save(project);
    }

    private LocalDate getFinalEndDate(Project project) {
        if (project.getExtensions() == null || project.getExtensions().isEmpty()) return project.getEndDate();
        return project.getExtensions().stream()
                .max(Comparator.comparing(ProjectExtension::getExtendedAt))
                .map(ProjectExtension::getNewEndDate)
                .orElse(project.getEndDate());
    }

    // Remaining required overrides
    @Override public Project getProjectById(Long projectId) { return projectRepository.findById(projectId).orElseThrow(); }
    @Override public Page<ProjectResponseDTO> getMyProjects(Pageable pageable) {
        Employee employee = employeeServiceImpl.findEmployeeWithDivision();
        return (employee == null) ? Page.empty(pageable) : projectRepository.findAllByEmployeesContaining(employee, pageable).map(this::mapToDTO);
    }
}