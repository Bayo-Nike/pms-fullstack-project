package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.request.CreateSubCityRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.SubCityResponseDto;
import et.scco.pms_backend.modules.admin.mapper.SubCityMapper;
import et.scco.pms_backend.modules.admin.model.City;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.CityRepository;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.SubCityService;
import lombok.AllArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class SubCityServiceImpl implements SubCityService {

    private final CityRepository cityRepository;
    private final SubCityRepository subCityRepository;
    private final UserRepository userRepository;

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
    public SubCityResponseDto createSubCity(CreateSubCityRequestDto dto) {
        if (subCityRepository.existsBySubCityNameIgnoreCase(dto.getName())) {
            throw new RuntimeException("SubCity already exists");
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
        // TODO - check employees, projects, task any other
        subCityRepository.deleteById(id);
    }

    @Override
    public SubCity getSubCityEntity(Long subCityId) {
        return subCityRepository.findById(subCityId)
                .orElseThrow(() -> new RuntimeException("SubCity not found with id: " + subCityId));
    }

    @Override
    public SubCity getCurrentUserSubCity() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found: " + currentUsername));
 
        // The below handles;
        // 1. If Employee is null -> returns null
        // 2. If Employee is NOT null but SubCity is null -> returns null
        // 3. If both are present -> returns SubCity
        return Optional.ofNullable(user.getEmployee())
                   .map(Employee::getSubCity)
                   .orElse(null);
    }
}
