package et.scco.pms_backend.modules.admin.dto.response;

import et.scco.pms_backend.enums.DivisionGroup;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmployeeResponseDto {
    private Long id;
    private String fullName;
    private Long divisionId;
    private DivisionGroup divisionGroup;
    private String divisionName;
    private Long positionId;
    private String positionName;
    private Long positionParentId;
    private String cityName;
    private Long subCityId;
    private String subCityName;
    private String status;
    private String email;
    private int projectCount;
    private int taskCount;
    private String employeeType;
    private Long clientId;
    private String clientName;
}
