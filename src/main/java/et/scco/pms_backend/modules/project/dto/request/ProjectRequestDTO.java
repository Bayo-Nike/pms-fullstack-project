package et.scco.pms_backend.modules.project.dto.request;

import lombok.Data;

@Data
public class ProjectRequestDTO {
    private Long id;
    private String title;
    private String description;
    private Long userId; // assign project to user
}
