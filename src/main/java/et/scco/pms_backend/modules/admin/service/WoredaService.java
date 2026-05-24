package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.request.WoredaRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.WoredaResponseDto;
import et.scco.pms_backend.modules.admin.model.SubCity;

public interface WoredaService {

    SubCity getSubCity(Long subCityId);

    List<WoredaResponseDto> getWoredas();

    WoredaResponseDto getWoreda(Long id);

    WoredaResponseDto updateWoreda(Long id, WoredaRequestDto dto);

    WoredaResponseDto createWoreda(WoredaRequestDto dto);

}
