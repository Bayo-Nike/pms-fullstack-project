package et.scco.pms_backend.modules.project.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectCostResponseDto {
    private Long id;
    private Long projectId;
    private Long taskId;
    private String taskName;
    private String phase;
    private Double amount;
    private String updatedBy;
    private LocalDateTime updatedAt;
}