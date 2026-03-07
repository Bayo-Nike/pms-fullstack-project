package et.scco.pms_backend.modules.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class UserResponseLoginDto {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private List<String> roles;
    private List<String>permissions;
}
