package et.scco.pms_backend.modules.demand.controller;

import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import et.scco.pms_backend.modules.demand.dto.request.DemandDocumentRequestDTO;
import et.scco.pms_backend.modules.demand.dto.request.DemandRequestDTO;
import et.scco.pms_backend.modules.demand.dto.request.ReviewDemandRequest;
import et.scco.pms_backend.modules.demand.dto.response.DemandResponseDTO;
import et.scco.pms_backend.modules.demand.service.DemandService;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/projects/demands")
@RequiredArgsConstructor
public class DemandController {

    private final DemandService demandService;

    /**
     * CREATE: Submit a new demand with dynamic file uploads.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DemandResponseDTO> createDemand(
            @RequestPart("demand") @Valid DemandRequestDTO demandRequestDTO,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestPart("fileMetadata") List<DemandDocumentRequestDTO> documentInfo) {
        
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
            @RequestPart("fileMetadata") List<DemandDocumentRequestDTO> documentInfo) throws JsonProcessingException {
        
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
}
