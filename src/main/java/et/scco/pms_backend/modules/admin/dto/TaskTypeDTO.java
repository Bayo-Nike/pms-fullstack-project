package et.scco.pms_backend.modules.admin.dto;

import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.enums.TaskTypeProjectPhase;
import lombok.Data;

@Data
public class TaskTypeDTO {
    private Long id;
    private String name;
    private ProjectType projectType;
    private TaskTypeProjectPhase taskTypeProjectPhase;
    private String description;
}