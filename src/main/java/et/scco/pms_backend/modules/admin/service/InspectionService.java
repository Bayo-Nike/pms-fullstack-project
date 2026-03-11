package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.request.InspectionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.InspectionResponseDto;

import java.util.List;

public interface InspectionService {
    boolean createInspection(InspectionRequestDto dto);

    InspectionResponseDto getInspection(Long id);
    void deleteInspection(Long id);
    InspectionResponseDto updateInspection(Long id, InspectionRequestDto dto);
    List<InspectionResponseDto> getInspections();
}
