package et.scco.pms_backend.modules.project.dto.request;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ProjectLevel;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateProjectInitiationRequestDTO {
    private String title;
    private String description;

    private ProjectType projectType;
    private Category category;
    private ProjectLevel projectLevel;

    private Long subCityId;
    private List<Long> locationIds;

    private ProjectStatus status;

    private LocalDate startDate;
    private LocalDate endDate;
}
