package et.scco.pms_backend.modules.project.model;

import et.scco.pms_backend.enums.PaymentStatus;
import et.scco.pms_backend.modules.admin.model.Client;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
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

    private String paymentName;
    private Double amount;
    private String milestone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Employee submittedBy;

    private String supportingDoc; // File Path

    @JoinColumn(name = "created_by")
    @ManyToOne(fetch = FetchType.LAZY)
    private Employee createdBy;

    // Stage 1: Office Head (Acknowledgement)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ack_id")
    private Employee acknowledgedBy;

    private String ackRemark;

    // Stage 2: Director (Decision)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decider_id")
    private Employee decider;
    
    private String deciderRemark;

    private LocalDateTime requestedDate;
    private LocalDateTime responseDate;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}