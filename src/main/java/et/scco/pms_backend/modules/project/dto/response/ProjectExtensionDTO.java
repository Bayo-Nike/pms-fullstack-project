package et.scco.pms_backend.modules.project.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProjectExtensionDTO {

    private Long id;
    private int extendedDays;
    private LocalDate previousEndDate;
    private LocalDate newEndDate;
    private String reason;
    private LocalDateTime extendedAt;
}
