package et.scco.pms_backend.modules.admin.service;


import java.util.List;

import et.scco.pms_backend.modules.admin.dto.response.ApiScopeResponseDTO;

public interface ApiScopeService {

    List<ApiScopeResponseDTO> getActiveScopes();

}
