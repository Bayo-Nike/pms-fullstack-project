package et.scco.pms_backend.modules.admin.dto.response;

import java.time.LocalDateTime;

import et.scco.pms_backend.enums.ConsultantStatus;
import et.scco.pms_backend.modules.admin.model.User;
import lombok.Data;

@Data
public class ConsultancyResponseDTO {
    private Long id;
    private String consultantName;
    private ConsultantStatus status;
    private String document;
    private User createdBy;
    private LocalDateTime createdDate;

}
