package et.scco.pms_backend.modules.project.controller;


import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.project.dto.request.PaymentWorkflowRequestDTO;
import et.scco.pms_backend.modules.project.dto.request.ProjectCostRequestDto;
import et.scco.pms_backend.modules.project.dto.response.ProjectCostResponseDto;
import et.scco.pms_backend.modules.project.service.ProjectCostService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectCostController {

    private final ProjectCostService costService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{projectId}/costs")
    public ApiResponse<List<ProjectCostResponseDto>> getHistory(@PathVariable Long projectId) {
        return ResponseUtil.success(
                "Financial history retrieved",
                costService.getHistoryByProject(projectId)
        );
    }

    @PostMapping(value = "/costs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProjectCostResponseDto> recordCost(@RequestPart("data") ProjectCostRequestDto dto, 
        @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseUtil.success(
                "Cost record added successfully",
                costService.addProjectPaymentRequest(dto, file)
        );
    }

    @DeleteMapping("/costs/{id}")
    public ApiResponse<Void> removeCost(@PathVariable Long id) {
        costService.deleteCost(id);
        return ResponseUtil.success("Financial record removed", null);
    }

    // Build Update Project Cost
    @PutMapping(value = "/costs/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProjectCostResponseDto>updateProjectCost(@PathVariable Long id, @RequestParam("data") String dataJson,
    @RequestParam(value = "file", required = false) MultipartFile file){

        try {
            // Manually parse the JSON string into the DTO
            ProjectCostRequestDto dto = objectMapper.readValue(dataJson, ProjectCostRequestDto.class);
            
            ProjectCostResponseDto projectCost = costService.updateProjectPaymentRequest(id, dto, file);
            return ResponseUtil.success("Project Payment Request updated successfully", projectCost);
            
        } catch (JsonProcessingException e) {
            // Professional error handling for malformed JSON
            throw new RuntimeException("Failed to parse request data: " + e.getMessage());
        }
    }

    @PutMapping("/costs/{id}/acknowledge")
    public ApiResponse<ProjectCostResponseDto> acknowledgeCost(@PathVariable Long id, 
        @RequestBody PaymentWorkflowRequestDTO request) {
        return ResponseUtil.success(
            "Payment acknowledged", 
            costService.acknowledge(id, request.getRemark())
        );
    }

    @PutMapping("/costs/{id}/approve")
    public ApiResponse<ProjectCostResponseDto> approveCost(@PathVariable Long id, @RequestBody PaymentWorkflowRequestDTO request) {
        return ResponseUtil.success(
            "Payment approved", 
            costService.approve(id, request.getRemark())
        );
    }

    @PutMapping("/costs/{id}/reject")
    public ApiResponse<ProjectCostResponseDto> rejectCost(@PathVariable Long id, @RequestBody PaymentWorkflowRequestDTO request) {
        return ResponseUtil.success(
            "Payment rejected", 
            costService.reject(id, request.getRemark())
        );
    }

    @GetMapping("/costs/files/{fileName:.+}")
    // @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws Exception {
        Path filePath = Paths.get("uploads/costs").resolve(fileName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found " + fileName);
        }

        // Try to determine content type
        String contentType = "application/octet-stream";
        if (fileName.endsWith(".png")) contentType = "image/png";
        else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (fileName.endsWith(".pdf")) contentType = "application/pdf";
        else if (fileName.endsWith(".docx")) contentType = "application/docx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}