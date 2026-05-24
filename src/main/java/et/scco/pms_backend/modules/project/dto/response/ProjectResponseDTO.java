package et.scco.pms_backend.modules.project.dto.response;


import et.scco.pms_backend.enums.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;


@Data
public class ProjectResponseDTO {

    private Long id;
    private String projectCode;
    private String title;
    private String description;
    private Double projectProgress;

    private ProjectLevel projectLevel;
    private ProjectType projectType;
    private Category category;

    private Long cityId;
    private String cityName;

    private Long subCityId;
    private String subCityName;

    private Long woredaId;
    private String woredaName;

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
    private LocalDate agreementDate;

    // for project extension
    private int totalExtendedDays;
    private LocalDate finalEndDate;
    private List<ProjectExtensionDTO> extensions;

    private ProjectStatus status;
    private ProjectPriority priority;
    private CurrencyType currencyType;

    private Double budget;
    private Double budgetUsed;

    private List<Long> employeeIds;
    private List<String> employeeNames;
}