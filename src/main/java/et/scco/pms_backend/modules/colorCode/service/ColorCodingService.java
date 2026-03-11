package et.scco.pms_backend.modules.colorCode.service;

import java.util.List;

import et.scco.pms_backend.modules.colorCode.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.colorCode.dto.ColorCodingResponseDTO;

public interface ColorCodingService {

    ColorCodingResponseDTO createColorCodeTarget(ColorCodingRequestDTO colorCodingRequestDTO);

    ColorCodingResponseDTO getColorCodeById(Long colorCodeId);

    List<ColorCodingResponseDTO> getAllColorCodes();

    ColorCodingResponseDTO updateColorCode(Long contractorId, ColorCodingRequestDTO colorCodingRequestDTO);

    void deleteColorCode(Long colorCodeId);

}
