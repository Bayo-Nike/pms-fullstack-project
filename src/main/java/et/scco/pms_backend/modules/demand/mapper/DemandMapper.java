package et.scco.pms_backend.modules.demand.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import et.scco.pms_backend.modules.admin.repository.ConsultancyRepository;
import et.scco.pms_backend.modules.admin.repository.ContractorRepository;
import et.scco.pms_backend.modules.admin.repository.LocationRepository;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.repository.WoredaRepository;
import et.scco.pms_backend.modules.demand.dto.request.DemandRequestDTO;
import et.scco.pms_backend.modules.demand.dto.response.DemandResponseDTO;
import et.scco.pms_backend.modules.demand.model.Demand;
import lombok.RequiredArgsConstructor;

@Component // Allows Spring to inject this class
@RequiredArgsConstructor
public class DemandMapper {

    private final ContractorRepository contractorRepository;
    private final ConsultancyRepository consultancyRepository;
    private final SubCityRepository subCityRepository;
    private final WoredaRepository woredaRepository;
    private final LocationRepository locationRepository;

    // Entity -> Response DTO
    public DemandResponseDTO mapToDemandResponseDTO(Demand entity) {
        if (entity == null)
            return null;

        return DemandResponseDTO.builder()
                .id(entity.getId())
                .demandCode(entity.getDemandCode())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .category(entity.getCategory() != null ? entity.getCategory().name() : null)
                .demandType(entity.getDemandType() != null ? entity.getDemandType().name() : null)
                .demandLevel(entity.getDemandLevel() != null ? entity.getDemandLevel().name() : null)
                
                // Geography & Hubs
                .subCityId(entity.getSubCity() != null ? entity.getSubCity().getId() : null)
                .subCityName(entity.getSubCity() != null ? entity.getSubCity().getSubCityName() : "City Level")
                .woredaId(entity.getWoreda() != null ? entity.getWoreda().getId() : null)
                .woredaName(entity.getWoreda() != null ? entity.getWoreda().getWoredaName() : "N/A")
                
                // Registered Site Detail
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : "N/A")
                .siteLocation(entity.getSiteLocation()) // Manual detail string
                
                // Stakeholders (Ids + Names)
                .contractorId(entity.getContractor() != null ? entity.getContractor().getId() : null)
                .contractorName(entity.getContractor() != null ? entity.getContractor().getContractorName() : "Not Assigned")
                
                .consultancyId(entity.getConsultancy() != null ? entity.getConsultancy().getId() : null)
                .consultancyName(entity.getConsultancy() != null ? entity.getConsultancy().getConsultantName() : "Not Assigned")
                
                .clientId(entity.getClientId())
                // clientName can be added here if you join with a Client Table
                
                // Workflow State
                .phase(entity.getPhase() != null ? entity.getPhase().name() : null)
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .reviewerRemark(entity.getReviewerRemark())
                
                // Audit Timeline
                .requestedDate(entity.getRequestedDate())
                .respondedDate(entity.getRespondedDate())
                .submittedBy(entity.getSubmittedBy())

                // Dynamic Documents
                .documents(entity.getDocuments() != null ? entity.getDocuments().stream()
                        .map(doc -> DemandResponseDTO.DocumentResponseDTO.builder()
                                .id(doc.getId())
                                .fileName(doc.getFileName())
                                .fileType(doc.getFileType())
                                .downloadUrl("/api/v1/files/download/" + doc.getId())
                                .build())
                        .collect(Collectors.toList()) : null)
                .build();
    }

    // Request DTO -> Entity (For Creation)
    public Demand mapToDemandEntity(DemandRequestDTO dto) {
        if (dto == null)
            return null;

        Demand entity = new Demand();
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setDemandType(dto.getDemandType());
        entity.setDemandLevel(dto.getDemandLevel());
        entity.setSiteLocation(dto.getSiteLocation());

        // Resolve Relationships
        if (dto.getContractorId() != null) {
            contractorRepository.findById(dto.getContractorId())
                .ifPresent(entity::setContractor);
        }
    
        if (dto.getConsultancyId() != null) {
            consultancyRepository.findById(dto.getConsultancyId())
                .ifPresent(entity::setConsultancy);
        }
    
        if (dto.getSubCityId() != null) {
            subCityRepository.findById(dto.getSubCityId())
                .ifPresent(entity::setSubCity);
        }
    
        if (dto.getWoredaId() != null) {
            woredaRepository.findById(dto.getWoredaId())
                .ifPresent(entity::setWoreda);
        }

        // Resolve Single Site Location Registry
        if (dto.getLocationId() != null) {
            locationRepository.findById(dto.getLocationId())
                .ifPresent(entity::setLocation);
        }

        entity.setClientId(dto.getClientId());
        return entity;
    }
}
