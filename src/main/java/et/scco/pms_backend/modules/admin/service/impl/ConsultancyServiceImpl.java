package et.scco.pms_backend.modules.admin.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.enums.ConsultantStatus;
import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.request.ConsultancyRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ConsultancyResponseDTO;
import et.scco.pms_backend.modules.admin.mapper.ConsultancyMapper;
import et.scco.pms_backend.modules.admin.model.Consultancy;
import et.scco.pms_backend.modules.admin.repository.ConsultancyRepository;
import et.scco.pms_backend.modules.admin.service.ConsultancyService;
import et.scco.pms_backend.utility.FileStorageService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConsultancyServiceImpl implements ConsultancyService{

    private final ConsultancyRepository consultancyRepository;
    private final FileStorageService fileStorageService;
    @Override
    public ConsultancyResponseDTO createConsultancy(ConsultancyRequestDTO consultancyRequestDTO) throws Exception{
      
        Consultancy consultancy = ConsultancyMapper.mapToConsultancy(consultancyRequestDTO);

        if (consultancyRequestDTO.getDocument() != null && !consultancyRequestDTO.getDocument().isEmpty()) {
            String fileName = fileStorageService.storeFile(consultancyRequestDTO.getDocument());
            consultancy.setDocument(fileName);
        }
        

        Consultancy savedConsultancy = consultancyRepository.save(consultancy);

        return ConsultancyMapper.mapToConsultancyResponseDTO(savedConsultancy);
    }

    @Override
    public ConsultancyResponseDTO getConsultantById(Long consultantId) {
        Consultancy consultancy = consultancyRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultancy is Not found with given id: " + consultantId));
        return ConsultancyMapper.mapToConsultancyResponseDTO(consultancy);
    
    }

    @Override
    public List<ConsultancyResponseDTO> getAllConsultancies() {
        List<Consultancy> consultancies = consultancyRepository.findAll();
        return consultancies.stream().map(ConsultancyMapper::mapToConsultancyResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ConsultancyResponseDTO updateConsultancy(Long consultantId, ConsultancyRequestDTO consultancyRequestDTO) throws Exception{
        Consultancy consultancy = consultancyRepository.findById(consultantId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Consultancy does not exist with given id: " + consultantId));

        // Update contractorName and status
        consultancy.setConsultantName(consultancyRequestDTO.getConsultantName());
        // contractor.setStatus(contractorRequestDTO.getStatus());
        consultancy.setStatus(ConsultantStatus.valueOf(consultancyRequestDTO.getStatus()));

        // Only update file if a new one is uploaded
        if (consultancyRequestDTO.getDocument() != null && !consultancyRequestDTO.getDocument().isEmpty()) {
            String fileName = fileStorageService.storeFile(consultancyRequestDTO.getDocument());
            consultancy.setDocument(fileName);
        }
        // else: keep the existing file

        Consultancy  updatedConsultancy = consultancyRepository.save(consultancy);
        return ConsultancyMapper.mapToConsultancyResponseDTO(updatedConsultancy);
    }

    @Override
    public void deleteConsultant(Long consultantId) {
        Consultancy consultancy = consultancyRepository.findById(consultantId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Consultancy is not Exist with given id:" + consultantId));
        consultancyRepository.delete(consultancy);
    }

    public Consultancy getConsultantEntityById(Long consultantId) {
        return consultancyRepository.findById(consultantId)
            .orElseThrow(() -> new RuntimeException("Consultant not found with id: "+consultantId));
    }
    
}
