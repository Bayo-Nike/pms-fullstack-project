package et.scco.pms_backend.utility;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReportToResponseDto {
    private Long employeeId;
    private String employeeName;
    private Long employeePositionId;
    private String employeePositionName;
}
