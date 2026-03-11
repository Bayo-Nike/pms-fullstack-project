package et.scco.pms_backend.modules.colorCode.mapper;
 
import et.scco.pms_backend.enums.BuildingType;
import et.scco.pms_backend.enums.PlanType;
import et.scco.pms_backend.modules.colorCode.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.colorCode.dto.ColorCodingResponseDTO;
import et.scco.pms_backend.modules.colorCode.model.ColorCoding;

public class ColorCodingMapper {
    public static ColorCodingResponseDTO mapToColorCodingResponseDTO(ColorCoding colorCoding) {

        if (colorCoding == null) return null;

        ColorCodingResponseDTO dto = new ColorCodingResponseDTO();

        dto.setId(colorCoding.getId());
        dto.setCity(colorCoding.getCity());
        dto.setSubCity(colorCoding.getSubCity());
        dto.setPlanType(colorCoding.getPlanType());
        dto.setBuildingType(colorCoding.getBuildingType());
        dto.setFiscalYear(colorCoding.getFiscalYear());
        dto.setTarget(colorCoding.getTarget());
        dto.setAchieved(colorCoding.getAchieved());
        // dto.setCreatedByUserName(colorCoding.getCreatedBy());

        return dto;
    }

    public static ColorCoding mapToColorCoding(ColorCodingRequestDTO dto) {

        if (dto == null) return null;

        ColorCoding colorCoding= new ColorCoding();
        colorCoding.setTarget(dto.getTarget());
        colorCoding.setAchieved(dto.getAchieved());
        colorCoding.setPlanType(PlanType.valueOf(dto.getPlanType()));
        colorCoding.setBuildingType(BuildingType.valueOf(dto.getBuildingType()));
        colorCoding.setFiscalYear(dto.getFiscalYear());

        return colorCoding;
    }

}
