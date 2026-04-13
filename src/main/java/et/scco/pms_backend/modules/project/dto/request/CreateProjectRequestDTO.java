package et.scco.pms_backend.modules.project.dto.request;

import et.scco.pms_backend.enums.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateProjectRequestDTO {

    private String title;
    private String description;

    private ProjectLevel projectLevel;
    private ProjectType projectType;

    private Long cityId;
    private Long subCityId;
    private List<Long> locationIds;
    private Long contractorId;
    private Long consultantId;
    private Long clientId;
    private Long projectManagerId;

    private LocalDate startDate;
    private LocalDate endDate;

    private ProjectStatus status;
    private ProjectPriority priority;
    private CurrencyType currencyType;

    private Double budget;
    private Double budgetUsed;

    private List<Long> employeeIds; //team members
}