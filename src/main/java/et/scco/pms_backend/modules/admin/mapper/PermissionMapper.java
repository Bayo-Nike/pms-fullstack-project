package et.scco.pms_backend.modules.admin.mapper;

import java.util.stream.Collectors;

import et.scco.pms_backend.modules.admin.dto.PermissionDto;
import et.scco.pms_backend.modules.admin.model.Permission;
import et.scco.pms_backend.modules.admin.model.Roles;

public class PermissionMapper {

    public static PermissionDto mapToPermissionDto(Permission permission) {

        if (permission == null) return null;

        PermissionDto dto = new PermissionDto();

        dto.setId(permission.getId());
        dto.setSlug(permission.getSlug());
        dto.setName(permission.getName());

        // Map Module
        if (permission.getModule() != null) {
            dto.setModuleId(permission.getModule().getId());
            dto.setModuleName(permission.getModule().getName());
        }

        // Map Roles -> roleIds
        if (permission.getRoles() != null) {
            dto.setRoleIds(
                permission.getRoles()
                        .stream()
                        .map(Roles::getId)
                        .collect(Collectors.toList())
            );
        }

        return dto;
    }

    public static Permission mapToPermission(PermissionDto dto) {

        if (dto == null) return null;

        Permission permission = new Permission();

        // permission.setId(dto.getId());
        permission.setSlug(dto.getSlug());
        permission.setName(dto.getName());

        // DO NOT set module & roles here
        // They must be set in the service layer after fetching from DB
        

        return permission;
    }

 
        // public static PermissionDto mapToPermissionDTO(Permission permission) {
        //     if (permission == null) return null;
        //     return new PermissionDTO(permission.getId(), permission.getName());
        // }
    
        // public static Permission mapToPermission(PermissionDTO dto) {
        //     if (dto == null) return null;
        //     Permission permission = new Permission();
        //     permission.setId(dto.getId());
        //     permission.setName(dto.getName());
        //     return permission;
        // }
    
}