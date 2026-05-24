package et.scco.pms_backend.modules.project.dto.response;

import et.scco.pms_backend.enums.InspectionLevel;
import et.scco.pms_backend.enums.WeatherCondition;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InspectionResponseDto {
    private Long id;

    private Long inspectionTypeId;
    private String inspectionTypeName;

    private InspectionLevel inspectionLevel;
    private WeatherCondition weatherCondition;

    private Long projectId;
    private String projectTitle;

    private Long taskId;
    private String taskName;

    private Long employeeId;
    private String employeeName;

    private LocalDate inspectionDate;
    private String inspectionResult;

    private Long activeWorkers;

    private String latitude;
    private String longitude;

    private String inspectionDocumentUrl;

    private String comment1;
    private String commentedBy1;
    private String comment2;
    private String commentedBy2;
}