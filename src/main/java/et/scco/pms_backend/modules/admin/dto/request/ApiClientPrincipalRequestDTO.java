package et.scco.pms_backend.modules.admin.dto.request;

import java.util.HashSet;
import java.util.Set;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApiClientPrincipalRequestDTO {
    private String principalType;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    private Set<Long> roleIds = new HashSet<>();

    @Valid
    @NotNull
    private ApiClientRequestDTO apiClient;

}
