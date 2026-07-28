package et.scco.pms_backend.modules.project.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import et.scco.pms_backend.enums.PaymentStatus;

@Data
@Builder
public class ProjectCostResponseDto {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long taskId;
    private String taskName;
    private String phase;
    private Double amount;
    private String paymentName;
    private String milestone;
    private String supportingDoc;
    private PaymentStatus status;
    private String submittedBy;
    private String acknowledgedBy;
    private String approvedBy;
    private String updatedBy;
    private LocalDateTime updatedAt;
    private String ackRemark;
    private String deciderRemark;
    private String clientName;
    private String contractorName;

    // Add flags for UI logic
    private boolean canAcknowledge;
    private boolean canApprove;
}