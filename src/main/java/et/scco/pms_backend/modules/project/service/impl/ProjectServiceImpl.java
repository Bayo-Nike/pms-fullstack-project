package et.scco.pms_backend.modules.project.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.project.dto.request.ProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.mapper.ProjectMapper;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.project.repository.ProjectRepository;
import et.scco.pms_backend.modules.project.service.ProjectService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService{

    private final ProjectRepository projectRepository;

    @Override
    public ProjectResponseDTO createProject(ProjectRequestDTO projectRequestDTO) {
        Project project = ProjectMapper.mapToProject(projectRequestDTO);
        Project savedProject = projectRepository.save(project);

        return ProjectMapper.mapToProjectDTO(savedProject);
    }

    @Override
    public ProjectResponseDTO getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project is Not found with given id: " + projectId));
        return ProjectMapper.mapToProjectDTO(project);
    }

    @Override
    public List<ProjectResponseDTO> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        return projects.stream().map(ProjectMapper::mapToProjectDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponseDTO updateProject(Long projectId, ProjectRequestDTO projectRequestDTO) {

        Project project = projectRepository.findById(projectId)
        .orElseThrow(() ->
                new ResourceNotFoundException("Project is not Exist with given id:" + projectId));

        // Update fields
        project.setTitle(projectRequestDTO.getTitle());
        project.setDescription(projectRequestDTO.getDescription());

        Project updatedProject = projectRepository.save(project);
        return ProjectMapper.mapToProjectDTO(updatedProject);

    }

    @Override
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Project is not Exist with given id:" + projectId));
        projectRepository.delete(project);
    }
}
