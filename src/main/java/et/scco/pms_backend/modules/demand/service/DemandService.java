package et.scco.pms_backend.modules.demand.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import et.scco.pms_backend.modules.demand.dto.request.DemandDocumentRequestDTO;
import et.scco.pms_backend.modules.demand.dto.request.DemandRequestDTO;
import et.scco.pms_backend.modules.demand.dto.request.ReviewDemandRequest;
import et.scco.pms_backend.modules.demand.dto.response.DemandResponseDTO;

public interface DemandService {

    DemandResponseDTO createDemand(DemandRequestDTO demandDTO, List<MultipartFile> files, List<DemandDocumentRequestDTO> documentInfo);

    Page<DemandResponseDTO> getAllDemands(String search, String category, String status, Long subCityId, Pageable pageable);

    DemandResponseDTO getDemandById(Long id);

    DemandResponseDTO reviewDemand(Long id, ReviewDemandRequest reviewRequest);

    void deleteDemand(Long id);

    DemandResponseDTO updateDemand(Long id, DemandRequestDTO dto, List<MultipartFile> files, List<DemandDocumentRequestDTO> documentInfo, List<Long> removedFileIds);

}
