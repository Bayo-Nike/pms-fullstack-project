package et.scco.pms_backend.modules.planning.mapper;
 
import java.util.List;
import java.util.stream.Collectors;

import et.scco.pms_backend.enums.BuildingType;
import et.scco.pms_backend.enums.PlanType;
import et.scco.pms_backend.enums.Quarter;
import et.scco.pms_backend.modules.planning.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.planning.dto.ColorCodingResponseDTO;
import et.scco.pms_backend.modules.planning.dto.DocumentResponseDTO;
import et.scco.pms_backend.modules.planning.model.ColorCoding;

public class ColorCodingMapper {
    public static ColorCodingResponseDTO mapToColorCodingResponseDTO(ColorCoding colorCoding) {

        if (colorCoding == null) return null;

        ColorCodingResponseDTO dto = new ColorCodingResponseDTO();

        dto.setId(colorCoding.getId());
        dto.setCity(colorCoding.getCity());
        dto.setSubCity(colorCoding.getSubCity());
        dto.setPlanType(colorCoding.getPlanType());
        dto.setQuarter(colorCoding.getQuarter());
        dto.setBuildingType(colorCoding.getBuildingType());
        dto.setFiscalYear(colorCoding.getFiscalYear());
        dto.setTarget(colorCoding.getTarget());
        dto.setAchieved(colorCoding.getAchieved());
        // dto.setPerformanceDocuments(colorCoding.getPerformanceDocuments());
        if (colorCoding.getPerformanceDocuments() != null) {
            List<DocumentResponseDTO> docDTOs = colorCoding.getPerformanceDocuments().stream()
                .map(doc -> new DocumentResponseDTO(doc.getId(), doc.getFileName()))
                .collect(Collectors.toList());
            dto.setPerformanceDocuments(docDTOs);
        }
        // dto.setCreatedByUserName(colorCoding.getCreatedBy());
 
        return dto;
    }

    public static ColorCoding mapToColorCoding(ColorCodingRequestDTO dto) {

        if (dto == null) return null;

        ColorCoding colorCoding= new ColorCoding();
        colorCoding.setTarget(dto.getTarget());
        colorCoding.setAchieved(dto.getAchieved());
        colorCoding.setPlanType(PlanType.valueOf(dto.getPlanType()));

        if (dto.getPlanType().equals("QUARTERLY")){
            colorCoding.setQuarter(Quarter.valueOf(dto.getQuarter()));
        }

        colorCoding.setBuildingType(BuildingType.valueOf(dto.getBuildingType()));
        colorCoding.setFiscalYear(dto.getFiscalYear());

        return colorCoding;
    }

}
