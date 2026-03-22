package et.scco.pms_backend.modules.project.dto.request;

import et.scco.pms_backend.enums.InspectionLevel;
import et.scco.pms_backend.enums.WeatherCondition;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InspectionRequestDto {
    private Long inspectionTypeId;
    private InspectionLevel inspectionLevel;
    private WeatherCondition weatherCondition;
    private Long projectId;
    private Long taskId;
    private LocalDate inspectionDate;
    private String inspectionResult;
    private Long activeWorkers;
}