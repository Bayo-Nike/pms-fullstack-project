package et.scco.pms_backend.modules.admin.model;

import et.scco.pms_backend.enums.ProjectType;
import et.scco.pms_backend.enums.TaskTypeProjectStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "task_types")
public class TaskType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private ProjectType projectType;

    @Enumerated(EnumType.STRING)
    private TaskTypeProjectStatus taskTypeProjectStatus;

    private String description;
}