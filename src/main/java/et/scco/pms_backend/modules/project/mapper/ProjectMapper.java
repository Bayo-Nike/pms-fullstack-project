package et.scco.pms_backend.modules.project.mapper;

import java.util.stream.Collectors;

import et.scco.pms_backend.modules.admin.mapper.UserMapper;
import et.scco.pms_backend.modules.project.dto.request.ProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.task.mapper.TaskMapper;

public class ProjectMapper {

    public static ProjectResponseDTO mapToProjectDTO(Project project) {

        return null;
    }

    public static Project mapToProject(ProjectRequestDTO dto) {
        if (dto == null) return null;
        Project project = new Project();
        project.setId(dto.getId());
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        // User & tasks should be set in service layer
        return project;
    }
}
