package et.scco.pms_backend.modules.auth;

public interface AuthService {
    AuthResponseDto login(LoginRequestDto loginRequest);
    void logout(String token);
    UserResponseLoginDto getProfile();
}