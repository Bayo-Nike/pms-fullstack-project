package et.scco.pms_backend.modules.project.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.request.ExtendProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.service.ProjectService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

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

    @PostMapping("/{id}/extend")
    public ResponseEntity<?> extendProject(
            @PathVariable Long id,
            @RequestBody ExtendProjectRequestDTO request
    ) {
        ProjectResponseDTO response = projectService.extendProject(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{projectId}/extensions/{extensionId}")
    public ResponseEntity<?> deleteLastExtension(@PathVariable Long projectId, @PathVariable Long extensionId) {
        
        try {
            projectService.deleteLastExtension(projectId, extensionId);
            return ResponseEntity.ok("Timeline reverted successfully");
        } catch (IllegalStateException e) {
            // This happens if the user tries to delete a record that isn't the latest
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error during reversion");
        }
    }

    @GetMapping("/by-demand/{demandCode}")
    public ApiResponse<Long> getProjectByDemandCode(@PathVariable String demandCode) {
        Long projectId = projectService.getProjectIdByDemandCode(demandCode);
        return ResponseUtil.success("Project fetched successfully", projectId);
    }
}