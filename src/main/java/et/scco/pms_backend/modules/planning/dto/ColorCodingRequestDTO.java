package et.scco.pms_backend.modules.planning.dto;
 
import lombok.Data;

@Data
public class ColorCodingRequestDTO {
    private Long cityId;
    private Long subCityId;
    private Long createdBy;
    private String fiscalYear;
    private String planType;
    private String quarter;
    private String buildingType;
    private Long target;
    private Long achieved;

}
