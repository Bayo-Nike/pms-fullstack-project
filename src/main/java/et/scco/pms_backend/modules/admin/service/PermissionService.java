package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.PermissionDto;
import et.scco.pms_backend.modules.admin.model.Permission;

public interface PermissionService {

    PermissionDto createPermission(PermissionDto permissionDto);

    PermissionDto getPermissionById(Long permissionId);

    List<PermissionDto> getAllPermissions();

    PermissionDto updatePermission(Long permissionId, PermissionDto updatePermission);

    void deletePermission(Long permissionId);

    List<Permission> getPermissions(List<Long>permissionIds);
} 
