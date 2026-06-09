package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.modules.admin.dto.response.WoredaResponseDto;
import et.scco.pms_backend.modules.admin.model.Woreda;

public class WoredaMapper {

    public static WoredaResponseDto toDto(Woreda woreda){
        return new WoredaResponseDto(
          woreda.getId(),
          woreda.getWoredaName(),
          woreda.getDescription(),
          woreda.getSubCity().getId(),
          woreda.getSubCity().getSubCityName()
        );
    }

}
