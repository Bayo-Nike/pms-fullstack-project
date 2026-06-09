package et.scco.pms_backend.modules.admin.dto.request;

import lombok.Data;

@Data
public class WoredaRequestDto {
    private String name;
    private String description;
    private Long subCityId;

}
