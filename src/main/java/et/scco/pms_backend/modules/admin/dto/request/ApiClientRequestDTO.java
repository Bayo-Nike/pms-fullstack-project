package et.scco.pms_backend.modules.admin.dto.request;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class ApiClientRequestDTO {
    @NotBlank
    private String organizationName;

    @NotBlank
    private String applicationName;

    private String applicationUrl;

    private String websiteUrl;

    private String description;

    @Email
    @NotBlank
    private String contactEmail;

    private String contactPhone;

    private String publicLogoUrl;

    private String callbackUrl;

    private Instant expiresAt;
     // Roles that this API client should receive
    private Set<Long> roleIds = new HashSet<>();
    // @NotEmpty
    // private Set<Long> scopeIds;
    private Set<Long> scopeIds = new HashSet<>();

    @NotEmpty
    private Set<Long> permissionIds = new HashSet<>();

}
