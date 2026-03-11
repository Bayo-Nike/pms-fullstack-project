package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.request.InspectionTypesRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.InspectionTypesResponseDto;
import et.scco.pms_backend.modules.admin.model.InspectionType;
import et.scco.pms_backend.modules.admin.repository.InspectionTypesRepository;
import et.scco.pms_backend.modules.admin.service.InspectionTypesService;
import et.scco.pms_backend.utility.AuthContext;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class InspectionTypesTypesServiceImpl implements InspectionTypesService {

    private final InspectionTypesRepository repository;
    private final AuthContext authContext;

    @Transactional
    @Override
    public boolean createInspection(InspectionTypesRequestDto dto) {
        if (repository.existsByNameAndProjectType(dto.getName(), dto.getProjectType())){
            throw new RuntimeException("InspectionType already exists");
        }
        InspectionType inspectionType = new InspectionType();
        inspectionType.setName(dto.getName());
        inspectionType.setProjectType(dto.getProjectType());
        inspectionType.setDescription(dto.getDescription());
        repository.save(inspectionType);
        System.out.println(authContext.getEmployee());
        return true;
    }

    @Override
    public InspectionTypesResponseDto getInspection(Long id) {
        return repository.findById(id)
                .stream().map(e -> new InspectionTypesResponseDto(e.getId(), e.getName(), e.getProjectType().name(), e.getDescription()))
                .findFirst().orElse(null);
    }

    @Override
    public void deleteInspection(Long id) {
        repository.deleteById(id);
    }

    @Override
    public InspectionTypesResponseDto updateInspection(Long id, InspectionTypesRequestDto dto) {

        InspectionType inspectionType = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("InspectionType not found"));
        inspectionType.setName(dto.getName());
        inspectionType.setProjectType(dto.getProjectType());
        return new InspectionTypesResponseDto(inspectionType.getId(), inspectionType.getName(), inspectionType.getProjectType().name(), inspectionType.getDescription());
    }

    @Override
    public List<InspectionTypesResponseDto> getInspections() {
        return repository.findAll()
                .stream().map(e -> new InspectionTypesResponseDto(e.getId(), e.getName(), e.getProjectType().name(), e.getDescription()))
                .toList();
    }
}
