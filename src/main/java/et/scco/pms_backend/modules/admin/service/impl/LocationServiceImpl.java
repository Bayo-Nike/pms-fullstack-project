package et.scco.pms_backend.modules.admin.service.impl;


import et.scco.pms_backend.modules.admin.dto.request.LocationRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.LocationResponseDTO;
import et.scco.pms_backend.modules.admin.model.Location;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.repository.LocationRepository;
import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
import et.scco.pms_backend.modules.admin.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    private final SubCityRepository subCityRepository;

    @Override
    public List<LocationResponseDTO> getLocations() {
        return locationRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public LocationResponseDTO getLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        return mapToDTO(location);
    }

    @Override
    public LocationResponseDTO createLocation(LocationRequestDTO dto) {

        if (locationRepository.existsByNameAndSubCityId(dto.getName(), dto.getSubCityId())) {
            throw new RuntimeException("Location already exists in this sub city");
        }

        SubCity subCity = subCityRepository.findById(dto.getSubCityId())
                .orElseThrow(() -> new RuntimeException("SubCity not found"));

        Location location = new Location();
        location.setName(dto.getName());
        location.setLat(dto.getLat());
        location.setLng(dto.getLng());
        location.setSubCity(subCity);

        return mapToDTO(locationRepository.save(location));
    }

    @Override
    public LocationResponseDTO updateLocation(Long id, LocationRequestDTO dto) {

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        if (locationRepository.existsByNameAndSubCityIdAndIdNot(
                dto.getName(),
                dto.getSubCityId(),
                id)) {
            throw new RuntimeException("Location already exists in this sub city");
        }

        SubCity subCity = subCityRepository.findById(dto.getSubCityId())
                .orElseThrow(() -> new RuntimeException("SubCity not found"));

        location.setName(dto.getName());
        location.setLat(dto.getLat());
        location.setLng(dto.getLng());
        location.setSubCity(subCity);

        return mapToDTO(locationRepository.save(location));
    }

    @Override
    public void deleteLocation(Long id) {

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        locationRepository.delete(location);
    }

    private LocationResponseDTO mapToDTO(Location location) {
        return new LocationResponseDTO(
                location.getId(),
                location.getName(),
                location.getSubCity().getId(),
                location.getSubCity().getSubCityName(),
                location.getLat(),
                location.getLng()
        );
    }
}