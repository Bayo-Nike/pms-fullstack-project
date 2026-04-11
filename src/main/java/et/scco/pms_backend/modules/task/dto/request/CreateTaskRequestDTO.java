package et.scco.pms_backend.modules.task.dto.request;

import et.scco.pms_backend.enums.ProjectPriority;
import et.scco.pms_backend.enums.TaskStatus;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTaskRequestDTO {

    private String taskName;

    private Long projectId;

    private List<Long> employeeIds;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    private TaskStatus status;

    private Double latitude;

    private Double longitude;
    private double taskCost;

    private List<Long> locationIds;

    private ProjectPriority priority; // HIGH, MEDIUM, LOW

    private Double weight;
    private MultipartFile supportDocument;
}