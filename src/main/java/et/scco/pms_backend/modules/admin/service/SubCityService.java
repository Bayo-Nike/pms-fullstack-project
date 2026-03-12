package et.scco.pms_backend.modules.admin.service;


import et.scco.pms_backend.modules.admin.dto.request.CreateSubCityRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.SubCityResponseDto;
import et.scco.pms_backend.modules.admin.model.City;
import et.scco.pms_backend.modules.admin.model.SubCity;

import java.util.List;

public interface SubCityService {
    City getCity();
    SubCityResponseDto getSubCity(Long id);
    List<SubCityResponseDto> getSubCities();
    SubCityResponseDto createSubCity(CreateSubCityRequestDto dto);
    SubCityResponseDto updateSubCity(Long id, CreateSubCityRequestDto dto);
    void deleteSubCity(Long id);
    SubCity getSubCityEntity(Long subCityId);
    SubCity getCurrentUserSubCity();
}
