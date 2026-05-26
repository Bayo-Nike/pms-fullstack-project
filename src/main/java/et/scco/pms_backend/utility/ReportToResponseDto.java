package et.scco.pms_backend.utility;


import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportToResponseDto {
    private Long employeeId;
    private String employeeName;
    private Long employeePositionId;
    private String employeePositionName;
    private List<ReportToResponseDto> children = new ArrayList<>();

    // Constructor for easy mapping
    public ReportToResponseDto(Long id, String name, Long posId, String posName) {
        this.employeeId = id;
        this.employeeName = name;
        this.employeePositionId = posId;
        this.employeePositionName = posName;
    }
}