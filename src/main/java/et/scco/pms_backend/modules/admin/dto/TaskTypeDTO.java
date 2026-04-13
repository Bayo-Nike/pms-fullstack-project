package et.scco.pms_backend.modules.admin.dto;

import et.scco.pms_backend.enums.ProjectType;
import lombok.Data;

@Data
public class TaskTypeDTO {
    private Long id;
    private String name;
    private ProjectType projectType;
    private String description;
}