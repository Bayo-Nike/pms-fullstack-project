package et.scco.pms_backend.modules.project.service;

import et.scco.pms_backend.modules.project.dto.request.InspectionRequestDto;
import et.scco.pms_backend.modules.project.dto.response.InspectionResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface InspectionService {

    @Transactional(readOnly = true)
    Page<InspectionResponseDto> getAllInspections(String search, Long subCityId, Pageable pageable);

    InspectionResponseDto getInspection(Long id);

    @Transactional
    InspectionResponseDto createInspection(InspectionRequestDto dto, List<MultipartFile> files);

    @Transactional
    InspectionResponseDto updateInspection(Long id, InspectionRequestDto dto, List<MultipartFile> files);

    void deleteInspection(Long id);

    List<InspectionResponseDto> getInspectionsByProject(Long projectId);

    InspectionResponseDto commentInspection(Long inspectionId, String comment);
}
