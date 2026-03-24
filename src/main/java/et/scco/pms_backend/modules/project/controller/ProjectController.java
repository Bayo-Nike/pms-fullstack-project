package et.scco.pms_backend.modules.project.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.service.impl.ProjectServiceImpl;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectServiceImpl projectService;

    @GetMapping
    public ApiResponse<Page<ProjectResponseDTO>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Long subCityId,
            Pageable pageable) {

        // Pass these new parameters to your service
        Page<ProjectResponseDTO> projects = projectService.getAllProjects(search, status, subCityId, pageable);
        return ResponseUtil.success("Projects fetched successfully", projects);
    }

    @GetMapping("/my")
    public ApiResponse<Page<ProjectResponseDTO>> getMyProjects(Pageable pageable) {
        Page<ProjectResponseDTO>projects = projectService.getMyProjects(pageable);
        return ResponseUtil.success("Projects fetched successfully", projects);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectResponseDTO> getProject(@PathVariable Long id) {
        ProjectResponseDTO project = projectService.getProject(id);
        return ResponseUtil.success("Project fetched successfully", project);
    }

    @PostMapping
    public ApiResponse<ProjectResponseDTO> createProject(@RequestBody CreateProjectRequestDTO dto) {
        ProjectResponseDTO project = projectService.createProject(dto);
        return ResponseUtil.success("Project created successfully", project);
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectResponseDTO> updateProject(@PathVariable Long id,
                                                         @RequestBody CreateProjectRequestDTO dto) {
        ProjectResponseDTO project = projectService.updateProject(id, dto);
        return ResponseUtil.success("Project updated successfully", project);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseUtil.success("Project deleted successfully", null);
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ProjectResponseDTO> updateStatus(@PathVariable Long id,
                                                        @RequestParam String status) {
        ProjectResponseDTO project = projectService.updateStatus(id, status);
        return ResponseUtil.success("Project status updated", project);
    }

    @PatchMapping("/{id}/priority")
    public ApiResponse<ProjectResponseDTO> updatePriority(@PathVariable Long id,
                                                          @RequestParam String priority) {
        ProjectResponseDTO project = projectService.updatePriority(id, priority);
        return ResponseUtil.success("Project priority updated", project);
    }

    @PatchMapping("/{id}/budget")
    public ApiResponse<ProjectResponseDTO> updateBudget(@PathVariable Long id,
                                                        @RequestParam Double budget,
                                                        @RequestParam Double budgetUsed) {
        ProjectResponseDTO project = projectService.updateBudget(id, budget, budgetUsed);
        return ResponseUtil.success("Project budget updated", project);
    }

    @PatchMapping("/{id}/timeline")
    public ApiResponse<ProjectResponseDTO> updateTimeline(@PathVariable Long id,
                                                          @RequestParam LocalDate startDate,
                                                          @RequestParam LocalDate endDate) {
        ProjectResponseDTO project = projectService.updateTimeline(id, startDate, endDate);
        return ResponseUtil.success("Project timeline updated", project);
    }
}