package et.scco.pms_backend.modules.admin.dto.response;
 
import java.util.List;

import et.scco.pms_backend.modules.admin.dto.RoleDto;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private Boolean isActive;
    private String remark;
    private List<RoleDto> roles;
}
