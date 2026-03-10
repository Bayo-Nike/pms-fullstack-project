package et.scco.pms_backend.modules.admin.service;


import et.scco.pms_backend.modules.admin.dto.request.LocationRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.LocationResponseDTO;
import et.scco.pms_backend.modules.admin.model.Location;
import et.scco.pms_backend.modules.admin.model.SubCity;

import java.util.List;

public interface LocationService {

    List<LocationResponseDTO> getLocations();

    LocationResponseDTO getLocation(Long id);

    LocationResponseDTO createLocation(LocationRequestDTO dto);

    LocationResponseDTO updateLocation(Long id, LocationRequestDTO dto);

    void deleteLocation(Long id);

    Location getLocationByLocationId(Long locationId);

    List<Location> getLocationsByIds(List<Long> locationIds);
}