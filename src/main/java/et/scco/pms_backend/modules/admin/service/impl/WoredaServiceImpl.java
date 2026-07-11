package et.scco.pms_backend.modules.admin.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.modules.admin.dto.request.WoredaRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.WoredaResponseDto;
import et.scco.pms_backend.modules.admin.mapper.WoredaMapper;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.Woreda;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.repository.WoredaRepository;
import et.scco.pms_backend.modules.admin.service.WoredaService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class WoredaServiceImpl implements WoredaService{

    private final WoredaRepository woredaRepository;
    private final SubCityRepository subCityRepository;

    @Override
    public SubCity getSubCity(Long subCityId) {
        return subCityRepository.getSubCityById(subCityId);
    }

    @Override
    public List<WoredaResponseDto> getWoredas() {
        return woredaRepository.findAll()
                .stream()
                .map(WoredaMapper::toDto)
                .toList();
    }

    @Override
    public WoredaResponseDto getWoreda(Long id) {
        Woreda woreda = woredaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Woreda not found with id: " + id));
        return WoredaMapper.toDto(woreda);
    }

    @Override
    public WoredaResponseDto updateWoreda(Long id, WoredaRequestDto dto) {
        Woreda woreda = woredaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Woreda not found with id: " + id));

        woreda.setWoredaName(dto.getName());
        woreda.setDescription(dto.getDescription());
        woreda.setSubCity(getSubCity(dto.getSubCityId()));

        return WoredaMapper.toDto(woredaRepository.save(woreda));
    }

    @Override
    public WoredaResponseDto createWoreda(WoredaRequestDto dto) {
        if (woredaRepository.existsByWoredaNameIgnoreCase(dto.getName())) {
            throw new RuntimeException("Woreda already exists");
        }
        Woreda woreda = new Woreda();
        woreda.setWoredaName(dto.getName());
        woreda.setDescription(dto.getDescription());
        woreda.setSubCity(getSubCity(dto.getSubCityId()));
        return WoredaMapper.toDto(woredaRepository.save(woreda));
        
    }

    @Override
    public void deleteById(Long id) {
        woredaRepository.deleteById(id);
    }

}
