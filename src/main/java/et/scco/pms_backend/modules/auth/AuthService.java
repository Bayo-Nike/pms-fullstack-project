package et.scco.pms_backend.modules.auth;

public interface AuthService {
    AuthResponseDto login(LoginRequestDto loginRequest, Boolean isMobile);
    void logout(String token);
    UserResponseLoginDto getProfile();
    Boolean changePassword(ChangePasswordRequestDto dto);
}