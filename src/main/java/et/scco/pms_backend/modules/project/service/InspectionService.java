package et.scco.pms_backend.modules.project.service;

import et.scco.pms_backend.modules.project.dto.request.InspectionRequestDto;
import et.scco.pms_backend.modules.project.dto.response.InspectionResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InspectionService {
    Page<InspectionResponseDto> getAllInspections(Pageable pageable);

    InspectionResponseDto getInspection(Long id);

    InspectionResponseDto createInspection(InspectionRequestDto dto);

    InspectionResponseDto updateInspection(Long id, InspectionRequestDto dto);

    void deleteInspection(Long id);

    List<InspectionResponseDto> getInspectionsByProject(Long projectId);

}
