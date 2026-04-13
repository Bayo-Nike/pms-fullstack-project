package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.TaskTypeDTO;

import java.util.List;

public interface TaskTypeService {
    List<TaskTypeDTO> findAll();
    TaskTypeDTO findById(Long id);
    TaskTypeDTO create(TaskTypeDTO taskTypeDTO);
    TaskTypeDTO update(Long id, TaskTypeDTO taskTypeDTO);
    void delete(Long id);
}
