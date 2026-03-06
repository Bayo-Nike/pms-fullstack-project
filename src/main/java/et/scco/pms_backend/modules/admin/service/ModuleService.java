package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.ModuleDto;
 

public interface ModuleService {

    ModuleDto getModuleById(Long moduleId);
    List<ModuleDto>getAllModules();
    ModuleDto updateModule(Long moduleId,ModuleDto moduleDto);
    void deleteModule(Long moduleId);

}
