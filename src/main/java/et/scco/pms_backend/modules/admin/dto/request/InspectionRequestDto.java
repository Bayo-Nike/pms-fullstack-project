package et.scco.pms_backend.modules.admin.dto.request;

import et.scco.pms_backend.enums.ProjectType;
import lombok.Data;

@Data
public class InspectionRequestDto {
    private String name;
    private ProjectType projectType;
    private String description;
}
