package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.request.PositionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.PositionResponseDto;
import et.scco.pms_backend.modules.admin.model.Position;

import java.util.List;
import java.util.Optional;

public interface PositionService {
    void deletePosition(String id);
    PositionResponseDto createPosition(PositionRequestDto dto);
    PositionResponseDto updatePosition(Long id, PositionResponseDto dto);
    List<PositionResponseDto> getPositions();
    PositionResponseDto getPosition(Long id);
    Optional<Position> findByIdAndDivisionId(Long positionId, Long divisionId);
}
