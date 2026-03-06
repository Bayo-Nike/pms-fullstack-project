package et.scco.pms_backend.modules.project.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import et.scco.pms_backend.modules.admin.dto.response.UserResponseDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import lombok.Data;

@Data
public class ProjectResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private UserResponseDTO user; // optional: include user info
    private List<TaskResponseDTO> tasks; // optional: include tasks
}
