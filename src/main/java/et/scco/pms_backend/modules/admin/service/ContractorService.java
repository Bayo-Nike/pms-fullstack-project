package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.request.ContractorRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ContractorResponseDTO;

public interface ContractorService {

    ContractorResponseDTO createContractor(ContractorRequestDTO contractorRequestDTO) throws Exception;

    ContractorResponseDTO getContractorById(Long contractorId);

    ContractorResponseDTO updateContractor(Long contractorId, ContractorRequestDTO contractorRequestDTO) throws Exception;

    List<ContractorResponseDTO> getAllContractors();

    void deleteContractor(Long contractorId);

}
