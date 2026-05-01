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

import et.scco.pms_backend.modules.admin.dto.request.ClientRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ClientResponseDTO;
import et.scco.pms_backend.modules.admin.service.ClientService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/client")
public class ClientController {
    private final ClientService clientService;

     // Build Add Contractor REST API
    @PostMapping(consumes = "multipart/form-data") //multipart/form-data cannot be parsed by @RequestBody else @ModelAttribute
    public ResponseEntity<ClientResponseDTO>createClient(@ModelAttribute ClientRequestDTO ClientRequestDTO) throws Exception{
        ClientResponseDTO  savedClientResponseDTO=clientService.createClient(ClientRequestDTO);
        return  new ResponseEntity<>(savedClientResponseDTO,HttpStatus.CREATED);
    }

    // Build Get Contractor REST API
    @GetMapping("{id}")
    public ResponseEntity<ClientResponseDTO>getClient(@PathVariable("id") Long ClientId){
        ClientResponseDTO ClientResponseDTO=clientService.getClientById(ClientId);
        return ResponseEntity.ok(ClientResponseDTO);

    }

    // Build Get All Consultancies REST API
    @GetMapping
    public ResponseEntity<List<ClientResponseDTO>>getAllClients(){
        List<ClientResponseDTO> allClientDto=clientService.getAllClients();
        return ResponseEntity.ok(allClientDto);

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

    // Build Update Client REST API
    @PutMapping(value = "{id}", consumes = "multipart/form-data")
    public ResponseEntity<ClientResponseDTO>updateClient(@PathVariable("id") Long clientId,@ModelAttribute ClientRequestDTO clientRequestDTO) throws Exception{
        
        ClientResponseDTO clientResponseDTO =clientService.updateClient(clientId,clientRequestDTO);
        return ResponseEntity.ok(clientResponseDTO);
    }
    // Build Delete Client REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String>deleteClient(@PathVariable("id") Long ClientId){
        clientService.deleteClient(ClientId);
        return ResponseEntity.ok("Client deleted successfully.");
    }
}
