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
    
    // Core Content
    private String title;
    private String description;
    private String category;       // e.g., "GOVERNMENT"
    private String demandType;     // e.g., "BUILDING"
    private String demandLevel;    // e.g., "SUB_CITY"
    
    // Geography & Hub Assignment (ID + Names)
    private Long cityId;
    private String cityName;
    private Long subCityId;
    private String subCityName;
    private Long woredaId;
    private String woredaName;
    
    // Registered Site Details
    private Long locationId;       // The ID of the registered site
    private String locationName;   // The name of the registered site (e.g. "Site A")
    private String siteLocation;   // The manual details provided by the user
    

    // Stakeholders (Partnerships)
    private Long contractorId;     // ID for potential links
    private String contractorName; // Display name (e.g. "OCC")
    
    private Long consultancyId;    // ID for potential links
    private String consultancyName;// Display name (e.g. "M/Qopheessaa")
    
    private Long clientId;
    private String clientName;     
    
    private Long submittedBy;      // User ID
    private String submittedByName; 

    // Workflow & Lifecycle
    private String phase;          // INITIATION / EXECUTION
    private String status;         // PENDING / APPROVED / REJECTED
    private String reviewerRemark;
    
    // Audit & Timeline Dates
    private LocalDateTime requestedDate;
    private LocalDateTime respondedDate;

    /**
     * This handles the dynamic number of files.
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
        private String downloadUrl; // API endpoint to download
        private Long size;
    }

}
