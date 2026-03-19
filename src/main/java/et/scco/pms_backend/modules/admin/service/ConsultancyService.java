package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.request.ConsultancyRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ConsultancyResponseDTO;

public interface ConsultancyService {

    ConsultancyResponseDTO createConsultancy(ConsultancyRequestDTO consultancyRequestDTO) throws Exception;

    ConsultancyResponseDTO getConsultantById(Long consultantId);

    List<ConsultancyResponseDTO> getAllConsultancies();

    ConsultancyResponseDTO updateConsultancy(Long consultantId, ConsultancyRequestDTO consultancyRequestDTO) throws Exception;

    void deleteConsultant(Long consultantId);

}
