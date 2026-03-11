package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.request.InspectionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.InspectionResponseDto;
import et.scco.pms_backend.modules.admin.model.Inspection;
import et.scco.pms_backend.modules.admin.repository.InspectionRepository;
import et.scco.pms_backend.modules.admin.service.InspectionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class InspectionServiceImpl implements InspectionService {

    private final InspectionRepository repository;

    @Transactional
    @Override
    public boolean createInspection(InspectionRequestDto dto) {
        if (repository.existsByNameAndProjectType(dto.getName(), dto.getProjectType())){
            throw new RuntimeException("Inspection already exists");
        }
        Inspection inspection = new Inspection();
        inspection.setName(dto.getName());
        inspection.setProjectType(dto.getProjectType());
        inspection.setDescription(dto.getDescription());
        repository.save(inspection);
        return true;
    }

    @Override
    public InspectionResponseDto getInspection(Long id) {
        return repository.findById(id)
                .stream().map(e -> new InspectionResponseDto(e.getId(), e.getName(), e.getProjectType().name(), e.getDescription()))
                .findFirst().orElse(null);
    }

    @Override
    public void deleteInspection(Long id) {
        repository.deleteById(id);
    }

    @Override
    public InspectionResponseDto updateInspection(Long id, InspectionRequestDto dto) {

        Inspection inspection = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));
        inspection.setName(dto.getName());
        inspection.setProjectType(dto.getProjectType());
        return new InspectionResponseDto(inspection.getId(), inspection.getName(), inspection.getProjectType().name(), inspection.getDescription());
    }

    @Override
    public List<InspectionResponseDto> getInspections() {
        return repository.findAll()
                .stream().map(e -> new InspectionResponseDto(e.getId(), e.getName(), e.getProjectType().name(), e.getDescription()))
                .toList();
    }
}
