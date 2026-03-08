package et.scco.pms_backend.modules.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationRequestDTO {

    private String name;
    private Long subCityId;
    private Double lat;
    private Double lng;
}