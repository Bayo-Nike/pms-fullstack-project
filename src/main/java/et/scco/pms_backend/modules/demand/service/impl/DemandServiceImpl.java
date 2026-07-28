package et.scco.pms_backend.modules.demand.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.DemandLevel;
import et.scco.pms_backend.enums.DemandPhase;
import et.scco.pms_backend.enums.DemandStatus;
import et.scco.pms_backend.enums.DemandType;
import et.scco.pms_backend.enums.EmployeeType;
import et.scco.pms_backend.enums.ProjectLevel;
import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.modules.admin.model.Client;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.ConsultancyRepository;
import et.scco.pms_backend.modules.admin.repository.ContractorRepository;
import et.scco.pms_backend.modules.admin.repository.LocationRepository;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.repository.WoredaRepository;
import et.scco.pms_backend.modules.auth.AuthUtility;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandServiceImpl implements DemandService {

    private final DemandRepository demandRepository;
    private final ProjectRepository projectRepository;
    private final DemandMapper demandMapper;
    private final ContractorRepository contractorRepository;
    private final ConsultancyRepository consultancyRepository;
    private final SubCityRepository subCityRepository;
    private final WoredaRepository woredaRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DemandResponseDTO createDemand(DemandRequestDTO demandRequestDTO, List<MultipartFile> files) {
        // 1. Map DTO to Entity
        Demand demand = demandMapper.mapToDemandEntity(demandRequestDTO);
        
        
        demand.setStatus(DemandStatus.PENDING);
        demand.setPhase(DemandPhase.INITIATION);

        String currentUsername = AuthUtility.getUserName();
        User user = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("The Updating User not found"));
            
            Employee employee = user.getEmployee();
            if (employee.getEmployeeType().equals(EmployeeType.EXTERNAL)) {
                Client client= employee.getClient();
                demand.setClient(client);
            }
            
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
        
        savedDemand = demandRepository.save(savedDemand);

            String demandCode = String.format(
                "SCCO-DMD-%s-%03d",
                LocalDate.now(),
                savedDemand.getId()
        );
        savedDemand.setDemandCode(demandCode);
 
        return demandMapper.mapToDemandResponseDTO(savedDemand);
    }

    @Override
    @Transactional
    public DemandResponseDTO reviewDemand(Long id, ReviewDemandRequest review) {
        Demand demand = demandRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demand not found"));

        demand.setStatus(review.getStatus());
        demand.setReviewerRemark(review.getReviewerRemark());
        demand.setRespondedDate(LocalDateTime.now());

        if (review.getStatus() == DemandStatus.APPROVED) {
            promoteToProject(demand);
        }

        return demandMapper.mapToDemandResponseDTO(demandRepository.save(demand));
    }

    @Transactional
    private void promoteToProject(Demand demand) {
        Project project = new Project();
        project.setDemandCode(demand.getDemandCode()); // Links Demand and Project
        project.setTitle(demand.getTitle());
        project.setDescription(demand.getDescription());
        project.setCategory(demand.getCategory());
        
        // Enum mapping String -> Enum
        project.setProjectType(ProjectType.valueOf(demand.getDemandType().name()));
        project.setProjectLevel(ProjectLevel.valueOf(demand.getDemandLevel().name()));
        
        project.setSubCity(demand.getSubCity());
        project.setWoreda(demand.getWoreda());
        project.setContractor(demand.getContractor());
        project.setConsultancy(demand.getConsultancy());
        project.setClient(demand.getClient());
        
        project.setStatus(ProjectStatus.NOT_STARTED);
        project.setPhase(ProjectPhase.EXECUTION);
        
        Project savedProject= projectRepository.save(project);
        String projectCode = String.format(
                "SCCO-PR-%s-%03d",
                LocalDate.now(),
                savedProject.getId()
        );
        savedProject.setProjectCode(projectCode);
        // projectRepository.save(savedProject);
    }

    // @Override
    // @Transactional(readOnly = true)
    // public Page<DemandResponseDTO> getAllDemands(String search, String category, String status, Long subCityId, Pageable pageable) {
    //     // 1. Create the Specification based on provided params
    // Specification<Demand> spec = DemandSpecifications.withFilters(search, category, status, subCityId);

    // // 2. Pass the spec to the repository
    // return demandRepository.findAll(spec, pageable)
    //         .map(demandMapper::mapToDemandResponseDTO);

    // }

    @Override
    @Transactional(readOnly = true)
    public Page<DemandResponseDTO> getAllDemands(String search, String category, String status, Long subCityId, Pageable pageable) {
        String currentUsername = AuthUtility.getUserName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("The current user context was not found"));

        Employee employee = user.getEmployee();
        
        // 1. Initialize the base Specification with existing filters
        Specification<Demand> spec = DemandSpecifications.withFilters(search, category, status, subCityId);

        // 2. If Client
        if (employee != null && employee.getEmployeeType() == EmployeeType.EXTERNAL) {
            Client client = employee.getClient();
            if (client == null) {
                return Page.empty(pageable);
            }
            
            // Add a mandatory filter: demand.client.id == employee.client.id
            Long clientId = client.getId();
            spec = spec.and((root, query, cb) -> cb.equal(root.get("client").get("id"), clientId));
        }

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

    @Override
    @Transactional
    public DemandResponseDTO updateDemand(Long id, DemandRequestDTO dto, List<MultipartFile> files) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demand not found"));

        // Security: Don't allow edits if already Approved
        if (demand.getStatus() == DemandStatus.APPROVED) {
            throw new RuntimeException("Locked: Approved demands cannot be modified.");
        }

        // Map Client fields from DTO to Entity (using the Logic we built in the Mapper)
        // 2. Update ONLY the fields that should change (Manual update or use a MapStruct @MappingTarget)
        demand.setTitle(dto.getTitle());
        demand.setDescription(dto.getDescription());
        demand.setCategory(Category.valueOf(dto.getCategory().name()));
        demand.setDemandType(DemandType.valueOf(dto.getDemandType().name()));
        demand.setDemandLevel(DemandLevel.valueOf(dto.getDemandLevel().name()));
        demand.setSiteLocation(dto.getSiteLocation());
        demand.setStatus(DemandStatus.PENDING);
        
        // 3. Update Relationships (IDs to Entities)
        if (dto.getContractorId() != null) 
            contractorRepository.findById(dto.getContractorId()).ifPresent(demand::setContractor);
        if (dto.getConsultancyId() != null) 
            consultancyRepository.findById(dto.getConsultancyId()).ifPresent(demand::setConsultancy);
        if (dto.getSubCityId() != null) 
            subCityRepository.findById(dto.getSubCityId()).ifPresent(demand::setSubCity);
        if (dto.getWoredaId() != null) 
            woredaRepository.findById(dto.getWoredaId()).ifPresent(demand::setWoreda);
        if (dto.getLocationId() != null) 
            locationRepository.findById(dto.getLocationId()).ifPresent(demand::setLocation);

        // 3. MANDATORY: Set the ID so JPA knows this is an UPDATE
        demand.setId(id);

        // 4. PRESERVE system fields (otherwise they will become null in the DB)
        // demand.setStatus(existing.getStatus());
        // demand.setDemandCode(dto.getDemandCode());
        demand.setRequestedDate(dto.getRequestedDate());
        // demand.setPhase(existing.getPhase());
        // demand.setDocuments(existing.getDocuments()); 
        // Handle additional file uploads
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                DemandDocument doc = new DemandDocument();
                doc.setFileName(file.getOriginalFilename());
                doc.setFileUrl("/uploads/" + file.getOriginalFilename());
                demand.addDocument(doc);
            }
        }

        return demandMapper.mapToDemandResponseDTO(demandRepository.save(demand));
    }
}