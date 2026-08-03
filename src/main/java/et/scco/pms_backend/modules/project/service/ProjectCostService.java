package et.scco.pms_backend.modules.project.service;

import et.scco.pms_backend.modules.project.dto.request.ProjectCostRequestDto;
import et.scco.pms_backend.modules.project.dto.response.ProjectCostResponseDto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface ProjectCostService {

    ProjectCostResponseDto addProjectPaymentRequest(ProjectCostRequestDto dto, MultipartFile file);

    List<ProjectCostResponseDto> getHistoryByProject(Long projectId);

    void deleteCost(Long id);

    ProjectCostResponseDto updateProjectPaymentRequest(Long id, ProjectCostRequestDto dto, MultipartFile file);
    ProjectCostResponseDto acknowledge(Long id, String remark);
    ProjectCostResponseDto approve(Long id, String remark);
    ProjectCostResponseDto reject(Long id, String remark);
}