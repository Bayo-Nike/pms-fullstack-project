package et.scco.pms_backend.utility;

import et.scco.pms_backend.enums.AccessType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class PermissionFilter extends OncePerRequestFilter {

    private final EndpointPermissionService endpointPermissionService;
    private final AuthContext authContext;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getRequestURI();

        return

                // =========================
                // STATIC / FRONTEND
                // =========================
                path.startsWith("/") ||
                        path.startsWith("/index.html") ||
                        path.startsWith("/assets/") ||
                        path.matches(".+\\.(js|css|svg|png|jpg|jpeg|ico)$") ||

                        // =========================
                        // AUTH (NO PERMISSION CHECK)
                        // =========================
                        path.startsWith("/api/auth/login") ||
                        path.startsWith("/api/mobile/auth/login") ||
                        path.startsWith("/api/auth/logout") ||
                        path.startsWith("/api/auth/change-password") ||

                        // =========================
                        // DOWNLOADS (already controlled by JWT only or public rules)
                        // =========================
                        path.startsWith("/api/admin/contractors/download/") ||
                        path.startsWith("/api/admin/consultancy/download/") ||
                        path.startsWith("/api/admin/client/download/") ||
                        path.startsWith("/api/colorCodes/download/") ||
                        path.startsWith("/api/tasks/download/") ||

                        // =========================
                        // OPTIONAL: PUBLIC OR SIMPLE AUTH ONLY
                        // =========================
                        path.startsWith("/api/notifications") ||

                        // =========================
                        // DASHBOARD
                        // =========================
                        path.startsWith("/api/dashboard/summary/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        EndpointPermission endpointPermission =
                endpointPermissionService
                        .getRequiredPermission(method, path);

        // =================================================
        // 1. Endpoint not registered
        // =================================================

        if (endpointPermission == null) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write(
                    "Unauthorized: Endpoint not registered"
            );

            return;
        }

        // =================================================
        // 2. Public endpoint
        // =================================================

        if (endpointPermission.getAccessType()
                == AccessType.PUBLIC) {

            filterChain.doFilter(request, response);
            return;
        }

        // =================================================
        // 3. Authentication required
        // =================================================

        if (!isAuthenticated()) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            response.getWriter().write(
                    "Unauthorized: Authentication required"
            );

            return;
        }

        // =================================================
        // 4. Authenticated-only endpoint
        // =================================================

        if (endpointPermission.getAccessType()
                == AccessType.AUTHENTICATED) {

            filterChain.doFilter(request, response);
            return;
        }

        // =================================================
        // 5. Permission endpoint
        // =================================================

        if (endpointPermission.getAccessType()
                == AccessType.PERMISSION) {

            boolean hasPermission =
                    authContext.hasPermission(
                            endpointPermission.getPermission()
                    );

            if (!hasPermission) {

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                response.getWriter().write(
                        "Forbidden: Missing Permission"
                );

                return;
            }
        }

        // =================================================
        // 6. Access granted
        // =================================================

        filterChain.doFilter(request, response);
    }

    // =====================================================
    // Helper Methods
    // =====================================================

    private boolean isAuthenticated() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication
                instanceof AnonymousAuthenticationToken);
    }

    private void unauthorized(HttpServletResponse response,
                              String message) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(message);
    }

    private void forbidden(HttpServletResponse response) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.getWriter().write("Forbidden: Missing Permission");
    }
}