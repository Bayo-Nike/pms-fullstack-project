package et.scco.pms_backend.modules.demand.controller;

import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import et.scco.pms_backend.modules.demand.dto.request.DemandDocumentRequestDTO;
import et.scco.pms_backend.modules.demand.dto.request.DemandRequestDTO;
import et.scco.pms_backend.modules.demand.dto.request.ReviewDemandRequest;
import et.scco.pms_backend.modules.demand.dto.response.DemandResponseDTO;
import et.scco.pms_backend.modules.demand.model.DemandDocument;
import et.scco.pms_backend.modules.demand.repository.DemandDocumentRepository;
import et.scco.pms_backend.modules.demand.service.DemandService;
import jakarta.validation.Valid;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/projects/demands")
@RequiredArgsConstructor
public class DemandController {

    private final DemandService demandService;
    private final DemandDocumentRepository demandDocumentRepository;
    /**
     * CREATE: Submit a new demand with dynamic file uploads.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DemandResponseDTO> createDemand(
            @RequestPart("demand") @Valid DemandRequestDTO demandRequestDTO,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestPart(value = "fileMetadata", required = false) List<DemandDocumentRequestDTO> documentInfo) {
        
        return new ResponseEntity<>(demandService.createDemand(demandRequestDTO, files, documentInfo), HttpStatus.CREATED);
        
    }

    /**
     * READ: Get all demands with pagination and filters.
     */
    @GetMapping
    public ResponseEntity<Page<DemandResponseDTO>> getAllDemands(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long subCityId,
            @PageableDefault(size = 10) Pageable pageable) {
        
        return ResponseEntity.ok(demandService.getAllDemands(search, category, status, subCityId, pageable));
    }

    /**
     * READ: Get single demand details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DemandResponseDTO> getDemandById(@PathVariable Long id) {
        return ResponseEntity.ok(demandService.getDemandById(id));
    }

    /**
     * UPDATE: General Update (Client Edit)
     * Handles Title, Description, Site, and File changes.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DemandResponseDTO> updateDemand(
            @PathVariable Long id,
            @RequestPart("demand") String demandJson, 
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestPart(value = "fileMetadata", required = false) List<DemandDocumentRequestDTO> documentInfo) throws JsonProcessingException {
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        
        DemandRequestDTO demandRequestDTO = objectMapper.readValue(demandJson, DemandRequestDTO.class);
        
        return ResponseEntity.ok(demandService.updateDemand(id, demandRequestDTO, files, documentInfo));
    }

    /**
     * REVIEW: Reviewer Update (Status & Remark Only)
     */
    @PatchMapping("/{id}/review")
    public ResponseEntity<DemandResponseDTO> reviewDemand(
            @PathVariable Long id,
            @RequestBody @Valid ReviewDemandRequest reviewRequest) {
        
        return ResponseEntity.ok(demandService.reviewDemand(id, reviewRequest));
    }

    /**
     * DELETE: Remove a demand initiation.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDemand(@PathVariable Long id) {
        demandService.deleteDemand(id);
        return ResponseEntity.noContent().build();
    }

    // @GetMapping("/files/download/{fileName:.+}")
    // public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws Exception {
    //     System.out.println("-----"+fileName);
    //     fileName="1785416479819_Screenshot_2025-07-21_145724.png";
    //     System.out.println("===="+fileName);
    //     Path filePath = Paths.get("uploads/demands/").resolve(fileName).normalize();
    //     System.out.println("000000 --- "+filePath);
    //     Resource resource = new UrlResource(filePath.toUri());

    //     System.out.println("---"+resource);
    //     if (!resource.exists()) {
    //         System.out.println("-----1-");
    //         throw new RuntimeException("File not found " + fileName);
    //     }
    //     System.out.println("---22-");

    //     // Try to determine content type
    //     String contentType = "application/octet-stream";
    //     if (fileName.endsWith(".png")) contentType = "image/png";
    //     else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
    //     else if (fileName.endsWith(".pdf")) contentType = "application/pdf";
    //     else if (fileName.endsWith(".docx")) contentType = "application/docx";

    //     System.out.println("HERERE");
    //     return ResponseEntity.ok()
    //             .contentType(MediaType.parseMediaType(contentType))
    //             .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
    //             .body(resource);
    // }

    @GetMapping("/files/download/{id}") // Use ID, not filename
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) throws Exception {
        
        // 1. Fetch metadata from DB
        DemandDocument doc = demandDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File record not found"));

        // 2. Resolve Path (Handles the subfolders we created earlier)
        // doc.getFileUrl() looks like "Client_A/17212345_Screenshot.png"
        Path filePath = Paths.get("uploads/demands").resolve(doc.getUniqueFileName()).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("Physical file not found at: " + filePath);
        }

        // 3. Determine Content Type
        String contentType = doc.getFileType();
        if (contentType == null) contentType = "application/octet-stream";

        // 4. Return the response with the ORIGINAL filename
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                // attachment tells browser to download, filename is what the user sees
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                // Crucial for React to see the header
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .body(resource);
    }
}
