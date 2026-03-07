package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmployeeResponseDto {
    private Long id;
    private String fullName;
    private Long divisionId;
    private String divisionName;
    private Long positionId;
    private String positionName;
    private String cityName;
    private Long subCityId;
    private String subCityName;
    private String status;
    private String email;
}
