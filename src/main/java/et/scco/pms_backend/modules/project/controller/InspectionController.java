package et.scco.pms_backend.modules.project.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.project.dto.request.InspectionRequestDto;
import et.scco.pms_backend.modules.project.dto.response.InspectionResponseDto;
import et.scco.pms_backend.modules.project.service.InspectionService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @GetMapping
    public ApiResponse<Page<InspectionResponseDto>> getAllInspections(Pageable pageable) {
        return ResponseUtil.success(
                "Inspection records fetched successfully",
                inspectionService.getAllInspections(pageable)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<InspectionResponseDto> getInspection(@PathVariable Long id) {
        return ResponseUtil.success(
                "Inspection detail fetched successfully",
                inspectionService.getInspection(id)
        );
    }

//    @PostMapping
//    public ApiResponse<InspectionResponseDto> createInspection(@RequestBody InspectionRequestDto dto) {
//        return ResponseUtil.success(
//                "Inspection recorded successfully",
//                inspectionService.createInspection(dto)
//        );
//    }
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<InspectionResponseDto> createInspection(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {

        InspectionRequestDto dto = objectMapper.readValue(dataJson, InspectionRequestDto.class);
        return ResponseUtil.success("Inspection recorded", inspectionService.createInspection(dto, files));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<InspectionResponseDto> updateInspection(
            @PathVariable Long id,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {

        InspectionRequestDto dto = objectMapper.readValue(dataJson, InspectionRequestDto.class);
        return ResponseUtil.success("Inspection updated", inspectionService.updateInspection(id, dto, files));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInspection(@PathVariable Long id) {
        inspectionService.deleteInspection(id);
        return ResponseUtil.success("Inspection record deleted", null);
    }

    // Helper endpoint for project-specific view
    @GetMapping("/project/{projectId}")
    public ApiResponse<List<InspectionResponseDto>> getInspectionsByProject(@PathVariable Long projectId) {
        return ResponseUtil.success(
                "Project inspections fetched successfully",
                inspectionService.getInspectionsByProject(projectId)
        );
    }
}