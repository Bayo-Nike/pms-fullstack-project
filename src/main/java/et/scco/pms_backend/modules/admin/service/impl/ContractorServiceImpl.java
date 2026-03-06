package et.scco.pms_backend.modules.admin.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.request.ContractorRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ContractorResponseDTO;
import et.scco.pms_backend.modules.admin.mapper.ContractorMapper;
import et.scco.pms_backend.modules.admin.model.Contractor;
import et.scco.pms_backend.modules.admin.repository.ContractorRepository;
import et.scco.pms_backend.modules.admin.service.ContractorService;
import et.scco.pms_backend.utility.FileStorageService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ContractorServiceImpl implements ContractorService{

    private final ContractorRepository contractorRepository;
    private final FileStorageService fileStorageService;

    @Override
    public ContractorResponseDTO createContractor(ContractorRequestDTO contractorRequestDTO) throws Exception{

        Contractor contractor = ContractorMapper.mapToContractor(contractorRequestDTO);
        
        // MultipartFile file = contractorRequestDTO.getDocument();

        String fileName = fileStorageService.storeFile(contractorRequestDTO.getDocument());

        contractor.setDocument(fileName);
        

        Contractor savedContractor = contractorRepository.save(contractor);

        return ContractorMapper.mapToContractorResponseDTO(savedContractor);
    }

    @Override
    public ContractorResponseDTO getContractorById(Long contractorId) {
        Contractor contractor = contractorRepository.findById(contractorId)
                .orElseThrow(() -> new ResourceNotFoundException("Contractor is Not found with given id: " + contractorId));
        return ContractorMapper.mapToContractorResponseDTO(contractor);
    }

    @Override
    public ContractorResponseDTO updateContractor(Long contractorId, ContractorRequestDTO contractorRequestDTO) throws Exception{

        Contractor contractor = contractorRepository.findById(contractorId)
        .orElseThrow(() ->
                new ResourceNotFoundException("Contractor is not Exist with given id:" + contractorId));


        // MultipartFile file = contractorRequestDTO.getDocument();

        // Update fields
        String fileName = fileStorageService.storeFile(contractorRequestDTO.getDocument());
    
        contractor.setDocument(fileName);
        contractor.setContractorName(contractorRequestDTO.getContractorName());
        contractor.setStatus(contractorRequestDTO.getStatus());

        Contractor updatedContractor = contractorRepository.save(contractor);
        return ContractorMapper.mapToContractorResponseDTO(updatedContractor);
    }

    @Override
    public List<ContractorResponseDTO> getAllContractors() {
        List<Contractor> contractors = contractorRepository.findAll();
        return contractors.stream().map(ContractorMapper::mapToContractorResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteContractor(Long contractorId) {
        Contractor contractor = contractorRepository.findById(contractorId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Contractor is not Exist with given id:" + contractorId));
        contractorRepository.delete(contractor);
    }

}
