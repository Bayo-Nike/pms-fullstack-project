package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.TaskTypeDTO;
import et.scco.pms_backend.modules.admin.model.TaskType;
import et.scco.pms_backend.modules.admin.repository.TaskTypeRepository;
import et.scco.pms_backend.modules.admin.service.TaskTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskTypeServiceImpl implements TaskTypeService {

    private final TaskTypeRepository taskTypeRepository;

    @Override
    public List<TaskTypeDTO> findAll() {
        return taskTypeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaskTypeDTO findById(Long id) {
        TaskType taskType = taskTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task Type not found with id: " + id));
        return convertToDTO(taskType);
    }

    @Override
    @Transactional
    public TaskTypeDTO create(TaskTypeDTO taskTypeDTO) {
        TaskType taskType = new TaskType();
        taskType.setName(taskTypeDTO.getName());
        taskType.setProjectType(taskTypeDTO.getProjectType());
        taskType.setDescription(taskTypeDTO.getDescription());
        taskType.setTaskTypeProjectStatus(taskTypeDTO.getTaskTypeProjectStatus());

        return convertToDTO(taskTypeRepository.save(taskType));
    }

    @Override
    @Transactional
    public TaskTypeDTO update(Long id, TaskTypeDTO dto) {
        TaskType taskType = taskTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task Type not found with id: " + id));

        taskType.setName(dto.getName());
        taskType.setProjectType(dto.getProjectType());
        taskType.setDescription(dto.getDescription());
        taskType.setTaskTypeProjectStatus(dto.getTaskTypeProjectStatus());

        return convertToDTO(taskTypeRepository.save(taskType));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!taskTypeRepository.existsById(id)) {
            throw new RuntimeException("Cannot delete. Task Type not found with id: " + id);
        }
        taskTypeRepository.deleteById(id);
    }

    private TaskTypeDTO convertToDTO(TaskType entity) {
        TaskTypeDTO dto = new TaskTypeDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setProjectType(entity.getProjectType());
        dto.setDescription(entity.getDescription());
        dto.setTaskTypeProjectStatus(entity.getTaskTypeProjectStatus());
        return dto;
    }
}