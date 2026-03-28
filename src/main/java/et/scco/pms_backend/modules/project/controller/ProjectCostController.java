package et.scco.pms_backend.modules.project.controller;


import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.project.dto.request.ProjectCostRequestDto;
import et.scco.pms_backend.modules.project.dto.response.ProjectCostResponseDto;
import et.scco.pms_backend.modules.project.service.ProjectCostService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectCostController {

    private final ProjectCostService costService;

    @GetMapping("/{projectId}/costs")
    public ApiResponse<List<ProjectCostResponseDto>> getHistory(@PathVariable Long projectId) {
        return ResponseUtil.success(
                "Financial history retrieved",
                costService.getHistoryByProject(projectId)
        );
    }

    @PostMapping("/costs")
    public ApiResponse<ProjectCostResponseDto> recordCost(@RequestBody ProjectCostRequestDto dto) {
        return ResponseUtil.success(
                "Cost record added successfully",
                costService.addCost(dto)
        );
    }

    @DeleteMapping("/costs/{id}")
    public ApiResponse<Void> removeCost(@PathVariable Long id) {
        costService.deleteCost(id);
        return ResponseUtil.success("Financial record removed", null);
    }

    // Build Update Project Cost
    @PutMapping(value = "/costs/{id}")
    public ApiResponse<ProjectCostResponseDto>updateProjectCost(@PathVariable("id") Long id,@RequestBody ProjectCostRequestDto dto){
       
        ProjectCostResponseDto projectCost = costService.updateProjectCost(id, dto);
        return ResponseUtil.success("Project Cost updated successfully", projectCost);
    }
}