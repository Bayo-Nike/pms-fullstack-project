package et.scco.pms_backend.modules.project.model;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "project_costs")
public class ProjectCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    private String phase;

    private Double amount;

    @JoinColumn(name = "created_by")
    @ManyToOne(fetch = FetchType.LAZY)
    private Employee createdBy;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}