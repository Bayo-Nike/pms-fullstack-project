package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.request.DivisionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.DivisionResponseDto;
import et.scco.pms_backend.modules.admin.mapper.DivisionMapper;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.repository.DivisionRepository;
import et.scco.pms_backend.modules.admin.service.DivisionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class DivisionServiceImpl implements DivisionService {

    private final DivisionRepository divisionRepository;

    @Override
    public DivisionResponseDto getDivisionResp(Long id) {
        return DivisionMapper.responseDto(getDivision(id));
    }

    @Override
    public Division getDivision(Long id) {
        return divisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Division not found with id: " + id));
    }

    @Override
    public List<DivisionResponseDto> getDivisions() {
        return divisionRepository.findAll()
                .stream()
                .map(DivisionMapper::responseDto)
                .toList();
    }

    @Override
    public DivisionResponseDto createDivision(DivisionRequestDto dto) {

        if (divisionRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new RuntimeException("Division already exists");
        }

        Division division = new Division();
        division.setName(dto.getName());

        if (dto.getParentId() != null) {
            Division parent = divisionRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent division not found"));
            division.setParent(parent);
        }

        Division saved = divisionRepository.save(division);

        return DivisionMapper.responseDto(saved);
    }

    @Override
    public DivisionResponseDto updateDivision(Long id, DivisionRequestDto dto) {

        Division division = divisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Division not found with id: " + id));
        division.setName(dto.getName());
        if (dto.getParentId() != null) {
            Division parent = divisionRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent division not found"));
            division.setParent(parent);
        } else {
            division.setParent(null);
        }

        return DivisionMapper.responseDto(divisionRepository.save(division));
    }

    @Override
    public void deleteDivision(Long id) {
        //TODO - check children divisions, employees and etc
        divisionRepository.deleteById(id);
    }
}
