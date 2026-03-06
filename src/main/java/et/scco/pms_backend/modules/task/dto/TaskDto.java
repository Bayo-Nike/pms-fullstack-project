package et.scco.pms_backend.modules.task.dto;

import lombok.Data;

@Data
public class TaskDto {

    private Long id;
    private String title;
    private String description;
}
