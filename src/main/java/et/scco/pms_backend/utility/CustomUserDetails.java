package et.scco.pms_backend.utility;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.User;
import lombok.Getter;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
public class CustomUserDetails implements UserDetails {

    private final User user;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean isEnabled;

    public CustomUserDetails(User user, Collection<? extends GrantedAuthority> authorities, boolean isEnabled) {
        this.user = user;
        this.authorities = authorities;
        this.isEnabled = isEnabled;
    }

    public Employee getEmployee() {
        return user.getEmployee();
    }

    @Override
    @NullMarked
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
}