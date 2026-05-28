package et.scco.pms_backend.modules.project.service.impl;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Location;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.Woreda;
import et.scco.pms_backend.modules.admin.repository.LocationRepository;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.repository.WoredaRepository;
import et.scco.pms_backend.modules.admin.service.AuditLogService;
import et.scco.pms_backend.modules.admin.service.impl.EmployeeServiceImpl;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectInitiationRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectInitiationResponseDTO;
import et.scco.pms_backend.modules.project.model.Project;
import et.scco.pms_backend.modules.project.repository.ProjectRepository;
import et.scco.pms_backend.modules.project.service.ProjectInitiationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectInitiationServiceImpl implements ProjectInitiationService {

    private final ProjectRepository projectRepository;
    private final SubCityRepository subCityRepository;
    private final WoredaRepository woredaRepository;
    private final LocationRepository locationRepository;
    private final AuditLogService auditLogService;
    private final EmployeeServiceImpl employeeServiceImpl;

    @Override
    @Transactional
    public ProjectInitiationResponseDTO createInitiation(CreateProjectInitiationRequestDTO dto) {
        Project project = new Project();

        mapDtoToEntity(dto, project);

        Project saved = projectRepository.save(project);

        String code = String.format(
                "SCCO-PR-%s-%03d",
                LocalDate.now(),
                saved.getId()
        );
        saved.setProjectCode(code);

        auditLogService.auditLog(
                "Project Initiation",
                saved.getTitle() + " has been initiated with project code: "+ code
        );


        return mapToResponseDTO(projectRepository.save(saved));
    }

    @Override
    public Page<ProjectInitiationResponseDTO> getInitiations(int page, int size, String search, ProjectPhase phase, Long subCityId, Category category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        
        Employee employee = employeeServiceImpl.findEmployeeWithDivision();
        if (employee == null) return projectRepository.findAll(pageable).map(this::mapToResponseDTO);

        SubCity restrictedSubCity = employee.getSubCity();
        
        Long finalSubCityId = (restrictedSubCity != null) ? restrictedSubCity.getId() : subCityId;
        
        Page<Project> projects = projectRepository.findInitiations(phase, category, search, finalSubCityId, pageable);

        return projects.map(this::mapToResponseDTO);
    }

    @Override
    public ProjectInitiationResponseDTO getInitiation(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Initiation record not found"));
        return mapToResponseDTO(project);
    }

    @Override
    @Transactional
    public ProjectInitiationResponseDTO updateInitiation(Long id, CreateProjectInitiationRequestDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Initiation record not found"));

        mapDtoToEntity(dto, project);

        Project updated = projectRepository.save(project);
        return mapToResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteInitiation(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Initiation record not found");
        }
        projectRepository.deleteById(id);
    }


    private void mapDtoToEntity(CreateProjectInitiationRequestDTO dto, Project project) {
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setProjectType(dto.getProjectType());
        project.setCategory(dto.getCategory());
        project.setProjectLevel(dto.getProjectLevel());
        project.setStatus(dto.getStatus());
        project.setPhase(dto.getPhase());

        if (dto.getPhase().equals(ProjectPhase.EXECUTION)) {
            project.setStartDate(dto.getStartDate());
            project.setEndDate(dto.getEndDate());
            project.setAgreementDate(dto.getAgreementDate());
        }


        // Map SubCity (Hub)
        if (dto.getSubCityId() != null) {
            SubCity subCity = subCityRepository.findById(dto.getSubCityId())
                    .orElseThrow(() -> new RuntimeException("Sub-City not found"));
            project.setSubCity(subCity);
        } else {
            project.setSubCity(null);
        }

        if (dto.getWoredaId() != null) {
            Woreda woreda = woredaRepository.findById(dto.getWoredaId())
                    .orElseThrow(() -> new RuntimeException("Woreda not found"));
            project.setWoreda(woreda);
        } else {
            project.setWoreda(null);;
        }

        // Map Locations (Sites)
        if (dto.getLocationIds() != null && !dto.getLocationIds().isEmpty()) {
            List<Location> sites = locationRepository.findAllById(dto.getLocationIds());
            project.setLocations(sites);
        } else {
            project.getLocations().clear();
        }
    }

    /**
     * Converts Project Entity back to Response DTO for the Frontend
     */
    private ProjectInitiationResponseDTO mapToResponseDTO(Project p) {
        ProjectInitiationResponseDTO res = new ProjectInitiationResponseDTO();
        res.setId(p.getId());
        res.setProjectCode(p.getProjectCode());
        res.setTitle(p.getTitle());
        res.setDescription(p.getDescription());
        res.setProjectType(p.getProjectType());
        res.setCategory(p.getCategory());
        res.setProjectLevel(p.getProjectLevel());
        res.setStatus(p.getStatus());
        res.setPhase(p.getPhase());
        res.setStartDate(p.getStartDate());
        res.setEndDate(p.getEndDate());
        res.setAgreementDate(p.getAgreementDate());

        if (p.getSubCity() != null) {
            res.setSubCityId(p.getSubCity().getId());
            res.setSubCityName(p.getSubCity().getSubCityName());
        }
        if (p.getWoreda() != null) {
            res.setWoredaId(p.getWoreda().getId());
            res.setWoredaName(p.getWoreda().getWoredaName());
        }

        if (p.getLocations() != null) {
            res.setLocationIds(p.getLocations().stream()
                    .map(Location::getId)
                    .collect(Collectors.toList()));
        }

        return res;
    }
}