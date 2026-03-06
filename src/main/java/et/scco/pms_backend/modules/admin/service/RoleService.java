package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.RoleDto;
import et.scco.pms_backend.modules.admin.dto.request.RoleRequestDto;

public interface RoleService {

    RoleDto createRole(RoleRequestDto roleDto);

    RoleDto getRoleById(Long roleId);

    List<RoleDto> getAllRoles();

    RoleDto updateRole(Long roleId, RoleRequestDto roleDto);

    void deleteRole(Long roleId);

}
