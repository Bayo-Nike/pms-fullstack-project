package et.scco.pms_backend.modules.project.dto.response;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ProjectLevel;
import et.scco.pms_backend.enums.ProjectStatus;
import et.scco.pms_backend.enums.ProjectType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectInitiationResponseDTO {
    private Long id;

    private String projectCode;

    private String title;
    private String description;

    // Enums
    private ProjectType projectType;
    private Category category;
    private ProjectLevel projectLevel;
    private ProjectStatus status;

    // Assignment Data
    private Long subCityId;
    private String subCityName;

    private List<Long> locationIds;

    // Added Date Fields
    private LocalDate startDate;
    private LocalDate endDate;
}