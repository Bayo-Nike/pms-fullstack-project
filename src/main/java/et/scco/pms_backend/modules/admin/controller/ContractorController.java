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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.modules.admin.dto.request.ContractorRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ContractorResponseDTO;
import et.scco.pms_backend.modules.admin.service.ContractorService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/contractors")
@RequiredArgsConstructor
public class ContractorController {
    private final ContractorService contractorService;
 
     // Build Add Contractor REST API
    @PostMapping(consumes = "multipart/form-data") //multipart/form-data cannot be parsed by @RequestBody else @ModelAttribute
    public ResponseEntity<ContractorResponseDTO>createContractor(@ModelAttribute ContractorRequestDTO contractorRequestDTO ) throws Exception{
        ContractorResponseDTO  savedContractorRequestDto=contractorService.createContractor(contractorRequestDTO);
        return  new ResponseEntity<>(savedContractorRequestDto,HttpStatus.CREATED);
    }

    // Build Get Contractor REST API
    @GetMapping("{id}")
    public ResponseEntity<ContractorResponseDTO>getContractor(@PathVariable("id") Long contractorId){
        ContractorResponseDTO contractorResponseDTO=contractorService.getContractorById(contractorId);
        return ResponseEntity.ok(contractorResponseDTO);

    }

    // Build Get All Contractors REST API
    @GetMapping
    public ResponseEntity<List<ContractorResponseDTO>>getAllContractors(){
        List<ContractorResponseDTO> allContractorsDto=contractorService.getAllContractors();
        return ResponseEntity.ok(allContractorsDto);

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

    // Build Update Contractor REST API
    @PutMapping(value = "{id}", consumes = "multipart/form-data")
    public ResponseEntity<ContractorResponseDTO>updateContractor(@PathVariable("id") Long contractorId,@ModelAttribute ContractorRequestDTO contractorRequestDTO) throws Exception{
        ContractorResponseDTO contractorResponseDTO =contractorService.updateContractor(contractorId,contractorRequestDTO);
        return ResponseEntity.ok(contractorResponseDTO);
    }
    // Build Delete Contractor REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String>deleteContractor(@PathVariable("id") Long contractorId){
        contractorService.deleteContractor(contractorId);
        return ResponseEntity.ok("Contractor deleted successfully.");
    }

}
