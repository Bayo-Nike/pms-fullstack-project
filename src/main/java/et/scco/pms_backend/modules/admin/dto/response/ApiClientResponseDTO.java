package et.scco.pms_backend.modules.admin.dto.response;

import java.time.Instant;
import java.util.Set;

import et.scco.pms_backend.enums.ApiClientStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiClientResponseDTO {

    private Long id;

    private Long userId;

    private String username;

    private String email;

    private String organizationName;

    private String applicationName;

    private String applicationUrl;

    private String websiteUrl;

    private String description;

    private String contactEmail;

    private String contactPhone;

    private String publicLogoUrl;

    private String clientId;

    private String callbackUrl;

    private ApiClientStatus status;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant expiresAt;

    private Instant lastUsedAt;

    private Instant revokedAt;

    private Set<String> roles;

    // Returned ONLY once during registration.
    private String clientSecret;

    /*
     * Permissions directly assigned to THIS API client.
     *
     * These come from api_client_permissions.
     */
    private Set<Long> permissionIds;

    private Set<String> permissions;

}
