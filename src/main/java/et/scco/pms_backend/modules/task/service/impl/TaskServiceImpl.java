package et.scco.pms_backend.modules.task.service.impl;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Location;
import et.scco.pms_backend.modules.admin.service.EmployeeService;
import et.scco.pms_backend.modules.admin.service.LocationService;
import et.scco.pms_backend.modules.project.service.impl.ProjectServiceImpl;
import et.scco.pms_backend.modules.task.dto.request.CreateTaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import et.scco.pms_backend.modules.task.model.Task;
import et.scco.pms_backend.modules.task.repository.TaskRepository;
import et.scco.pms_backend.modules.task.service.TaskService;
import et.scco.pms_backend.utility.AuthContext;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeService employeeServiceImpl;    // to fetch employees
    private final LocationService locationServiceImpl;    // optional location
    private final ProjectServiceImpl projectService;
    private final AuthContext authContext;
    // private final SubCityServiceImpl subCityServiceImpl;

    // ---------------- Create Task ----------------
    @Override
    public TaskResponseDTO createTask(CreateTaskRequestDTO dto) {

        Task task = mapToEntity(dto);
        Task saved = taskRepository.save(task);

        return mapToDTO(saved);
    }

    // ---------------- Update Task ----------------
    @Override
    public TaskResponseDTO updateTask(Long taskId, CreateTaskRequestDTO dto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        Task updated = taskRepository.save(mapToEntity(dto, task));

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
        task.setTaskName(dto.getTaskName());

        if (dto.getProjectId() != null) {
            task.setProject(projectService.getProjectById(dto.getProjectId()));
        }

        if (dto.getEmployeeIds() != null && !dto.getEmployeeIds().isEmpty()) {
            task.setEmployees(employeeServiceImpl.findEmpsByEmployeeIds(dto.getEmployeeIds()));
        } else {
            task.setEmployees(new ArrayList<>());
        }

        task.setStartDate(dto.getStartDate());
        task.setEndDate(dto.getEndDate());
        task.setDescription(dto.getDescription());
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
        dto.setTaskName(task.getTaskName());
        dto.setProjectId(task.getProject() != null ? task.getProject().getId() : null);
        dto.setProjectTitle(task.getProject() != null ? task.getProject().getTitle() : null);

        dto.setEmployeeIds(task.getEmployees().stream().map(Employee::getId).toList());
        if (dto.getEmployeeIds() != null || !dto.getEmployeeIds().isEmpty()) {
            dto.setEmployeeNames(task.getEmployees().stream().map(Employee::getFullName).toList());
        }

        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setWeight(task.getWeight());
        dto.setLatitude(task.getLatitude());
        dto.setLongitude(task.getLongitude());

        // 🔹 multiple locations
        dto.setLocationIds(task.getLocations().stream().map(Location::getId).toList());
        dto.setLocationNames(task.getLocations().stream().map(Location::getName).toList());

        return dto;
    }

    @Override
    public Page<TaskResponseDTO> getAllTasks(Pageable pageable) {
        Page<Task> taskPage;
        taskPage = taskRepository.findAll(pageable);
        return taskPage.map(this::mapToDTO);
    }
}