package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.CurrencyType;
import et.scco.pms_backend.enums.ProjectPriority;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
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
        return null; // implement
    }

    private Project mapToEntity(CreateProjectRequestDTO dto) {
        Project project = new Project();
        project.setProjectCode(dto.getProjectCode());
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setProjectType(ProjectType.valueOf(dto.getProjectType()));
        project.setCity(dto.getCityId());
        project.setSubCity(dto.getSubCityId());
        project.setLocation(dto.getLocationId());
        project.setContractor(dto.getContractorId());
        project.setProjectManager(dto.getProjectManagerId());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus()));
        project.setPriority(ProjectPriority.valueOf(dto.getPriority()));
        project.setCurrencyType(CurrencyType.valueOf(dto.getCurrencyType()));
        project.setBudget(dto.getBudget());
        project.setBudgetUsed(dto.getBudgetUsed());
        project.setEmployees(dto.getEmployeeIds());

        return project;
    }
}