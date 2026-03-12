package et.scco.pms_backend.modules.task.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.task.dto.request.CreateTaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import et.scco.pms_backend.modules.task.service.TaskService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ApiResponse<TaskResponseDTO> createTask(@RequestBody CreateTaskRequestDTO dto) {

        return ResponseUtil.success(
                "Task created successfully",
                taskService.createTask(dto)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @RequestBody CreateTaskRequestDTO dto) {

        return ResponseUtil.success(
                "Task updated successfully",
                taskService.updateTask(id, dto)
        );
    }

    @GetMapping("/my")
    public ApiResponse<List<TaskResponseDTO>> getMyTasks() {
        return ResponseUtil.success(
                "My tasks fetched successfully",
                taskService.getMyTasks()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<TaskResponseDTO> getTask(@PathVariable Long id) {

        return ResponseUtil.success(
                "Task fetched successfully",
                taskService.getTask(id)
        );
    }

    @GetMapping("/project/{projectId}")
    public ApiResponse<List<TaskResponseDTO>> getTasksByProject(@PathVariable Long projectId) {

        return ResponseUtil.success(
                "Tasks fetched successfully",
                taskService.getTasksByProject(projectId)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTask(@PathVariable Long id) {

        taskService.deleteTask(id);

        return ResponseUtil.success("Task deleted successfully", null);
    }
}