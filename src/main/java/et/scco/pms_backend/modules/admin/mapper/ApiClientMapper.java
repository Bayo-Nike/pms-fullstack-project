package et.scco.pms_backend.modules.admin.mapper;

import java.util.Collections;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import et.scco.pms_backend.modules.admin.dto.request.ApiClientRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ApiClientResponseDTO;
import et.scco.pms_backend.modules.admin.model.ApiClient;
import et.scco.pms_backend.modules.admin.model.Permission;
import et.scco.pms_backend.modules.admin.model.Roles;
import et.scco.pms_backend.modules.admin.model.User;

@Component
public class ApiClientMapper {

    public ApiClient toEntity(ApiClientRequestDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException("ApiClientRequestDTO cannot be null");
        }

        ApiClient apiClient = new ApiClient();

        apiClient.setOrganizationName(
                required(dto.getOrganizationName())
        );

        apiClient.setApplicationName(
                required(dto.getApplicationName())
        );

        apiClient.setApplicationUrl(
                normalize(dto.getApplicationUrl())
        );

        apiClient.setWebsiteUrl(
                normalize(dto.getWebsiteUrl())
        );

        apiClient.setDescription(
                normalize(dto.getDescription())
        );

        apiClient.setContactEmail(
                required(dto.getContactEmail()).toLowerCase(Locale.ROOT)
        );

        apiClient.setContactPhone(
                normalize(dto.getContactPhone())
        );

        apiClient.setPublicLogoUrl(
                normalize(dto.getPublicLogoUrl())
        );

        apiClient.setCallbackUrl(
                normalize(dto.getCallbackUrl())
        );

        apiClient.setExpiresAt(dto.getExpiresAt());

        return apiClient;
    }

    public ApiClientResponseDTO toResponse(ApiClient apiClient) {

        if (apiClient == null) {
            return null;
        }

        User user = apiClient.getUser();

        Set<String> roles = user != null && user.getRoles() != null
                ? user.getRoles()
                        .stream()
                        .map(Roles::getRoleName)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        /*
     * ============================================================
     * DIRECT API CLIENT PERMISSIONS
     * ============================================================
     *
     * IMPORTANT:
     *
     * These come from api_client_permissions.
     *
     * They are NOT the permissions from ROLE_API_CLIENT.
     */
        Set<Long> permissionIds =
                apiClient.getPermissions()
                        .stream()
                        .map(Permission::getId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

        Set<String> permissions =
                apiClient.getPermissions()
                        .stream()
                        .map(Permission::getName)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
        // Set<String> permissions =
        //         apiClient.getPermissions()
        //                 .stream()
        //                 .map(Permission::getName)
        //                 .collect(Collectors.toSet());

        return ApiClientResponseDTO.builder()
                .id(apiClient.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .organizationName(apiClient.getOrganizationName())
                .applicationName(apiClient.getApplicationName())
                .applicationUrl(apiClient.getApplicationUrl())
                .websiteUrl(apiClient.getWebsiteUrl())
                .description(apiClient.getDescription())
                .contactEmail(apiClient.getContactEmail())
                .contactPhone(apiClient.getContactPhone())
                .publicLogoUrl(apiClient.getPublicLogoUrl())
                .clientId(apiClient.getClientId())
                .callbackUrl(apiClient.getCallbackUrl())
                .status(apiClient.getStatus())
                .createdAt(apiClient.getCreatedAt())
                .updatedAt(apiClient.getUpdatedAt())
                .expiresAt(apiClient.getExpiresAt())
                .lastUsedAt(apiClient.getLastUsedAt())
                .revokedAt(apiClient.getRevokedAt())
                .roles(roles)
                .permissionIds(permissionIds)
                .permissions(permissions)
                .build();
    }

    /**
     * Normalizes optional string values.
     */
    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    /**
     * Validates required string values.
     *
     * Request DTO validation should normally catch this,
     * but this protects the mapper when used independently.
     */
    private String required(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    "Required value cannot be null or blank"
            );
        }

        return value.trim();
    }
}
