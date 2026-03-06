package et.scco.pms_backend.modules.task.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.project.mapper.ProjectMapper;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.task.dto.request.TaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import et.scco.pms_backend.modules.task.mapper.TaskMapper;
import et.scco.pms_backend.modules.task.model.Task;
import et.scco.pms_backend.modules.task.repository.TaskRepository;
import et.scco.pms_backend.modules.task.service.TaskService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService{

    private final TaskRepository taskRepository;

    @Override
    public TaskResponseDTO createTask(TaskRequestDTO taskRequestDTO) {
       Task task = TaskMapper.mapToTask(taskRequestDTO);
       Task savedTask = taskRepository.save(task);

        return TaskMapper.mapToTaskDTO(savedTask);
    }

    @Override
    public TaskResponseDTO getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task is Not found with given id: " + taskId));
        return TaskMapper.mapToTaskDTO(task);
    }

    @Override
    public List<TaskResponseDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        return tasks.stream().map((task) -> TaskMapper.mapToTaskDTO(task))
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponseDTO updatetask(Long taksId, TaskRequestDTO taskRequestDTO) {
        Task task  = taskRepository.findById(taksId)
        .orElseThrow(() ->
                new ResourceNotFoundException("Task is not Exist with given id:" + taksId));

        // Update fields
        task.setTitle(taskRequestDTO.getTitle());
        task.setDescription(taskRequestDTO.getDescription());

        Task updatedTask = taskRepository.save(task);
        return TaskMapper.mapToTaskDTO(updatedTask);
    }

    @Override
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Task is not Exist with given id:" + taskId));
        taskRepository.delete(task);
        // taskRepository.delete(taskId);
    }
    
}
