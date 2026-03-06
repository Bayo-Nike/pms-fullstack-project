package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.request.PositionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.PositionResponseDto;

import java.util.List;

public interface PositionService {
    void deletePosition(String id);
    PositionResponseDto createPosition(PositionRequestDto dto);
    PositionResponseDto updatePosition(Long id, PositionResponseDto dto);
    List<PositionResponseDto> getPositions();
    PositionResponseDto getPosition(Long id);
}
