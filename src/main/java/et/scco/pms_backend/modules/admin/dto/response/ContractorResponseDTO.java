package et.scco.pms_backend.modules.admin.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ContractorStatus;
import lombok.Data;

@Data
public class ContractorResponseDTO {

    private Long id;
    private String contractorName;
    private ContractorStatus status;
    private String document;
    private LocalDateTime createdDate;
    private Category category;
    private LocalDate registeredDate;
    private LocalDate licenseExpiryDate;



}
