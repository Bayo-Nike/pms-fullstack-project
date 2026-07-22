package et.scco.pms_backend.modules.demand.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandResponseDTO {
    // Primary Identifiers
    private Long id;
    private String demandCode;
    
    // Content
    private String title;
    private String description;
    private String category;       // e.g., "GOVERNMENT"
    private String demandType;     // e.g., "BUILDING"
    private String demandLevel;    // e.g., "SUB_CITY"
    
    // Location Details (ID + Names for easy UI display)
    private Long cityId;
    private String cityName;
    private Long subCityId;
    private String subCityName;
    private Long woredaId;
    private String woredaName;
    private String siteLocation;
    

    // Stakeholders
    
    private String contractor;
    private String consultant;
    private Long clientId;
    private String clientName;     // Useful if joining with client table
    private Long submittedBy;      // User ID
    private String submittedByName; 

    // Workflow State
    private String phase;          // INITIATION / EXECUTION
    private String status;         // PENDING / APPROVED / REJECTED
    private String reviewerRemark;
    
    // Audit Dates
    private LocalDateTime requestedDate;
    private LocalDateTime respondedDate;

    /**
     * This handles the dynamic number of files.
     * Instead of file1, file2, we use a structured list.
     */
    private List<DocumentResponseDTO> documents;

    /**
     * Nested DTO for Document details
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentResponseDTO {
        private Long id;
        private String fileName;
        private String fileType; // e.g., "Design Approval"
        private String downloadUrl; // Generated URL to download/view the file
        private Long size;
    }

}
