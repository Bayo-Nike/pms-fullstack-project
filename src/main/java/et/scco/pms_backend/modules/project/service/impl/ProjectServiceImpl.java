package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.CurrencyType;
import et.scco.pms_backend.enums.ProjectPriority;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.dto.response.ContractorResponseDTO;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.service.impl.ContractorServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.EmployeeServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.LocationServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.SubCityServiceImpl;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.project.repository.ProjectRepository;
import et.scco.pms_backend.modules.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final SubCityServiceImpl subCityServiceImpl;
    private final LocationServiceImpl locationServiceImpl;
    private final ContractorServiceImpl contractorServiceImpl;
    private final EmployeeServiceImpl employeeServiceImpl;

    @Override
    public Page<ProjectResponseDTO> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    public ProjectResponseDTO getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return mapToDTO(project);
    }

    @Override
    public ProjectResponseDTO createProject(CreateProjectRequestDTO dto) {
        if (projectRepository.existsByTitleAndSubCityId(dto.getTitle(), dto.getSubCityId())) {
            throw new RuntimeException("Project already exists in this sub-city");
        } 
        Project project = mapToEntity(dto);
        Project saved = projectRepository.save(project);
        return mapToDTO(saved);
    }

    @Override
    public ProjectResponseDTO updateProject(Long id, CreateProjectRequestDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        // update fields
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setProjectType(ProjectType.valueOf(dto.getProjectType()));
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus()));
        project.setPriority(ProjectPriority.valueOf(dto.getPriority()));
        project.setCurrencyType(CurrencyType.valueOf(dto.getCurrencyType()));
        project.setBudget(dto.getBudget());
        project.setBudgetUsed(dto.getBudgetUsed());
        // other fields like city/subCity/manager/location/contractor can also be updated here
        project.setContractor(contractorServiceImpl.getContractorEntityById(dto.getContractorId()));
        project.setCity(subCityServiceImpl.getCity());
        project.setSubCity(subCityServiceImpl.getSubCityEntity(dto.getSubCityId()));
        project.setLocation(locationServiceImpl.getLocationByLocationId(dto.getLocationId()));
        project.setProjectManager(employeeServiceImpl.findEmployee(dto.getProjectManagerId()));
        project.setEmployees(employeeServiceImpl.findEmpsByEmployeeIds(dto.getEmployeeIds()));

        return mapToDTO(project);
    }

    @Override
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    @Override
    public ProjectResponseDTO updateStatus(Long id, String status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        project.setStatus(ProjectStatus.valueOf(status));
        return mapToDTO(project);
    }

    @Override
    public ProjectResponseDTO updatePriority(Long id, String priority) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        project.setPriority(ProjectPriority.valueOf(priority));
        return mapToDTO(project);
    }

    @Override
    public ProjectResponseDTO assignManager(Long projectId, Long managerId) {
        // fetch project and employee, set projectManager
        return null; // implement
    }

    @Override
    public ProjectResponseDTO assignEmployees(Long projectId, List<Long> employeeIds) {
        // fetch project, fetch employees, set employees list
        return null; // implement
    }

    @Override
    public ProjectResponseDTO updateBudget(Long projectId, Double budget, Double budgetUsed) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        project.setBudget(budget);
        project.setBudgetUsed(budgetUsed);
        return mapToDTO(project);
    }

    @Override
    public ProjectResponseDTO updateTimeline(Long projectId, LocalDate startDate, LocalDate endDate) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        project.setStartDate(startDate);
        project.setEndDate(endDate);
        return mapToDTO(project);
    }

    // --- Mapping methods ---
    private ProjectResponseDTO mapToDTO(Project project) {
        // map entity to DTO (IDs + names for foreign keys)
        if (project == null) return null;
        
        ProjectResponseDTO dto = new ProjectResponseDTO();

        dto.setId(project.getId());
        dto.setProjectCode(project.getProjectCode());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setProjectType(project.getProjectType());
        if (project.getCity() != null) {
            dto.setCityId(project.getCity().getId());
            dto.setCityName(project.getCity().getName());
        }
        if (project.getSubCity() != null) {
            dto.setSubCityId(project.getSubCity().getId());
            dto.setSubCityName(project.getSubCity().getSubCityName());
        }
        if (project.getLocation() != null) {
            dto.setLocationId(project.getLocation().getId());
            dto.setLocationName(project.getLocation().getName());
        }
        if (project.getContractor() != null) {
            dto.setContractorId(project.getContractor().getId());
            dto.setContractorName(project.getContractor().getContractorName());
        }
        
        if (project.getProjectManager() != null) {
            dto.setProjectManagerId(project.getProjectManager().getId());
            dto.setProjectManagerName(project.getProjectManager().getFullName());
        }

        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setStatus(project.getStatus());
        if (project.getPriority() != null) {
            dto.setPriority(project.getPriority());
        }
        if (project.getCurrencyType() != null) {
            dto.setCurrencyType(project.getCurrencyType());
        }
        
        dto.setBudget(project.getBudget());
        dto.setBudgetUsed(project.getBudgetUsed());


        List<Employee> employees = project.getEmployees();

        // 🔹 Convert Employees -> IDs
        dto.setEmployeeIds(
            employees.stream().map(Employee::getId).toList()
        );

        // 🔹 Convert Employees -> Names
        dto.setEmployeeNames(
            employees.stream().map(Employee::getFullName).toList()
        );


        return dto;
        
    }

    private Project mapToEntity(CreateProjectRequestDTO dto) {
        
        Project project = new Project();
        project.setProjectCode(dto.getProjectCode());
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setProjectType(ProjectType.valueOf(dto.getProjectType()));
        project.setCity(subCityServiceImpl.getCity());
        project.setSubCity(subCityServiceImpl.getSubCityEntity(dto.getSubCityId()));
        project.setLocation(locationServiceImpl.getLocationByLocationId(dto.getLocationId()));
        project.setContractor(contractorServiceImpl.getContractorEntityById(dto.getContractorId()));
        project.setProjectManager(employeeServiceImpl.findEmployee(dto.getProjectManagerId()));
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus()));
        project.setPriority(ProjectPriority.valueOf(dto.getPriority()));
        project.setCurrencyType(CurrencyType.valueOf(dto.getCurrencyType()));
        project.setBudget(dto.getBudget());
        project.setBudgetUsed(dto.getBudgetUsed());
        project.setEmployees(employeeServiceImpl.findEmpsByEmployeeIds(dto.getEmployeeIds()));

        return project;
    }
}