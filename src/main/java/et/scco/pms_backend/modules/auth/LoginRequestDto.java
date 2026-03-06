package et.scco.pms_backend.modules.auth;

import lombok.Data;

@Data
public class LoginRequestDto {
    private String usernameOrEmail;
    private String password;
}
