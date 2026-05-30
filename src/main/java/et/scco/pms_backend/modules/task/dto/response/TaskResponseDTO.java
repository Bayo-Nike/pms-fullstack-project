package et.scco.pms_backend.modules.task.dto.response;

import et.scco.pms_backend.enums.ProjectPriority;
import et.scco.pms_backend.enums.TaskStatus;
import et.scco.pms_backend.enums.TaskTypeProjectPhase;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskResponseDTO {

    private Long id;

    private String taskName;

    private Long projectId;
    private String projectTitle;

    private List<Long> employeeIds;
    private List<String> employeeNames;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;
    private String remark;

    private TaskStatus status;

    private Double latitude;

    private Double longitude;
    private double taskCost;

    private List<Long> locationIds;
    private List<String> locationNames;

    private ProjectPriority priority;

    private Double weight;

    private LocalDateTime createdAt;
    private String supportDocument;

    private TaskTypeProjectPhase taskTypeProjectPhase;
}