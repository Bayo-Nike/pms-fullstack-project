package et.scco.pms_backend.modules.admin.dto.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ConsultancyRequestDTO {

    private String consultantName;
    private String status;
    private MultipartFile document;
}
