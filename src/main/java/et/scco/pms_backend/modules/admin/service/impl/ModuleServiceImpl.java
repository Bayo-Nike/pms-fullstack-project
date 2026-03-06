package et.scco.pms_backend.modules.admin.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.ModuleDto;
import et.scco.pms_backend.modules.admin.mapper.ModuleMapper;
import et.scco.pms_backend.modules.admin.repository.ModuleRepository;
import et.scco.pms_backend.modules.admin.service.ModuleService;
import lombok.RequiredArgsConstructor;
import et.scco.pms_backend.modules.admin.model.Module;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;


    @Override
    public ModuleDto getModuleById(Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module is Not found with given id: " + moduleId));
        return ModuleMapper.mapToModuleDto(module);
    }

    @Override
    public List<ModuleDto> getAllModules() {
        List<Module> modules = moduleRepository.findAll();
        return modules.stream().map(ModuleMapper::mapToModuleDto)
                .collect(Collectors.toList());

    }

    @Override
    public ModuleDto updateModule(Long moduleId, ModuleDto moduleDto) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module is not Exist with given id:" + moduleId));

        module.setName(moduleDto.getName());
        // module.setPermissions(moduleDto.getPermissionIds());

        Module updatedModule = moduleRepository.save(module);
        return ModuleMapper.mapToModuleDto(updatedModule);
    }

    @Override
    public void deleteModule(Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module is not Exist with given id:" + moduleId));

        moduleRepository.deleteById(moduleId);
    }

}
