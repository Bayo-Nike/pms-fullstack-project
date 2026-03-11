package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InspectionTypesResponseDto {
    private Long id;
    private String name;
    private String projectType;
    private String description;
}
