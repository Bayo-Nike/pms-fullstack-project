package et.scco.pms_backend.modules.admin.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.repository.ModuleRepository;
import et.scco.pms_backend.modules.admin.dto.PermissionDto;
import et.scco.pms_backend.modules.admin.mapper.PermissionMapper;
import et.scco.pms_backend.modules.admin.model.Permission;
import et.scco.pms_backend.modules.admin.repository.PermissionRepository;
import et.scco.pms_backend.modules.admin.service.PermissionService;
import lombok.RequiredArgsConstructor;
import et.scco.pms_backend.modules.admin.model.Module;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService{
    
    private final PermissionRepository permissionRepository;
    private final ModuleRepository moduleRepository;

    @Override
    public PermissionDto createPermission(PermissionDto permissionDto) { 
        Permission permission = PermissionMapper.mapToPermission(permissionDto);
        if (permissionDto.getModuleId() != null) {
            Module module = moduleRepository.findById(permissionDto.getModuleId())
                    .orElseThrow(() -> new RuntimeException("Module not found"));

            permission.setModule(module);
        }
        Permission savedPermission = permissionRepository.save(permission);

        return PermissionMapper.mapToPermissionDto(savedPermission);
    }

    @Override
    public PermissionDto getPermissionById(Long permissionId) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission is Not found with given id: " + permissionId));
        return PermissionMapper.mapToPermissionDto(permission);
    }



    @Override
    public List<PermissionDto> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        return permissions.stream().map(PermissionMapper::mapToPermissionDto)
                .collect(Collectors.toList());
    }

    @Override
    public PermissionDto updatePermission(Long permissionId, PermissionDto updatePermission) {
        Permission permission = permissionRepository.findById(permissionId)
        .orElseThrow(() -> new ResourceNotFoundException("Permission is not Exist with given id:" + permissionId));

        permission.setName(updatePermission.getName());
        // module.setPermissions(moduleDto.getPermissionIds());

        Permission updatedPermission = permissionRepository.save(permission);
        return PermissionMapper.mapToPermissionDto(updatedPermission);
    }

    @Override
    public void deletePermission(Long permissionId) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission is not Exist with given id:" + permissionId));

        permissionRepository.deleteById(permissionId);
    }

    @Override
    public List<Permission> getPermissions(List<Long> permissionIds) {
        return permissionRepository.findAllById(permissionIds);
    }
}
