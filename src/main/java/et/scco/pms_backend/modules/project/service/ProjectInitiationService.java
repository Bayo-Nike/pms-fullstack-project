package et.scco.pms_backend.modules.project.service;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ProjectPhase;
import et.scco.pms_backend.modules.project.dto.request.CreateProjectInitiationRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectInitiationResponseDTO;
import org.springframework.data.domain.Page;

public interface ProjectInitiationService {
    ProjectInitiationResponseDTO createInitiation(CreateProjectInitiationRequestDTO dto);

    Page<ProjectInitiationResponseDTO> getInitiations(int page, int size, String search, ProjectPhase phase, Category category);

    ProjectInitiationResponseDTO getInitiation(Long id);

    ProjectInitiationResponseDTO updateInitiation(Long id, CreateProjectInitiationRequestDTO dto);

    void deleteInitiation(Long id);
}
