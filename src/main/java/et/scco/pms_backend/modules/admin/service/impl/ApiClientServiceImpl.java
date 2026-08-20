package et.scco.pms_backend.modules.admin.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import et.scco.pms_backend.enums.ApiClientStatus;
import et.scco.pms_backend.enums.ApiScopeStatus;
import et.scco.pms_backend.enums.PrincipalType;
import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.request.ApiClientPrincipalRequestDTO;
import et.scco.pms_backend.modules.admin.dto.request.ApiClientRequestDTO;
import et.scco.pms_backend.modules.admin.dto.request.UserCreateRequest;
import et.scco.pms_backend.modules.admin.dto.response.ApiClientResponseDTO;
import et.scco.pms_backend.modules.admin.dto.response.UserResponseDTO;
import et.scco.pms_backend.modules.admin.mapper.ApiClientMapper;
import et.scco.pms_backend.modules.admin.mapper.UserMapper;
import et.scco.pms_backend.modules.admin.model.ApiClient;
import et.scco.pms_backend.modules.admin.model.Permission;
import et.scco.pms_backend.modules.admin.model.Roles;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.ApiClientRepository;
import et.scco.pms_backend.modules.admin.repository.PermissionRepository;
import et.scco.pms_backend.modules.admin.repository.RoleRepository;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.ApiClientService;

