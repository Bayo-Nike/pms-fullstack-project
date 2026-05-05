package et.scco.pms_backend.modules.project.dto.request;

import lombok.Data;

@Data
public class ProjectCostRequestDto {
    private Long projectId;
    private Long taskId;
    private String phase;
    private Double amount;
}
