package et.scco.pms_backend.modules.task.service;

import et.scco.pms_backend.modules.task.dto.request.CreateTaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface TaskService {

    TaskResponseDTO createTask(CreateTaskRequestDTO dto, MultipartFile file);

    // TaskResponseDTO updateTask(Long id, CreateTaskRequestDTO dto);
    TaskResponseDTO updateTask(Long id, CreateTaskRequestDTO dto, MultipartFile file);

    TaskResponseDTO getTask(Long id);

    List<TaskResponseDTO> getTasksByProject(Long projectId);

    void deleteTask(Long id);

    List<TaskResponseDTO> getMyTasks();

    Page<TaskResponseDTO> getAllTasks(Pageable pageable);

}