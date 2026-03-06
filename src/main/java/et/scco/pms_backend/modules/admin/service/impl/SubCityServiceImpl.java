package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.request.CreateSubCityRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.SubCityResponseDto;
import et.scco.pms_backend.modules.admin.mapper.SubCityMapper;
import et.scco.pms_backend.modules.admin.model.City;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.repository.CityRepository;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.service.SubCityService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SubCityServiceImpl implements SubCityService {

    private final CityRepository cityRepository;
    private final SubCityRepository subCityRepository;

    @Override
    public City getCity() {
        return cityRepository.getCityById(1L);
    }

    @Override
    public SubCityResponseDto getSubCity(Long id) {
        SubCity subCity = subCityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCity not found with id: " + id));
        return SubCityMapper.toDto(subCity);
    }

    @Override
    public List<SubCityResponseDto> getSubCities() {
        return subCityRepository.findAll()
                .stream()
                .map(SubCityMapper::toDto)
                .toList();
    }

    @Override
    public SubCityResponseDto createSubCity(CreateSubCityRequestDto dto)
    {
        if(subCityRepository.existsBySubCityNameIgnoreCase(dto.getName())){
            return null;
        }
        SubCity subCity = new SubCity();
        subCity.setSubCityName(dto.getName());
        subCity.setCity(getCity());
        return SubCityMapper.toDto(subCityRepository.save(subCity));
    }

    @Override
    public SubCityResponseDto updateSubCity(Long id, CreateSubCityRequestDto dto) {
        SubCity subCity = subCityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCity not found with id: " + id));

        subCity.setSubCityName(dto.getName());

        return SubCityMapper.toDto(subCityRepository.save(subCity));
    }

    @Override
    public void deleteSubCity(Long id) {
        //TODO - check employees, projects, task any other
        subCityRepository.deleteById(id);
    }
}
