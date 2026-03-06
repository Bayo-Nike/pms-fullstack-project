package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.modules.admin.dto.ModuleDto;
import et.scco.pms_backend.modules.admin.model.Module;
import et.scco.pms_backend.modules.admin.model.Permission;

import java.util.stream.Collectors;

public class ModuleMapper {

    public static ModuleDto mapToModuleDto(Module module) {

        if (module == null) return null;

        ModuleDto dto = new ModuleDto();

        dto.setId(module.getId());
        dto.setName(module.getName());

        // Map permissions → permissionIds
        if (module.getPermissions() != null) {
            dto.setPermissionIds(
                module.getPermissions()
                        .stream()
                        .map(Permission::getId)
                        .collect(Collectors.toList())
            );
        }

        return dto;
    }
}