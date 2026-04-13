package et.scco.pms_backend.modules.admin.controller;

import et.scco.pms_backend.modules.admin.dto.TaskTypeDTO;
import et.scco.pms_backend.modules.admin.service.TaskTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.utility.ResponseUtil;
import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/task-types")
public class TaskTypeController {

    private final TaskTypeService taskTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskTypeDTO>>> getAll() {
        List<TaskTypeDTO> data = taskTypeService.findAll();
        return ResponseEntity.ok(ResponseUtil.success("Task types retrieved successfully", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskTypeDTO>> getById(@PathVariable Long id) {
        TaskTypeDTO data = taskTypeService.findById(id);
        return ResponseEntity.ok(ResponseUtil.success("Task type details retrieved", data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskTypeDTO>> create(@RequestBody TaskTypeDTO dto) {
        TaskTypeDTO data = taskTypeService.create(dto);
        return ResponseEntity.ok(ResponseUtil.success("New task type registered", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskTypeDTO>> update(@PathVariable Long id, @RequestBody TaskTypeDTO dto) {
        TaskTypeDTO data = taskTypeService.update(id, dto);
        return ResponseEntity.ok(ResponseUtil.success("Task type updated successfully", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        taskTypeService.delete(id);
        return ResponseEntity.ok(ResponseUtil.success("Task type removed successfully", null));
    }
}