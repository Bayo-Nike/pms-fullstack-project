package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.request.DivisionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.DivisionResponseDto;
import et.scco.pms_backend.modules.admin.model.Division;

import java.util.List;

public interface DivisionService {

    Division getDivision(Long id);
    DivisionResponseDto getDivisionResp(Long id);
    List<DivisionResponseDto> getDivisions();
    DivisionResponseDto createDivision(DivisionRequestDto dto);
    DivisionResponseDto updateDivision(Long id, DivisionRequestDto dto);
    void deleteDivision(Long id);
}