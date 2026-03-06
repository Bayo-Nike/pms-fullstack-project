package et.scco.pms_backend.modules.task.mapper;

import et.scco.pms_backend.modules.task.dto.request.TaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import et.scco.pms_backend.modules.task.model.Task;

public class TaskMapper {

    public static TaskResponseDTO mapToTaskDTO(Task task) {

        return null;
    }

    public static Task mapToTask(TaskRequestDTO dto) {
        if (dto == null) return null;
        Task task = new Task();
        task.setId(dto.getId());
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setDueDate(dto.getDueDate());
        // Project & assignedUsers should be set in service layer
        return task;
    }
}