import java.net.URI;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApiClientServiceImpl implements ApiClientService {

        private final ApiClientRepository apiClientRepository;
        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final ApiClientMapper apiClientMapper;
        private final PasswordEncoder passwordEncoder;
        private final PermissionRepository permissionRepository;

        private final SecureRandom secureRandom = new SecureRandom();

        // REGISTER API CLIENT
        // @Override
        // public ApiClientResponseDTO register(
        //                 ApiClientRequestDTO request) {

        //         validateRegistration(request);

        //         /*
        //          * -----------------------------------------------------
        //          * 1. Create ApiClient entity
        //          * -----------------------------------------------------
        //          */
        //         ApiClient apiClient = apiClientMapper.toEntity(request);

        //         /*
        //          * -----------------------------------------------------
        //          * 2. Generate internal username
        //          * -----------------------------------------------------
        //          */
        //         String username = generateUsername(
        //                         request.getOrganizationName(),
        //                         request.getApplicationName());

        //         /*
        //          * -----------------------------------------------------
        //          * 3. Generate API credentials
        //          * -----------------------------------------------------
        //          *
        //          * clientId:
        //          * Public identifier.
        //          *
        //          * clientSecret:
        //          * Sensitive credential.
        //          *
        //          * IMPORTANT:
        //          * We NEVER store clientSecret directly.
        //          */
        //         String clientId = generateClientId();
        //         String clientSecret = generateClientSecret();

        //         /*
        //          * -----------------------------------------------------
        //          * 4. Hash client secret
        //          * -----------------------------------------------------
        //          */
        //         String secretHash = passwordEncoder.encode(clientSecret);

        //         /*
        //          * -----------------------------------------------------
        //          * 5. Populate ApiClient
        //          * -----------------------------------------------------
        //          */
        //         Instant now = Instant.now();

        //         apiClient.setClientId(clientId);
        //         apiClient.setSecretHash(secretHash);
        //         apiClient.setStatus(ApiClientStatus.ACTIVE);
        //         apiClient.setCreatedAt(now);
        //         apiClient.setUpdatedAt(now);

        //         /*
        //          * -----------------------------------------------------
        //          * 6. Create User
        //          * -----------------------------------------------------
        //          *
        //          * Every API client is also represented as a User
        //          * in the authentication/authorization layer.
        //          */
        //         User user = new User();

        //         user.setUsername(username);

        //         /*
        //          * This password is NOT the API client secret.
        //          *
        //          * Your current User entity requires a non-null password.
        //          * Therefore we generate a random internal password.
        //          */
        //         String internalPassword = generateInternalPassword();

        //         user.setPassword(
        //                         passwordEncoder.encode(internalPassword));

        //         user.setEmail(
        //                         request.getContactEmail()
        //                                         .trim()
        //                                         .toLowerCase(Locale.ROOT));

        //         user.setUserType(UserType.SYSTEM);
        //         user.setPrincipalType(PrincipalType.API_CLIENT);
        //         user.setMobileAllowed(false);

        //         /*
        //          * -----------------------------------------------------
        //          * 7. Link User <-> ApiClient
        //          * -----------------------------------------------------
        //          *
        //          * User owns the FK:
        //          *
        //          * users.api_client_id
        //          */
        //         user.setApiClient(apiClient);

        //         /*
        //          * Maintain the reverse side as well.
        //          */
        //         apiClient.setUser(user);

        //         assignRoles(user, request.getRoleIds());

        //         /*
        //          * -----------------------------------------------------
        //          * 9. Save ApiClient
        //          * -----------------------------------------------------
        //          *
        //          * ApiClient must be persisted first because User
        //          * contains the FK to api_client.
        //          */
        //         apiClientRepository.save(apiClient);

        //         // 10. Save User
        //         userRepository.save(user);

        //         /*
        //          * -----------------------------------------------------
        //          * 11. Return credentials ONCE
        //          * -----------------------------------------------------
        //          *
        //          * clientSecret is intentionally returned here.
        //          *
        //          * It must NEVER be returned by normal GET endpoints.
        //          */
        //         return ApiClientResponseDTO.builder()
        //                         .clientId(apiClient.getClientId())
        //                         .userId(user.getId())
        //                         .username(user.getUsername())
        //                         .email(user.getEmail())
        //                         .clientId(apiClient.getClientId())
        //                         // .clientSecret(clientSecret)
        //                         .status(apiClient.getStatus())
        //                         .expiresAt(apiClient.getExpiresAt())
        //                         .build();
        // }


        @Override
        @Transactional
        public ApiClientResponseDTO register(
                ApiClientPrincipalRequestDTO request) {

        /*
        * -----------------------------------------------------
        * 0. Extract nested API client request
        * -----------------------------------------------------
        */
        ApiClientRequestDTO apiRequest =
                request.getApiClient();

        /*
        * -----------------------------------------------------
        * 1. Validate registration
        * -----------------------------------------------------
        */
        validateRegistration(apiRequest);

        /*
        * -----------------------------------------------------
        * 2. Create ApiClient entity
        * -----------------------------------------------------
        */
        ApiClient apiClient =
                apiClientMapper.toEntity(apiRequest);

        /*
        * -----------------------------------------------------
        * 3. Use username from React request
        * -----------------------------------------------------
        *
        * React already sends:
        *
        * username: "api_abc_erp2"
        *
        * Therefore we don't need to generate another username.
        */
        String username =
                request.getUsername();

        /*
        * -----------------------------------------------------
        * 4. Generate API credentials
        * -----------------------------------------------------
        */
        String clientId =
                generateClientId();

        String clientSecret =
                generateClientSecret();

        /*
        * -----------------------------------------------------
        * 5. Hash client secret
        * -----------------------------------------------------
        */
        String secretHash =
                passwordEncoder.encode(clientSecret);

        /*
        * -----------------------------------------------------
        * 6. Populate ApiClient
        * -----------------------------------------------------
        */
        Instant now = Instant.now();

        apiClient.setClientId(clientId);
        apiClient.setSecretHash(secretHash);
        apiClient.setStatus(ApiClientStatus.ACTIVE);
        apiClient.setCreatedAt(now);
        apiClient.setUpdatedAt(now);

        /*
        * If expiresAt is part of ApiClient entity,
        * mapper should already populate it from apiRequest.
        */

        /*
        * -----------------------------------------------------
        * 7. Create User
        * -----------------------------------------------------
        */
        User user = new User();

        user.setUsername(username);

        /*
        * The password coming from React is the account password.
        *
        * If you intentionally don't want the API client's
        * username/password to be used for authentication,
        * keep your generated internal password instead.
        */
        String internalPassword =
                generateInternalPassword();

        user.setPassword(
                passwordEncoder.encode(internalPassword)
        );

        user.setEmail(
                apiRequest.getContactEmail()
                        .trim()
                        .toLowerCase(Locale.ROOT)
        );

        user.setUserType(UserType.SYSTEM);
        user.setPrincipalType(PrincipalType.API_CLIENT);
        user.setMobileAllowed(false);

        /*
        * -----------------------------------------------------
        * 8. Link User <-> ApiClient
        * -----------------------------------------------------
        */
        user.setApiClient(apiClient);
        apiClient.setUser(user);

        /*
        * -----------------------------------------------------
        * 9. Assign roles
        * -----------------------------------------------------
        */
        assignRoles(
                user,
                request.getRoleIds()
        );

        /*
        * -----------------------------------------------------
        * 9.1 Assign direct API client permissions
        * -----------------------------------------------------
        */
        assignPermissions(
                apiClient,
                apiRequest.getPermissionIds()
        );

        /*
        * -----------------------------------------------------
        * 10. Handle scopes
        * -----------------------------------------------------
        *
        * Your frontend currently does NOT send scopeIds.
        *
        * Therefore you must either:
        *
        * A) derive scopes from roleIds
        * B) assign default scopes
        * C) make scopeIds optional
        *
        * Do NOT blindly use roleIds as scopeIds unless
        * they represent the same database records.
        */

        /*
        * Example:
        *
        * Set<Long> scopeIds =
        *      deriveScopeIdsFromRoles(request.getRoleIds());
        *
        * ...
        */

        /*
        * -----------------------------------------------------
        * 11. Save ApiClient
        * -----------------------------------------------------
        */
        apiClientRepository.save(apiClient);

        /*
        * -----------------------------------------------------
        * 12. Save User
        * -----------------------------------------------------
        */
        userRepository.save(user);

        /*
        * -----------------------------------------------------
        * 13. Return response
        * -----------------------------------------------------
        */
        return ApiClientResponseDTO.builder()
                .clientId(apiClient.getClientId())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(apiClient.getStatus())
                .expiresAt(apiClient.getExpiresAt())
                .build();
        }

        private void assignPermissions(
                ApiClient apiClient,
                Set<Long> permissionIds) {
        
            if (permissionIds == null ||
                permissionIds.isEmpty()) {
        
                apiClient.getPermissions().clear();
        
                return;
            }
        
            Set<Permission> permissions =
                    new HashSet<>(
                            permissionRepository.findAllById(
                                    permissionIds
                            )
                    );
        
            /*
             * Make sure every requested permission actually exists.
             */
            if (permissions.size() != permissionIds.size()) {
        
                Set<Long> foundIds =
                        permissions.stream()
                                .map(Permission::getId)
                                .collect(Collectors.toSet());
        
                Set<Long> missingIds =
                        new HashSet<>(permissionIds);
        
                missingIds.removeAll(foundIds);
        
                throw new IllegalArgumentException(
                        "Invalid permission IDs: " + missingIds
                );
            }
        
            apiClient.setPermissions(permissions);
        }

        // VALIDATION
        private void validateRegistration(
                        ApiClientRequestDTO request) {

                if (request == null) {
                        throw new IllegalArgumentException(
                                        "API client registration request cannot be null.");
                }

                /*
                 * -----------------------------------------------------
                 * Organization + Application uniqueness
                 * -----------------------------------------------------
                 */
                boolean apiClientExists = apiClientRepository
                                .existsByApplicationNameIgnoreCaseAndOrganizationNameIgnoreCase(
                                                request.getApplicationName().trim(),
                                                request.getOrganizationName().trim());

                if (apiClientExists) {
                        throw new IllegalStateException(
                                        "An API client with this application and organization already exists.");
                }

                /*
                 * -----------------------------------------------------
                 * User email uniqueness
                 * -----------------------------------------------------
                 *
                 * User.email is unique in your database.
                 */
                String email = request.getContactEmail()
                                .trim()
                                .toLowerCase(Locale.ROOT);

                if (userRepository.existsByEmailIgnoreCase(email)) {
                        throw new IllegalStateException(
                                        "A user already exists with contact email: " + email);
                }

                /*
                 * -----------------------------------------------------
                 * Expiration validation
                 * -----------------------------------------------------
                 */
                if (request.getExpiresAt() != null &&
                                !request.getExpiresAt().isAfter(Instant.now())) {

                        throw new IllegalArgumentException(
                                        "Expiration date must be in the future.");
                }

                /*
                 * -----------------------------------------------------
                 * URL validation
                 * -----------------------------------------------------
                 */
                if (request.getCallbackUrl() != null &&
                                !request.getCallbackUrl().isBlank()) {

                        validateUrl(
                                        request.getCallbackUrl(),
                                        "Callback URL");
                }

                if (request.getApplicationUrl() != null &&
                                !request.getApplicationUrl().isBlank()) {

                        validateUrl(
                                        request.getApplicationUrl(),
                                        "Application URL");
                }

                if (request.getWebsiteUrl() != null &&
                                !request.getWebsiteUrl().isBlank()) {

                        validateUrl(
                                        request.getWebsiteUrl(),
                                        "Website URL");
                }

                if (request.getPublicLogoUrl() != null &&
                                !request.getPublicLogoUrl().isBlank()) {

                        validateUrl(
                                        request.getPublicLogoUrl(),
                                        "Public logo URL");
                }
        }

       // ROLE ASSIGNMENT
        private void assignRoles(
                        User user,
                        Set<Long> roleIds) {

                /*
                 * No roles supplied.
                 *
                 * You can change this behavior if API clients are
                 * allowed to exist without roles.
                 */
                if (roleIds == null || roleIds.isEmpty()) {
                        return;
                }

                List<Roles> foundRoles = roleRepository.findAllById(roleIds);

                /*
                 * Ensure every requested role actually exists.
                 */
                if (foundRoles.size() != roleIds.size()) {

                        Set<Long> foundIds = foundRoles.stream()
                                        .map(Roles::getId)
                                        .collect(java.util.stream.Collectors.toSet());

                        Set<Long> missingIds = new HashSet<>(roleIds);

                        missingIds.removeAll(foundIds);

                        throw new EntityNotFoundException(
                                        "One or more requested roles do not exist: "
                                                        + missingIds);
                }

                // Defensive copy
                user.setRoles(new HashSet<>(foundRoles));
        }

        // USERNAME GENERATION
        private String generateUsername(
                        String organizationName,
                        String applicationName) {

                String organization = slugify(organizationName);

                String application = slugify(applicationName);

                String base = "api_" + organization + "_" + application;

                String username = base;

                int counter = 1;

                while (userRepository.existsByUsername(username)) {

                        username = base + "_" + counter;

                        counter++;
                }

                return username;
        }

        private String slugify(String value) {

                return value
                                .toLowerCase(Locale.ROOT)
                                .trim()
                                .replaceAll("[^a-z0-9]+", "_")
                                .replaceAll("^_+|_+$", "");
        }

        // CLIENT ID
        private String generateClientId() {

                return "cli_" +
                                UUID.randomUUID()
                                                .toString()
                                                .replace("-", "");
        }

        // CLIENT SECRET
        private String generateClientSecret() {

                byte[] bytes = new byte[32];

                secureRandom.nextBytes(bytes);

                return Base64.getUrlEncoder()
                                .withoutPadding()
                                .encodeToString(bytes);
        }

        // INTERNAL USER PASSWORD
        private String generateInternalPassword() {

                byte[] bytes = new byte[32];

                secureRandom.nextBytes(bytes);

                return Base64.getUrlEncoder()
                                .withoutPadding()
                                .encodeToString(bytes);
        }

        // URL VALIDATION
        private void validateUrl(
                        String value,
                        String fieldName) {

                try {

                        URI uri = URI.create(value);

                        String scheme = uri.getScheme();

                        if (scheme == null ||
                                        (!scheme.equalsIgnoreCase("http")
                                                        && !scheme.equalsIgnoreCase("https"))) {

                                throw new IllegalArgumentException(
                                                fieldName +
                                                                " must use HTTP or HTTPS.");
                        }

                        if (uri.getHost() == null ||
                                        uri.getHost().isBlank()) {

                                throw new IllegalArgumentException(
                                                fieldName +
                                                                " must contain a valid host.");
                        }

                } catch (IllegalArgumentException ex) {

                        throw new IllegalArgumentException(
                                        fieldName +
                                                        " must be a valid HTTP/HTTPS URL.");
                }
        }

        // GET BY ID
        @Override
        public ApiClientResponseDTO getById(Long id) {

                ApiClient apiClient = apiClientRepository
                                .findById(id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "API client not found: " + id));

                return apiClientMapper.toResponse(apiClient);
        }

        // GET ALL
        @Override
        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public List<ApiClientResponseDTO> getAll() {

                return apiClientRepository
                                .findAllWithUserAndRoles()
                                .stream()
                                .map(apiClientMapper::toResponse)
                                .toList();
        }

        // SUSPEND
        @Override
        public ApiClientResponseDTO suspend(Long id) {

                ApiClient apiClient = getEntity(id);

                if (apiClient.getStatus() == ApiClientStatus.REVOKED) {

                        throw new IllegalStateException(
                                        "A revoked API client cannot be suspended.");
                }

                if (apiClient.getStatus() == ApiClientStatus.SUSPENDED) {

                        throw new IllegalStateException(
                                        "API client is already suspended.");
                }

                apiClient.setStatus(
                                ApiClientStatus.SUSPENDED);

                apiClient.setUpdatedAt(
                                Instant.now());

                return apiClientMapper.toResponse(
                                apiClientRepository.save(apiClient));
        }

        // ACTIVATE
        @Override
        public ApiClientResponseDTO activate(Long id) {

                ApiClient apiClient = getEntity(id);

                if (apiClient.getStatus() == ApiClientStatus.REVOKED) {

                        throw new IllegalStateException(
                                        "A revoked API client cannot be activated.");
                }

                if (apiClient.getExpiresAt() != null &&
                                !apiClient.getExpiresAt().isAfter(Instant.now())) {

                        apiClient.setStatus(
                                        ApiClientStatus.EXPIRED);

                        apiClient.setUpdatedAt(
                                        Instant.now());

                        throw new IllegalStateException(
                                        "Expired API client cannot be activated.");
                }

                apiClient.setStatus(
                                ApiClientStatus.ACTIVE);

                apiClient.setUpdatedAt(
                                Instant.now());

                return apiClientMapper.toResponse(
                                apiClientRepository.save(apiClient));
        }

        // REVOKE
        @Override
        public ApiClientResponseDTO revoke(Long id) {

                ApiClient apiClient = getEntity(id);

                if (apiClient.getStatus() == ApiClientStatus.REVOKED) {

                        throw new IllegalStateException(
                                        "API client is already revoked.");
                }

                apiClient.setStatus(
                                ApiClientStatus.REVOKED);

                apiClient.setRevokedAt(
                                Instant.now());

                apiClient.setUpdatedAt(
                                Instant.now());

                return apiClientMapper.toResponse(
                                apiClientRepository.save(apiClient));
        }

       // FIND ENTITY
        private ApiClient getEntity(Long id) {

                return apiClientRepository
                                .findById(id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "API client not found: " + id));
        }

        @Override
        @Transactional
        public ApiClientResponseDTO updateApiClient(
                Long userId,
                ApiClientPrincipalRequestDTO requestDTO) {

        if (requestDTO == null) {
                throw new IllegalArgumentException(
                        "Update request cannot be null."
                );
        }

        if (requestDTO.getApiClient() == null) {
                throw new IllegalArgumentException(
                        "API client information is required."
                );
        }

        ApiClientRequestDTO apiRequest =
                requestDTO.getApiClient();

        /*
        * -----------------------------------------------------
        * 1. Load ApiClient
        * -----------------------------------------------------
        */
        
        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User does not exist for Id: "
                                                + userId
                                )
                        );

        /*
        * -----------------------------------------------------
        * 2. Load associated User
        * -----------------------------------------------------
        */
        // User user =
        //         userRepository.findByApiClient_Id(apiClientId)
        //                 .orElseThrow(() ->
        //                         new ResourceNotFoundException(
        //                                 "User does not exist for apiClientId: "
        //                                         + apiClientId
        //                         )
        //                 );
        ApiClient apiClient =
                apiClientRepository.findById(user.getApiClient().getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "API client does not exist with id: "
                                                + user.getApiClient().getId()
                                )
                        );

        /*
        * -----------------------------------------------------
        * 3. Normalize input
        * -----------------------------------------------------
        */
        String username =
                requestDTO.getUsername() == null
                        ? null
                        : requestDTO.getUsername().trim();

        String email =
                apiRequest.getContactEmail() == null
                        ? null
                        : apiRequest.getContactEmail()
                                .trim()
                                .toLowerCase(Locale.ROOT);

        String organizationName =
                apiRequest.getOrganizationName()
                        .trim();

        String applicationName =
                apiRequest.getApplicationName()
                        .trim();

        /*
        * -----------------------------------------------------
        * 4. Validate username uniqueness
        * -----------------------------------------------------
        */
        if (username != null &&
                !username.equals(user.getUsername()) &&
                userRepository.existsByUsername(username)) {

                throw new IllegalStateException(
                        "Username already exists: " + username
                );
        }

        /*
        * -----------------------------------------------------
        * 5. Validate email uniqueness
        * -----------------------------------------------------
        */
        if (email != null &&
                !email.equalsIgnoreCase(user.getEmail()) &&
                userRepository.existsByEmailIgnoreCase(email)) {

                throw new IllegalStateException(
                        "A user already exists with email: " + email
                );
        }

        /*
        * -----------------------------------------------------
        * 6. Validate ApiClient uniqueness
        * -----------------------------------------------------
        */
       
        boolean duplicate =
                apiClientRepository
                        .existsByApplicationNameIgnoreCaseAndOrganizationNameIgnoreCaseAndIdNot(
                                applicationName,
                                organizationName,
                                apiClient.getId()
                        );

        if (duplicate) {
                throw new IllegalStateException(
                        "An API client with this application and organization already exists."
                );
        }

        /*
        * -----------------------------------------------------
        * 7. Validate expiration
        * -----------------------------------------------------
        */
        if (apiRequest.getExpiresAt() != null &&
                !apiRequest.getExpiresAt().isAfter(Instant.now())) {

                throw new IllegalArgumentException(
                        "Expiration date must be in the future."
                );
        }

        /*
        * -----------------------------------------------------
        * 8. Validate URLs
        * -----------------------------------------------------
        */
        if (apiRequest.getCallbackUrl() != null &&
                !apiRequest.getCallbackUrl().isBlank()) {

                validateUrl(
                        apiRequest.getCallbackUrl(),
                        "Callback URL"
                );
        }

        if (apiRequest.getApplicationUrl() != null &&
                !apiRequest.getApplicationUrl().isBlank()) {

                validateUrl(
                        apiRequest.getApplicationUrl(),
                        "Application URL"
                );
        }

        if (apiRequest.getWebsiteUrl() != null &&
                !apiRequest.getWebsiteUrl().isBlank()) {

                validateUrl(
                        apiRequest.getWebsiteUrl(),
                        "Website URL"
                );
        }

        if (apiRequest.getPublicLogoUrl() != null &&
                !apiRequest.getPublicLogoUrl().isBlank()) {

                validateUrl(
                        apiRequest.getPublicLogoUrl(),
                        "Public logo URL"
                );
        }

        /*
        * -----------------------------------------------------
        * 9. Update User
        * -----------------------------------------------------
        */
        if (username != null) {
                user.setUsername(username);
        }

        if (email != null) {
                user.setEmail(email);
        }

        /*
        * Do not update password here unless this endpoint
        * is intentionally responsible for user credentials.
        */

        assignRoles(
                user,
                requestDTO.getRoleIds()
        );

        /*
        * -----------------------------------------------------
        * 10. Update ApiClient
        * -----------------------------------------------------
        */
        apiClient.setOrganizationName(
                organizationName
        );

        apiClient.setApplicationName(
                applicationName
        );

        apiClient.setContactEmail(
                email
        );

        apiClient.setCallbackUrl(
                apiRequest.getCallbackUrl()
        );

        apiClient.setApplicationUrl(
                apiRequest.getApplicationUrl()
        );

        apiClient.setWebsiteUrl(
                apiRequest.getWebsiteUrl()
        );

        apiClient.setPublicLogoUrl(
                apiRequest.getPublicLogoUrl()
        );

        apiClient.setExpiresAt(
                apiRequest.getExpiresAt()
        );

        apiClient.setDescription(apiRequest.getDescription());

        /*
        * -----------------------------------------------------
        * 11. Update API permissions
        * -----------------------------------------------------
        */
        assignPermissions(
                apiClient,
                apiRequest.getPermissionIds()
        );

        /*
        * -----------------------------------------------------
        * 12. Update timestamps
        * -----------------------------------------------------
        */
        Instant now = Instant.now();

        apiClient.setUpdatedAt(now);

        /*
        * -----------------------------------------------------
        * 13. Save
        * -----------------------------------------------------
        */
        userRepository.save(user);
        apiClientRepository.save(apiClient);

        /*
        * -----------------------------------------------------
        * 14. Return
        * -----------------------------------------------------
        */
        return apiClientMapper.toResponse(apiClient);
        }


        private Set<Permission> resolveScopes(Set<Long> permissionIds) {

                if (permissionIds == null ||
                        permissionIds.isEmpty()) {

                        throw new IllegalArgumentException(
                                        "At least one API scope must be selected.");
                }

                List<Permission> permissions = permissionRepository.findAllById(
                                permissionIds);

                if (permissions.size() != permissions.size()) {

                        Set<Long> foundIds = permissions.stream()
                                        .map(Permission::getId)
                                        .collect(Collectors.toSet());

                        Set<Long> missingIds = new HashSet<>(permissionIds);

                        missingIds.removeAll(foundIds);

                        throw new EntityNotFoundException(
                                        "API scopes not found: " +
                                                        missingIds);
                }

                return new HashSet<>(permissions);
        }
}
