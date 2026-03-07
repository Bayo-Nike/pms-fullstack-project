package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.request.PositionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.PositionResponseDto;
import et.scco.pms_backend.modules.admin.mapper.PositionMapper;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.model.Position;
import et.scco.pms_backend.modules.admin.repository.DivisionRepository;
import et.scco.pms_backend.modules.admin.repository.PositionRepository;
import et.scco.pms_backend.modules.admin.service.PositionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;
    private final DivisionRepository divisionRepository;

    @Override
    public void deletePosition(String id) {
        //ToDO - check everything
        positionRepository.deleteById(Long.parseLong(id));
    }

    @Override
    public PositionResponseDto createPosition(PositionRequestDto dto) {
        if (positionRepository.existsByNameIgnoreCaseAndDivisionId(dto.getName(), dto.getDivisionId())) {
            throw new RuntimeException("Position already exists");
        }
        Position position = new Position();
        position.setName(dto.getName());
        if (dto.getParentId() != null) {
            Position parent = positionRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(""));
            position.setParent(parent);
        }
        if (dto.getDivisionId() != null) {
            Division division = divisionRepository.findById(dto.getDivisionId())
                    .orElseThrow(() -> new ResourceNotFoundException(""));
            position.setDivision(division);
        }
        return PositionMapper.responseDto(positionRepository.save(position));
    }

    @Override
    public PositionResponseDto updatePosition(Long id, PositionResponseDto dto) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found with id:"));
        position.setName(dto.getName());
        if (dto.getParentId() != null) {
            Position parent = positionRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent position not found"));
            position.setParent(parent);
        } else {
            position.setParent(null);
        }
        if (dto.getDivisionId() != null) {
            Division division = divisionRepository.findById(dto.getDivisionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Division not found"));
            position.setDivision(division);
        } else {
            position.setDivision(null);
        }
        return PositionMapper.responseDto(positionRepository.save(position));
    }

    @Override
    public List<PositionResponseDto> getPositions() {
        return positionRepository.findAll()
                .stream()
                .map(PositionMapper::responseDto)
                .toList();
    }

    @Override
    public Optional<Position> findByIdAndDivisionId(Long positionId, Long divisionId) {
        return positionRepository.findByIdAndDivisionId(positionId, divisionId);
    }

    @Override
    public PositionResponseDto getPosition(Long id) {
        return positionRepository.findById(id)
                .map(PositionMapper::responseDto).orElse(null);
    }
}
