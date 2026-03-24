package et.scco.pms_backend.modules.project.dto.response;


import et.scco.pms_backend.enums.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;


@Data
// @AllArgsConstructor
public class ProjectResponseDTO {

    private Long id;
    private String projectCode;
    private String title;
    private String description;
    private String progress;

    private ProjectLevel projectLevel;
    private ProjectType projectType;

    private Long cityId;
    private String cityName;

    private Long subCityId;
    private String subCityName;

    private List<Long> locationIds ;
    private List<String> locationNames;

    private Long contractorId;
    private String contractorName;

    private Long consultantId;
    private String consultantName;

    private Long clientId;
    private String clientName;

    private Long projectManagerId;
    private String projectManagerName;

    private LocalDate startDate;
    private LocalDate endDate;

    private ProjectStatus status;
    private ProjectPriority priority;
    private CurrencyType currencyType;

    private Double budget;
    private Double budgetUsed;

    private List<Long> employeeIds;
    private List<String> employeeNames;

}