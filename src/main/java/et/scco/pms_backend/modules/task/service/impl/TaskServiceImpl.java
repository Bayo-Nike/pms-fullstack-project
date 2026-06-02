package et.scco.pms_backend.modules.task.service.impl;

import et.scco.pms_backend.enums.DivisionGroup;
import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Location;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.TaskType;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.TaskTypeRepository;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.EmployeeService;
import et.scco.pms_backend.modules.admin.service.LocationService;
import et.scco.pms_backend.modules.admin.service.impl.EmployeeServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.NotificationServiceImpl;
import et.scco.pms_backend.modules.auth.AuthUtility;
import et.scco.pms_backend.modules.project.service.impl.ProjectServiceImpl;
import et.scco.pms_backend.modules.task.dto.request.CreateTaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import et.scco.pms_backend.modules.task.model.Task;
import et.scco.pms_backend.modules.task.repository.TaskRepository;
import et.scco.pms_backend.modules.task.service.TaskService;
import et.scco.pms_backend.utility.AuthContext;
import et.scco.pms_backend.utility.FileStorageService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeService employeeService;    // to fetch employees
    private final LocationService locationServiceImpl;    // optional location
    private final ProjectServiceImpl projectService;
    private final AuthContext authContext;
    private final TaskTypeRepository taskTypeRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final NotificationServiceImpl notificationServiceImpl; 
    private final EmployeeServiceImpl employeeServiceImpl;

    // ---------------- Create Task ----------------
    @Override
    public TaskResponseDTO createTask(CreateTaskRequestDTO dto, MultipartFile file) {

        Task task = mapToEntity(dto);

        // 5. Security Context
        String currentUsername = AuthUtility.getUserName();
        User loggedInUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("The Updating User not found")); 
        Employee loggedInEmployee=loggedInUser.getEmployee();

        // if (dto.getSupportDocument() != null && !dto.getSupportDocument().isEmpty()) {
        if (file != null && !file.isEmpty()) {
            String fileName = null;
            try {
                fileName = fileStorageService.storeFile(file);
            } catch (Exception e) {
                e.printStackTrace();
            }
            task.setSupportDocument(fileName);
        }
        Task saved = taskRepository.save(task);

        //send notification to SE
        saved.getEmployees().forEach(receiverEmployee -> {

            notificationServiceImpl.sendNotification(
                    loggedInEmployee.getId(),
                    receiverEmployee.getId(),
                    String.format(
                            "%s has assigned a task %s for project %s to you.",
                            loggedInEmployee.getFullName(),
                            saved.getTaskType().getName(),
                            saved.getProject().getTitle()
                    ),
                    "inspections/create"
            );
        });

        return mapToDTO(saved);
    }

    // ---------------- Update Task ----------------
    @Override
    // public TaskResponseDTO updateTask(Long taskId, CreateTaskRequestDTO dto) {
    public TaskResponseDTO updateTask(Long taskId, CreateTaskRequestDTO dto, MultipartFile file){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
       
                // 5. Security Context
        String currentUsername = AuthUtility.getUserName();
        User loggedInUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("The Updating User not found")); 
        Employee loggedInEmployee=loggedInUser.getEmployee();

        // Only update file if a new one is uploaded
        // if (dto.getSupportDocument() != null && !dto.getSupportDocument().isEmpty()) {
            if (file != null && !file.isEmpty()) {
            String fileName = null;
            try {
                fileName = fileStorageService.storeFile(file);
            } catch (Exception e) {
                e.printStackTrace();
            }
            task.setSupportDocument(fileName);
        }
        // else: keep the existing file

        Task updated = taskRepository.save(mapToEntity(dto, task));

        //send notification to SE
        updated.getEmployees().forEach(receiverEmployee -> {

            notificationServiceImpl.sendNotification(
                    loggedInEmployee.getId(),
                    receiverEmployee.getId(),
                    String.format(
                            "%s has assigned a task %s for project %s to you.",
                            loggedInEmployee.getFullName(),
                            updated.getTaskType().getName(),
                            updated.getProject().getTitle()
                    ),
                    "inspections/create"
            );
        });

        return mapToDTO(updated);
    }

    @Override
    public TaskResponseDTO getTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return mapToDTO(task);
    }

    @Override
    public List<TaskResponseDTO> getTasksByProject(Long projectId) {
        return taskRepository.findAllByProjectId(projectId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getMyTasks() {
        List<Task> taskEntities;

        // 1. Admin/Mayor Bypass - Use a query that fetches relations!
        if (authContext.isSuperAdmin() || authContext.isMayor()) {
            taskEntities = taskRepository.findAllWithDetails();
        } else {
            // 2. Regular Employee path
            Employee sessionEmployee = authContext.getEmployee();
            if (sessionEmployee == null) {
                return Collections.emptyList();
            }
            taskEntities = taskRepository.findWithDetailsByEmployees_Id(sessionEmployee.getId());
        }

        if (taskEntities == null) return Collections.emptyList();

        // 3. Map to DTO
        return taskEntities.stream()
                .map(this::mapToDTO)
                .toList();
    }


    // ---------------- Mapper ----------------
    private Task mapToEntity(CreateTaskRequestDTO dto) {
        Task task = new Task();
        return mapToEntity(dto, task);
    }

    private Task mapToEntity(CreateTaskRequestDTO dto, Task task) {

        TaskType taskType = taskTypeRepository.findById(dto.getTaskTypeId())
                        .orElseThrow();
        task.setTaskType(taskType);

        if (dto.getProjectId() != null) {
            task.setProject(projectService.getProjectById(dto.getProjectId()));
        }

        if (dto.getEmployeeIds() != null && !dto.getEmployeeIds().isEmpty()) {
            task.setEmployees(employeeService.findEmpsByEmployeeIds(dto.getEmployeeIds()));
        } else {
            task.setEmployees(new ArrayList<>());
        }

        task.setTaskCost(dto.getTaskCost());
        task.setStartDate(dto.getStartDate());
        task.setEndDate(dto.getEndDate());
        task.setDescription(dto.getDescription());
        task.setRemark(dto.getRemark());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setWeight(dto.getWeight());
        task.setLatitude(dto.getLatitude());
        task.setLongitude(dto.getLongitude());

        // 🔹 multiple locations
        if (dto.getLocationIds() != null && !dto.getLocationIds().isEmpty()) {
            task.setLocations(locationServiceImpl.getLocationsByIds(dto.getLocationIds()));
        } else {
            task.setLocations(new ArrayList<>());
        }

        return task;
    }


    private TaskResponseDTO mapToDTO(Task task) {
        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(task.getId());
        dto.setTaskName(task.getTaskType().getName());
        dto.setProjectId(task.getProject() != null ? task.getProject().getId() : null);
        dto.setProjectTitle(task.getProject() != null ? task.getProject().getTitle() : null);

        dto.setEmployeeIds(task.getEmployees().stream().map(Employee::getId).toList());
        if (dto.getEmployeeIds() != null || !dto.getEmployeeIds().isEmpty()) {
            dto.setEmployeeNames(task.getEmployees().stream().map(Employee::getFullName).toList());
        }

        dto.setSupportDocument(task.getSupportDocument());
        dto.setTaskCost(task.getTaskCost());
        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setDescription(task.getDescription());
        dto.setRemark(task.getRemark());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setWeight(task.getWeight());
        dto.setLatitude(task.getLatitude());
        dto.setLongitude(task.getLongitude());

        dto.setTaskTypeProjectPhase(task.getTaskType().getTaskTypeProjectPhase());

        // 🔹 multiple locations
        dto.setLocationIds(task.getLocations().stream().map(Location::getId).toList());
        dto.setLocationNames(task.getLocations().stream().map(Location::getName).toList());

        return dto;
    }

    @Override
    public Page<TaskResponseDTO> getAllTasks(Pageable pageable) {

        // 1. Get Employee context
        Employee employee = employeeServiceImpl.findEmployeeWithDivision();
        if (employee == null) return taskRepository.findAll(pageable).map(this::mapToDTO);

        // 2. Validate Division
        Division division = employee.getDivision();
        if (division == null) return Page.empty(pageable);

        // 3. Determine ProjectType filter based on DivisionGroup
        DivisionGroup divisionGroup = division.getDivisionGroup();
        ProjectType projectType = null;
        if (divisionGroup == DivisionGroup.BLD) {
            projectType = ProjectType.BUILDING;
        } else if (divisionGroup == DivisionGroup.WAR) {
            projectType = ProjectType.WATER_AND_ROAD;
        }
        // If DivisionGroup.BTH, projectType remains null (no filter applied)

        // 4. Determine SubCity filter
        Long subId = (employee.getSubCity() != null) ? employee.getSubCity().getId() : null; 


        Page<Task> taskPage;
        taskPage = taskRepository.findAllTasksByCriteria(subId, projectType, ProjectPhase.EXECUTION,  pageable);
        // taskPage = taskRepository.findAll(pageable);
        return taskPage.map(this::mapToDTO);
    }
}