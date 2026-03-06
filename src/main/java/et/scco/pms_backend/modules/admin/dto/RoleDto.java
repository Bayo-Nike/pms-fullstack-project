package et.scco.pms_backend.modules.admin.dto;

import java.util.List;

import lombok.Data;

@Data
public class RoleDto {
    private Long id;
    private String roleName;
    private String description;
    private List<PermissionDto> permissions;
}

