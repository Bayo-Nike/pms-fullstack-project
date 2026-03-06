package et.scco.pms_backend.modules.task.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import et.scco.pms_backend.modules.admin.dto.response.UserResponseDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import lombok.Data;

@Data
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private ProjectResponseDTO project;
    private List<UserResponseDTO> assignedUsers;
}
