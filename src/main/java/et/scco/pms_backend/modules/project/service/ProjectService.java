package et.scco.pms_backend.modules.project.service;

import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {

    Page<ProjectResponseDTO> getAllProjects(String search, ProjectStatus status, Long subCityId, Pageable pageable);

    ProjectResponseDTO getProject(Long id);

    ProjectResponseDTO updateProject(Long id, CreateProjectRequestDTO dto);

    void deleteProject(Long id);

    Project getProjectById(Long projectId);

    Page<ProjectResponseDTO> getMyProjects(Pageable pageable);
}