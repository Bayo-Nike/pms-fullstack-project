package et.scco.pms_backend.modules.admin.dto.request;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ContractorRequestDTO {
    private String contractorName;
    private String status;
    private String category;
    private LocalDate registeredDate;
    private LocalDate licenseExpiryDate;
    private MultipartFile document;
}
