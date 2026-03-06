package et.scco.pms_backend.modules.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
    @PostMapping
    public ResponseEntity<ContractorResponseDTO>createContractor(@RequestBody ContractorRequestDTO contractorRequestDTO ) throws Exception{
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

    // Build Update Contractor REST API
    @PutMapping("{id}")
    public ResponseEntity<ContractorResponseDTO>updateContractor(@PathVariable("id") Long contractorId,@RequestBody ContractorRequestDTO contractorRequestDTO) throws Exception{
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
