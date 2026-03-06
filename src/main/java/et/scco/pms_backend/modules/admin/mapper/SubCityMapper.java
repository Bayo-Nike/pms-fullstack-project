package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.modules.admin.dto.response.SubCityResponseDto;
import et.scco.pms_backend.modules.admin.model.SubCity;

public class SubCityMapper {
    public static SubCityResponseDto toDto(SubCity subCity){
        return new SubCityResponseDto(
          subCity.getId(),
          subCity.getSubCityName(),
          subCity.getCity().getId(),
          subCity.getCity().getName()
        );
    }
}
