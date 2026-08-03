package et.scco.pms_backend.modules.project.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPaymentResponseDTO {
    private Long id;
    private String paymentName;
    private Double amount;
    private String milestone; // Expected Progress as per Contractual
    private String status;    // DRAFTED, REQUESTED, ACKNOWLEDGED, APPROVED, REJECTED

    // Project Context
    private Long projectId;
    private String projectCode;
    private String projectTitle;

    // Submitter Info
    private String clientName;
    private String submittedByName;
    private LocalDateTime requestedDate;

    // Stage 1: Office Head Acknowledgement
    private Long acknowledgedById;
    private String acknowledgedByName;
    private String ackRemark;

    // Stage 2: Director Decision
    private Long deciderId;
    private String deciderName;
    private String deciderRemark;
    private LocalDateTime responseDate;

    // Supporting Document
    private String supportingDocUrl;
    private String fileName;
}
