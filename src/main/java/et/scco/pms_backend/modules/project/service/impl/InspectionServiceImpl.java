package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.InspectionLevel;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.InspectionType;
import et.scco.pms_backend.modules.admin.repository.InspectionTypesRepository;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import et.scco.pms_backend.modules.admin.service.UserService;
import et.scco.pms_backend.modules.project.dto.request.InspectionRequestDto;
import et.scco.pms_backend.modules.project.dto.response.InspectionResponseDto;
import et.scco.pms_backend.modules.project.model.Inspection;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.project.repository.InspectionRepository;
import et.scco.pms_backend.modules.project.repository.ProjectRepository;
import et.scco.pms_backend.modules.project.service.InspectionService;
import et.scco.pms_backend.modules.task.model.Task;
import et.scco.pms_backend.modules.task.repository.TaskRepository;
import et.scco.pms_backend.utility.AuthContext;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class InspectionServiceImpl implements InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionTypesRepository inspectionTypeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AuthContext authContext;
    private final UserService userService;
    private final NotificationService notificationService;


    @Override
    public Page<InspectionResponseDto> getAllInspections(Pageable pageable) {

        if (authContext.isMayor() || authContext.isSuperAdmin()) {
            return inspectionRepository.findAll(pageable)
                    .map(this::mapToResponseDto);
        }

        // Find only my inspections with pagination
        return inspectionRepository
                .findAllByEmployee(authContext.getEmployee(), pageable)
                .map(this::mapToResponseDto);
    }

    @Override
    public InspectionResponseDto getInspection(Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));
        return mapToResponseDto(inspection);
    }

    @Override
    @Transactional
    public InspectionResponseDto createInspection(InspectionRequestDto dto) {
        Inspection inspection = new Inspection();

        updateInspectionEntity(inspection, dto);

        Inspection saved = inspectionRepository.save(inspection);

        //send notification
        notificationService.sendNotification(
                authContext.getUsername(),
                userService.getManagerUserName(),
                "Project inspection result",
                "inspections/edit/"+saved.getId()
        );

        return mapToResponseDto(saved);
    }

    @Override
    @Transactional
    public InspectionResponseDto updateInspection(Long id, InspectionRequestDto dto) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        updateInspectionEntity(inspection, dto);

        Inspection updated = inspectionRepository.save(inspection);
        return mapToResponseDto(updated);
    }

    @Override
    @Transactional
    public void deleteInspection(Long id) {
        if (!inspectionRepository.existsById(id)) {
            throw new RuntimeException("Inspection not found");
        }
        inspectionRepository.deleteById(id);
    }

    @Override
    public List<InspectionResponseDto> getInspectionsByProject(Long projectId) {
        return inspectionRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    private void updateInspectionEntity(Inspection inspection, InspectionRequestDto dto)
    {
        if (authContext.isSuperAdmin()) {
            throw new RuntimeException("Super Admin cannot update Inspection");
        }

        InspectionType type = inspectionTypeRepository.findById(dto.getInspectionTypeId())
                .orElseThrow(() -> new RuntimeException("Inspection Type not found"));

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Employee employee = null;
        if (!authContext.isSuperAdmin()) {
            employee = authContext.getEmployee();
        }

        inspection.setInspectionType(type);
        inspection.setProject(project);
        inspection.setEmployee(employee);
        inspection.setInspectionLevel(dto.getInspectionLevel());
        inspection.setInspectionDate(dto.getInspectionDate());
        inspection.setInspectionResult(dto.getInspectionResult());

        if (dto.getInspectionLevel() == InspectionLevel.TASK && dto.getTaskId() != null) {
            Task task = taskRepository.findById(dto.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            inspection.setTask(task);
        } else {
            inspection.setTask(null);
        }
    }

    private InspectionResponseDto mapToResponseDto(Inspection inspection) {
        InspectionResponseDto dto = new InspectionResponseDto();
        dto.setId(inspection.getId());

        dto.setInspectionTypeId(inspection.getInspectionType().getId());
        dto.setInspectionTypeName(inspection.getInspectionType().getName());

        dto.setInspectionLevel(inspection.getInspectionLevel());

        dto.setProjectId(inspection.getProject().getId());
        dto.setProjectTitle(inspection.getProject().getTitle());

        if (inspection.getTask() != null) {
            dto.setTaskId(inspection.getTask().getId());
            dto.setTaskName(inspection.getTask().getTaskName());
        }

        dto.setEmployeeId(inspection.getEmployee().getId());
        dto.setEmployeeName(inspection.getEmployee().getFullName());

        dto.setInspectionDate(inspection.getInspectionDate());
        dto.setInspectionResult(inspection.getInspectionResult());

        return dto;
    }
}