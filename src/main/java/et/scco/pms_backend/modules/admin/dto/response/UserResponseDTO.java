package et.scco.pms_backend.modules.admin.dto.response;
 
import java.util.List;

import et.scco.pms_backend.modules.admin.dto.RoleDto;
import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private List<RoleDto> roles;
    private boolean mobileAllowed;
}
