package et.scco.pms_backend.modules.planning.dto;
 
import java.util.List;

import org.springframework.web.multipart.MultipartFile;
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
    // private MultipartFile performanceDocument;
    private List<MultipartFile> performanceDocuments;
    private List<Long> deletedFileIds; // to handle delete option

}
