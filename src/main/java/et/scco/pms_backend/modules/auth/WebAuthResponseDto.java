package et.scco.pms_backend.modules.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WebAuthResponseDto {
    private UserResponseLoginDto user;

}
