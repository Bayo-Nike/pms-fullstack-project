package et.scco.pms_backend.modules.demand.dto.request;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.DemandLevel;
import et.scco.pms_backend.enums.DemandType;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) // If the frontend sends extra fields I don't know about, just ignore them instead of crashing.
public class DemandRequestDTO {
    private String title;
    private String demandCode;
    private String description;
    private Category category;
    private DemandType demandType;
    private DemandLevel demandLevel;
    private Long cityId;
    private Long subCityId;
    private Long woredaId;
    private String siteLocation;
    private Long contractorId;
    private Long consultancyId;
    private Long clientId;
    private Long locationId;
    private LocalDateTime requestedDate;

}
