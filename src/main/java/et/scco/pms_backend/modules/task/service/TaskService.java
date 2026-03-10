package et.scco.pms_backend.modules.task.service;

import et.scco.pms_backend.modules.task.dto.request.CreateTaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;

import java.util.List;

public interface TaskService {

    TaskResponseDTO createTask(CreateTaskRequestDTO dto);

    TaskResponseDTO updateTask(Long id, CreateTaskRequestDTO dto);

    TaskResponseDTO getTask(Long id);

    List<TaskResponseDTO> getTasksByProject(Long projectId);

    void deleteTask(Long id);
}