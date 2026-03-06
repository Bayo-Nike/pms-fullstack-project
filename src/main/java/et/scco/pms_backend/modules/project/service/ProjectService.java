package et.scco.pms_backend.modules.project.service;

import java.util.List;

import et.scco.pms_backend.modules.project.dto.request.ProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;

public interface ProjectService {

    ProjectResponseDTO createProject(ProjectRequestDTO projectDto);

    ProjectResponseDTO getProjectById(Long projectId);

    List<ProjectResponseDTO> getAllProjects();

    ProjectResponseDTO updateProject(Long projectId, ProjectRequestDTO projectRequestDTO);

    void deleteProject(Long projectId);

    
} 
