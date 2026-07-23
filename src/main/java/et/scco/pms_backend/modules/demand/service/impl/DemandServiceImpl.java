package et.scco.pms_backend.modules.demand.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import et.scco.pms_backend.enums.DemandPhase;
import et.scco.pms_backend.enums.DemandStatus;
import et.scco.pms_backend.enums.ProjectLevel;
import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.demand.dto.request.DemandRequestDTO;
import et.scco.pms_backend.modules.demand.dto.request.ReviewDemandRequest;
import et.scco.pms_backend.modules.demand.dto.response.DemandResponseDTO;
import et.scco.pms_backend.modules.demand.mapper.DemandMapper;
import et.scco.pms_backend.modules.demand.model.Demand;
import et.scco.pms_backend.modules.demand.model.DemandDocument;
import et.scco.pms_backend.modules.demand.repository.DemandRepository;
import et.scco.pms_backend.modules.demand.service.DemandService;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.project.repository.ProjectRepository;
import et.scco.pms_backend.utility.DemandSpecifications;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandServiceImpl implements DemandService {

    private final DemandRepository demandRepository;
    private final ProjectRepository projectRepository;
    private final DemandMapper demandMapper;

    @Override
    @Transactional
    public DemandResponseDTO createDemand(DemandRequestDTO demandRequestDTO, List<MultipartFile> files) {
        // 1. Map DTO to Entity
        Demand demand = demandMapper.mapToDemandEntity(demandRequestDTO);
        
        
        demand.setStatus(DemandStatus.PENDING);
        demand.setPhase(DemandPhase.INITIATION);
 
        
        // 2. Handle Dynamic Files
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String fileName = file.getOriginalFilename();
                
                // Logic to save file to your storage (S3, Local Disk, etc.)
                // String fileUrl = fileStorageService.save(file); 
                String fileUrl = "/uploads/" + fileName; // Placeholder

                DemandDocument doc = new DemandDocument();
                doc.setFileName(fileName);
                doc.setFileUrl(fileUrl);
                doc.setFileType(file.getContentType());
                
                // USE THE HELPER METHOD to link both sides
                demand.addDocument(doc);
            }
        }
 
        // 4. Save and return DTO
        Demand savedDemand = demandRepository.save(demand);
        return demandMapper.mapToDemandResponseDTO(savedDemand);
    }

    @Override
    @Transactional
    public DemandResponseDTO reviewDemand(Long id, ReviewDemandRequest review) {
        Demand demand = demandRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demand not found"));

        demand.setStatus(review.getStatus()); 
        demand.setReviewerRemark(review.getRemark());
        demand.setRespondedDate(LocalDateTime.now());

        if (review.getStatus() == DemandStatus.APPROVED) {
            promoteToProject(demand);
        }

        return demandMapper.mapToDemandResponseDTO(demandRepository.save(demand));
    }

    @Transactional
    private void promoteToProject(Demand demand) {
        Project project = new Project();
        project.setProjectCode(demand.getDemandCode());
        project.setTitle(demand.getTitle());
        project.setDescription(demand.getDescription());
        project.setCategory(demand.getCategory());
        
        // Enum mapping String -> Enum
        project.setProjectType(ProjectType.valueOf(demand.getDemandType().name()));
        project.setProjectLevel(ProjectLevel.valueOf(demand.getDemandLevel().name()));
        
        project.setSubCity(demand.getSubCity());
        project.setWoreda(demand.getWoreda());
        project.setContractor(demand.getContractor());
        project.setConsultancy(demand.getConsultancy()); // consultancy to consultancy
        
        project.setStatus(ProjectStatus.NOT_STARTED);
        project.setPhase(ProjectPhase.INITIATION);
        
        projectRepository.save(project);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DemandResponseDTO> getAllDemands(String search, String category, String status, Long subCityId, Pageable pageable) {
        // 1. Create the Specification based on provided params
    Specification<Demand> spec = DemandSpecifications.withFilters(search, category, status, subCityId);

    // 2. Pass the spec to the repository
    return demandRepository.findAll(spec, pageable)
            .map(demandMapper::mapToDemandResponseDTO);

    }

    @Override
    @Transactional(readOnly = true)
    public DemandResponseDTO getDemandById(Long id) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demand not found"));
        return demandMapper.mapToDemandResponseDTO(demand);
    }

    @Override
    @Transactional
    public void deleteDemand(Long id) {
        if (!demandRepository.existsById(id)) {
            throw new RuntimeException("Demand not found");
        }
        demandRepository.deleteById(id);
    }
}