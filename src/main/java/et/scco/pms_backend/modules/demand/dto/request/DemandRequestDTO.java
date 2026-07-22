package et.scco.pms_backend.modules.demand.dto.request;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.DemandType;
import et.scco.pms_backend.enums.ProjectLevel;
import et.scco.pms_backend.enums.ProjectType;
import lombok.Data;

@Data
public class DemandRequestDTO {
    private String title;
    private String description;
    private Category category;
    private DemandType demandType;
    private ProjectLevel demandLevel;
    private Long cityId;
    private Long subCityId;
    private Long woredaId;
    private String siteLocation;
    private Long contractorId;
    private Long consultancyId;
    private Long clientId;

}
