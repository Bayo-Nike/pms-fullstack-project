package et.scco.pms_backend.modules.project.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateProjectRequestDTO {

    private String projectCode;
    private String title;
    private String description;

    private String projectType;

    private Long cityId;
    private Long subCityId;
    private Long locationId;
    private Long contractorId;
    private Long projectManagerId;

    private LocalDate startDate;
    private LocalDate endDate;

    private String status;
    private String priority;
    private String currencyType;

    private Double budget;
    private Double budgetUsed;

    private List<Long> employeeIds;
}