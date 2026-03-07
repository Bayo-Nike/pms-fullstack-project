package et.scco.pms_backend.modules.admin.dto.request;

import lombok.Data;

@Data
public class CreateEmployeeRequestDto {
    private String fullName;
    private String email;
    private Long divisionId;
    private Long positionId;
    private Long subCityId;
    private String status;
}
