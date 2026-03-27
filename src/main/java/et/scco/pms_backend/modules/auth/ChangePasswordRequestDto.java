package et.scco.pms_backend.modules.auth;

import lombok.Getter;

@Getter
public class ChangePasswordRequestDto {
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}
