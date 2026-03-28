package et.scco.pms_backend.modules.project.service.impl;


import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.modules.admin.service.NotificationService;
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
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ProjectCostResponseDto addCost(ProjectCostRequestDto dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectCost cost = new ProjectCost();
        cost.setProject(project);
        cost.setPhase(dto.getPhase());
        cost.setAmount(dto.getAmount());

        if (!authContext.isSuperAdmin()) {
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

    @Transactional
    @Override
    public ProjectCostResponseDto updateProjectCost(Long id, ProjectCostRequestDto dto) {
        ProjectCost projectCost = costRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project Cost not found with id: " + id));

        Project project = projectCost.getProject();
        Long projectManagerId =projectCost.getProject().getProjectManager().getId();
        Double currentTaskCost = projectCost.getAmount();

        projectCost.setAmount(dto.getAmount());
        projectCost.setPhase(dto.getPhase());
        projectCost.setProject(project); 

        if (!authContext.isSuperAdmin()) {
            projectCost.setCreatedBy(authContext.getEmployee());
        }

        // Link Task if provided
        if (dto.getTaskId() != null) {
            Task task = taskRepository.findById(dto.getTaskId()).orElse(null);
            projectCost.setTask(task);
        }
 
        ProjectCost updatedProjectCost = costRepository.save(projectCost);
 
        // Update Project's budgetUsed field automatically
        Double currentProjectBudgetUsed = project.getBudgetUsed();
        
        Double newProjectBudgetAdjustment = currentProjectBudgetUsed - (currentTaskCost - dto.getAmount());
        
        
        project.setBudgetUsed(newProjectBudgetAdjustment);
        //send payment notification to the Project manager
        if (projectManagerId != null){
            notificationService.sendNotification(
                    authContext.getEmployee().getId(),
                    projectManagerId,
                    projectCost.getProject().getTitle()+" Project Cost Payment has been Updated",
                    "projects/"+projectCost.getProject().getId()
            );
        }

        return mapToDto(updatedProjectCost);
    }
}