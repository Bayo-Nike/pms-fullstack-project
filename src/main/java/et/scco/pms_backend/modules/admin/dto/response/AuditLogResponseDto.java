package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuditLogResponseDto {
    private Long id;
    private String action;
    private String performedBy;
    private String details;
    private LocalDateTime timestamp;
}
