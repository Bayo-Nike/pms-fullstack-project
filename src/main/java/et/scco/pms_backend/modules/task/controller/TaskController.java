package et.scco.pms_backend.modules.task.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.task.dto.request.CreateTaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import et.scco.pms_backend.modules.task.service.TaskService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ApiResponse<Page<TaskResponseDTO>> getTasks(Pageable pageable) {
        Page<TaskResponseDTO> tasks = taskService.getAllTasks(pageable);
        return ResponseUtil.success("Task fetched successfully", tasks);
    }

    
    @PostMapping(consumes = "multipart/form-data") //multipart/form-data cannot be parsed by @RequestBody else @ModelAttribute
    public ApiResponse<TaskResponseDTO> createTask(@ModelAttribute CreateTaskRequestDTO dto) {

        return ResponseUtil.success(
                "Task created successfully",
                taskService.createTask(dto)
        );
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) throws Exception {
        Path filePath = Paths.get("uploads").resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found " + filename);
        }

        // Try to determine content type
        String contentType = "application/octet-stream";
        if (filename.endsWith(".png")) contentType = "image/png";
        else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (filename.endsWith(".pdf")) contentType = "application/pdf";
        else if (filename.endsWith(".docx")) contentType = "application/docx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // Build Update Contractor REST API
    @PutMapping(value = "{id}", consumes = "multipart/form-data")
    // @PutMapping("/{id}")
    public ApiResponse<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @ModelAttribute CreateTaskRequestDTO dto) {

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