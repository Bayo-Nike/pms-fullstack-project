package et.scco.pms_backend.modules.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {

    private String accessToken;
    private String tokenType = "Bearer";
    private UserResponseLoginDto user;

    public AuthResponseDto(String accessToken, UserResponseLoginDto user) {
        this.accessToken = accessToken;
        this.user = user;
        this.tokenType = "Bearer";
    }
}