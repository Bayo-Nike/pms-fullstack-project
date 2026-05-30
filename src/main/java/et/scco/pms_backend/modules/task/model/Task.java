package et.scco.pms_backend.modules.task.model;

import et.scco.pms_backend.enums.*;
import et.scco.pms_backend.modules.admin.model.*;
import et.scco.pms_backend.modules.project.model.Project;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_type_id", nullable = false)
    private TaskType taskType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToMany
    @JoinTable(
            name = "task_employee",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private List<Employee> employees = new ArrayList<>();

    private LocalDate startDate;
    private LocalDate endDate;

    private String description;
    private String remark;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private Double latitude;
    private Double longitude;
    
    @Column(name = "task_cost")
    private double taskCost;

    @Column(name = "support_document")
    private String supportDocument; // file name or path

    @ManyToMany
    @JoinTable(
            name = "task_locations",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "location_id")
    )
    private List<Location> locations = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ProjectPriority priority;

    private Double weight;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
