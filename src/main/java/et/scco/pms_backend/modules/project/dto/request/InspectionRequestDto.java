package et.scco.pms_backend.modules.project.dto.request;

import et.scco.pms_backend.enums.InspectionLevel;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InspectionRequestDto {
    private Long inspectionTypeId;
    private InspectionLevel inspectionLevel;
    private Long projectId;
    private Long taskId;
    private Long employeeId;
    private LocalDate inspectionDate;
    private String inspectionResult;
}