package et.scco.pms_backend.modules.project.service.impl;


import et.scco.pms_backend.enums.PaymentStatus;
import et.scco.pms_backend.modules.admin.model.Client;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.repository.ClientRepository;
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
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectCostServiceImpl implements ProjectCostService {

    private final ProjectCostRepository costRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AuthContext authContext;
    private final ClientRepository clientRepository;

    // @Override
    // @Transactional
    // public ProjectCostResponseDto addCost(ProjectCostRequestDto dto) {
    //     Project project = projectRepository.findById(dto.getProjectId())
    //             .orElseThrow(() -> new RuntimeException("Project not found"));

    //     ProjectCost cost = new ProjectCost();
    //     cost.setProject(project);
    //     cost.setPhase(dto.getPhase());
    //     cost.setAmount(dto.getAmount());
        
    //     cost.setStatus(PaymentStatus.REQUESTED);
    //     cost.setRequestedDate(LocalDateTime.now());

    //     if (!authContext.isSuperAdmin()) {
    //         cost.setCreatedBy(authContext.getEmployee());
    //     }

    //     // Link Task if provided
    //     if (dto.getTaskId() != null) {
    //         Task task = taskRepository.findById(dto.getTaskId()).orElse(null);
    //         cost.setTask(task);
    //     }

    //     ProjectCost saved = costRepository.save(cost);

    //     // Update Project's budgetUsed field automatically
    //     // Double projectBudgetUsed = project.getBudgetUsed() != null ? project.getBudgetUsed(): Double.valueOf(0.0);
    //     // projectBudgetUsed = projectBudgetUsed + dto.getAmount();

    //     // project.setBudgetUsed(projectBudgetUsed);

    //     // projectRepository.save(project);


    //     //send payment notification to the Project manager
    //     if (project.getProjectManager() != null){
    //         notificationService.sendNotification(
    //                 authContext.getEmployee().getId(),
    //                 project.getProjectManager().getId(),
    //                 project.getTitle()+" Project Cost Payment has been Added",
    //                 "projects/"+project.getId()
    //         );
    //     }

    //     return mapToDto(saved);
    // }

    // @Transactional
    // public ProjectCostResponseDto acknowledge(Long id, String remark) {
    //     ProjectCost cost = costRepository.findById(id).orElseThrow();
    //     cost.setStatus(PaymentStatus.ACKNOWLEDGED);
    //     cost.setAcknowledgedBy(authContext.getEmployee());
    //     cost.setAckRemark(remark);
        
    //     // Notify Director
    //     // notificationService.sendNotification("DIRECTOR", "Payment Awaiting Final Approval: " + cost.getProject().getTitle());
        
    //     return mapToDto(costRepository.save(cost));
    // }

    // @Transactional
    // public ProjectCostResponseDto approve(Long id, String remark) {
    //     ProjectCost cost = costRepository.findById(id).orElseThrow();
    //     Project project = cost.getProject();

    //     cost.setStatus(PaymentStatus.APPROVED);
    //     cost.setDecider(authContext.getEmployee());
    //     cost.setDeciderRemark(remark);
    //     cost.setResponseDate(LocalDateTime.now());

    //     // CRITICAL: Only deduct budget on final approval
    //     double currentTotal = project.getBudgetUsed() != null ? project.getBudgetUsed() : 0.0;
    //     project.setBudgetUsed(currentTotal + cost.getAmount());
    //     projectRepository.save(project);

    //     return mapToDto(costRepository.save(cost));
    // }

    // @Transactional
    // public ProjectCostResponseDto reject(Long id, String remark) {
    //     ProjectCost cost = costRepository.findById(id).orElseThrow();
    //     cost.setStatus(PaymentStatus.REJECTED);
    //     cost.setDeciderRemark(remark); // Reuse decider remark for rejection reason
    //     return mapToDto(costRepository.save(cost));
    // }

    // @Override
    // public List<ProjectCostResponseDto> getHistoryByProject(Long projectId) {
    //     return costRepository.findAllByProjectIdOrderByUpdatedAtDesc(projectId)
    //             .stream()
    //             .map(this::mapToDto)
    //             .toList();
    // }

    // @Override
    // @Transactional
    // public void deleteCost(Long id) {
    //     ProjectCost cost = costRepository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Record not found"));

    //     // Reverse the budget calculation before deleting
    //     Project project = cost.getProject();
    //     project.setBudgetUsed(project.getBudgetUsed() - cost.getAmount());

    //     projectRepository.save(project);
    //     costRepository.delete(cost);
    // }

    // private ProjectCostResponseDto mapToDto(ProjectCost entity) {
    //     return ProjectCostResponseDto.builder()
    //             .id(entity.getId())
    //             .projectId(entity.getProject().getId())
    //             .projectTitle(entity.getProject().getTitle())
    //             .taskId(entity.getTask() != null ? entity.getTask().getId() : null)
    //             .taskName(entity.getTask() != null ? entity.getTask().getTaskType().getName() : null)
    //             .phase(entity.getPhase())
    //             .amount(entity.getAmount())
    //             .status(entity.getStatus())
    //             .submittedBy(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName(): UserType.SYSTEM.name())
    //             .acknowledgedBy(entity.getAcknowledgedBy() != null ? entity.getAcknowledgedBy().getFullName() : null)
    //             .approvedBy(entity.getDecider() != null ? entity.getDecider().getFullName() : null)
    //             .updatedAt(entity.getUpdatedAt())
    //             .build();
    // }

    // @Transactional
    // @Override
    // public ProjectCostResponseDto updateProjectCost(Long id, ProjectCostRequestDto dto) {
    //     ProjectCost projectCost = costRepository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Project Cost not found with id: " + id));

    //     Project project = projectCost.getProject();
    //     Long projectManagerId =projectCost.getProject().getProjectManager().getId();
    //     Double currentTaskCost = projectCost.getAmount();

    //     projectCost.setAmount(dto.getAmount());
    //     projectCost.setPhase(dto.getPhase());
    //     projectCost.setProject(project); 

    //     if (!authContext.isSuperAdmin()) {
    //         projectCost.setCreatedBy(authContext.getEmployee());
    //     }

    //     // Link Task if provided
    //     if (dto.getTaskId() != null) {
    //         Task task = taskRepository.findById(dto.getTaskId()).orElse(null);
    //         projectCost.setTask(task);
    //     }
 
    //     ProjectCost updatedProjectCost = costRepository.save(projectCost);
 
    //     // Update Project's budgetUsed field automatically
    //     Double currentProjectBudgetUsed = project.getBudgetUsed();
        
    //     Double newProjectBudgetAdjustment = currentProjectBudgetUsed - (currentTaskCost - dto.getAmount());
        
        
    //     project.setBudgetUsed(newProjectBudgetAdjustment);
    //     //send payment notification to the Project manager
    //     if (projectManagerId != null){
    //         notificationService.sendNotification(
    //                 authContext.getEmployee().getId(),
    //                 projectManagerId,
    //                 projectCost.getProject().getTitle()+" Project Cost Payment has been Updated",
    //                 "projects/"+projectCost.getProject().getId()
    //         );
    //     }

    //     return mapToDto(updatedProjectCost);
    // } 

    @Override
    @Transactional
    public ProjectCostResponseDto addProjectPaymentRequest(ProjectCostRequestDto dto, MultipartFile file) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Employee currentEmployee = authContext.getEmployee();

        ProjectCost cost = new ProjectCost();
        cost.setProject(project);
        cost.setPhase(dto.getPhase());
        cost.setAmount(dto.getAmount());
        cost.setPaymentName(dto.getPaymentName());
        cost.setMilestone(dto.getMilestone());
        cost.setStatus(PaymentStatus.REQUESTED);
        cost.setRequestedDate(LocalDateTime.now());

        // 2. REATTACH THE CLIENT (The Fix)
        if (!authContext.isSuperAdmin() && currentEmployee != null) {
            cost.setCreatedBy(currentEmployee);
            
            if (currentEmployee.getClient() != null) {
                // Get the ID from the proxy (this doesn't trigger lazy loading)
                Long clientId = currentEmployee.getClient().getId();
                
                // Fetch a FRESH instance from the database in the CURRENT session
                Client attachedClient = clientRepository.findById(clientId)
                        .orElseThrow(() -> new RuntimeException("Client not found"));
                
                cost.setClient(attachedClient);
            }
        }

        if (dto.getTaskId() != null) {
            cost.setTask(taskRepository.findById(dto.getTaskId()).orElse(null));
        }

        // 3. Handle File Save
        if (file != null && !file.isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                saveFileToDisk(file, fileName); 
                cost.setSupportingDoc(fileName);
            } catch (IOException e) {
                throw new RuntimeException("File upload failed");
            }
        }

        // 4. Save and Map
        ProjectCost saved = costRepository.save(cost);

        // mapToDto is now safe because 'saved.getClient()' is an attached entity
        return mapToDto(saved);
    }

    
    @Override
    @Transactional
    public ProjectCostResponseDto acknowledge(Long id, String remark) {
        ProjectCost cost = costRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cost record not found"));

        if (cost.getStatus() != PaymentStatus.REQUESTED) {
            throw new IllegalStateException("Only PENDING payments can be acknowledged.");
        }

        cost.setStatus(PaymentStatus.ACKNOWLEDGED);
        cost.setAckRemark(remark);
        if (!authContext.isSuperAdmin()) {
            cost.setAcknowledgedBy(authContext.getEmployee());
        }

        ProjectCost updated = costRepository.save(cost);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public ProjectCostResponseDto approve(Long id, String remark) {
        ProjectCost cost = costRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cost record not found"));

        if (cost.getStatus() != PaymentStatus.ACKNOWLEDGED) {
            throw new IllegalStateException("Only ACKNOWLEDGED payments can be approved by Director.");
        }

        cost.setStatus(PaymentStatus.APPROVED);
        cost.setDeciderRemark(remark);
        cost.setResponseDate(LocalDateTime.now());
        if (!authContext.isSuperAdmin()) {
            cost.setDecider(authContext.getEmployee());
        }

        // Deduct/Update Project Budget USED on final Director Approval
        Project project = cost.getProject();
        Double currentBudgetUsed = project.getBudgetUsed() != null ? project.getBudgetUsed() : 0.0;
        project.setBudgetUsed(currentBudgetUsed + cost.getAmount());
        projectRepository.save(project);

        ProjectCost updated = costRepository.save(cost);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public ProjectCostResponseDto reject(Long id, String remark) {
        ProjectCost cost = costRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cost record not found"));

        cost.setStatus(PaymentStatus.REJECTED);
        cost.setDeciderRemark(remark);
        cost.setResponseDate(LocalDateTime.now());
        if (!authContext.isSuperAdmin()) {
            cost.setDecider(authContext.getEmployee());
        }

        ProjectCost updated = costRepository.save(cost);
        return mapToDto(updated);
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

        // Reverse budget if it was already approved
        if (cost.getStatus() == PaymentStatus.APPROVED) {
            Project project = cost.getProject();
            project.setBudgetUsed(project.getBudgetUsed() - cost.getAmount());
            projectRepository.save(project);
        }

        costRepository.delete(cost);
    }

    @Override
    @Transactional
    public ProjectCostResponseDto updateProjectPaymentRequest(Long id, ProjectCostRequestDto dto, MultipartFile file) {
        // 1. Fetch and Validate Existence
        ProjectCost projectCost = costRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project Cost record not found"));

        // 2. Security/Workflow Check: Prevent editing if already processed
        if (projectCost.getStatus() == PaymentStatus.APPROVED || projectCost.getStatus() == PaymentStatus.ACKNOWLEDGED) {
            throw new RuntimeException("Cannot edit a record that has already been acknowledged or approved.");
        }

        // 3. Handle Budget Adjustment (CRITICAL for financial integrity)
        Project project = projectCost.getProject();
        double oldAmount = projectCost.getAmount();
        double newAmount = dto.getAmount();
        
        if (oldAmount != newAmount) {
            double difference = newAmount - oldAmount;
            double currentTotalUsed = project.getBudgetUsed() != null ? project.getBudgetUsed() : 0.0;
            project.setBudgetUsed(currentTotalUsed + difference);
            projectRepository.save(project);
        }

        // 4. Update Text Fields
        projectCost.setAmount(newAmount);
        projectCost.setPhase(dto.getPhase());
        projectCost.setPaymentName(dto.getPaymentName());
        projectCost.setMilestone(dto.getMilestone());

        // 5. Update Task Association
        if (dto.getTaskId() != null) {
            Task task = taskRepository.findById(dto.getTaskId()).orElse(null);
            projectCost.setTask(task);
        }

        // 6. Professional File Update Logic
        if (file != null && !file.isEmpty()) {
            try {
                // Delete old physical file if it exists
                if (projectCost.getSupportingDoc() != null) {
                    deleteOldFile(projectCost.getSupportingDoc());
                }

                // Save new file
                String newFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                saveFileToDisk(file, newFileName);
                projectCost.setSupportingDoc(newFileName);
                
            } catch (IOException e) {
                throw new RuntimeException("Could not store file. Error: " + e.getMessage());
            }
        }

        // 7. Update Audit Info
        projectCost.setUpdatedAt(LocalDateTime.now());
        // projectCost.setCreatedBy(authContext.getEmployee()); // Optional: track who did the last edit

        ProjectCost updated = costRepository.save(projectCost);
        return mapToDto(updated);
    }

    /**
     * Professional helper to save file to disk
     */
    private void saveFileToDisk(MultipartFile file, String fileName) throws IOException {
        Path uploadPath = Paths.get("uploads/payments");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        try (InputStream inputStream = file.getInputStream()) {
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    /**
     * Professional helper to delete old files
     */
    private void deleteOldFile(String fileName) {
        try {
            Path filePath = Paths.get("uploads/payments").resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log the error but don't stop the transaction
            System.err.println("Failed to delete old file: " + e.getMessage());
        }
    }
 

    private ProjectCostResponseDto mapToDto(ProjectCost entity) {
        return ProjectCostResponseDto.builder()
                .id(entity.getId())
                .projectId(entity.getProject().getId())
                .taskId(entity.getTask() != null ? entity.getTask().getId() : null)
                .taskName(entity.getTask() != null && entity.getTask().getTaskType() != null ? entity.getTask().getTaskType().getName() : null)
                .phase(entity.getPhase())
                .amount(entity.getAmount())
                .paymentName(entity.getPaymentName())
                .milestone(entity.getMilestone())
                .supportingDoc(entity.getSupportingDoc())
                .status(entity.getStatus() != null ? entity.getStatus() : PaymentStatus.REQUESTED)
                .submittedBy(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName() : "SYSTEM")
                .acknowledgedBy(entity.getAcknowledgedBy() != null ? entity.getAcknowledgedBy().getFullName() : null)
                .approvedBy(entity.getDecider() != null ? entity.getDecider().getFullName() : null)
                .updatedBy(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName() : "SYSTEM")
                .updatedAt(entity.getUpdatedAt())
                .ackRemark(entity.getAckRemark())
                .deciderRemark(entity.getDeciderRemark())
                .clientName(entity.getClient() != null ? entity.getClient().getClientName() : 
                        (entity.getProject().getClient() != null ? entity.getProject().getClient().getClientName() : "SYSTEM/INTERNAL"))
                .contractorName(entity.getProject().getContractor() != null ? entity.getProject().getContractor().getContractorName() : "N/A")
                .build();
    }


}