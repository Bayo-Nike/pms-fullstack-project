package et.scco.pms_backend.modules.planning.service;

import java.util.List;

import et.scco.pms_backend.modules.planning.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.planning.dto.ColorCodingResponseDTO;

public interface ColorCodingService {

    ColorCodingResponseDTO createColorCodeTarget(ColorCodingRequestDTO colorCodingRequestDTO);

    ColorCodingResponseDTO getColorCodeById(Long colorCodeId);

    List<ColorCodingResponseDTO> getAllColorCodes();

    ColorCodingResponseDTO updateColorCode(Long contractorId, ColorCodingRequestDTO colorCodingRequestDTO);

    void deleteColorCode(Long colorCodeId);

}
