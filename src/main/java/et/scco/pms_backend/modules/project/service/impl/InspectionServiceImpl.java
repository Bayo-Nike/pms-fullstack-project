package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.DivisionGroup;
import et.scco.pms_backend.enums.InspectionLevel;
import et.scco.pms_backend.enums.InspectionStatus;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.InspectionType;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.repository.InspectionTypesRepository;
import et.scco.pms_backend.modules.admin.service.AuditLogService;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import et.scco.pms_backend.modules.admin.service.impl.EmployeeServiceImpl;
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
import et.scco.pms_backend.utility.FileStorageService;
import et.scco.pms_backend.utility.JurisdictionUtility;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class InspectionServiceImpl implements InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionTypesRepository inspectionTypeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AuthContext authContext;
    private final NotificationService notificationService;
    private final EmployeeServiceImpl employeeServiceImpl;
    private final JurisdictionUtility jurisdictionUtility;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    // @Transactional(readOnly = true)
    // @Override
    // public Page<InspectionResponseDto> getAllInspections(String search, Long subCityId, Pageable pageable) {

    //     Employee employee = employeeServiceImpl.findEmployeeWithDivision();

    //     if (employee == null) {
    //         return inspectionRepository.findAll(pageable).map(this::mapToResponseDto);
    //     }

    //     SubCity restrictedSubCity = employee.getSubCity();
    //     Division division = employee.getDivision();

    //     if (division == null) {
    //         return Page.empty(pageable);
    //     }

    //     DivisionGroup divisionGroup = division.getDivisionGroup();
    //     Long finalSubCityId = (restrictedSubCity != null) ? restrictedSubCity.getId() : subCityId;

    //     ProjectType projectType = null;
    //     if (divisionGroup.equals(DivisionGroup.BLD)) {
    //         projectType = ProjectType.BUILDING;
    //     } else if (!divisionGroup.equals(DivisionGroup.BTH)) {
    //         projectType = ProjectType.WATER_AND_ROAD;
    //     }

    //     Page<Inspection> inspectionPage = inspectionRepository.findWithFilters(
    //             projectType,
    //             finalSubCityId,
    //             search,
    //             pageable);

    //     return inspectionPage.map(this::mapToResponseDto);
    // }

    @Transactional(readOnly = true)
    @Override
    public Page<InspectionResponseDto> getAllInspections(String search, Long subCityId, Pageable pageable) {
        Employee employee = employeeServiceImpl.findEmployeeWithDivision();

        if (employee == null) {
            return inspectionRepository.findAll(pageable).map(this::mapToResponseDto);
        }

        SubCity restrictedSubCity = employee.getSubCity();
        Division division = employee.getDivision();

        if (division == null) {
            return Page.empty(pageable);
        }

        DivisionGroup divisionGroup = division.getDivisionGroup();
        Long finalSubCityId = (restrictedSubCity != null) ? restrictedSubCity.getId() : subCityId;

        ProjectType projectType = null;
        if (divisionGroup.equals(DivisionGroup.BLD)) {
            projectType = ProjectType.BUILDING;
        } else if (!divisionGroup.equals(DivisionGroup.BTH)) {
            projectType = ProjectType.WATER_AND_ROAD;
        }

        // ADD THIS LOGIC:
        List<InspectionStatus> allowedStatuses = new ArrayList<>();
    
        // 1. Role-based visibility
        if (authContext.hasAnyRole("ROLE_CITY_TEAM_LEADER","ROLE_SUB-CITY_TEAM_LEADER")){
            allowedStatuses.addAll(List.of(InspectionStatus.values()));
        } 
        else if (authContext.hasAnyRole("ROLE_CITY_DIRECTOR","ROLE_SUB-CITY_OFFICE_HEAD")){
            allowedStatuses.add(InspectionStatus.APPROVED_BY_TL);
            allowedStatuses.add(InspectionStatus.APPROVED_BY_DIRECTOR);
        } 
        else if (authContext.hasRole("ROLE_CITY_OFFICE_HEAD")) { // Matches your AuthContext name
            allowedStatuses.add(InspectionStatus.APPROVED_BY_DIRECTOR);
        }
        // 2. Fallback for Site Engineer (The person creating the logs)
        else {
            allowedStatuses.add(InspectionStatus.SUBMITTED_BY_SE);
            allowedStatuses.add(InspectionStatus.APPROVED_BY_TL);
            allowedStatuses.add(InspectionStatus.APPROVED_BY_DIRECTOR);
        }

        // IMPORTANT: If no statuses are found, add a dummy to prevent SQL error
        if (allowedStatuses.isEmpty()) {
            allowedStatuses.add(InspectionStatus.SUBMITTED_BY_SE);
        }

        return inspectionRepository.findWithFilters(
                projectType,
                finalSubCityId,
                search,
                allowedStatuses,
                pageable
        ).map(this::mapToResponseDto);
    }

    @Override
    public InspectionResponseDto getInspection(Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));
        return mapToResponseDto(inspection);
    }


    @Transactional
    @Override
    public InspectionResponseDto createInspection(InspectionRequestDto dto, List<MultipartFile> files) {
        Inspection inspection = new Inspection();
        inspection.setInspectionStatus(InspectionStatus.SUBMITTED_BY_SE); // Default start
        return getInspectionResponseDto(dto, files, inspection, true);
    }

    @Transactional
    @Override
    public InspectionResponseDto updateInspection(Long id, InspectionRequestDto dto, List<MultipartFile> files) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        return getInspectionResponseDto(dto, files, inspection, false);
    }

    @NonNull
    private InspectionResponseDto getInspectionResponseDto(InspectionRequestDto dto, List<MultipartFile> files, Inspection inspection, boolean isCreate) {
        updateInspectionEntity(inspection, dto);

        if (files != null)
        {
            try {
                String fileName = fileStorageService.storeFile(files.getFirst());
                inspection.setInspectionDocumentUrl(fileName);
            }catch (Exception e) {
                System.out.println(e.getMessage());
            }
        }
        Inspection updated = inspectionRepository.save(inspection);
        Employee employee =  updated.getEmployee();
        String insName = updated.getInspectionType().getName();

        if (isCreate){
            notificationService.sendNotification(
                    employee.getId(),
                    jurisdictionUtility.mySupervisor(),
                    insName + " inspection logged by "+ employee.getFullName(),
                    "/inspections"
            );
            auditLogService.auditLog("CREATE", "Inspection"+ updated.getInspectionType().getName()+" Created");
        }else{
            notificationService.sendNotification(
                    employee.getId(),
                    jurisdictionUtility.mySupervisor(),
                    insName + " inspection submitted by "+ employee.getFullName(),
                    "/inspections"
            );
            auditLogService.auditLog("UPDATE", "Inspection "+ updated.getInspectionType().getName() +"Updated");
        }

        return mapToResponseDto(updated);
    }

    @Override
    @Transactional
    public void deleteInspection(Long id) {
        if (!inspectionRepository.existsById(id)) {
            throw new RuntimeException("Inspection not found");
        }
        inspectionRepository.deleteById(id);
        auditLogService.auditLog("DELETE", "Inspection result has been deleted");
    }

    @Override
    public List<InspectionResponseDto> getInspectionsByProject(Long projectId) {
        return inspectionRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    public InspectionResponseDto commentInspection(Long inspectionId, String comment) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));
        int which;
        if (inspection.getComment1() == null) {
            inspection.setComment1(comment);
            inspection.setCommentedBy1(authContext.getEmployee().getFullName());
            which = 1;
        } else {
            if (inspection.getComment2() == null){
                inspection.setComment2(comment);
                inspection.setCommentedBy2(authContext.getEmployee().getFullName());
                which = 2;
            }else{
                which = 0;
            }
        }

        if (which != 0){
            Long empId =  inspection.getEmployee().getId();
            String who = which == 2 ? inspection.getCommentedBy2(): inspection.getCommentedBy1();
            notificationService.sendNotification(
                    empId,
                    empId, who + " has as added a comment to your inspection result",
                    "inspections"
            );
        }

        return mapToResponseDto(inspectionRepository.save(inspection));
    }

    private void updateInspectionEntity(Inspection inspection, InspectionRequestDto dto) {
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
        inspection.setInspectionStatus(dto.getInspectionStatus());
        inspection.setWeatherCondition(dto.getWeatherCondition());
        inspection.setInspectionDate(dto.getInspectionDate());
        inspection.setInspectionResult(dto.getInspectionResult());
        inspection.setActiveWorkers(dto.getActiveWorkers());
        inspection.setLatitude(dto.getLatitude());
        inspection.setLongitude(dto.getLongitude());

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
        dto.setInspectionStatus(inspection.getInspectionStatus());
        dto.setWeatherCondition(inspection.getWeatherCondition());
        dto.setProjectId(inspection.getProject().getId());
        dto.setProjectTitle(inspection.getProject().getTitle());

        if (inspection.getTask() != null) {
            dto.setTaskId(inspection.getTask().getId());
            dto.setTaskName(inspection.getTask().getTaskType().getName());
        }

        dto.setEmployeeId(inspection.getEmployee().getId());
        dto.setEmployeeName(inspection.getEmployee().getFullName());
        dto.setInspectionDate(inspection.getInspectionDate());
        dto.setInspectionResult(inspection.getInspectionResult());
        dto.setActiveWorkers(inspection.getActiveWorkers());
        dto.setLatitude(inspection.getLatitude());
        dto.setLongitude(inspection.getLongitude());
        dto.setInspectionDocumentUrl(inspection.getInspectionDocumentUrl());
        dto.setComment1(inspection.getComment1());
        dto.setComment2(inspection.getComment2());
        dto.setCommentedBy1(inspection.getCommentedBy1());
        dto.setCommentedBy2(inspection.getCommentedBy2());

        return dto;
    }

    @Transactional
    public InspectionResponseDto approveInspection(Long id) {
        Inspection inspection = inspectionRepository.findById(id).orElseThrow();
        
        if (authContext.hasRole("ROLE_CITY_TEAM_LEADER") && inspection.getInspectionStatus() == InspectionStatus.SUBMITTED_BY_SE) {
            inspection.setInspectionStatus(InspectionStatus.APPROVED_BY_TL);
        } else if (authContext.hasRole("ROLE_CITY_DIRECTOR") && inspection.getInspectionStatus() == InspectionStatus.APPROVED_BY_TL) {
            inspection.setInspectionStatus(InspectionStatus.APPROVED_BY_DIRECTOR);
        }
        
        return mapToResponseDto(inspectionRepository.save(inspection));
    }
}