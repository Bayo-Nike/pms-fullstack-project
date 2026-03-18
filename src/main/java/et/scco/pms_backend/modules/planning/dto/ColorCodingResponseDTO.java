package et.scco.pms_backend.modules.planning.dto;


import java.util.List;

import et.scco.pms_backend.enums.BuildingType;
import et.scco.pms_backend.enums.PlanType;
import et.scco.pms_backend.enums.Quarter;
import et.scco.pms_backend.modules.admin.model.City;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.User;
import lombok.Data;

@Data
public class ColorCodingResponseDTO {

    private Long id;
    private City city;
    private SubCity subCity;
    private String fiscalYear;
    private PlanType planType;
    private Quarter quarter;
    private BuildingType buildingType;
    private Long target;
    private Long achieved;
    private User createdByUserName;
    // private String performanceDocument;
    private List<DocumentResponseDTO> performanceDocuments; 

}
