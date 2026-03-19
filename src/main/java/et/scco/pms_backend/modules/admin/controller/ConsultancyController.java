package et.scco.pms_backend.modules.admin.controller;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.modules.admin.dto.request.ConsultancyRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ConsultancyResponseDTO;
import et.scco.pms_backend.modules.admin.service.ConsultancyService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/consultancy")
public class ConsultancyController {
    private final ConsultancyService consultancyService;

    
     // Build Add Contractor REST API
    @PostMapping(consumes = "multipart/form-data") //multipart/form-data cannot be parsed by @RequestBody else @ModelAttribute
    public ResponseEntity<ConsultancyResponseDTO>createConsultancy(@ModelAttribute ConsultancyRequestDTO consultancyRequestDTO) throws Exception{
        ConsultancyResponseDTO  savedConsultancyResponseDTO=consultancyService.createConsultancy(consultancyRequestDTO);
        return  new ResponseEntity<>(savedConsultancyResponseDTO,HttpStatus.CREATED);
    }

    // Build Get Contractor REST API
    @GetMapping("{id}")
    public ResponseEntity<ConsultancyResponseDTO>getConsultancy(@PathVariable("id") Long consultantId){
        ConsultancyResponseDTO consultancyResponseDTO=consultancyService.getConsultantById(consultantId);
        return ResponseEntity.ok(consultancyResponseDTO);

    }

    // Build Get All Consultancies REST API
    @GetMapping
    public ResponseEntity<List<ConsultancyResponseDTO>>getAllConsultancies(){
        List<ConsultancyResponseDTO> allConsultancyDto=consultancyService.getAllConsultancies();
        return ResponseEntity.ok(allConsultancyDto);

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

    // Build Update Consultant REST API
    @PutMapping(value = "{id}", consumes = "multipart/form-data")
    public ResponseEntity<ConsultancyResponseDTO>updateConsultancy(@PathVariable("id") Long consultantId,@ModelAttribute ConsultancyRequestDTO consultancyRequestDTO) throws Exception{
        ConsultancyResponseDTO consultancyResponseDTO =consultancyService.updateConsultancy(consultantId,consultancyRequestDTO);
        return ResponseEntity.ok(consultancyResponseDTO);
    }
    // Build Delete Consultant REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String>deleteConsultant(@PathVariable("id") Long consultantId){
        consultancyService.deleteConsultant(consultantId);
        return ResponseEntity.ok("Consultant deleted successfully.");
    }

}
