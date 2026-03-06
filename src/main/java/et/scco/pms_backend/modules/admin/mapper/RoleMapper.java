package et.scco.pms_backend.modules.admin.mapper;

import java.util.List;
import java.util.stream.Collectors;

import et.scco.pms_backend.modules.admin.dto.RoleDto;
import et.scco.pms_backend.modules.admin.dto.request.RoleRequestDto;
import et.scco.pms_backend.modules.admin.model.Permission;
import et.scco.pms_backend.modules.admin.model.Roles;

public class RoleMapper {

    public static RoleDto mapToRoleDTO(Roles role) {
        if (role == null) return null;
        RoleDto dto = new RoleDto();
        dto.setId(role.getId());
        dto.setRoleName(role.getRoleName());
        dto.setDescription(role.getDescription());
        if (role.getPermissions() != null) {
            dto.setPermissions(role.getPermissions().stream()
                .map(PermissionMapper::mapToPermissionDto)
                .collect(Collectors.toList()));
        }
        return dto;
    }

    public static Roles mapToRole(RoleRequestDto dto, List<Permission> permissions) {
        if (dto == null) return null;
        Roles role = new Roles();
        role.setId(dto.getId());
        role.setRoleName(dto.getRoleName());
        role.setDescription(dto.getDescription());
        role.setPermissions(permissions);
        return role;
    }
}