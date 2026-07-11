package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WoredaResponseDto {

    private Long id;
    private String name;
    private String description;
    private Long subCityId;
    private String subCityName;

}
