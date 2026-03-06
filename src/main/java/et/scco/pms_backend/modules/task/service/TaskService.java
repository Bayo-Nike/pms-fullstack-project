package et.scco.pms_backend.modules.task.service;

import java.util.List;

import et.scco.pms_backend.modules.task.dto.request.TaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;

public interface TaskService {

    TaskResponseDTO createTask(TaskRequestDTO taskRequestDTO);

    TaskResponseDTO getTaskById(Long taskId);

    List<TaskResponseDTO> getAllTasks();

    TaskResponseDTO updatetask(Long projectId, TaskRequestDTO taskRequestDTO);

    void deleteTask(Long taskId);     

}
