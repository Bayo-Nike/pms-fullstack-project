package et.scco.pms_backend.modules.planning.dto.request;

import lombok.Data;

@Data
public class LocationDTO {

    private Double latitude;
    private Double longitude;
    private String feedback;
}
