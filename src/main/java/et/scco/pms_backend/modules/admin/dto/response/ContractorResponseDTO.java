package et.scco.pms_backend.modules.admin.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ContractorResponseDTO {

    private Long id;
    private String contractorName;
    private String status;
    private String document;
    private LocalDateTime createdDate;


}
