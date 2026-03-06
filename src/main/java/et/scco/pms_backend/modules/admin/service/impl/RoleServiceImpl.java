package et.scco.pms_backend.modules.admin.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import et.scco.pms_backend.exception.RoleInUseException;
import et.scco.pms_backend.modules.admin.dto.request.RoleRequestDto;
import et.scco.pms_backend.modules.admin.model.Permission;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.RoleDto;
import et.scco.pms_backend.modules.admin.mapper.RoleMapper;
import et.scco.pms_backend.modules.admin.model.Roles;
import et.scco.pms_backend.modules.admin.repository.RoleRepository;
import et.scco.pms_backend.modules.admin.service.RoleService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService{

    private final RoleRepository roleRepository;
    private final PermissionServiceImpl permissionService;

    @Override
    public RoleDto createRole(RoleRequestDto roleDto) {
        List<Permission>permissions = permissionService.getPermissions(roleDto.getPermissions());
        Roles role = RoleMapper.mapToRole(roleDto, permissions);
        Roles savedRole = roleRepository.save(role);

        return RoleMapper.mapToRoleDTO(savedRole);    
    }

    @Override
    public RoleDto getRoleById(Long roleId) {
        Roles role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role is Not found with given id: " + roleId));
        return RoleMapper.mapToRoleDTO(role);
    }

    @Override
    public List<RoleDto> getAllRoles() {
        List<Roles> roles = roleRepository.findAll();
        return roles.stream().map(RoleMapper::mapToRoleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RoleDto updateRole(Long roleId, RoleRequestDto roleDto) {
         
        Roles role  = roleRepository.findById(roleId)
        .orElseThrow(() ->
                new ResourceNotFoundException("Role is not Exist with given id:" + roleId));

        // Update fields
        role.setRoleName(roleDto.getRoleName());
        role.setDescription(roleDto.getDescription());
        role.setPermissions(permissionService.getPermissions(roleDto.getPermissions()));
        Roles updatedRole = roleRepository.save(role);
        return RoleMapper.mapToRoleDTO(updatedRole);
    }

    @Override
    @Transactional
    public void deleteRole(Long roleId) {

        Roles role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found with id: " + roleId));

        if (roleRepository.isRoleUsed(roleId)) {
            throw new RoleInUseException("Role is assigned to users. Remove it first.");
        }

        roleRepository.delete(role);
    }
}
