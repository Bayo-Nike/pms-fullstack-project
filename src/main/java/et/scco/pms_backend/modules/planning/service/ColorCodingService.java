package et.scco.pms_backend.modules.planning.service;

import java.util.List;


import et.scco.pms_backend.modules.planning.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.planning.dto.ColorCodingResponseDTO;

public interface ColorCodingService {

    ColorCodingResponseDTO createColorCodeTarget(ColorCodingRequestDTO colorCodingRequestDTO);

    ColorCodingResponseDTO getColorCodeById(Long colorCodeId);

    List<ColorCodingResponseDTO> getAllColorCodes();

    void deleteColorCode(Long colorCodeId);

    ColorCodingResponseDTO updateColorCode(Long colorCodeId, ColorCodingRequestDTO colorCodingRequestDTO)throws Exception;

}
