package et.scco.pms_backend.modules.task.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class TaskRequestDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private LocalDateTime dueDate;
    private Long projectId;
    private List<Long> assignedUserIds; // New field
}
