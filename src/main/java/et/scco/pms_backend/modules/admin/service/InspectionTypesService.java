package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.request.InspectionTypesRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.InspectionTypesResponseDto;

import java.util.List;

public interface InspectionTypesService {
    boolean createInspection(InspectionTypesRequestDto dto);

    InspectionTypesResponseDto getInspection(Long id);

    void deleteInspection(Long id);

    InspectionTypesResponseDto updateInspection(Long id, InspectionTypesRequestDto dto);

    List<InspectionTypesResponseDto> getInspections();
}
