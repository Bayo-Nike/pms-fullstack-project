package et.scco.pms_backend.modules.project.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.project.dto.request.InspectionRequestDto;
import et.scco.pms_backend.modules.project.dto.response.InspectionResponseDto;
import et.scco.pms_backend.modules.project.service.InspectionService;
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
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/admin/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @GetMapping
    public ApiResponse<Page<InspectionResponseDto>> getAllInspections(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long subCityId,
            Pageable pageable) {

        return ResponseUtil.success(
                "Inspections fetched successfully",
                inspectionService.getAllInspections(search, subCityId, pageable)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<InspectionResponseDto> getInspection(@PathVariable Long id) {
        return ResponseUtil.success(
                "Inspection detail fetched successfully",
                inspectionService.getInspection(id)
        );
    }

    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<InspectionResponseDto> createInspection(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {

        InspectionRequestDto dto = objectMapper.readValue(dataJson, InspectionRequestDto.class);
        return ResponseUtil.success("Inspection recorded", inspectionService.createInspection(dto, files));
    }

    @PutMapping("/comment/{id}")
    public ApiResponse<InspectionResponseDto> commentInspection(@RequestBody String comment, @PathVariable Long id){
        return ResponseUtil.success(
                "Comment saved",
                inspectionService.commentInspection(id, comment)
        );
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

    @PutMapping("/{id}/approve")
    public ApiResponse<InspectionResponseDto> approve(@PathVariable Long id) {
        return ResponseUtil.success("Inspection promoted to next level", inspectionService.approveInspection(id));
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
}