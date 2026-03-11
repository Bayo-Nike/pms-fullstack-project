package et.scco.pms_backend.modules.auth;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.utility.CustomUserDetails;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@AllArgsConstructor
public class AuthUtility {

    public static String getUserName()
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            throw new RuntimeException("Unauthorized: No active session found");
        }

        return authentication.getName();
    }

    public static Employee getEmployee() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new RuntimeException("Unauthorized");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        assert userDetails != null;
        return userDetails.getEmployee();
    }
}
