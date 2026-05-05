package et.scco.pms_backend.modules.project.controller;


import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectInitiationRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectInitiationResponseDTO;
import et.scco.pms_backend.modules.project.service.ProjectInitiationService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/initiations")
@RequiredArgsConstructor
public class ProjectInitiationController {

    private final ProjectInitiationService initiationService;

    @PostMapping
    public ApiResponse<ProjectInitiationResponseDTO> createInitiation(@RequestBody CreateProjectInitiationRequestDTO dto) {
        ProjectInitiationResponseDTO initiation = initiationService.createInitiation(dto);
        return ResponseUtil.success("Project initiation record created successfully", initiation);
    }

    @GetMapping
    public ApiResponse<Page<ProjectInitiationResponseDTO>> getInitiations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProjectPhase phase,
            @RequestParam(required = false) Category category) {

        Page<ProjectInitiationResponseDTO> initiations = initiationService.getInitiations(page, size, search, phase, category);
        return ResponseUtil.success("Project initiations retrieved successfully", initiations);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectInitiationResponseDTO> getInitiation(@PathVariable Long id) {
        ProjectInitiationResponseDTO initiation = initiationService.getInitiation(id);
        return ResponseUtil.success("Initiation detail retrieved successfully", initiation);
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectInitiationResponseDTO> updateInitiation(
            @PathVariable Long id,
            @RequestBody CreateProjectInitiationRequestDTO dto) {

        ProjectInitiationResponseDTO initiation = initiationService.updateInitiation(id, dto);
        return ResponseUtil.success("Initiation record updated successfully", initiation);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInitiation(@PathVariable Long id) {
        initiationService.deleteInitiation(id);
        return ResponseUtil.success("Project initiation deleted successfully", null);
    }
}