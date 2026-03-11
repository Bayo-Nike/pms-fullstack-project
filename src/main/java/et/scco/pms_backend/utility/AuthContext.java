package et.scco.pms_backend.utility;

import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthContext {

    private CustomUserDetails getPrincipal() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            throw new RuntimeException("Unauthorized");
        }

        return (CustomUserDetails) authentication.getPrincipal();
    }

    public User getUser() {
        return getPrincipal().getUser();
    }

    public String getUsername() {
        return getPrincipal().getUsername();
    }

    public Employee getEmployee() {
        return getPrincipal().getEmployee();
    }

    public Long getEmployeeId() {
        Employee employee = getEmployee();
        return employee != null ? employee.getId() : null;
    }

    public boolean isSystemUser() {
        return getUser().getUserType() == UserType.SYSTEM;
    }

}