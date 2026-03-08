package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LocationResponseDTO {

    private Long id;
    private String name;
    private Long subCityId;
    private String subCityName;
    private Double lat;
    private Double lng;
}