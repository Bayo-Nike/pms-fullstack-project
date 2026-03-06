package et.scco.pms_backend.components;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "super.admin")
public class SuperAdminProperties {
    private String firstName;
    private String middleName;
    private String lastName;
    private String username;
    private String password;
    private String userEmail;
}