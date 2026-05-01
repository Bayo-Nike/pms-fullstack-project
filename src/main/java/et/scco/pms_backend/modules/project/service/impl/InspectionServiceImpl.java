package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.DivisionGroup;
import et.scco.pms_backend.enums.InspectionLevel;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.InspectionType;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.repository.InspectionTypesRepository;
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

        Page<Inspection> inspectionPage = inspectionRepository.findWithFilters(
                projectType,
                finalSubCityId,
                search,
                pageable);

        return inspectionPage.map(this::mapToResponseDto);
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
        return getInspectionResponseDto(dto, files, inspection);
    }

    @Transactional
    @Override
    public InspectionResponseDto updateInspection(Long id, InspectionRequestDto dto, List<MultipartFile> files) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        return getInspectionResponseDto(dto, files, inspection);
    }

    @NonNull
    private InspectionResponseDto getInspectionResponseDto(InspectionRequestDto dto, List<MultipartFile> files, Inspection inspection) {
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

//        List<Long>allSuper = jurisdictionUtility.myHierarchyUp();
//
//        if (!allSuper.isEmpty())
//        {
//            allSuper.forEach(sup ->{
//                notificationService.sendNotification(
//                        authContext.getEmployee().getId(),
//                        sup,
//                        "Inspection updates for project",
//                        "nspections/edit/"+updated.getId()
//                );
//            });
//        }
//
//        Long sup = jurisdictionUtility.mySupervisor();
//
//        if (sup != null)
//        {
//                notificationService.sendNotification(
//                        authContext.getEmployee().getId(),
//                        sup,
//                        "Inspection updates for project",
//                        "nspections/edit/"+updated.getId()
//                );
//        }
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
        dto.setWeatherCondition(inspection.getWeatherCondition());
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
        dto.setActiveWorkers(inspection.getActiveWorkers());
        dto.setLatitude(inspection.getLatitude());
        dto.setLongitude(inspection.getLongitude());
        dto.setInspectionDocumentUrl(inspection.getInspectionDocumentUrl());

        return dto;
    }
}