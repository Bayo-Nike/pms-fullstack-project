package et.scco.pms_backend.modules.admin.dto.response;

import java.time.LocalDateTime;

import et.scco.pms_backend.enums.ClientStatus;
import et.scco.pms_backend.modules.admin.model.User;
import lombok.Data;

@Data
public class ClientResponseDTO {
    private Long id;
    private String clientName;
    private ClientStatus status;
    private String document;
    private User createdBy;
    private LocalDateTime createdDate;

}
