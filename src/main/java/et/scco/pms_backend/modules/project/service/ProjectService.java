package et.scco.pms_backend.modules.project.service;

import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ProjectService {

//    Page<ProjectResponseDTO> getAllProjects(Pageable pageable);

    Page<ProjectResponseDTO> getAllProjects(String search, ProjectStatus status, Long subCityId, Pageable pageable);

    ProjectResponseDTO getProject(Long id);

//    ProjectResponseDTO createProject(CreateProjectRequestDTO dto);

    ProjectResponseDTO updateProject(Long id, CreateProjectRequestDTO dto);

    void deleteProject(Long id);

//    ProjectResponseDTO updateStatus(Long id, String status);

//    ProjectResponseDTO updatePriority(Long id, String priority);

//    ProjectResponseDTO updateBudget(Long projectId, Double budget, Double budgetUsed);

//    ProjectResponseDTO updateTimeline(Long projectId, LocalDate startDate, LocalDate endDate);

    Project getProjectById(Long projectId);

    Page<ProjectResponseDTO> getMyProjects(Pageable pageable);
}