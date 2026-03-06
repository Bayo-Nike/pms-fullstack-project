package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class SubCityResponseDto {
    private Long id;
    private String name;
    private Long cityId;
    private String cityName;
}
