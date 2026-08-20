package et.scco.pms_backend.modules.admin.dto.response;

import java.util.Set;

import et.scco.pms_backend.enums.ApiScopeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiScopeResponseDTO {
    private Long id;

    private String code;

    private String name;

    private String description;

    private ApiScopeStatus status;

    private Set<String> permissions;

}
