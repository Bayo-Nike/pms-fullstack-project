package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.request.ApiClientPrincipalRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ApiClientResponseDTO;

public interface ApiClientService {

    ApiClientResponseDTO register(ApiClientPrincipalRequestDTO request);

    ApiClientResponseDTO getById(Long id);

    List<ApiClientResponseDTO> getAll();

    ApiClientResponseDTO suspend(Long id);

    ApiClientResponseDTO activate(Long id);

    ApiClientResponseDTO revoke(Long id);

    ApiClientResponseDTO updateApiClient(Long apiClientId, ApiClientPrincipalRequestDTO requestDTO);
}
