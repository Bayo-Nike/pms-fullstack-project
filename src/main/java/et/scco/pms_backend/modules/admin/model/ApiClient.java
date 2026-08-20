package et.scco.pms_backend.modules.admin.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import et.scco.pms_backend.enums.ApiClientStatus;
import et.scco.pms_backend.enums.OAuthGrantType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "api_clients", uniqueConstraints = {
    @UniqueConstraint(name="uk_api_client_client_id",columnNames = "client_id")
})
@Getter
@Setter
public class ApiClient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "application_name", nullable = false)
    private String applicationName;

    @Column(name = "application_url")
    private String applicationUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(length = 2000)
    private String description;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "public_logo_url")
    private String publicLogoUrl;

    /**
     * OAuth API client identifier.
     */
    @Column(name = "client_id", nullable = false, unique = true)
    private String clientId;

    /**
     * Never store plaintext secret.
     */
    @Column(name = "secret_hash", nullable = false)
    private String secretHash;

    @Column(name = "callback_url")
    private String callbackUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApiClientStatus status = ApiClientStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "grant_type", nullable = false)
    private OAuthGrantType grantType = OAuthGrantType.CLIENT_CREDENTIALS;

    /*
     * ============================================================
     * API CLIENT DIRECT PERMISSIONS
     * ============================================================
     *
     * These permissions belong specifically to THIS API client.
     *
     * They are independent from the permissions inherited
     * through ROLE_API_CLIENT.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "api_client_permissions",
        joinColumns = @JoinColumn(
            name = "api_client_id"
        ),
        inverseJoinColumns = @JoinColumn(
            name = "permission_id"
        )
    )
    private Set<Permission> permissions = new HashSet<>();


    // optionally have the reverse relationship
    @OneToOne(mappedBy = "apiClient", fetch = FetchType.LAZY)
    private User user;  

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

}
