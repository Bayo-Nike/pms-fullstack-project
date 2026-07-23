package et.scco.pms_backend.modules.demand.dto.request;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.DemandLevel;
import et.scco.pms_backend.enums.DemandType;
import lombok.Data;

@Data
public class DemandRequestDTO {
    private String title;
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

}
