package et.scco.pms_backend.modules.project.service.impl;


import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.modules.project.dto.request.ProjectCostRequestDto;
import et.scco.pms_backend.modules.project.dto.response.ProjectCostResponseDto;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.project.model.ProjectCost;
import et.scco.pms_backend.modules.project.repository.ProjectCostRepository;
import et.scco.pms_backend.modules.project.repository.ProjectRepository;
import et.scco.pms_backend.modules.project.service.ProjectCostService;
import et.scco.pms_backend.modules.task.model.Task;
import et.scco.pms_backend.modules.task.repository.TaskRepository;
import et.scco.pms_backend.utility.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectCostServiceImpl implements ProjectCostService {

    private final ProjectCostRepository costRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AuthContext authContext;

    @Override
    @Transactional
    public ProjectCostResponseDto addCost(ProjectCostRequestDto dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectCost cost = new ProjectCost();
        cost.setProject(project);
        cost.setPhase(dto.getPhase());
        cost.setAmount(dto.getAmount());

        if (!authContext.isSystemUser()) {
            cost.setCreatedBy(authContext.getEmployee());
        }

        // Link Task if provided
        if (dto.getTaskId() != null) {
            Task task = taskRepository.findById(dto.getTaskId()).orElse(null);
            cost.setTask(task);
        }


        ProjectCost saved = costRepository.save(cost);

        // Update Project's budgetUsed field automatically
        project.setBudgetUsed(project.getBudgetUsed() + dto.getAmount());
        projectRepository.save(project);

        return mapToDto(saved);
    }

    @Override
    public List<ProjectCostResponseDto> getHistoryByProject(Long projectId) {
        return costRepository.findAllByProjectIdOrderByUpdatedAtDesc(projectId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteCost(Long id) {
        ProjectCost cost = costRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        // Reverse the budget calculation before deleting
        Project project = cost.getProject();
        project.setBudgetUsed(project.getBudgetUsed() - cost.getAmount());

        projectRepository.save(project);
        costRepository.delete(cost);
    }

    private ProjectCostResponseDto mapToDto(ProjectCost entity) {
        return ProjectCostResponseDto.builder()
                .id(entity.getId())
                .projectId(entity.getProject().getId())
                .taskId(entity.getTask() != null ? entity.getTask().getId() : null)
                .taskName(entity.getTask() != null ? entity.getTask().getTaskName() : null)
                .phase(entity.getPhase())
                .amount(entity.getAmount())
                .updatedBy(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName(): UserType.SYSTEM.name())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}