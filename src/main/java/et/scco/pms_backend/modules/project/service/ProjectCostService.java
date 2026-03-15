package et.scco.pms_backend.modules.project.service;

import et.scco.pms_backend.modules.project.dto.request.ProjectCostRequestDto;
import et.scco.pms_backend.modules.project.dto.response.ProjectCostResponseDto;

import java.util.List;

public interface ProjectCostService {

    ProjectCostResponseDto addCost(ProjectCostRequestDto dto);

    List<ProjectCostResponseDto> getHistoryByProject(Long projectId);

    void deleteCost(Long id);
}